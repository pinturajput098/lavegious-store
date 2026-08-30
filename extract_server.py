from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import re

app = Flask(__name__)
CORS(app)

@app.route('/extract', methods=['POST'])
def extract_product():
    data = request.get_json() or {}
    url = data.get('url', '')
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    try:
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Real HD Photo
        og_img = soup.find('meta', property='og:image') or soup.find('meta', attrs={'name': 'og:image'})
        image_url = og_img['content'] if og_img else ""
        
        # Real Title
        og_title = soup.find('meta', property='og:title') or soup.find('title')
        title = og_title['content'] if og_title and 'content' in og_title.attrs else (soup.title.string if soup.title else "")
        title = re.sub(r'\s*\|.*|Online at Best Price.*', '', title).strip()
        
        cat = "Jeans" if "jean" in url.lower() else "T-Shirts" if "tshirt" in url.lower() else "Shirts"
        
        return jsonify({
            "title": title or "Streetwear Apparel",
            "price": 899,
            "originalPrice": 1799,
            "category": cat,
            "tag": "Trending Drop",
            "image": image_url,
            "description": "Premium high-density fabric streetwear drop. Soft texture with modern aesthetic fit."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
