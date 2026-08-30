import os
import sys
import json
import re
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
        print(f"⚠️ Gemini API Request Failed: {e}")
        return None

def read_project_files():
    files_data = {}
    targets = ['public/index.html', 'public/script.js', 'public/admin.html', 'products.json', 'auto_drop.py']
    for path in targets:
        if os.path.exists(path):
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    files_data[path] = f.read()
            except:
                pass
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
    cleaned = clean_json_text(changes_json_str)
    try:
        changes = json.loads(cleaned, strict=False)
    except Exception as parse_err:
        # Fallback repair for escaped backslashes in code string
        try:
            repaired = re.sub(r'(?<!\\)\\(?!["\\/bfnrtu])', r'\\\\', cleaned)
            changes = json.loads(repaired, strict=False)
        except Exception as second_err:
            return False, f"JSON Parse Error: {parse_err}"

    try:
        for filepath, content in changes.items():
            filepath = filepath.lstrip("./")
            dirname = os.path.dirname(filepath)
            if dirname:
                os.makedirs(dirname, exist_ok=True)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Successfully updated file: {filepath}")
        return True, "Success"
    except Exception as write_err:
        return False, f"File Write Error: {write_err}"

def run_git_push(commit_msg):
    print("🚀 Git Push initiating...")
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", commit_msg])
    res = subprocess.run(["git", "push", "origin", "main"])
    if res.returncode == 0:
        print("🔥 SUCCESS: Changes pushed cleanly to main branch!")
        return True
    else:
        print("⚠️ Git Push failed!")
        return False

def autonomous_loop(user_prompt):
    system_prompt = """You are an expert Autonomous Developer.
Return ONLY a valid JSON object mapping file paths to complete file contents.
Example JSON:
{
  "auto_drop.py": "code content here..."
}
STRICT RULE: Do NOT touch or modify any other files unless explicitly instructed by the user."""

    print(f"\n🤖 Autonomous Gemini Agent Started: '{user_prompt}'")
    current_files = read_project_files()
    feedback = ""

    # Self-healing retry loop (Max 3 attempts)
    for attempt in range(1, 4):
        print(f"\n🔄 Attempt {attempt} of 3...")
        
        full_input = f"User Request: {user_prompt}\n\nCurrent Codebase:\n{json.dumps(current_files)}"
        if feedback:
            full_input += f"\n\nPrevious Attempt Error Feedback:\n{feedback}\nPlease fix the JSON formatting/escaping error and return a valid JSON object."

        ai_response = call_gemini(full_input, system_prompt)
        if not ai_response:
            feedback = "Empty or invalid response from Gemini API"
            continue

        success, msg = apply_code_changes(ai_response)
        if success:
            run_git_push(f"Auto Update: {user_prompt[:40]}")
            print("🎉 Task completed successfully!")
            return
        else:
            print(f"❌ Attempt {attempt} failed: {msg}")
            feedback = msg

    print("❌ Agent could not self-heal after 3 attempts.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        autonomous_loop(" ".join(sys.argv[1:]))
    else:
        print("Usage: gemini \"your prompt here\"")
