"""
llm_client.py  –  Gemini rotator + JSON call helper
Owner: Ahmed

Public API (frozen – do not change signatures):
    call_gemini_json(system_prompt, user_prompt) -> dict
    call_gemini_vision_json(system_prompt, text, image_base64) -> dict
    is_gemini_available() -> bool
"""

import json
import os
import time
import hashlib

import httpx
from dotenv import load_dotenv

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────

GEMINI_API_KEYS: list[str] = [
    k.strip()
    for k in os.getenv("GEMINI_API_KEYS", "").replace("\n", ",").split(",")
    if k.strip()
]
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

# ── Back-off state ─────────────────────────────────────────────────────────────

_gemini_disabled_until: float = 0.0
_BACKOFF_SECONDS: int = 600  # 10 minutes after all keys fail

# ── In-memory cache ────────────────────────────────────────────────────────────
# Keyed by SHA-256 of (model + system_prompt + user_prompt).
# Keeps the demo deterministic and protects quota on repeated runs.

_cache: dict[str, dict] = {}


def _cache_key(model: str, system: str, user: str) -> str:
    raw = f"{model}||{system}||{user}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _cache_get(model: str, system: str, user: str) -> dict | None:
    return _cache.get(_cache_key(model, system, user))


def _cache_set(model: str, system: str, user: str, value: dict) -> None:
    _cache[_cache_key(model, system, user)] = value


# ── JSON extraction ────────────────────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    """Tolerant extractor — handles code-fence wrapping if present."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1]
        if text.startswith("json"):
            text = text[4:]
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise RuntimeError(f"No JSON object in model output: {text[:200]}")
    return json.loads(text[start : end + 1])


# ── Availability check ─────────────────────────────────────────────────────────

def is_gemini_available() -> bool:
    """True when keys are configured and not in the back-off window."""
    return bool(GEMINI_API_KEYS) and time.time() >= _gemini_disabled_until


# ── Core rotator ──────────────────────────────────────────────────────────────

def _rotate_call(payload: dict, model: str = GEMINI_MODEL) -> dict:
    """
    Try each API key in order. Skip 429 (quota). Raise on 404 (bad model).
    Disable Gemini for _BACKOFF_SECONDS when all keys are exhausted.
    """
    global _gemini_disabled_until

    if not GEMINI_API_KEYS:
        raise RuntimeError("No Gemini API keys configured — set GEMINI_API_KEYS in .env")

    if time.time() < _gemini_disabled_until:
        remaining = int(_gemini_disabled_until - time.time())
        raise RuntimeError(
            f"Gemini temporarily disabled (all keys quota-exceeded). "
            f"Retry in {remaining}s."
        )

    last_error: str = "unknown"
    for key in GEMINI_API_KEYS:
        url = f"{_BASE}/{model}:generateContent?key={key}"
        try:
            with httpx.Client(timeout=30) as client:
                resp = client.post(url, json=payload)

            if resp.status_code == 429:
                last_error = f"quota exceeded on key …{key[-4:]}"
                continue

            if resp.status_code == 404:
                # Wrong model name — fail fast, rotation won't fix this.
                raise RuntimeError(
                    f"Model '{model}' not found (404). "
                    "Check GEMINI_MODEL in .env — use gemini-2.5-flash."
                )

            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return _extract_json(text)

        except RuntimeError:
            raise
        except Exception as exc:
            last_error = str(exc)
            continue

    # All keys failed.
    _gemini_disabled_until = time.time() + _BACKOFF_SECONDS
    raise RuntimeError(
        f"All Gemini keys failed ({last_error}). "
        f"Disabled for {_BACKOFF_SECONDS}s."
    )


# ── Public functions ───────────────────────────────────────────────────────────

def call_gemini_json(system_prompt: str, user_prompt: str) -> dict:
    """
    Send one JSON-mode text request through the key rotator.
    Returns a parsed dict. Raises RuntimeError if all keys fail.
    """
    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 1024,
            "responseMimeType": "application/json",
        },
    }

    cached = _cache_get(GEMINI_MODEL, system_prompt, user_prompt)
    if cached is not None:
        return cached

    result = _rotate_call(payload)
    _cache_set(GEMINI_MODEL, system_prompt, user_prompt, result)
    return result


def call_gemini_vision_json(
    system_prompt: str,
    text: str,
    image_base64: str,
    mime_type: str = "image/jpeg",
) -> dict:
    """
    Send a vision request (image + text) through the key rotator.
    Used by Farha's /notice/interpret route to OCR + interpret a scanned notice.
    Returns a parsed dict. Raises RuntimeError if all keys fail.
    """
    cache_key_text = f"[VISION]{text[:100]}[IMG]{image_base64[:32]}"

    cached = _cache_get(GEMINI_MODEL, system_prompt, cache_key_text)
    if cached is not None:
        return cached

    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": text or "Analyze this image."},
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": image_base64,
                        }
                    },
                ],
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 1024,
            "responseMimeType": "application/json",
        },
    }

    result = _rotate_call(payload)
    _cache_set(GEMINI_MODEL, system_prompt, cache_key_text, result)
    return result
