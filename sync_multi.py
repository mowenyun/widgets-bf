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
REPO_BASE = f"https://github.com/{GITHUB_USER}/{REPO_NAME}"

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

    downloaded_widgets = 0

    if data.get("icon"):
        icon_url = data["icon"]
        icon_name = os.path.basename(urlparse(icon_url).path) or "icon.png"
        icon_local = os.path.join(source_assets_dir, icon_name)

        try:
            print("Downloading icon:", icon_url)
            download_file(icon_url, icon_local, headers)
            mirror_data["icon"] = f"{RAW_BASE}/{icon_local.replace(os.sep, '/')}"
        except Exception as e:
            print("Failed to download icon:", icon_url, e)

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
            downloaded_widgets += 1
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

    return {
        "id": source_id,
        "name": source_name,
        "source_url": source_url,
        "origin_file": origin_out.replace(os.sep, "/"),
        "mirror_file": mirror_out.replace(os.sep, "/"),
        "widget_count": len(origin_widgets),
        "downloaded_widgets": downloaded_widgets
    }

def generate_readme(results):
    lines = []
    lines.append(f"# {REPO_NAME}")
    lines.append("")
    lines.append("自动同步多个 Forward Widgets 订阅源，并生成两个版本：")
    lines.append("")
    lines.append("- `origin`：订阅文件在本仓库，但 js 仍使用原始地址")
    lines.append("- `mirror`：订阅文件和 js 都使用本仓库地址")
    lines.append("")
    lines.append("## 仓库说明")
    lines.append("")
    lines.append(f"- 仓库地址：{REPO_BASE}")
    lines.append(f"- Raw 根地址：{RAW_BASE}")
    lines.append("- 配置文件：`sources.json`")
    lines.append("- 自动同步脚本：`sync_multi.py`")
    lines.append("")
    lines.append("## 目录说明")
    lines.append("")
    lines.append("- `subscriptions/`：生成的订阅文件")
    lines.append("- `widgets/`：同步下来的 js 文件")
    lines.append("- `assets/`：图标等资源")
    lines.append("- `originals/`：原始抓取的 fwd 文件备份")
    lines.append("")
    lines.append("## 当前已同步源")
    lines.append("")

    if not results:
        lines.append("当前没有可用的同步源。")
        lines.append("")
    else:
        for item in results:
            origin_url = f"{RAW_BASE}/{item['origin_file']}"
            mirror_url = f"{RAW_BASE}/{item['mirror_file']}"
            lines.append(f"### {item['name']} (`{item['id']}`)")
            lines.append("")
            lines.append(f"- 源地址：`{item['source_url']}`")
            lines.append(f"- Widget 数量：`{item['widget_count']}`")
            lines.append(f"- 成功下载 js 数量：`{item['downloaded_widgets']}`")
            lines.append(f"- 原地址版：{origin_url}")
            lines.append(f"- 镜像版：{mirror_url}")
            lines.append("")

    lines.append("## 使用方法")
    lines.append("")
    lines.append("1. 编辑 `sources.json`，添加或删除要同步的订阅源")
    lines.append("2. 在 GitHub Actions 中运行同步任务")
    lines.append("3. 从 `subscriptions/` 中使用生成后的订阅文件")
    lines.append("")
    lines.append("## 自动生成说明")
    lines.append("")
    lines.append("本 README 由 `sync_multi.py` 自动生成，请勿手动长期维护。")
    lines.append("")

    with open("README.md", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

def main():
    ensure_dir(SUBSCRIPTIONS_DIR)
    ensure_dir(WIDGETS_DIR)
    ensure_dir(ASSETS_DIR)
    ensure_dir(ORIGINALS_DIR)

    sources = load_sources()
    results = []

    for source in sources:
        try:
            result = process_source(source)
            results.append(result)
        except Exception as e:
            print(f"Source failed: {source.get('id', 'unknown')} -> {e}")

    generate_readme(results)

if __name__ == "__main__":
    main()import os
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

    # 避免不同源 id 冲突
    original_id = w.get("id") or w.get("title") or "unknown"
    safe_id = str(original_id).strip().replace(" ", "_")
    w["id"] = f"{source_id}.{safe_id}"

    # 保留来源信息到描述里
    desc = w.get("description", "")
    prefix = f"[source:{source_name}] "
    if not desc.startswith(prefix):
        w["description"] = prefix + desc

    return w

def process_source(source):
    source_id = source["id"]
    source_name = source.get("name", source_id)
    source_url = source["url"]
    referer = source.get("referer", "")

    print(f"\n===== Processing: {source_name} ({source_id}) =====")

    headers = build_headers(referer)
    local_dir = os.path.join(SYNCED_DIR, source_id)
    reset_dir(local_dir)

    text = download_text(source_url, headers)
    data = json.loads(text)

    origin_widgets = []
    mirror_widgets = []
    downloaded = 0

    for widget in data.get("widgets", []):
        if not isinstance(widget, dict):
            continue

        origin_widget = normalize_widget(widget, source_id, source_name)
        mirror_widget = copy.deepcopy(origin_widget)

        url = widget.get("url")
        if url:
            filename = os.path.basename(urlparse(url).path)
            if filename:
                local_path = os.path.join(local_dir, filename)
                try:
                    print("Downloading:", url)
                    download_file(url, local_path, headers)
                    mirror_widget["url"] = f"{RAW_BASE}/{local_path.replace(os.sep, '/')}"
                    downloaded += 1
                except Exception as e:
                    print("Failed:", url, e)
                    mirror_widget["url"] = url

        origin_widgets.append(origin_widget)
        mirror_widgets.append(mirror_widget)

    return {
        "id": source_id,
        "name": source_name,
        "source_url": source_url,
        "origin_widgets": origin_widgets,
        "mirror_widgets": mirror_widgets,
        "widget_count": len(origin_widgets),
        "downloaded": downloaded
    }

def load_custom_widgets():
    ensure_dir(CUSTOM_DIR)

    widgets = []
    for filename in sorted(os.listdir(CUSTOM_DIR)):
        if not filename.endswith(".js"):
            continue

        widget_name = os.path.splitext(filename)[0]
        file_path = os.path.join(CUSTOM_DIR, filename).replace(os.sep, "/")

        widgets.append({
            "id": f"custom.{widget_name}",
            "title": widget_name,
            "description": f"[source:custom] Custom widget: {widget_name}",
            "requiredVersion": "0.0.1",
            "version": "1.0.0",
            "author": GITHUB_USER,
            "url": f"{RAW_BASE}/{file_path}"
        })

    return widgets

def write_aggregated_subscriptions(origin_widgets, mirror_widgets):
    ensure_dir(SUBSCRIPTIONS_DIR)

    origin_data = {
        "title": f"{GITHUB_USER} aggregated widgets",
        "description": "Aggregated widgets subscription (origin urls)",
        "widgets": origin_widgets
    }

    mirror_data = {
        "title": f"{GITHUB_USER} aggregated widgets",
        "description": "Aggregated widgets subscription (mirror urls)",
        "widgets": mirror_widgets
    }

    origin_path = os.path.join(SUBSCRIPTIONS_DIR, "all-origin.fwd")
    mirror_path = os.path.join(SUBSCRIPTIONS_DIR, "all-mirror.fwd")

    with open(origin_path, "w", encoding="utf-8") as f:
        json.dump(origin_data, f, ensure_ascii=False, indent=2)

    with open(mirror_path, "w", encoding="utf-8") as f:
        json.dump(mirror_data, f, ensure_ascii=False, indent=2)

def generate_readme(results, total_origin, total_mirror):
    lines = []
    lines.append(f"# {REPO_NAME}")
    lines.append("")
    lines.append("自动聚合多个 Forward Widgets 来源，并生成统一订阅。")
    lines.append("")
    lines.append("## 订阅地址")
    lines.append("")
    lines.append(f"- 聚合原地址版：{RAW_BASE}/subscriptions/all-origin.fwd")
    lines.append(f"- 聚合镜像版：{RAW_BASE}/subscriptions/all-mirror.fwd")
    lines.append("")
    lines.append("## 目录")
    lines.append("")
    lines.append("- `sources.json`：外部源配置")
    lines.append("- `subscriptions/`：聚合订阅文件")
    lines.append("- `synced/`：同步下来的外部 js")
    lines.append("- `custom/`：你自己上传的 js")
    lines.append("")
    lines.append("## 当前来源")
    lines.append("")

    for item in results:
        lines.append(f"### {item['name']} (`{item['id']}`)")
        lines.append(f"- 来源：`{item['source_url']}`")
        lines.append(f"- Widgets：`{item['widget_count']}`")
        lines.append(f"- 成功镜像 js：`{item['downloaded']}`")
        lines.append("")

    lines.append("### custom")
    lines.append(f"- 来源：`{REPO_BASE}/tree/{BRANCH}/custom`")
    lines.append(f"- Widgets：`{len(total_origin) - sum(i['widget_count'] for i in results)}`")
    lines.append("")
    lines.append("## 统计")
    lines.append("")
    lines.append(f"- 聚合原地址版总数：`{len(total_origin)}`")
    lines.append(f"- 聚合镜像版总数：`{len(total_mirror)}`")
    lines.append("")
    lines.append("## 使用说明")
    lines.append("")
    lines.append("1. 外部源：编辑 `sources.json`")
    lines.append("2. 自定义 js：上传到 `custom/`")
    lines.append("3. 运行 GitHub Actions 自动更新聚合订阅")
    lines.append("")
    lines.append("本 README 由脚本自动生成。")
    lines.append("")

    with open("README.md", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

def main():
    ensure_dir(SUBSCRIPTIONS_DIR)
    ensure_dir(SYNCED_DIR)
    ensure_dir(CUSTOM_DIR)

    results = []
    all_origin_widgets = []
    all_mirror_widgets = []

    try:
        sources = load_sources()
    except Exception as e:
        print("Failed to load sources.json:", e)
        sources = []

    for source in sources:
        try:
            result = process_source(source)
            results.append(result)
            all_origin_widgets.extend(result["origin_widgets"])
            all_mirror_widgets.extend(result["mirror_widgets"])
        except Exception as e:
            print(f"Source failed: {source.get('id', 'unknown')} -> {e}")

    custom_widgets = load_custom_widgets()
    all_origin_widgets.extend(custom_widgets)
    all_mirror_widgets.extend(custom_widgets)

    write_aggregated_subscriptions(all_origin_widgets, all_mirror_widgets)
    generate_readme(results, all_origin_widgets, all_mirror_widgets)

if __name__ == "__main__":
    main()
