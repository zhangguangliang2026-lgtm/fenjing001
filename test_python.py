import requests
import json
import sys

API_KEY = "test"
BASE_URL = "https://gpt-best.apifox.cn"
MODEL = "claude-sonnet-4-6"

def call_claude_api(prompt, temperature=0.7):
    url = f"{BASE_URL}/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    data = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "max_tokens": 8192
    }
    
    try:
        response = requests.post(url=url, headers=headers, data=json.dumps(data), timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Response Text (first 200 chars): {response.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    call_claude_api("Hello")
