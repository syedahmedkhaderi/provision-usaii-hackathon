from __future__ import annotations

import llm_client


class _FakeResponse:
    def __init__(self, payload: dict):
        self._payload = payload
        self.status_code = 200

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


class _FakeClient:
    def __init__(self, payload: dict, capture: dict):
        self.payload = payload
        self.capture = capture

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def post(self, url: str, headers: dict | None = None, json: dict | None = None):
        self.capture["url"] = url
        self.capture["headers"] = headers or {}
        self.capture["json"] = json or {}
        return _FakeResponse(self.payload)


def _mock_httpx_client(monkeypatch, response_payload: dict, capture: dict):
    monkeypatch.setattr(
        llm_client.httpx,
        "Client",
        lambda timeout=30: _FakeClient(response_payload, capture),
    )


def test_call_gemini_json_uses_rest_field_names(monkeypatch):
    capture: dict = {}
    response_payload = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {"text": '{"category":"other","must_report":false,"deadline_days":null,"reasoning":"Test.","confidence":"high","call_script":{"opening":"Hi","what_to_say":"Test","what_to_ask":"Test"}}'}
                    ]
                }
            }
        ]
    }

    monkeypatch.setattr(llm_client, "GEMINI_API_KEYS", ["test-key"])
    monkeypatch.setattr(llm_client, "_gemini_disabled_until", 0.0)
    _mock_httpx_client(monkeypatch, response_payload, capture)

    llm_client.call_gemini_json("System prompt", "User prompt")

    assert capture["url"].endswith(":generateContent")
    assert capture["headers"]["x-goog-api-key"] == "test-key"
    assert "system_instruction" in capture["json"]
    assert "systemInstruction" not in capture["json"]


def test_call_gemini_vision_json_uses_rest_field_names(monkeypatch):
    capture: dict = {}
    response_payload = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {"text": '{"notice_type":"renewal_reminder","what_it_means":"Test.","urgency":"moderate","deadline_days":30,"confidence":"high","key_facts":["One","Two","Three"],"options":[{"label":"Submit report","detail":"Do it soon."}]}'}
                    ]
                }
            }
        ]
    }

    monkeypatch.setattr(llm_client, "GEMINI_API_KEYS", ["test-key"])
    monkeypatch.setattr(llm_client, "_gemini_disabled_until", 0.0)
    _mock_httpx_client(monkeypatch, response_payload, capture)

    llm_client.call_gemini_vision_json("System prompt", "User prompt", "abcd1234", "image/png")

    parts = capture["json"]["contents"][0]["parts"]
    assert "system_instruction" in capture["json"]
    assert "systemInstruction" not in capture["json"]
    assert "inline_data" in parts[1]
    assert "inlineData" not in parts[1]
    assert parts[1]["inline_data"]["mime_type"] == "image/png"
