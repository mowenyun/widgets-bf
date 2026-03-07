import os
import json
import copy
import shutil
import requests
from urllib.parse import urlparse

GITHUB_USER = "mowenyun"
REPO_NAME = "widgets-bf"
BRANCH = "main"

RAW_BASE = f"https://raw.githubusercontent.com/{GITHUB_USER}/{REPO_NAME}/{BRANCH}"

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

SOURCE_CONFIG = "sources.json"
SUBSCRIPTIONS_DIR = "subscriptions"
WIDGETS_DIR = "widgets"
ASSETS_DIR = "assets"
ORIGINALS_DIR = "originals"

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def safe_remove_dir(path):
    if os.path.exists(path):
        shutil.rmtree(path)
    os.makedirs(path, exist_ok=True)

def download_text(url, headers):
    r = requests.get(url, headers=headers, timeout=30)
    r.raise_for_status()
    return r.text

def download_file(url, local_path, headers):
    r = requests.get(url, headers=headers, timeout=60)
    r.raise_for_status()
    ensure_dir(os.path.dirname(local_path) or ".")
    with open(local_path, "wb") as f:
        f.write(r.content)

def load_sources():
    with open(SOURCE_CONFIG, "r", encoding="utf-8") as f:
        return json.load(f)

def build_headers(referer=""):
    headers = DEFAULT_HEADERS.copy()
    if referer:
        headers["Referer"] = referer
    return headers

def process_source(source):
    source_id = source["id"]
    source_name = source.get("name", source_id)
    source_url = source["url"]
    referer = source.get("referer", "")

    print(f"\n===== Processing: {source_name} ({source_id}) =====")
    headers = build_headers(referer)

    source_widgets_dir = os.path.join(WIDGETS_DIR, source_id)
    source_assets_dir = os.path.join(ASSETS_DIR, source_id)

    safe_remove_dir(source_widgets_dir)
    safe_remove_dir(source_assets_dir)

    ensure_dir(SUBSCRIPTIONS_DIR)
    ensure_dir(ORIGINALS_DIR)

    text = download_text(source_url, headers)

    original_text_path = os.path.join(ORIGINALS_DIR, f"{source_id}.original.fwd")
    with open(original_text_path, "w", encoding="utf-8") as f:
        f.write(text)

    data = json.loads(text)
    origin_data = copy.deepcopy(data)
    mirror_data = copy.deepcopy(data)

    # 处理 icon
    if data.get("icon"):
        icon_url = data["icon"]
        icon_name = os.path.basename(urlparse(icon_url).path) or "icon.png"
        icon_local = os.path。join(source_assets_dir, icon_name)

        try:
            print("Downloading icon:", icon_url)
            download_file(icon_url, icon_local, headers)
            mirror_data["icon"] = f"{RAW_BASE}/{icon_local.replace(os.sep, '/')}"
        except Exception as e:
            print("Failed to download icon:", icon_url, e)

    # 处理 widgets
    origin_widgets = origin_data.get("widgets", [])
    mirror_widgets = mirror_data.get("widgets", [])

    for i, widget in enumerate(origin_widgets):
        url = widget.get("url")
        if not url:
            continue

        filename = os.path.basename(urlparse(url).path)
        if not filename:
            continue

        local_path = os.path.join(source_widgets_dir, filename)

        try:
            print("Downloading widget:", url)
            download_file(url, local_path, headers)
            mirror_widgets[i]["url"] = f"{RAW_BASE}/{local_path.replace(os.sep, '/')}"
        except Exception as e:
            print("Failed to download widget:", url, e)
            mirror_widgets[i]["url"] = url

    origin_out = os.path.join(SUBSCRIPTIONS_DIR, f"{source_id}-origin.fwd")
    mirror_out = os.path.join(SUBSCRIPTIONS_DIR, f"{source_id}-mirror.fwd")

    with open(origin_out, "w", encoding="utf-8") as f:
        json.dump(origin_data, f, ensure_ascii=False, indent=2)

    with open(mirror_out, "w", encoding="utf-8") as f:
        json.dump(mirror_data, f, ensure_ascii=False, indent=2)

    print(f"Generated: {origin_out}")
    print(f"Generated: {mirror_out}")

def main():
    ensure_dir(SUBSCRIPTIONS_DIR)
    ensure_dir(WIDGETS_DIR)
    ensure_dir(ASSETS_DIR)
    ensure_dir(ORIGINALS_DIR)

    sources = load_sources()
    for source in sources:
        try:
            process_source(source)
        except Exception as e:
            print(f"Source failed: {source.get('id', 'unknown')} -> {e}")

if __name__ == "__main__":
    main()

