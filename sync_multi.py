import os
import re
import json
import copy
import shutil
import requests
from urllib.parse import urlparse

GITHUB_USER = "mowenyun"
REPO_NAME = "widgets-bf"
BRANCH = "main"

RAW_BASE = f"https://raw.githubusercontent.com/{GITHUB_USER}/{REPO_NAME}/{BRANCH}"
REPO_BASE = f"https://github.com/{GITHUB_USER}/{REPO_NAME}"

SOURCE_CONFIG = "sources.json"
SUBSCRIPTIONS_DIR = "subscriptions"
SYNCED_DIR = "synced"
CUSTOM_DIR = "custom"

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0"
}


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def reset_dir(path):
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


def normalize_widget(widget, source_id, source_name):
    w = copy.deepcopy(widget)

    original_id = w.get("id") or w.get("title") or "unknown"
    safe_id = str(original_id).strip().replace(" ", "_")
    w["id"] = f"{source_id}.{safe_id}"

    desc = w.get("description", "")
    prefix = f"[source:{source_name}] "
    if not desc.startswith(prefix):
        w["description"] = prefix + desc

    return w


def process_source(source):
    source_id = source["id"]
    source