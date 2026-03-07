# widgets-bf

自动同步多个 Forward Widgets 订阅源，并生成两个版本：

- `origin`：订阅文件在本仓库，但 js 仍使用原始地址
- `mirror`：订阅文件和 js 都使用本仓库地址

## 仓库说明

- 仓库地址：https://github.com/mowenyun/widgets-bf
- Raw 根地址：https://raw.githubusercontent.com/mowenyun/widgets-bf/main
- 配置文件：`sources.json`
- 自动同步脚本：`sync_multi.py`

## 目录说明

- `subscriptions/`：生成的订阅文件
- `widgets/`：同步下来的 js 文件
- `assets/`：图标等资源
- `originals/`：原始抓取的 fwd 文件备份

## 当前已同步源

### huangxd Widgets (`huangxd`)

- 源地址：`https://raw.githubusercontent.com/huangxd-/ForwardWidgets/refs/heads/main/widgets.fwd`
- Widget 数量：`8`
- 成功下载 js 数量：`8`
- 原地址版：https://raw.githubusercontent.com/mowenyun/widgets-bf/main/subscriptions/huangxd-origin.fwd
- 镜像版：https://raw.githubusercontent.com/mowenyun/widgets-bf/main/subscriptions/huangxd-mirror.fwd

## 使用方法

1. 编辑 `sources.json`，添加或删除要同步的订阅源
2. 在 GitHub Actions 中运行同步任务
3. 从 `subscriptions/` 中使用生成后的订阅文件

## 自动生成说明

本 README 由 `sync_multi.py` 自动生成，请勿手动长期维护。
