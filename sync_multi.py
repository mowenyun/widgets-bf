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


def extract_widget_metadata(js_text):
    """
    从 js 文件中提取 WidgetMetadata = {...}
    这是一个尽量宽松的简单提取器，不保证覆盖所有极端情况。
    """
    m = re.search(r'WidgetMetadata\s*=\s*\{', js_text)
    if not m:
        return None

    start = m.end() - 1
    depth = 0
    in_str = None
    escape = False

    for i in range(start, len(js_text)):
        ch = js_text[i]

        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_str:
                in_str = None
            continue

        if ch in ("'", '"'):
            in_str = ch
            continue

        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                obj_text = js_text[start:i + 1]
                break
    else:
        return None

    # 尝试把 JS 对象转成 JSON 兼容格式
    candidate = obj_text

    # 去掉尾逗号
    candidate = re.sub(r",\s*}", "}", candidate)
    candidate = re.sub(r",\s*]", "]", candidate)

    # 给裸 key 补引号
    candidate = re.sub(r'([{\s,])([A-Za-z_][A-Za-z0-9_]*)\s*:', r'\1"\2":', candidate)

    # 单引号改双引号
    candidate = re.sub(r"'", '"', candidate)

    try:
        return json.loads(candidate)
    except Exception:
        return None


def build_custom_widget_from_file(filename):
    path = os.path.join(CUSTOM_DIR, filename)
    raw_path = path.replace(os.sep, "/")
    widget_name = os.path.splitext(filename)[0]

    metadata = None
    try:
        with open(path, "r", encoding="utf-8") as f:
            js_text = f.read()
        metadata = extract_widget_metadata(js_text)
    except Exception as e:
        print(f"Failed to read custom file metadata: {filename} -> {e}")

    if metadata and isinstance(metadata, dict):
        return {
            "id": metadata.get("id") or f"custom.{widget_name}",
            "title": metadata.get("title") or widget_name,
            "description": metadata.get("description") or f"[source:custom] Custom widget: {widget_name}",
            "requiredVersion": metadata.get("requiredVersion") or "0.0.1",
            "version": metadata.get("version") or "1.0.0",
            "author": metadata.get("author") or GITHUB_USER,
            "url": f"{RAW_BASE}/{raw_path}"
        }

    return {
        "id": f"custom.{widget_name}",
        "title": widget_name,
        "description": f"[source:custom] Custom widget: {widget_name}",
        "requiredVersion": "0.0.1",
        "version": "1.0.0",
        "author": GITHUB_USER,
        "url": f"{RAW_BASE}/{raw_path}"
    }


def load_custom_widgets():
    ensure_dir(CUSTOM_DIR)

    widgets = []
    for filename in sorted(os.listdir(CUSTOM_DIR)):
        if not filename.endswith(".js"):
            continue
        widgets.append(build_custom_widget_from_file(filename))

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


def generate_readme(results, total_origin, total_mirror, custom_count):
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
    lines.append(f"- Widgets：`{custom_count}`")
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
    generate_readme(results, all_origin_widgets, all_mirror_widgets, len(custom_widgets))


if __name__ == "__main__":
    main()
