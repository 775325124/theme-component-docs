# Slate 2.x vs 3.x 主题差异

我们仓库里的主题分两套技术架构，**后台运营操作几乎一致**，但代码层面差异不小。技术维护者必读。

<div v-pre>

## 一句话区分

| 项 | Slate 2.x（sline / Liquid） | Slate 3.x（Handlebars 风格） |
|------|------------|-------------|
| 模板语言 | **Liquid**（Shopify 同款） | Shopline 自研的 Handlebars-like |
| Section 文件 | `sections/<name>.liquid`（**扁平**） | `sections/<name>/<name>.html`（**文件夹型**） |
| Block 文件 | 内嵌在同一个 `.liquid` 里（`{% block %}`） | 独立子目录 `sections/<name>/blocks/*.html` |
| Schema | 文件末尾 `{% schema %} … {% endschema %}` | 文件末尾 `{{#schema}} … {{/schema}}` |
| 条件 / 循环 | `{% if %}`、`{% for %}` | `{{#if}}`、`{{#for}}`、`{{#blocks}}` |
| 变量输出 | `{{ section.settings.title }}` | `{{section.settings.title}}` |
| 不转义输出 | `{{ var \| raw }}` 或自定义 filter | `{{{var}}}`（三个大括号） |
| 站点主题设置 | `config/settings_schema.json` | `theme.config.json` |

</div>

## 我们仓库里的归属

| 主题仓库 | 版本 | 状态 |
|----------|------|------|
| **Giipet** | **Slate 2.x（Liquid）** | 在用 |
| **daramiyo** | **Slate 3.x（Handlebars）** | 在用 |
| **kenpogen** | **Slate 3.x（Handlebars）** | 在用 |
| **pettena-kr** | **Slate 3.x（Handlebars）** | 在用 |
| **lanfo** | — | 空 git 仓库，暂未投入 |

## 运营层面是否能感知

**几乎不能**。两边后台都是相同的「主题编辑器 → 添加分区 → 调设置 → 保存」流程。同一个组件在 2.x 和 3.x 里展示的设置项 99% 是同名同结构（schema 字段就是后台显示项）。

唯一可能的差异：组件的 **后台命名 / 显示文案**可能因翻译文件不同而略不同，以实际后台看到的为准。

## 技术维护者怎么改

### 改一个组件

1. **定位主题**：先确认你要改的是哪个主题（每个主题独立改，**不要跨主题复制粘贴未经测试**）。
2. **看版本**：
   - 主题根目录有 `config/settings_schema.json` → Slate 2.x
   - 主题根目录有 `theme.config.json` + `sections/<x>/<x>.html` → Slate 3.x
3. **改 schema** = 改后台显示项（字段加 / 减 / label / 默认值都在 schema 里）。
4. **改 HTML/Liquid** = 改前端渲染。注意两边语法不同：

::: code-group
```liquid [Slate 2.x: sections/example.liquid]
{% if section.settings.title %}
  <h2>{{ section.settings.title }}</h2>
{% endif %}

{% for block in section.blocks %}
  <div>{{ block.settings.image | img_tag }}</div>
{% endfor %}

{% schema %}
{
  "name": "Example",
  "settings": [
    { "type": "text", "id": "title", "label": "标题" }
  ]
}
{% endschema %}
```

```handlebars [Slate 3.x: sections/example/example.html]
{{#if section.settings.title}}
  <h2>{{section.settings.title}}</h2>
{{/if}}

{{#blocks}}
  <div>{{#component "image" data=forblock.settings.image /}}</div>
{{/blocks}}

{{#schema}}
{
  "name": "Example",
  "settings": [
    { "type": "text", "id": "title", "label": "标题" }
  ]
}
{{/schema}}
```
:::

<div v-pre>

### 跨主题移植组件

把 daramiyo（3.x）的某个组件搬到 Giipet（2.x），或反向，**必须重写模板代码**。原因：
- `{{#blocks}}` 在 2.x 不存在，要换成 `{% for block in section.blocks %}`
- `{{#component "image"}}` 在 2.x 不存在，要换成 `{{ block.settings.image | img_tag }}` 或类似
- `{{{var}}}`（不转义）换成 `{{ var }}` 或 `{{ var | raw }}`
- 文件结构要重组（扁平 vs 文件夹型）

**schema 部分基本可以直接抄**，因为两边 JSON 结构基本一致，只换外层标签（`{% schema %}` ↔ `{{#schema}}`）。

</div>

## 自定义代码片段板块的版本标注

去 [代码片段库](/snippets/) 找现成片段时，看每篇片段顶部的「适用版本」徽章。同一场景常常 2.x 和 3.x 各有写法，文章里用 `::: code-group` 切换。
