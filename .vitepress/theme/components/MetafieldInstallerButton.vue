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
.mib-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
}
.mib-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  flex-shrink: 0;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font: inherit;
  line-height: 1.35;
  cursor: pointer;
}
.mib-btn:hover { background: var(--vp-c-brand-2); }
.mib-btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}
.mib-err {
  color: #dc2626;
  font-size: 12px;
  line-height: 1.4;
}
</style>
