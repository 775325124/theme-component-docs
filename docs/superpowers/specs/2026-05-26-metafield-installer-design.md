# 元字段一键安装器 · 设计文档

> 创建日期：2026-05-26  
> 作者：ww  
> 状态：草稿（待用户评审）

## 背景与问题

应用插件（如「自定义购买选择器」`product-variant-picker2`）依赖一组商品元字段定义（namespace + key + type）。每开一个新店铺，运营要手动在 Shopline 后台「设置 → 元字段 → 商品」逐个新增 5 个字段，繁琐且容易写错 key。

随着插件矩阵增多（后续会陆续登记新插件），这个手工成本会线性增长。

## 目标

在 **VitePress 文档站点**（即本手册）里增加一个「一键安装元字段」交互：

- 用户在「插件索引页 `/apps/`」或「插件详情页（如 `/apps/product-variant-picker2`）」点击按钮，弹窗输入店铺 handle，自动把该插件需要的所有元字段定义批量创建到该店铺。
- 元字段「安装模板」以 JSON 文件形式维护在仓库里，新增插件时只需新增一份 JSON 并在文档里挂载。
- 单次只处理一个 handle（用户已确认）；多店铺重复操作即可。

## 非目标

- 不做后端服务、不做账号系统、不做权限审批。
- 不处理已存在元字段的更新 / 删除（已存在则跳过 + 标记）。
- 不做跨 namespace 的批量管理 UI；只针对当前插件那一组字段一次性安装。
- 不支持一次输入多个 handle（用户明确说每次仅支持一个）。

## 技术方案概览

### token 获取

Giikin 自家 SystemJS 模块 `adminApi`（CDN：`https://shopline-scripts-cdn.qgergdv.com/systemjs/`）提供了内置的 token 颁发流程：

```js
const adminApi = new Module.adminApi('001', handle);
const accessToken = await adminApi.ready();
```

经源码审阅（`api/admin/request.js`），其实现是：用预置 appKey + handle + 时间戳，用 appSecret 做 HmacSHA256 签名后请求 `https://shopline-app-cdn.qgergdv.com/auth/login` 换 Bearer token，**不依赖** Shopline 后台 cookie，**可以**在任意网域（包括我们的 GitHub Pages）执行；token 被缓存到 `sessionStorage` 的 `GiikinApp001AccessToken` 键里。

### 创建元字段

Shopline Admin REST API 原生接口：

```
POST https://{handle}.myshopline.com/admin/openapi/v20260901/metafield_definition.json
Headers:
  Content-Type: application/json; charset=utf-8
  Authorization: Bearer {token}
Body:
  {
    "definition": {
      "name": "...",
      "key": "...",
      "namespace": "my_fields",
      "owner_resource": "products",
      "type": "single_line_text_field",
      "description": "...?",
      "access": { "admin": "MERCHANT_READ_WRITE" }  // 仅当 namespace 是 $app: 时
    }
  }
```

关于 `access`：官方文档明确「当 `access.admin` 传值时，`namespace` 必须设置为 `$app:{namespace}` 格式」。本项目里现有元字段全部用 `my_fields` 命名空间，按字面规则**不应**也**不能**传 `access`。

但用户原始需求要求「access 默认 MERCHANT_READ_WRITE」，文档描述也可能保守。Plan Task 1 的探测页会**同时跑两组用例**——A 不传 access、B 强制传 `MERCHANT_READ_WRITE`——按实测决定最终规则：

- 若 A 200、B 400 → 保留下面的「`$app:` 才传 access」规则。
- 若 A 200、B 200 → 放宽：按模板里写的 access 透传，不按 namespace 拦截。
- 若 A 400（意外）→ 再做一轮探测。

下面是按官方文档的默认假设（Task 1 实测后可能调整）：

- 若 `namespace` 以 `$app:` 开头 → 透传模板里指定的 `access.admin`（默认 `MERCHANT_READ_WRITE`）
- 否则 → **不发送** `access` 字段

### CORS 风险与 fallback

跨域调用 `*.myshopline.com` 是否被允许，本设计阶段未在浏览器里实测过。两条腿走路：

1. **首选路径**：浏览器内 fetch 直接发起。第一个 Task 必须在本地 dev 环境实测一次，记录响应头。
2. **Fallback**：若 CORS 不允许，组件下方提供一段「复制到 Shopline 后台开发者控制台运行的 JS 脚本」（同样的 token + 同样的 fetch 代码），用户复制粘贴到后台 console 跑。这种 fallback 仍然让用户零思考，只多一次复制。

### 元字段「安装模板」数据结构

仓库里新增 `apps/metafield-installers/` 目录，每个插件一份 JSON：

```json
{
  "$schema": "../_installer.schema.json",
  "id": "product-variant-picker2",
  "title": "自定义购买选择器",
  "docHref": "/apps/product-variant-picker2",
  "defaults": {
    "namespace": "my_fields",
    "ownerResource": "products"
  },
  "fields": [
    {
      "key": "customDiscountTitle",
      "name": "各档标题",
      "type": "single_line_text_field",
      "description": "各档标题，逗号分隔，例如 2足購入で,3足購入で,4足購入で",
      "required": true
    },
    {
      "key": "custom_discount_variant_num",
      "name": "各档需选件数",
      "type": "single_line_text_field",
      "description": "各档需选几件，逗号分隔，例如 2,3,4",
      "required": true
    },
    {
      "key": "custom_discount_badge_labels",
      "name": "各档角标文案",
      "type": "single_line_text_field",
      "description": "各档角标，逗号分隔，可留空",
      "required": false
    },
    {
      "key": "discountQuotas",
      "name": "各档折扣百分比",
      "type": "single_line_text_field",
      "description": "整数百分比，逗号分隔；与 Shopline 自动折扣同步",
      "required": false
    },
    {
      "key": "fixedDiscountAmounts",
      "name": "各档固定减免金额",
      "type": "single_line_text_field",
      "description": "主货币整数金额，逗号分隔；与百分比二选一",
      "required": false
    }
  ]
}
```

字段说明：

- `id`：与 `apps/<slug>.md` 同名，用于 UI 关联。
- `defaults`：模板默认值，运行时可被字段级覆盖（如某个字段需要不同 namespace）。
- `fields[].key/name/type/description/required`：完整对齐 Shopline create API。
- `fields[].access?`：可选，仅 `$app:` 命名空间用得上；schema 校验时禁止 `my_fields` 命名空间下出现。

新增一份 schema 文件 `apps/metafield-installers/_installer.schema.json` 用于编辑器智能提示与 lint 校验（VS Code / Cursor 都支持 JSON Schema）。

### UI / 交互

#### 组件

在 `.vitepress/theme/components/MetafieldInstaller.vue` 实现，导出两种用法：

- **行内按钮 + 弹窗**：放在文档页或索引页表格里。
- **弹窗对话框**：弹出后内部状态机如下。

#### 弹窗内部状态机

```
[idle] —— 用户输入 handle —— [token-loading] ——成功——> [installing]
                                |              ——失败——> [error: token]
[installing]
  ├── 字段1 ✅ created
  ├── 字段2 ⚠️ already_exists（按 409/重复键名识别，标 skip 不报错）
  ├── 字段3 ✅ created
  ├── 字段4 ❌ failed: <错误信息>（可单独重试）
  └── 字段5 ✅ created
[done] —— 显示统计、留「再装一个店铺」按钮
```

#### 索引页接入

`apps/index.md` 表格新增一列「一键安装」，对应 `id` 在 `metafield-installers/` 里有 JSON 的插件，渲染一个 `<MetafieldInstallerButton :id="..." />`；没有的不显示。

#### 详情页接入

`apps/product-variant-picker2.md` 在「Shopline 后台：商品元字段」这一节顶部插入 `<MetafieldInstallerButton id="product-variant-picker2" />`。

#### 视觉

- 按钮：`primary` 风格，带「⚡ 一键安装元字段」文案。
- 弹窗：标题、handle 输入框、字段预览表（key / name / type）、"开始安装"按钮、安装日志区。
- 风格继承 VitePress 默认主题色，不重新设计。

### 错误识别

- **token 拿不到**：`adminApi.ready()` 抛错或 console.error；UI 提示「Handle 输入错误，或者网络问题，请检查后重试」。
- **某字段 400 重复**：服务端通常会返回错误消息含 `already exists` / `重复` / 类似字样；按消息文字 + HTTP 状态码识别为「已存在」并 skip。
- **CORS 阻断**：fetch 抛 TypeError；UI 展示 fallback 脚本生成区。
- **429 限流**：在字段循环间加 200ms 间隔；命中 429 时自动 backoff 重试一次。

## 文件结构

| 路径 | 类型 | 说明 |
|---|---|---|
| `apps/metafield-installers/_installer.schema.json` | JSON Schema | 模板格式校验 |
| `apps/metafield-installers/product-variant-picker2.json` | 数据 | 首个插件模板 |
| `.vitepress/theme/components/MetafieldInstaller.vue` | Vue 组件 | 弹窗 + 安装流程 |
| `.vitepress/theme/components/MetafieldInstallerButton.vue` | Vue 组件 | 按钮（按 id 加载模板，触发弹窗） |
| `.vitepress/theme/lib/shoplineAdmin.ts` | 工具 | `loadAdminApi()` / `getAccessToken(handle)` / `createMetafieldDefinition()` |
| `.vitepress/theme/lib/installerLoader.ts` | 工具 | 按 id 动态 import 模板 JSON |
| `.vitepress/theme/index.ts` | 改 | 全局注册两个组件 |
| `apps/index.md` | 改 | 索引表新增「一键安装」列 |
| `apps/product-variant-picker2.md` | 改 | 在元字段节插入按钮 |
| `apps/metafield-installers/README.md` | 文档 | 教维护者怎么新增一份模板 |
| `docs/superpowers/specs/2026-05-26-metafield-installer-design.md` | 文档 | 本设计 |
| `docs/superpowers/plans/2026-05-26-metafield-installer.md` | 文档 | 实施计划（下一步产出） |

## 测试策略

VitePress 是静态站，没有现成单元测试基础设施。本项目采用**手动验证清单**（在 plan 里逐项落地）：

1. `npm run dev` 起本地站。
2. 打开 `/apps/`，点击「一键安装」按钮，验证弹窗弹出、字段列表正确渲染。
3. 输入一个真实测试店铺 handle，点击安装，观察网络面板：
   - `auth/login` 请求是否 200，返回是否含 `accessToken`。
   - 5 个 `metafield_definition.json` POST 是否都 200。
4. 在 Shopline 后台「设置 → 元字段 → 商品」检查 5 个字段是否真实写入。
5. 再点一次「一键安装」（同一店铺）→ 5 个字段全部应标记为「已存在 skip」。
6. 试一个不存在的 handle → 弹窗显示错误，不卡死。
7. **如果**第 3 步 CORS 失败：fallback 脚本输出区显示完整脚本，复制到 Shopline 后台 console 跑，验证可以替代浏览器内直发。
8. `npm run build` 通过。

## 与现有功能的隔离

- 仅新增文件 + 在 `apps/index.md` 表格末尾加列 + 在 `apps/product-variant-picker2.md` 元字段节加一行。
- 不动 `.vitepress/config.mts` 已有的侧栏、搜索、主题色。
- `index.ts` 只新增 `app.component()` 注册，不改原有 Layout。
- 现有所有 markdown 文档继续按原样渲染。

## 风险与降级

| 风险 | 概率 | 降级方案 |
|---|---|---|
| CORS 阻断浏览器内 fetch | 中 | fallback 脚本（一次复制粘贴） |
| Giikin appCode `001` 未来变更或 token 服务关停 | 低 | 把 appCode 做成可配置；fallback 脚本不依赖 Giikin 代理 |
| 用户手抖把 handle 写错 / 写成域名 | 高 | 输入框做轻校验：仅允许 `^[a-z0-9-]+$`，长度合理 |
| 安装一半失败导致部分字段已建 | 中 | 失败字段单独标红，给「重试这一条」按钮；已建字段下次自动 skip |
| 同名字段已存在但 type 不一致 | 低 | API 自然会返回错误；UI 原样展示，不强行覆盖 |

## 后续扩展位（不在本期）

- 删除元字段定义按钮（破坏性，先不做）
- 列出当前店铺已有元字段（GET 接口）
- 多 handle 批量（用户已说先不做）
- 模板版本 / 升级（带 schema 版本号字段）
