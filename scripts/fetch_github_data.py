import os
import requests
import json

GITHUB_TOKEN = os.environ['GITHUB_TOKEN']
REPO = os.environ['GITHUB_REPOSITORY']

HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

def fetch(endpoint):
    url = f"https://api.github.com/repos/{REPO}/{endpoint}"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return response.json()

def save_json(data, filename):
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    save_json(fetch("milestones?state=all"), "milestones.json")
    save_json(fetch("issues?state=all&per_page=100"), "issues.json")
    save_json(fetch("pulls?state=all&per_page=100"), "prs.json")