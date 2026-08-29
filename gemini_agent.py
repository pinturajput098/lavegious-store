import os
import sys
import json
import subprocess
import urllib.request

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("❌ Error: GEMINI_API_KEY environment variable set nahi hai!")
    sys.exit(1)

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

def call_gemini(prompt, system_instruction=""):
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(GEMINI_URL, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        print(f"⚠️ Gemini API Error: {e}")
        return None

def read_project_files():
    files_data = {}
    targets = ['public/index.html', 'public/script.js', 'public/admin.html', 'products.json']
    for path in targets:
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                files_data[path] = f.read()
    return files_data

def clean_json_text(raw_text):
    if not raw_text:
        return ""
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()

def apply_code_changes(changes_json_str):
    try:
        cleaned = clean_json_text(changes_json_str)
        changes = json.loads(cleaned)
        for filepath, content in changes.items():
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Updated: {filepath}")
        return True
    except Exception as e:
        print(f"❌ JSON Parse Error: {e}")
        return False

def run_git_push(commit_msg):
    print("🚀 Git Push processing...")
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", commit_msg])
    res = subprocess.run(["git", "push", "origin", "main"])
    if res.returncode == 0:
        print("🔥 SUCCESS: Changes pushed cleanly to GitHub!")
    else:
        print("⚠️ Git Push failed!")

def autonomous_loop(user_prompt):
    system_prompt = """
    You are an expert Frontend Developer and UI Designer for 'LAVEGIOUS' streetwear brand.
    THEME: Premium Purple (#6D28D9, #7C3AED) and White gradient clean glassmorphism aesthetic.
    
    Your task:
    1. Update frontend (public/index.html & script.js) and admin panel (public/admin.html) according to the user request.
    2. Maintain existing search logic, category chips filter, image fallbacks (referrerpolicy="no-referrer").
    3. Return ONLY a valid JSON object mapping file paths to full code content.
    """

    print(f"\n🤖 Gemini Executing Prompt: '{user_prompt}'")
    current_files = read_project_files()
    full_input = f"User Request: {user_prompt}\n\nCurrent Codebase:\n{json.dumps(current_files)}"

    ai_response = call_gemini(full_input, system_prompt)
    if ai_response and apply_code_changes(ai_response):
        run_git_push(f"Gemini Auto Update: {user_prompt[:50]}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        autonomous_loop(" ".join(sys.argv[1:]))
    else:
        print("Usage: gemini \"your instructions here\"")
