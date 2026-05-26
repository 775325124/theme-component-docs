<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { InstallerTemplate, InstallStatus } from '../lib/shoplineAdmin'
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
