import os
import json
import uuid
from datetime import datetime
import requests
import re
from dotenv import load_dotenv
import google.generativeai as genai
from flask import Flask, request, jsonify, send_from_directory

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    # Fallback for Render deployment if .env isn't used, check direct env var
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

PRODUCTS_JSON_FILE = 'products.json'
ADMIN_PASSWORD = 'Yts@12345' # Hardcoded password as per request

app = Flask(__name__, static_folder='public', static_url_path='')

# --- Helper Functions (adapted from auto_drop.py) ---

def admin_required(f):
    """Decorator to check for admin password in headers."""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.headers.get('x-admin-password') != ADMIN_PASSWORD:
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

def load_products():
    """Loads products from products.json."""
    if not os.path.exists(PRODUCTS_JSON_FILE):
        return []
    try:
        with open(PRODUCTS_JSON_FILE, 'r', encoding='utf-8') as f:
            products = json.load(f)
            if not isinstance(products, list):
                print(f"Warning: {PRODUCTS_JSON_FILE} is not a list. Initializing with empty list.")
                return []
            return products
    except json.JSONDecodeError:
        print(f"Warning: {PRODUCTS_JSON_FILE} is malformed. Initializing with empty list.")
        return []
    except Exception as e:
        print(f"Error loading products.json: {e}")
        return []

def save_products(products):
    """Saves products to products.json."""
    try:
        with open(PRODUCTS_JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving products.json: {e}")

def fetch_page_content(url):
    """Fetches the HTML content of a given URL."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()  # Raise an exception for HTTP errors
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return None

def extract_product_data_with_gemini(html_content):
    """
    Uses Gemini to extract product details from HTML content.
    The prompt is designed to get a specific JSON structure.
    """
    if not html_content:
        return None

    prompt = f"""
    You are an expert at extracting product information from raw HTML.
    Given the following HTML content of a product page, extract the following details into a JSON object.
    Be precise and try to find the most accurate information.

    HTML Content:
    ```html
    {html_content[:10000]} # Limit HTML to avoid token limits
    ```

    Extract the following fields:
    - `title`: The main product title.
    - `price`: The current selling price of the product. Extract only the numerical value. If a currency symbol is present, ignore it. Round to 0 decimal places if possible.
    - `originalPrice`: (Optional) The original price if a discount is applied. Extract only the numerical value. If not found, set to `null`. Round to 0 decimal places if possible.
    - `category`: A general category for the product (e.g., "T-Shirts", "Jeans", "Shoes", "Accessories"). Infer from title, description, or common page elements.
    - `tag`: (Optional) A short, descriptive tag for the product (e.g., "Oversized", "Trending", "New Drop", "Limited Edition"). If not found, set to `null` or an empty string.
    - `image`: The URL of the primary product image. If multiple images are clearly visible and relevant, provide an array of URLs. Otherwise, provide a single URL string. Prioritize high-quality, clear images.
    - `description`: A concise description of the product, summarizing its key features, material, or style.

    Ensure the output is a valid JSON object, and do not include any other text or markdown outside the JSON block.
    Example JSON format:
    {{
      "title": "Example Product Title",
      "price": 123,
      "originalPrice": 150,
      "category": "Shirts",
      "tag": "New Drop",
      "image": "https://example.com/image.jpg",
      "description": "A detailed description of the product features and benefits."
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        
        # Attempt to find JSON within markdown block
        match = re.search(r"```json\n(.*)\n```", text_response, re.DOTALL)
        if match:
            json_str = match.group(1)
        else:
            # If not in markdown, assume the whole response is JSON
            json_str = text_response

        product_data = json.loads(json_str)
        return product_data
    except Exception as e:
        print(f"Error extracting product data with Gemini: {e}")
        print(f"Gemini raw response: {text_response if 'text_response' in locals() else 'No response'}")
        return None

def clean_and_format_extracted_data_for_frontend(data):
    """Cleans and formats extracted product data for frontend display."""
    if not data:
        return None

    cleaned_data = {}
    
    # Ensure price and originalPrice are numbers
    try:
        price_str = str(data.get('price', '0')).replace(',', '') # Remove commas
        cleaned_data['price'] = round(float(re.sub(r'[^\d.]', '', price_str))) if price_str else 0
    except ValueError:
        cleaned_data['price'] = 0

    original_price_str = str(data.get('originalPrice')).replace(',', '') if data.get('originalPrice') is not None else None
    if original_price_str:
        try:
            cleaned_data['originalPrice'] = round(float(re.sub(r'[^\d.]', '', original_price_str)))
        except ValueError:
            cleaned_data['originalPrice'] = None
    else:
        cleaned_data['originalPrice'] = None

    # Ensure image is a list of strings
    image_data = data.get('image')
    if isinstance(image_data, str):
        cleaned_data['images'] = [image_data]
    elif isinstance(image_data, list):
        cleaned_data['images'] = [img for img in image_data if isinstance(img, str) and img.strip()]
    else:
        cleaned_data['images'] = []

    # Ensure other fields exist and are strings
    cleaned_data['title'] = str(data.get('title', 'Untitled Product')).strip()
    cleaned_data['category'] = str(data.get('category', 'General')).strip()
    cleaned_data['tag'] = str(data.get('tag', '')).strip() if data.get('tag') else ''
    cleaned_data['description'] = str(data.get('description', '')).strip()

    return cleaned_data

# --- API Endpoints ---

@app.route('/api/products', methods=['GET'])
def get_products():
    products = load_products()
    return jsonify(products)

@app.route('/api/products', methods=['POST'])
@admin_required
def add_product():
    data = request.json
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    products = load_products()
    
    # Generate new product metadata
    new_product = {
        "_id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(),
        "isFeatured": False,
        "title": data.get('title', 'Untitled Product'),
        "price": float(data.get('price', 0)),
        "description": data.get('description', ''),
        "link": data.get('link', '#'),
        "category": data.get('category', 'General'),
        "tag": data.get('tag', '') if data.get('tag') else None,
        "images": data.get('images', []) # Expecting a list of base64 or URLs
    }
    
    products.insert(0, new_product)
    save_products(products)
    return jsonify(new_product), 201

@app.route('/api/products/<id>', methods=['PUT'])
@admin_required
def update_product(id):
    data = request.json
    if not data:
        return jsonify({"error": "Invalid data"}), 400

    products = load_products()
    for i, product in enumerate(products):
        if product['_id'] == id:
            # Update fields, but keep original _id, timestamp, isFeatured if not provided
            product['title'] = data.get('title', product.get('title'))
            product['price'] = float(data.get('price', product.get('price', 0)))
            product['description'] = data.get('description', product.get('description'))
            product['link'] = data.get('link', product.get('link'))
            product['category'] = data.get('category', product.get('category'))
            product['tag'] = data.get('tag', product.get('tag')) if data.get('tag') else None
            product['images'] = data.get('images', product.get('images', [])) # Update images
            
            products[i] = product
            save_products(products)
            return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/products/<id>', methods=['DELETE'])
@admin_required
def delete_product(id):
    products = load_products()
    initial_len = len(products)
    products = [p for p in products if p['_id'] != id]
    if len(products) < initial_len:
        save_products(products)
        return jsonify({"message": "Product deleted"}), 200
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/products/<id>/feature', methods=['PUT'])
@admin_required
def feature_product(id):
    products = load_products()
    found = False
    for product in products:
        if product['_id'] == id:
            product['isFeatured'] = True
            found = True
        else:
            product['isFeatured'] = False # Only one featured product at a time
    
    if found:
        save_products(products)
        return jsonify({"message": "Product feature status updated"}), 200
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/extract', methods=['POST'])
@admin_required
def extract_product_details():
    data = request.json
    product_url = data.get('url')

    if not product_url:
        return jsonify({"error": "URL is required"}), 400

    print(f"Attempting to extract from URL: {product_url}")
    html_content = fetch_page_content(product_url)
    if not html_content:
        return jsonify({"error": "Failed to fetch page content. URL might be invalid or inaccessible."}), 500

    extracted_data = extract_product_data_with_gemini(html_content)
    if not extracted_data:
        return jsonify({"error": "Failed to extract product data using AI. The page structure might be too complex or the AI encountered an issue."}), 500
    
    # Clean and format for frontend, but don't add DB-specific metadata yet
    formatted_data = clean_and_format_extracted_data_for_frontend(extracted_data)
    if not formatted_data:
        return jsonify({"error": "Failed to format extracted data."}), 500

    return jsonify(formatted_data)

# --- Serve Static Files ---
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    # Create products.json if it doesn't exist
    if not os.path.exists(PRODUCTS_JSON_FILE):
        with open(PRODUCTS_JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f, indent=2)
    app.run(debug=True, port=os.getenv("PORT", 5000))
