import requests
from bs4 import BeautifulSoup
import sys

# Your site URL
TARGET_URL = "http://gamedayxpress.com"

def get_all_links(url):
    """Fetches the homepage and extracts all valid HTTP/HTTPS links."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch the main site: {e}")
        sys.exit(1)

    soup = BeautifulSoup(response.text, "html.parser")
    links = set()
    
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        # Only grab actual web links (ignore mailto:, javascript:, etc.)
        if href.startswith("http"):
            links.add(href)
            
    return links

def check_links(links):
    """Pings each link to see if it is alive or dead."""
    broken_links = []
    # Using a standard User-Agent so sports sites don't block our script as a bot
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'} 
    
    for link in links:
        try:
            # We use a HEAD request first because it's faster and saves bandwidth
            res = requests.head(link, headers=headers, timeout=5, allow_redirects=True)
            
            if res.status_code >= 400:
                # If HEAD fails, double-check with a standard GET request
                res_get = requests.get(link, headers=headers, timeout=5)
                if res_get.status_code >= 400:
                    broken_links.append((link, res_get.status_code))
                    
        except requests.exceptions.RequestException as e:
            # Captures timeouts, DNS failures, etc.
            broken_links.append((link, "Connection Error/Timeout"))
            
    return broken_links

if __name__ == "__main__":
    print(f"Scanning {TARGET_URL} for links...")
    all_links = get_all_links(TARGET_URL)
    print(f"Found {len(all_links)} unique links. Checking statuses...\n")
    
    dead_links = check_links(all_links)
    
    if dead_links:
        print(f"❌ Found {len(dead_links)} broken links:")
        for link, status in dead_links:
            print(f"- {link} (Error: {status})")
        # Exit with a status of 1 so GitHub Actions knows the test "failed"
        sys.exit(1) 
    else:
        print("✅ All links are working perfectly!")
        sys.exit(0)
