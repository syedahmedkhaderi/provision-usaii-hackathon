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
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

# ── Back-off state ─────────────────────────────────────────────────────────────

_gemini_disabled_until: float = 0.0
_BACKOFF_SECONDS: int = 60  # 1 minute after all keys fail (was 10 min — too aggressive)
_probe_cache_until: float = 0.0
_probe_cache_value: bool = False

# ── In-memory cache ────────────────────────────────────────────────────────────
# Keyed by SHA-256 of (model + system_prompt + user_prompt).
# Keeps the demo deterministic and protects quota on repeated runs.

_cache: dict[str, dict] = {}
_MAX_CACHE_SIZE = 512


def _cache_key(model: str, system: str, user: str) -> str:
    raw = f"{model}||{system}||{user}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _cache_get(model: str, system: str, user: str) -> dict | None:
    return _cache.get(_cache_key(model, system, user))


def _cache_set(model: str, system: str, user: str, value: dict) -> None:
    if len(_cache) >= _MAX_CACHE_SIZE:
        keys = list(_cache.keys())
        for k in keys[: len(keys) // 2]:
            del _cache[k]
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


def _extract_text_from_response(data: dict) -> str:
    """Return the first text part from a Gemini REST response."""
    candidates = data.get("candidates", [])
    if not candidates:
        raise RuntimeError(f"No candidates returned by Gemini: {data}")

    finish_reason = candidates[0].get("finishReason", "")
    if finish_reason in ("SAFETY", "RECITATION", "BLOCKED"):
        raise RuntimeError(f"Gemini response blocked (finishReason={finish_reason})")

    parts = (candidates[0].get("content") or {}).get("parts") or []
    if not parts or "text" not in parts[0]:
        raise RuntimeError(f"Gemini returned no text parts: {data}")

    return parts[0]["text"]


# ── Availability check ─────────────────────────────────────────────────────────

def is_gemini_available() -> bool:
    """True when keys are configured. Note: even if temporarily backed-off,
    _rotate_call will auto-fallback to gemini-3.1-flash-lite."""
    return bool(GEMINI_API_KEYS)


def probe_gemini() -> bool:
    """
    Lightweight live readiness check for health endpoints.
    Cached briefly so repeated /health calls do not spam the API.
    """
    global _probe_cache_until, _probe_cache_value

    now = time.time()
    if now < _probe_cache_until:
        return _probe_cache_value

    if not is_gemini_available():
        _probe_cache_value = False
        _probe_cache_until = now + 30
        return False

    ready = False
    for key in GEMINI_API_KEYS:
        try:
            with httpx.Client(timeout=10) as client:
                resp = client.get(
                    f"{_BASE}/{GEMINI_MODEL}",
                    headers={"x-goog-api-key": key},
                )
            if resp.status_code == 200:
                ready = True
                break
        except Exception:
            continue

    _probe_cache_value = ready
    _probe_cache_until = now + 30
    return ready


# ── Core rotator ──────────────────────────────────────────────────────────────

def _rotate_call(payload: dict, model: str = GEMINI_MODEL) -> dict:
    """
    Try each API key in order. Skip 429 (quota). Raise on 404 (bad model).
    Disable Gemini for _BACKOFF_SECONDS when all keys are exhausted.
    """
    global _gemini_disabled_until

    if not GEMINI_API_KEYS:
        raise RuntimeError("No Gemini API keys configured — set GEMINI_API_KEYS in .env")

    # If we're in a backoff window, try the fallback model directly
    # by temporarily clearing the backoff for this attempt
    if time.time() < _gemini_disabled_until:
        if model != "gemini-3.1-flash-lite":
            saved = _gemini_disabled_until
            _gemini_disabled_until = 0
            try:
                return _rotate_call(payload, model="gemini-3.1-flash-lite")
            except RuntimeError:
                _gemini_disabled_until = saved
                remaining = int(saved - time.time())
                raise RuntimeError(
                    f"Gemini temporarily disabled (all keys quota-exceeded). "
                    f"Retry in {remaining}s."
                )
        else:
            remaining = int(_gemini_disabled_until - time.time())
            raise RuntimeError(
                f"Gemini temporarily disabled (all keys quota-exceeded). "
                f"Retry in {remaining}s."
            )

    last_error: str = "unknown"
    for key in GEMINI_API_KEYS:
        url = f"{_BASE}/{model}:generateContent"
        try:
            with httpx.Client(timeout=30) as client:
                resp = client.post(
                    url,
                    headers={"x-goog-api-key": key},
                    json=payload,
                )

            if resp.status_code == 429:
                last_error = f"quota exceeded on key …{key[-4:]}"
                continue

            if resp.status_code == 404:
                # Wrong model name — fail fast, rotation won't fix this.
                raise RuntimeError(
                    f"Model '{model}' not found (404). "
                    "Check GEMINI_MODEL in .env — use gemini-3.1-flash-lite."
                )

            resp.raise_for_status()
            data = resp.json()
            text = _extract_text_from_response(data)
            return _extract_json(text)

        except RuntimeError:
            raise
        except Exception as exc:
            last_error = str(exc)
            continue

    # All keys failed on the configured model.
    # Try fallback to gemini-3.1-flash-lite if we were using a different model
    if model != "gemini-3.1-flash-lite":
        try:
            return _rotate_call(payload, model="gemini-3.1-flash-lite")
        except RuntimeError:
            pass  # fallback also failed, continue to backoff

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
        "system_instruction": {"parts": [{"text": system_prompt}]},
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
    # Strip data-URI prefix if present (e.g., "data:image/jpeg;base64,...")
    if "," in image_base64 and image_base64.startswith("data:"):
        image_base64 = image_base64.split(",", 1)[1]

    cache_key_text = f"[VISION]{text[:100]}[IMG]{hashlib.sha256(image_base64.encode()).hexdigest()[:16]}"

    cached = _cache_get(GEMINI_MODEL, system_prompt, cache_key_text)
    if cached is not None:
        return cached

    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": text or "Analyze this image."},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
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
