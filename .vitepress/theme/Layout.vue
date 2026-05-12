<script setup lang="ts">
import { computed } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'

const { Layout } = DefaultTheme
const { page, frontmatter } = useData()

// 计算反馈用的 GitHub Issue URL（带页面路径预填）
const issueUrl = computed(() => {
  const path = page.value.relativePath
  const title = `[文档反馈] ${path}`
  const body = `## 反馈的页面\n\n\`${path}\`\n\n## 反馈内容\n\n（请详细说明：哪里看不懂 / 哪里错了 / 希望补充什么）\n\n## 你的角色\n\n- [ ] 运营 / 客服 / 店主\n- [ ] 技术维护\n- [ ] 其它`
  const params = new URLSearchParams({
    title,
    body,
    labels: 'docs-feedback',
  })
  return `https://github.com/775325124/theme-component-docs/issues/new?${params.toString()}`
})

const editUrl = computed(() => {
  const path = page.value.relativePath
  return `https://github.com/775325124/theme-component-docs/edit/main/${path}`
})

// 首页 / 无反馈区的页面跳过
const showFeedback = computed(() => {
  if (frontmatter.value.layout === 'home') return false
  if (frontmatter.value.feedback === false) return false
  return true
})
</script>

<template>
  <Layout>
    <template #doc-after>
      <div v-if="showFeedback" class="feedback-section">
        <h4>这页有用 / 没用？</h4>
        <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2);">
          看不懂、有错误、缺内容、想要某个新例子——告诉我，下次更新就改。
        </p>
        <div class="feedback-actions">
          <a :href="issueUrl" target="_blank" rel="noopener">
            报告问题 / 提建议
          </a>
          <a :href="editUrl" target="_blank" rel="noopener" class="secondary">
            在 GitHub 上编辑此页
          </a>
        </div>
      </div>
    </template>
  </Layout>
</template>
