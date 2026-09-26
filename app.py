import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
CORS(app)

def get_client():
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return None
    return OpenAI(api_key=key)

@app.get("/")
def home():
    return jsonify({"status": "online", "app": "Jatin AI"})

@app.get("/health")
def health():
    return jsonify({"ok": True, "service": "Jatin AI backend"})

@app.post("/chat")
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Message is required"}), 400

    client = get_client()
    if client is None:
        return jsonify({"reply": "Jatin AI backend is online, but OPENAI_API_KEY is not configured yet."})

    try:
        response = client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-5.6-mini"),
            instructions="You are Jatin AI, a helpful, friendly AI assistant.",
            input=message
        )
        return jsonify({"reply": response.output_text})
    except Exception as e:
        return jsonify({"error": "AI request failed", "details": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", "10000"))
    app.run(host="0.0.0.0", port=port)
