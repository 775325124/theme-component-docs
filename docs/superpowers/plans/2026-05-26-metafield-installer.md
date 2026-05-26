# 元字段一键安装器 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 VitePress 文档站点加一个「一键安装元字段」交互：输入店铺 handle，浏览器内拿 token 后批量调用 Shopline Open API 创建元字段定义；模板用仓库 JSON 维护。

**Architecture:** 仓库里维护 `apps/metafield-installers/<id>.json` 模板；运行时 VitePress 全局注册一个按钮组件，点击弹窗 → 用 SystemJS 动态加载 Giikin `adminApi` 模块 → `ready()` 拿 token → 循环 fetch `https://{handle}.myshopline.com/admin/openapi/v20260901/metafield_definition.json` 写入字段。CORS 失败时降级为「复制脚本到 Shopline 后台 console 跑」。

**Tech Stack:** VitePress 1.6 / Vue 3 (Composition API) / TypeScript / SystemJS (CDN) / Shopline Admin REST API。零新增 npm 依赖。

参考 spec：[2026-05-26-metafield-installer-design.md](../specs/2026-05-26-metafield-installer-design.md)。

---

## Task 1：可行性验证（必须先做，决定后续走向）

**目的：** 在 VitePress dev 环境里验证「浏览器跨域调用 Shopline Open API」是否被 CORS 允许。如果不行，从 Task 5 起走 fallback 分支。

**Files:**
- 临时新建：`scratch/cors-probe.html`（验证完即删，不入 git）

- [ ] **Step 1：创建临时探测页**

把以下文件写到 `scratch/cors-probe.html`（手册根目录新建 scratch 目录）。注意：这个文件**只是临时探测用，验证完后删除**。

本页一次性探三件事：
1. CORS 能不能跨域到 `*.myshopline.com`
2. 普通命名空间 `my_fields` + **不传** `access` 是否 200
3. 普通命名空间 `my_fields` + **强制传** `access.admin = MERCHANT_READ_WRITE` 是否 200（决定 access 规则的最终走向）

```html
<!doctype html>
<html>
<head><meta charset="utf-8"><title>cors-probe</title></head>
<body>
<script src="https://shopline-scripts-cdn.qgergdv.com/systemjs/core/system.min.js"></script>
<script type="systemjs-importmap" src="https://shopline-scripts-cdn.qgergdv.com/systemjs/config/map.json" crossorigin="anonymous"></script>
<script>
  (async () => {
    const HANDLE = prompt('shopline handle (例: open001)');
    if (!HANDLE) return;
    const Module = await System.import('adminApi');
    const adminApi = new Module.adminApi('001', HANDLE);
    const token = await adminApi.ready();
    console.log('TOKEN:', token);
    if (!token) { alert('token 拿不到'); return; }

    const baseDef = {
      namespace: 'my_fields',
      owner_resource: 'products',
      type: 'single_line_text_field',
      description: 'cors probe, safe to delete',
    };
    const cases = [
      { label: 'A · 不传 access', def: { ...baseDef, name: '__probe_a__', key: '__probe_a__' } },
      { label: 'B · 传 access=MERCHANT_READ_WRITE', def: { ...baseDef, name: '__probe_b__', key: '__probe_b__', access: { admin: 'MERCHANT_READ_WRITE' } } },
    ];
    const results = [];
    for (const c of cases) {
      try {
        const resp = await fetch(`https://${HANDLE}.myshopline.com/admin/openapi/metafield_definition.json`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({ definition: c.def }),
        });
        const body = await resp.json().catch(() => null);
        results.push({ case: c.label, status: resp.status, ok: resp.ok, body });
      } catch (e) {
        results.push({ case: c.label, status: 0, ok: false, body: String(e) });
      }
    }
    console.table(results.map(r => ({ case: r.case, status: r.status, ok: r.ok })));
    console.log('完整响应：', results);
    alert('两组探测完成，详见 console.table');
  })();
</script>
</body>
</html>
```

- [ ] **Step 2：启动 vitepress dev**

```bash
npm run dev
```

期望：终端打印本地 URL，无报错。

- [ ] **Step 3：在浏览器里打开探测页**

把 `scratch/cors-probe.html` 直接拖进浏览器（或者起一个简单 http server）。注意：用 `file://` 协议也行；如果失败，用 `python3 -m http.server 8765` 起一个临时 server，浏览 `http://localhost:8765/scratch/cors-probe.html`。

输入一个**测试店铺** handle，按 F12 看 console 和 network。

**记录以下四个事实，写进 `scratch/cors-probe.result.md`（同样不入 git）：**

| 检查项 | 期望 | 实测 |
|---|---|---|
| `/auth/login` 是否 200 | 200 + 含 accessToken | ? |
| 跨域到 `*.myshopline.com` 是否被 CORS 拒绝（看 console 红字） | 不被拒 | ? |
| 用例 A（不传 access） POST 状态码 | 200 | ? |
| 用例 B（强制传 access=MERCHANT_READ_WRITE） POST 状态码 | 看实际 | ? |

- [ ] **Step 4：决策分支**

CORS / token：
- 若 CORS 通 + token OK：本计划按「主路径」走（Task 5 内的浏览器直发分支）。
- 若 CORS 失败：按「降级路径」走，弹窗里仅显示「复制 Console 脚本」入口。
- 若 `/auth/login` 都 401：fallback 脚本作为唯一路径。

access.admin（决定 Task 4 `createMetafieldDefinition` 内的判定规则）：
- 若 A 200、B 400：保留 spec 里的规则——`$app:` 才传 access，`my_fields` 不传。
- 若 A 200、B 200：放宽规则——按模板里写的 access 透传，不再按 namespace 拦截。
- 若 A 400（很意外）：再开一次 Task 1 探测，把 `name`/`key`/`description` 全去掉做最小集 + 详读官方 example。

把以上决策一句话写进 `scratch/cors-probe.result.md`。**如果决策与 spec 里的「`$app:` 才传 access」不同，对应在 Task 4 Step 1 写 `createMetafieldDefinition` 时按实测结果修改 `if (namespace.startsWith('$app:') && field.access?.admin)` 这一行**。

> 注意：探测会真的在测试店里创建 `__probe_a__` / `__probe_b__` 这两条元字段。验证完毕请到 Shopline 后台「设置 → 元字段 → 商品」手动删掉，避免污染。

- [ ] **Step 5：清理临时文件**

```bash
rm -rf scratch
```

确保不污染 git。

- [ ] **Step 6：commit（此 Task 不产出代码，只产出决策；commit 该决策记录到 plan 文末「执行日志」追加段）**

不创建额外 commit，下个 Task 一起 commit。

---

## Task 2：建立元字段模板目录与 JSON Schema

**Files:**
- Create: `apps/metafield-installers/_installer.schema.json`
- Create: `apps/metafield-installers/README.md`

- [ ] **Step 1：写 JSON Schema**

新文件 `apps/metafield-installers/_installer.schema.json`：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Metafield Installer Template",
  "type": "object",
  "required": ["id", "title", "fields"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9][a-z0-9-]{1,49}$",
      "description": "与 apps/<slug>.md 同名"
    },
    "title": { "type": "string", "minLength": 1 },
    "docHref": {
      "type": "string",
      "description": "可选；按钮上的「查看文档」链接，默认 /apps/<id>"
    },
    "defaults": {
      "type": "object",
      "properties": {
        "namespace": { "type": "string", "default": "my_fields" },
        "ownerResource": {
          "type": "string",
          "enum": ["products", "variants", "collections", "customers", "orders", "pages", "blogs", "articles", "shop"],
          "default": "products"
        }
      },
      "additionalProperties": false
    },
    "fields": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["key", "name", "type"],
        "properties": {
          "key": {
            "type": "string",
            "pattern": "^[A-Za-z0-9_-]{3,30}$"
          },
          "name": { "type": "string", "minLength": 1, "maxLength": 255 },
          "namespace": {
            "type": "string",
            "description": "可选；不填则用 defaults.namespace"
          },
          "ownerResource": {
            "type": "string",
            "description": "可选；不填则用 defaults.ownerResource"
          },
          "type": {
            "type": "string",
            "enum": [
              "single_line_text_field",
              "list.single_line_text_field",
              "multi_line_text_field",
              "color", "list.color",
              "date", "list.date",
              "date_time", "list.date_time",
              "url", "list.url",
              "file_reference", "list.file_reference",
              "json",
              "weight", "list.weight",
              "volume", "list.volume",
              "dimension", "list.dimension",
              "number_integer", "list.number_integer",
              "number_decimal", "list.number_decimal",
              "rating", "list.rating",
              "page_reference", "list.page_reference",
              "product_reference", "list.product_reference",
              "variant_reference", "list.variant_reference",
              "collection_reference", "list.collection_reference",
              "boolean",
              "money"
            ]
          },
          "description": { "type": "string", "maxLength": 255 },
          "required": { "type": "boolean", "default": false },
          "access": {
            "type": "object",
            "description": "仅在 namespace 以 $app: 开头时有效",
            "properties": {
              "admin": {
                "type": "string",
                "enum": ["MERCHANT_READ_WRITE", "MERCHANT_READ", "PUBLIC_READ", "PRIVATE", "NONE"]
              }
            }
          }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
}
```

- [ ] **Step 2：写维护说明**

新文件 `apps/metafield-installers/README.md`：

```markdown
# 元字段安装模板

本目录里每个 JSON 描述一个插件需要的元字段定义集合，供文档站点上的「一键安装元字段」按钮读取。

## 新增一份模板

1. 复制 `product-variant-picker2.json` 改名为 `<plugin-id>.json`，文件名与 `apps/<plugin-id>.md` 同名。
2. 编辑 JSON：填 `id` / `title`，列出 `fields[]`。
3. 在 `apps/<plugin-id>.md` 顶部「商品元字段」一节插入按钮：

   \`\`\`html
   <MetafieldInstallerButton id="<plugin-id>" />
   \`\`\`

4. 索引页 `apps/index.md` 的表格不用动——会自动检测本目录下所有 JSON 并在索引页相应行渲染按钮。
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
| `fields[].name` | 是 | 显示名 |
| `fields[].type` | 是 | Shopline 支持的 type 枚举（见 schema） |
| `fields[].description` | 否 | 255 字符内的说明 |
| `fields[].required` | 否 | 文档用，不影响 API 调用 |
| `fields[].namespace` | 否 | 字段级 namespace，覆盖 defaults |
| `fields[].access.admin` | 否 | 仅 `$app:` 命名空间允许 |

## Schema 校验

VS Code / Cursor 打开 JSON 时会自动按 `_installer.schema.json` 提示。
```

- [ ] **Step 3：commit**

```bash
git add apps/metafield-installers/
git commit -m "feat(apps): 元字段安装模板目录与 JSON Schema"
```

---

## Task 3：写第一份模板（product-variant-picker2）

**Files:**
- Create: `apps/metafield-installers/product-variant-picker2.json`

- [ ] **Step 1：把 5 个字段对齐 spec 写入 JSON**

```json
{
  "$schema": "./_installer.schema.json",
  "id": "product-variant-picker2",
  "title": "自定义购买选择器 · 商品元字段",
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

- [ ] **Step 2：用 VS Code / Cursor 打开此 JSON，确认 schema 提示生效（应能在 type 字段联想枚举）**

不行也无所谓，下一步实际加载会报错。

- [ ] **Step 3：commit**

```bash
git add apps/metafield-installers/product-variant-picker2.json
git commit -m "feat(apps): 新增 product-variant-picker2 元字段安装模板"
```

---

## Task 4：Shopline Admin API 客户端工具

**Files:**
- Create: `.vitepress/theme/lib/shoplineAdmin.ts`
- Create: `.vitepress/theme/lib/installerLoader.ts`

- [ ] **Step 1：写客户端工具（含类型定义）**

新文件 `.vitepress/theme/lib/shoplineAdmin.ts`：

```ts
export type MetafieldFieldConfig = {
  key: string
  name: string
  type: string
  description?: string
  required?: boolean
  namespace?: string
  ownerResource?: string
  access?: { admin?: string }
}

export type InstallerTemplate = {
  id: string
  title: string
  docHref?: string
  defaults?: {
    namespace?: string
    ownerResource?: string
  }
  fields: MetafieldFieldConfig[]
}

export type InstallStatus =
  | { state: 'pending' }
  | { state: 'creating' }
  | { state: 'created'; id?: number }
  | { state: 'skipped'; reason: string }
  | { state: 'failed'; reason: string }

declare global {
  interface Window {
    System?: {
      import: (name: string) => Promise<any>
    }
  }
}

const SYSTEMJS_CORE = 'https://shopline-scripts-cdn.qgergdv.com/systemjs/core/system.min.js'
const SYSTEMJS_MAP = 'https://shopline-scripts-cdn.qgergdv.com/systemjs/config/map.json'

let systemJsReadyPromise: Promise<void> | null = null

function loadScript(src: string, attrs: Record<string, string> = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-shopline-loader="${src}"]`)
    if (existing) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.dataset.shoplineLoader = src
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v)
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

function injectImportMap(): void {
  const existing = document.querySelector('script[type="systemjs-importmap"][data-shopline-map]')
  if (existing) return
  const s = document.createElement('script')
  s.type = 'systemjs-importmap'
  s.src = SYSTEMJS_MAP
  s.crossOrigin = 'anonymous'
  s.dataset.shoplineMap = '1'
  document.head.appendChild(s)
}

export async function loadSystemJs(): Promise<void> {
  if (systemJsReadyPromise) return systemJsReadyPromise
  systemJsReadyPromise = (async () => {
    injectImportMap()
    await loadScript(SYSTEMJS_CORE)
    if (!window.System) throw new Error('SystemJS 未加载成功')
  })()
  return systemJsReadyPromise
}

export async function getAccessToken(handle: string): Promise<string> {
  await loadSystemJs()
  const mod = await window.System!.import('adminApi')
  const AdminApi = mod.adminApi
  if (!AdminApi) throw new Error('adminApi 模块未导出 adminApi')
  const instance = new AdminApi('001', handle)
  const token = await instance.ready()
  if (!token || typeof token !== 'string') {
    throw new Error('获取 accessToken 失败：handle 不正确或网络异常')
  }
  return token
}

export type CreateOutcome =
  | { ok: true; id?: number }
  | { ok: false; alreadyExists: boolean; status: number; message: string }

export async function createMetafieldDefinition(
  handle: string,
  token: string,
  field: MetafieldFieldConfig,
  defaults: { namespace: string; ownerResource: string }
): Promise<CreateOutcome> {
  const namespace = field.namespace ?? defaults.namespace
  const ownerResource = field.ownerResource ?? defaults.ownerResource

  const definition: Record<string, unknown> = {
    name: field.name,
    key: field.key,
    namespace,
    owner_resource: ownerResource,
    type: field.type,
  }
  if (field.description) definition.description = field.description
  if (namespace.startsWith('$app:') && field.access?.admin) {
    definition.access = { admin: field.access.admin }
  }

  const url = `https://${handle}.myshopline.com/admin/openapi/metafield_definition.json`

  let resp: Response
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ definition }),
    })
  } catch (e: any) {
    return { ok: false, alreadyExists: false, status: 0, message: `网络/跨域错误: ${e?.message ?? e}` }
  }

  let payload: any = null
  try { payload = await resp.json() } catch { payload = null }

  if (resp.ok && payload?.definition?.id) {
    return { ok: true, id: payload.definition.id }
  }

  const message: string = String(payload?.errors ?? payload?.message ?? `HTTP ${resp.status}`)
  const alreadyExists =
    resp.status === 400 &&
    /already\s*exist|exists|重复|已存在|duplicate/i.test(message)

  return { ok: false, alreadyExists, status: resp.status, message }
}

export function buildFallbackScript(
  handle: string,
  template: InstallerTemplate
): string {
  const defaults = {
    namespace: template.defaults?.namespace ?? 'my_fields',
    ownerResource: template.defaults?.ownerResource ?? 'products',
  }
  const fieldsJson = JSON.stringify(template.fields, null, 2)
  const defaultsJson = JSON.stringify(defaults, null, 2)
  return `// 把以下整段粘贴到 ${handle}.myshopline.com 后台任意页面的浏览器 Console 后回车
(async () => {
  const HANDLE = ${JSON.stringify(handle)};
  const DEFAULTS = ${defaultsJson};
  const FIELDS = ${fieldsJson};
  await new Promise((resolve, reject) => {
    const s1 = document.createElement('script');
    s1.src = 'https://shopline-scripts-cdn.qgergdv.com/systemjs/core/system.min.js';
    s1.onload = () => {
      const s2 = document.createElement('script');
      s2.type = 'systemjs-importmap';
      s2.src = 'https://shopline-scripts-cdn.qgergdv.com/systemjs/config/map.json';
      s2.crossOrigin = 'anonymous';
      s2.onload = resolve;
      s2.onerror = reject;
      document.head.appendChild(s2);
    };
    s1.onerror = reject;
    document.head.appendChild(s1);
  });
  const Module = await System.import('adminApi');
  const adminApi = new Module.adminApi('001', HANDLE);
  const token = await adminApi.ready();
  console.log('TOKEN ready');
  const results = [];
  for (const f of FIELDS) {
    const ns = f.namespace || DEFAULTS.namespace;
    const or = f.ownerResource || DEFAULTS.ownerResource;
    const def = { name: f.name, key: f.key, namespace: ns, owner_resource: or, type: f.type };
    if (f.description) def.description = f.description;
    if (ns.startsWith('$app:') && f.access && f.access.admin) def.access = { admin: f.access.admin };
    try {
      const resp = await fetch('https://' + HANDLE + '.myshopline.com/admin/openapi/metafield_definition.json', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ definition: def }),
      });
      const data = await resp.json().catch(() => null);
      results.push({ key: f.key, status: resp.status, ok: resp.ok, body: data });
    } catch (e) {
      results.push({ key: f.key, status: 0, ok: false, body: String(e) });
    }
  }
  console.table(results.map(r => ({ key: r.key, status: r.status, ok: r.ok })));
  console.log('详细 body:', results);
})();
`
}
```

- [ ] **Step 2：写模板加载器（按 id 动态 import JSON）**

新文件 `.vitepress/theme/lib/installerLoader.ts`：

```ts
import type { InstallerTemplate } from './shoplineAdmin'

const modules = import.meta.glob<{ default: InstallerTemplate }>(
  '../../../apps/metafield-installers/*.json',
  { import: 'default' }
)

const indexById: Record<string, () => Promise<InstallerTemplate>> = {}

for (const [path, loader] of Object.entries(modules)) {
  const m = path.match(/\/([^/]+)\.json$/)
  if (!m) continue
  if (m[1].startsWith('_')) continue
  indexById[m[1]] = loader as () => Promise<InstallerTemplate>
}

export function listInstallerIds(): string[] {
  return Object.keys(indexById).sort()
}

export async function loadInstallerTemplate(id: string): Promise<InstallerTemplate | null> {
  const loader = indexById[id]
  if (!loader) return null
  const tpl = await loader()
  return { ...tpl, id }
}
```

- [ ] **Step 3：dev 起一下检查没有编译错误**

```bash
npm run dev
```

期望：无 ts/构建错误，能成功启动。Ctrl+C 停掉。

- [ ] **Step 4：commit**

```bash
git add .vitepress/theme/lib/
git commit -m "feat(theme): Shopline admin token & metafield-definition 客户端"
```

---

## Task 5：UI 组件 · 弹窗 + 安装流程

**Files:**
- Create: `.vitepress/theme/components/MetafieldInstaller.vue`

- [ ] **Step 1：写 Vue 组件**

新文件 `.vitepress/theme/components/MetafieldInstaller.vue`：

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { InstallerTemplate, InstallStatus, MetafieldFieldConfig } from '../lib/shoplineAdmin'
import {
  getAccessToken,
  createMetafieldDefinition,
  buildFallbackScript,
} from '../lib/shoplineAdmin'

const props = defineProps<{
  open: boolean
  template: InstallerTemplate | null
}>()
const emit = defineEmits<{ (e: 'close'): void }>()

const handle = ref('')
const phase = ref<'idle' | 'token' | 'installing' | 'done' | 'error'>('idle')
const errorMsg = ref<string>('')
const statuses = ref<InstallStatus[]>([])
const showFallback = ref(false)

const fallbackScript = computed(() => {
  if (!props.template || !handle.value) return ''
  return buildFallbackScript(handle.value.trim(), props.template)
})

const defaults = computed(() => ({
  namespace: props.template?.defaults?.namespace ?? 'my_fields',
  ownerResource: props.template?.defaults?.ownerResource ?? 'products',
}))

const summary = computed(() => {
  const total = statuses.value.length
  let ok = 0, skip = 0, fail = 0
  for (const s of statuses.value) {
    if (s.state === 'created') ok++
    else if (s.state === 'skipped') skip++
    else if (s.state === 'failed') fail++
  }
  return { total, ok, skip, fail }
})

watch(() => props.open, (v) => {
  if (v) {
    phase.value = 'idle'
    handle.value = ''
    errorMsg.value = ''
    statuses.value = []
    showFallback.value = false
  }
})

watch(() => props.template, (tpl) => {
  if (tpl) {
    statuses.value = tpl.fields.map(() => ({ state: 'pending' }))
  } else {
    statuses.value = []
  }
})

function validHandle(h: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,49}$/.test(h)
}

async function startInstall() {
  if (!props.template) return
  const h = handle.value.trim()
  if (!validHandle(h)) {
    errorMsg.value = 'handle 格式不对：只能小写字母、数字、连字符'
    return
  }
  errorMsg.value = ''
  phase.value = 'token'
  let token: string
  try {
    token = await getAccessToken(h)
  } catch (e: any) {
    phase.value = 'error'
    errorMsg.value = e?.message ?? String(e)
    return
  }

  phase.value = 'installing'
  const fields = props.template.fields
  const def = defaults.value
  for (let i = 0; i < fields.length; i++) {
    statuses.value[i] = { state: 'creating' }
    statuses.value = [...statuses.value]
    const outcome = await createMetafieldDefinition(h, token, fields[i], def)
    if (outcome.ok) {
      statuses.value[i] = { state: 'created', id: outcome.id }
    } else if (outcome.alreadyExists) {
      statuses.value[i] = { state: 'skipped', reason: '已存在，跳过' }
    } else {
      statuses.value[i] = { state: 'failed', reason: outcome.message }
    }
    statuses.value = [...statuses.value]
    if (i < fields.length - 1) {
      await new Promise(r => setTimeout(r, 200))
    }
  }
  phase.value = 'done'
}

async function retryOne(idx: number) {
  if (!props.template) return
  const h = handle.value.trim()
  if (!validHandle(h)) return
  let token: string
  try {
    token = await getAccessToken(h)
  } catch (e: any) {
    errorMsg.value = e?.message ?? String(e)
    return
  }
  statuses.value[idx] = { state: 'creating' }
  statuses.value = [...statuses.value]
  const outcome = await createMetafieldDefinition(h, token, props.template.fields[idx], defaults.value)
  if (outcome.ok) {
    statuses.value[idx] = { state: 'created', id: outcome.id }
  } else if (outcome.alreadyExists) {
    statuses.value[idx] = { state: 'skipped', reason: '已存在，跳过' }
  } else {
    statuses.value[idx] = { state: 'failed', reason: outcome.message }
  }
  statuses.value = [...statuses.value]
}

function copyFallback() {
  navigator.clipboard?.writeText(fallbackScript.value).then(() => {
    alert('已复制脚本，去对应店铺后台任意页面 Console 粘贴回车')
  })
}

function close() {
  if (phase.value === 'token' || phase.value === 'installing') return
  emit('close')
}
</script>

<template>
  <div v-if="open" class="mi-overlay" @click.self="close">
    <div class="mi-dialog" role="dialog" aria-modal="true">
      <header class="mi-head">
        <h3>{{ template?.title ?? '一键安装元字段' }}</h3>
        <button class="mi-x" @click="close" :disabled="phase === 'token' || phase === 'installing'">×</button>
      </header>

      <section v-if="template" class="mi-body">
        <div class="mi-row">
          <label>店铺 handle</label>
          <input
            v-model="handle"
            type="text"
            placeholder="例如 open001（来自 open001.myshopline.com）"
            :disabled="phase === 'token' || phase === 'installing'"
            @keydown.enter="startInstall"
            autofocus
          />
        </div>

        <div class="mi-row">
          <label>命名空间 / 资源</label>
          <div class="mi-defaults">
            <code>{{ defaults.namespace }}</code> · <code>{{ defaults.ownerResource }}</code>
            <span class="mi-hint">（模板默认值，已写死在 JSON 里）</span>
          </div>
        </div>

        <div class="mi-fields">
          <div class="mi-field-head">
            <span>字段</span><span>类型</span><span>状态</span>
          </div>
          <div
            v-for="(f, i) in template.fields"
            :key="f.key"
            class="mi-field-row"
          >
            <div>
              <div class="mi-field-name">{{ f.name }} <span v-if="f.required" class="mi-req">*</span></div>
              <div class="mi-field-key"><code>{{ f.key }}</code></div>
              <div v-if="f.description" class="mi-field-desc">{{ f.description }}</div>
            </div>
            <div><code>{{ f.type }}</code></div>
            <div>
              <span v-if="statuses[i]?.state === 'pending'" class="mi-tag mi-tag-grey">待安装</span>
              <span v-else-if="statuses[i]?.state === 'creating'" class="mi-tag mi-tag-blue">写入中…</span>
              <span v-else-if="statuses[i]?.state === 'created'" class="mi-tag mi-tag-green">已创建</span>
              <span v-else-if="statuses[i]?.state === 'skipped'" class="mi-tag mi-tag-grey">已存在</span>
              <span v-else-if="statuses[i]?.state === 'failed'" class="mi-tag mi-tag-red" :title="(statuses[i] as any).reason">失败</span>
              <button
                v-if="statuses[i]?.state === 'failed'"
                class="mi-retry"
                @click="retryOne(i)"
              >重试</button>
            </div>
          </div>
        </div>

        <p v-if="errorMsg" class="mi-error">{{ errorMsg }}</p>

        <div v-if="phase === 'done'" class="mi-summary">
          完成：✅ 创建 {{ summary.ok }} · ⏭ 跳过 {{ summary.skip }} · ❌ 失败 {{ summary.fail }}
        </div>

        <details class="mi-fallback">
          <summary @click="showFallback = true">浏览器拦截了？复制脚本到店铺后台 Console 跑</summary>
          <p class="mi-hint">
            如果上面安装时网络面板红字 / 跨域报错，把下面整段脚本复制到 <code>{{ handle || '<handle>' }}.myshopline.com</code> 后台任意页面的浏览器 Console（按 F12），粘贴回车即可。
          </p>
          <pre>{{ fallbackScript || '请先在上方输入 handle 后再生成脚本' }}</pre>
          <button class="mi-btn-secondary" :disabled="!fallbackScript" @click="copyFallback">复制脚本</button>
        </details>
      </section>

      <footer class="mi-foot">
        <button class="mi-btn-secondary" @click="close" :disabled="phase === 'token' || phase === 'installing'">关闭</button>
        <button
          class="mi-btn-primary"
          :disabled="phase === 'token' || phase === 'installing' || !template"
          @click="startInstall"
        >
          {{ phase === 'idle' ? '开始安装' : phase === 'token' ? '获取 token…' : phase === 'installing' ? '写入中…' : '再装一次' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.mi-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.mi-dialog {
  background: var(--vp-c-bg);
  border-radius: 12px;
  max-width: 720px; width: calc(100vw - 32px);
  max-height: calc(100vh - 64px); overflow: auto;
  box-shadow: 0 12px 40px rgba(0,0,0,0.25);
}
.mi-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--vp-c-divider);
}
.mi-head h3 { margin: 0; font-size: 16px; }
.mi-x {
  background: transparent; border: none; cursor: pointer;
  font-size: 22px; line-height: 1;
}
.mi-body { padding: 16px 20px; }
.mi-row { margin-bottom: 12px; }
.mi-row label { display: block; font-size: 12px; color: var(--vp-c-text-2); margin-bottom: 4px; }
.mi-row input {
  width: 100%; box-sizing: border-box;
  border: 1px solid var(--vp-c-divider); border-radius: 6px;
  padding: 8px 10px; font: inherit;
  background: var(--vp-c-bg-soft);
}
.mi-defaults { font-size: 13px; }
.mi-hint { color: var(--vp-c-text-3); font-size: 12px; }
.mi-fields {
  border: 1px solid var(--vp-c-divider); border-radius: 8px;
  overflow: hidden; margin-top: 8px;
}
.mi-field-head, .mi-field-row {
  display: grid; grid-template-columns: 1fr 220px 160px;
  gap: 12px; padding: 10px 12px; align-items: start;
}
.mi-field-head {
  background: var(--vp-c-bg-soft); font-size: 12px;
  color: var(--vp-c-text-2);
}
.mi-field-row + .mi-field-row {
  border-top: 1px solid var(--vp-c-divider);
}
.mi-field-name { font-weight: 600; }
.mi-field-key { font-size: 12px; color: var(--vp-c-text-2); margin-top: 2px; }
.mi-field-desc { font-size: 12px; color: var(--vp-c-text-3); margin-top: 4px; }
.mi-req { color: var(--vp-c-danger-1, #c00); }
.mi-tag {
  display: inline-block; padding: 2px 8px;
  font-size: 12px; border-radius: 12px;
}
.mi-tag-grey { background: var(--vp-c-bg-alt); color: var(--vp-c-text-2); }
.mi-tag-blue { background: rgba(59,130,246,0.12); color: #2563eb; }
.mi-tag-green { background: rgba(34,197,94,0.14); color: #16a34a; }
.mi-tag-red { background: rgba(239,68,68,0.14); color: #dc2626; }
.mi-retry {
  margin-left: 6px; font-size: 12px;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft);
  border-radius: 4px; padding: 1px 6px; cursor: pointer;
}
.mi-error {
  margin: 8px 0 0; color: #dc2626; font-size: 13px;
}
.mi-summary {
  margin-top: 12px; font-size: 14px;
  padding: 8px 10px; border-radius: 6px;
  background: var(--vp-c-bg-soft);
}
.mi-fallback {
  margin-top: 16px;
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 12px;
}
.mi-fallback summary { cursor: pointer; font-size: 13px; }
.mi-fallback pre {
  max-height: 280px; overflow: auto;
  font-size: 12px; line-height: 1.4;
  background: var(--vp-c-bg-soft);
  padding: 10px; border-radius: 6px;
}
.mi-foot {
  display: flex; gap: 10px; justify-content: flex-end;
  padding: 12px 20px; border-top: 1px solid var(--vp-c-divider);
}
.mi-btn-primary, .mi-btn-secondary {
  border: none; border-radius: 6px;
  padding: 8px 16px; font: inherit; cursor: pointer;
}
.mi-btn-primary {
  background: var(--vp-c-brand-1); color: #fff;
}
.mi-btn-primary:disabled {
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-3);
  cursor: not-allowed;
}
.mi-btn-secondary {
  background: var(--vp-c-bg-soft); color: var(--vp-c-text-1);
}
</style>
```

- [ ] **Step 2：dev 看是否编译通过**

```bash
npm run dev
```

期望：编译无报错。Ctrl+C 停掉。组件还没在任何页面挂载，所以页面上看不到效果——下个 Task 处理。

- [ ] **Step 3：commit**

```bash
git add .vitepress/theme/components/MetafieldInstaller.vue
git commit -m "feat(theme): 元字段一键安装弹窗组件"
```

---

## Task 6：按钮组件 + 全局注册

**Files:**
- Create: `.vitepress/theme/components/MetafieldInstallerButton.vue`
- Modify: `.vitepress/theme/index.ts`

- [ ] **Step 1：写按钮组件**

新文件 `.vitepress/theme/components/MetafieldInstallerButton.vue`：

```vue
<script setup lang="ts">
import { ref, shallowRef, watchEffect } from 'vue'
import MetafieldInstaller from './MetafieldInstaller.vue'
import { loadInstallerTemplate } from '../lib/installerLoader'
import type { InstallerTemplate } from '../lib/shoplineAdmin'

const props = withDefaults(defineProps<{
  id: string
  label?: string
  size?: 'sm' | 'md'
}>(), { label: '⚡ 一键安装元字段', size: 'md' })

const open = ref(false)
const template = shallowRef<InstallerTemplate | null>(null)
const loadingError = ref('')

async function handleClick() {
  loadingError.value = ''
  if (!template.value) {
    const tpl = await loadInstallerTemplate(props.id)
    if (!tpl) {
      loadingError.value = `没找到模板：${props.id}`
      return
    }
    template.value = tpl
  }
  open.value = true
}

watchEffect(() => {
  if (!open.value) loadingError.value = ''
})
</script>

<template>
  <span class="mib-wrap">
    <button
      type="button"
      class="mib-btn"
      :class="{ 'mib-btn-sm': size === 'sm' }"
      @click="handleClick"
    >{{ label }}</button>
    <span v-if="loadingError" class="mib-err">{{ loadingError }}</span>
    <ClientOnly>
      <MetafieldInstaller
        :open="open"
        :template="template"
        @close="open = false"
      />
    </ClientOnly>
  </span>
</template>

<style scoped>
.mib-wrap { display: inline-flex; align-items: center; gap: 8px; }
.mib-btn {
  display: inline-flex; align-items: center;
  background: var(--vp-c-brand-1); color: #fff;
  border: none; border-radius: 6px;
  padding: 8px 14px; font: inherit; cursor: pointer;
}
.mib-btn:hover { background: var(--vp-c-brand-2); }
.mib-btn-sm { padding: 4px 10px; font-size: 12px; }
.mib-err { color: #dc2626; font-size: 12px; }
</style>
```

- [ ] **Step 2：全局注册组件**

修改 `.vitepress/theme/index.ts`，把现有内容替换为：

```ts
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './styles/vars.css'
import './styles/custom.css'
import Layout from './Layout.vue'
import MetafieldInstallerButton from './components/MetafieldInstallerButton.vue'

const theme: Theme = {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('MetafieldInstallerButton', MetafieldInstallerButton)
  },
}

export default theme
```

- [ ] **Step 3：dev 检查无报错**

```bash
npm run dev
```

期望：编译通过。

- [ ] **Step 4：commit**

```bash
git add .vitepress/theme/components/MetafieldInstallerButton.vue .vitepress/theme/index.ts
git commit -m "feat(theme): 元字段安装按钮组件 + 全局注册"
```

---

## Task 7：把按钮接入索引页 + 详情页

**Files:**
- Modify: `apps/index.md`
- Modify: `apps/product-variant-picker2.md`

- [ ] **Step 1：详情页插入按钮**

修改 `apps/product-variant-picker2.md`，在「## Shopline 后台：商品元字段」这一节的标题**正下方一行**插入：

```markdown
<MetafieldInstallerButton id="product-variant-picker2" />

::: tip 一键安装
点击上方按钮，输入店铺 handle，自动把下表 5 个字段一次性写入该店铺。已存在的字段会自动跳过。
:::
```

放在「在 **设置 → 元字段 → 商品** 中创建以下字段…」这一段**上方**，作为该节的开头。

- [ ] **Step 2：索引页表格新增「一键安装」列**

修改 `apps/index.md`。把「插件索引」一节的表格改成：

```markdown
## 插件索引

| 缩略 | 后台 / 脚本名 | 一句话用途 | 配置方式 | 详情 | 元字段一键安装 |
|------|---------------|------------|----------|------|------|
| ![pvp2](/screenshots/product-variant-picker2.png) | **product-variant-picker2** | 弹层式多件规格选择 + 分层优惠，加购 / 结账 | Shopline 多件折扣 + 元字段同步 + 应用挂载 | [打开](/apps/product-variant-picker2) | <MetafieldInstallerButton id="product-variant-picker2" size="sm" label="⚡ 安装" /> |
```

- [ ] **Step 3：dev 起来肉眼检查**

```bash
npm run dev
```

打开 `http://localhost:5173/theme-component-docs/apps/`（或 dev 输出的具体 URL），确认：

1. 索引页表格末列出现「⚡ 安装」小按钮。
2. 点按钮 → 弹窗弹出 → 字段列表显示 5 条。
3. 关闭弹窗能关掉。
4. 打开 `/apps/product-variant-picker2`，「商品元字段」节顶部有按钮和提示 callout。

无需真的安装到店铺（那一步留给 Task 8）。

- [ ] **Step 4：commit**

```bash
git add apps/index.md apps/product-variant-picker2.md
git commit -m "docs(apps): 索引页与 product-variant-picker2 接入一键安装按钮"
```

---

## Task 8：端到端验证 + 文档收尾

**Files:**
- Modify: `apps/metafield-installers/README.md`（增补「已知问题与排错」一节）

- [ ] **Step 1：起 dev 跑真实安装**

```bash
npm run dev
```

按 spec 的「测试策略」清单逐项验证，对照真实测试店铺（用一个**可丢弃的测试店**或事先约定的店铺）：

1. 打开 `/apps/`，点「⚡ 安装」。
2. 输入 handle（如 `open001` 类测试店）。
3. 观察网络面板：
   - `https://shopline-app-cdn.qgergdv.com/auth/login?...` 是否 200 + 含 accessToken。
   - 5 个 `POST https://{handle}.myshopline.com/admin/openapi/metafield_definition.json` 是否 200。
4. 到 Shopline 后台「设置 → 元字段 → 商品」检查 5 个 `my_fields/*` 是否出现。
5. 再点一次「⚡ 安装」（同店）→ 5 条全部「已存在」。
6. 把 handle 改成乱写的字符串 → 弹窗显示「获取 accessToken 失败」类提示。

- [ ] **Step 2：如果 CORS 被拒，验证 fallback 脚本**

只要 Step 1 第 3 项的 `metafield_definition.json` 全部不通：

1. 展开弹窗里的 `<details>「浏览器拦截了？」`。
2. 复制脚本。
3. 打开 `https://{handle}.myshopline.com/admin/` 任意页面（已登录后台），按 F12 打开 Console，粘贴回车。
4. 看 console.table 输出，5 行 `ok: true`。
5. 后台再次确认字段已存在。

- [ ] **Step 3：把实测结果写进 README 的「已知问题与排错」一节**

在 `apps/metafield-installers/README.md` 末尾追加以下一节，并把测试中遇到的**真实**情况填进表格（例如：「2026-05-26 实测：浏览器内直发 X 成功 / 被 CORS 拒，改用 fallback」）：

```markdown
## 已知问题与排错

| 现象 | 原因 / 处理 |
|---|---|
| 弹窗一直在「获取 token…」 | handle 写错；或网络被墙；F12 看 console 报错 |
| 直发请求被 CORS 拒 | 展开「浏览器拦截了？」复制脚本到店铺后台 Console 跑 |
| 字段全部「已存在」 | 之前装过了，重复执行无副作用 |
| 401 / 429 | token 过期或限流；关闭弹窗重开，组件会重新走 ready() 拿新 token |

## 实测记录

- 2026-XX-XX：在 `<handle>` 店实测，浏览器内直发：成功 / 失败（原因…）；fallback：成功。
```

把日期与店铺改成实测值。

- [ ] **Step 4：`npm run build` + lint 通过**

```bash
npm run lint:md && npm run build
```

期望：均无错误。如有 markdown lint 错（多半是空行 / 标题层级），按提示修。

- [ ] **Step 5：commit**

```bash
git add apps/metafield-installers/README.md
git commit -m "docs(apps): 一键安装器实测记录与排错指南"
```

---

## 完成定义（DoD）

- [ ] `apps/metafield-installers/_installer.schema.json` 与 `product-variant-picker2.json` 存在且 schema 合法。
- [ ] `.vitepress/theme/lib/shoplineAdmin.ts` 与 `installerLoader.ts` 编译通过。
- [ ] `MetafieldInstaller.vue` + `MetafieldInstallerButton.vue` 已全局注册。
- [ ] `/apps/` 索引页与 `/apps/product-variant-picker2` 详情页都能弹出弹窗。
- [ ] 真实店铺端到端验证通过（直发或 fallback 至少一条通路）。
- [ ] `npm run lint:md && npm run build` 通过。
- [ ] 所有 commit message 中文化，遵循现有 `docs:` / `feat:` 前缀风格。

---

## 执行日志（执行时追加）

- **Task 1（2026-05-26）**：CORS ✅、token ✅；无版本路径 POST 返回 404 `Url not found.`。修正为 `.../admin/openapi/v20260901/metafield_definition.json`。access A/B 待复测；实现暂按 spec（`$app:` 才传 access）。
- Task 8 实测：（执行 Task 8 后追加）
