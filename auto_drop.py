import os
import argparse
import requests
import json
import uuid
from datetime import datetime
import subprocess
from dotenv import load_dotenv
import google.generativeai as genai
import re

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in a .env file.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

PRODUCTS_JSON_FILE = 'products.json'
GIT_REPO_PATH = '.' # Assuming the script is run from the root of the git repository

# --- Helper Functions ---

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

def extract_product_data_with_gemini(html_content, product_url):
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
    {html_content}
    ```

    Extract the following fields:
    - `title`: The main product title.
    - `price`: The current selling price of the product. Extract only the numerical value. If a currency symbol is present, ignore it.
    - `originalPrice`: (Optional) The original price if a discount is applied. Extract only the numerical value. If not found, set to `null`.
    - `category`: A general category for the product (e.g., "T-Shirts", "Jeans", "Shoes", "Accessories"). Infer from title, description, or common page elements.
    - `tag`: (Optional) A short, descriptive tag for the product (e.g., "Oversized", "Trending", "New Drop", "Limited Edition"). If not found, set to `null`.
    - `images`: An array of URLs for product images. Prioritize high-quality, clear images. If only one image is found, provide an array with one URL.
    - `description`: A concise description of the product, summarizing its key features, material, or style.
    - `supplier`: (Optional) The supplier name (e.g., "QIKINK", "CJ_DROPSHIPPING"). Infer if possible, otherwise `null`.
    - `supplierSku`: (Optional) The supplier's SKU or product ID. If not found, set to `null`.

    Ensure the output is a valid JSON object, and do not include any other text or markdown outside the JSON block.
    Example JSON format:
    {{
      "title": "Example Product Title",
      "price": 123.45,
      "originalPrice": 150.00,
      "category": "Shirts",
      "tag": "New Drop",
      "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
      "description": "A detailed description of the product features and benefits.",
      "supplier": "QIKINK",
      "supplierSku": "QK12345"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        # Gemini often wraps JSON in markdown code blocks
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
        print(f"Gemini raw response: {response.text if 'response' in locals() else 'No response'}")
        return None

def clean_and_format_product_data(data, product_url, affiliate_url):
    """Cleans, validates, and adds standard fields to the extracted product data."""
    if not data:
        return None

    # Ensure price and originalPrice are numbers
    try:
        data['price'] = float(re.sub(r'[^\d.]', '', str(data.get('price', 0))))
    except ValueError:
        data['price'] = 0.0

    if data.get('originalPrice') is not None:
        try:
            data['originalPrice'] = float(re.sub(r'[^\d.]', '', str(data['originalPrice'])))
        except ValueError:
            data['originalPrice'] = None
    else:
        data['originalPrice'] = None

    # Ensure images is a list of strings
    image_data = data.get('images')
    if isinstance(image_data, str):
        data['images'] = [image_data]
    elif isinstance(image_data, list):
        data['images'] = [img for img in image_data if isinstance(img, str) and img.strip()]
    else:
        data['images'] = []
    
    # Add required fields
    data['_id'] = str(uuid.uuid4())
    data['timestamp'] = datetime.now().isoformat()
    data['link'] = affiliate_url if affiliate_url else product_url
    data['isFeatured'] = False # New products are not featured by default

    # Ensure other fields exist and are strings
    data['title'] = str(data.get('title', 'Untitled Product')).strip()
    data['category'] = str(data.get('category', 'General')).strip()
    data['tag'] = str(data.get('tag', '')).strip() if data.get('tag') else None
    data['description'] = str(data.get('description', '')).strip()
    data['supplier'] = str(data.get('supplier', 'Other')).strip() if data.get('supplier') else 'Other'
    data['supplierSku'] = str(data.get('supplierSku', '')).strip() if data.get('supplierSku') else None

    return data

def update_products_json(new_product_data, filename=PRODUCTS_JSON_FILE):
    """Loads existing products, prepends new data, and saves back to JSON."""
    products = []
    if os.path.exists(filename):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                products = json.load(f)
            if not isinstance(products, list):
                print(f"Warning: {filename} is not a list. Initializing with empty list.")
                products = []
        except json.JSONDecodeError:
            print(f"Warning: {filename} is malformed. Initializing with empty list.")
            products = []

    # Prepend the new product
    products.insert(0, new_product_data)

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print(f"Successfully prepended new product to {filename}.")

def run_git_commands(commit_message, repo_path=GIT_REPO_PATH):
    """Adds, commits, and pushes changes to the git repository."""
    try:
        # Add products.json
        subprocess.run(['git', 'add', PRODUCTS_JSON_FILE], cwd=repo_path, check=True)
        print(f"Added {PRODUCTS_JSON_FILE} to git staging area.")

        # Commit changes
        subprocess.run(['git', 'commit', '-m', commit_message], cwd=repo_path, check=True)
        print(f"Committed changes with message: '{commit_message}'")

        # Push to remote (assuming 'origin' and current branch)
        # Get current branch name
        current_branch = subprocess.run(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'], 
            cwd=repo_path, 
            capture_output=True, 
            text=True, 
            check=True
        ).stdout.strip()
        
        subprocess.run(['git', 'push', 'origin', current_branch], cwd=repo_path, check=True)
        print(f"Pushed changes to origin/{current_branch}.")

    except subprocess.CalledProcessError as e:
        print(f"Git command failed: {e}")
        print(f"Stderr: {e.stderr.decode()}")
        print(f"Stdout: {e.stdout.decode()}")
    except Exception as e:
        print(f"An unexpected error occurred during git operations: {e}")

# --- Main Script Logic ---

def main():
    parser = argparse.ArgumentParser(description="Automate product drops to products.json and push to git.")
    parser.add_argument("product_url", help="The URL of the product page to scrape.")
    parser.add_argument("--affiliate_url", help="Optional affiliate link for the product.", default=None)
    args = parser.parse_args()

    print(f"Starting auto-drop for product URL: {args.product_url}")
    if args.affiliate_url:
        print(f"Using affiliate URL: {args.affiliate_url}")

    # 1. Fetch page content
    html_content = fetch_page_content(args.product_url)
    if not html_content:
        print("Failed to fetch page content. Exiting.")
        return

    # 2. Extract product data using Gemini
    print("Extracting product data using Gemini...")
    extracted_data = extract_product_data_with_gemini(html_content, args.product_url)
    if not extracted_data:
        print("Failed to extract product data with Gemini. Exiting.")
        return
    
    print("Gemini extraction successful. Raw extracted data:")
    print(json.dumps(extracted_data, indent=2, ensure_ascii=False))

    # 3. Clean and format data
    new_product = clean_and_format_product_data(extracted_data, args.product_url, args.affiliate_url)
    if not new_product:
        print("Failed to clean and format product data. Exiting.")
        return

    print("\nFormatted product data to be added:")
    print(json.dumps(new_product, indent=2, ensure_ascii=False))

    # 4. Update products.json
    try:
        update_products_json(new_product)
        print(f"Product '{new_product['title']}' added to {PRODUCTS_JSON_FILE}.")
    except Exception as e:
        print(f"Error updating {PRODUCTS_JSON_FILE}: {e}")
        return

    # 5. Push to git
    commit_message = f"feat: Add new product: {new_product['title']}"
    run_git_commands(commit_message)

    print("\nAuto-drop process completed successfully!")

if __name__ == "__main__":
    main()
