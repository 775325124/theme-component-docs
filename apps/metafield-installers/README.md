# 元字段安装模板

本目录里每个 JSON 描述一个插件需要的元字段定义集合，供文档站点上的「一键安装元字段」按钮读取。

## 新增一份模板

1. 复制 `product-variant-picker2.json` 改名为 `<plugin-id>.json`，文件名与 `apps/<plugin-id>.md` 同名。
2. 编辑 JSON：填 `id` / `title`，列出 `fields[]`。
3. 在 `apps/<plugin-id>.md` 顶部「商品元字段」一节插入按钮：

   ```html
   <MetafieldInstallerButton id="<plugin-id>" />
   ```

4. 在 `apps/index.md` 的 `.apps-plugin-index` 里复制一张 `.apps-plugin-card`，把 `MetafieldInstallerButton` 的 `id` 改成与 JSON 同名。
5. `npm run build` 看是否有 lint 错误，提交。

## 字段说明

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | 是 | 与文档 slug 同名 |
| `title` | 是 | 弹窗标题；中文短句 |
| `docHref` | 否 | 弹窗里「查看文档」链接；默认 `/apps/<id>` |
| `defaults.namespace` | 否 | 默认 `my_fields` |
| `defaults.ownerResource` | 否 | 默认 `products` |
| `fields[].key` | 是 | 3~30 字符，仅字母数字下划线连字符 |
| `fields[].name` | 是 | Shopline 后台「字段名称」；一键安装时写入 API 的 `definition.name` |
| `fields[].type` | 是 | Shopline 支持的 type 枚举（见 schema） |
| `fields[].description` | 否 | 255 字符内的说明 |
| `fields[].required` | 否 | 文档用，不影响 API 调用 |
| `fields[].namespace` | 否 | 字段级 namespace，覆盖 defaults |
| `defaults.access.admin` | 否 | 模板级默认权限，如 `MERCHANT_READ_WRITE` |
| `fields[].access.admin` | 否 | 字段级覆盖 `defaults.access` |

## Schema 校验

VS Code / Cursor 打开 JSON 时会自动按 `_installer.schema.json` 提示。

## 已知问题与排错

| 现象 | 原因 / 处理 |
|---|---|
| 弹窗一直在「获取 token…」 | handle 写错；或网络被墙；F12 看 console 报错 |
| 直发请求被 CORS 拒 | 展开「浏览器拦截了？」复制脚本到店铺后台 Console 跑 |
| 字段全部「已存在」 | 之前装过了，重复执行无副作用 |
| 401 / 429 | token 过期或限流；关闭弹窗重开，组件会重新走 ready() 拿新 token |

## 实测记录

- **2026-05-26（Task 1 探测）**：CORS ✅、token ✅。无版本路径返回 **404**；修正为 `.../admin/openapi/v20260901/metafield_definition.json` 后可用。
- **2026-05-26（Task 1 复测）**：`my_fields` 下 A（不传 access）与 B（传 `MERCHANT_READ_WRITE`）均为 **200**；响应里 `access` 可能仍为 `null`，属服务端表现。实现按模板 `defaults.access` / `fields[].access` 透传，不按 namespace 限制。
