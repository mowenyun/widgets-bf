# widgets-bf

自动聚合多个 Forward Widgets 来源，并生成统一订阅。

## 订阅地址

- 聚合原地址版：https://raw.githubusercontent.com/mowenyun/widgets-bf/main/subscriptions/all-origin.fwd
- 聚合镜像版：https://raw.githubusercontent.com/mowenyun/widgets-bf/main/subscriptions/all-mirror.fwd

## 目录

- `sources.json`：来源配置
- `subscriptions/`：聚合订阅文件
- `synced/`：同步下来的外部 js
- `custom/`：你自己上传的 js

## 当前来源

### huangxd Widgets (`huangxd`)
- 来源：`https://raw.githubusercontent.com/huangxd-/ForwardWidgets/refs/heads/main/widgets.fwd`
- Widgets：`8`
- 成功镜像 js：`8`

### ec Widgets (`ec`)
- 来源：`https://raw.githubusercontent.com/EmrysChoo/ForwardWidgets/refs/heads/main/Widgets.fwd`
- Widgets：`14`
- 成功镜像 js：`10`

### ti Widgets (`ti`)
- 来源：`https://raw.githubusercontent.com/bemarkt/scripts/refs/heads/master/provider/Forward/ti.fwd`
- Widgets：`2`
- 成功镜像 js：`2`

### makkapakka Forward Widgets (`makkapakka`)
- 来源：`https://raw.githubusercontent.com/MakkaPakka518/FW/refs/heads/main/widgets.fwd`
- Widgets：`22`
- 成功镜像 js：`21`

### 2kuai ForwardWidgets (`2kuai`)
- 来源：`https://github.com/2kuai/ForwardWidgets/tree/main/Widgets`
- Widgets：`3`
- 成功镜像 js：`4`

### custom
- 来源：`https://github.com/mowenyun/widgets-bf/tree/main/custom`
- Widgets：`2`

## 统计

- 聚合原地址版总数：`47`
- 聚合镜像版总数：`47`

## 跳过记录

- 来源 `2kuai ForwardWidgets` / 文件 `jpyy.js` / 原因：未提取到有效的 WidgetMetadata

## 使用说明

1. 外部源：编辑 `sources.json`
2. 自定义 js：上传到 `custom/`
3. 运行 GitHub Actions 自动更新聚合订阅

本 README 由脚本自动生成。
