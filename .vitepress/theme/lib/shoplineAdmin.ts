export const SHOPLINE_METAFIELD_API_VERSION = 'v20260901'

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
    access?: { admin?: string }
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

export function metafieldDefinitionUrl(handle: string): string {
  return `https://${handle}.myshopline.com/admin/openapi/${SHOPLINE_METAFIELD_API_VERSION}/metafield_definition.json`
}

export async function createMetafieldDefinition(
  handle: string,
  token: string,
  field: MetafieldFieldConfig,
  defaults: { namespace: string; ownerResource: string; access?: { admin?: string } }
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
  const accessAdmin = field.access?.admin ?? defaults.access?.admin
  if (accessAdmin) {
    definition.access = { admin: accessAdmin }
  }

  const url = metafieldDefinitionUrl(handle)

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
    access: template.defaults?.access,
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
    const accessAdmin = (f.access && f.access.admin) || (DEFAULTS.access && DEFAULTS.access.admin);
    if (accessAdmin) def.access = { admin: accessAdmin };
    try {
      const resp = await fetch('https://' + HANDLE + '.myshopline.com/admin/openapi/${SHOPLINE_METAFIELD_API_VERSION}/metafield_definition.json', {
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
