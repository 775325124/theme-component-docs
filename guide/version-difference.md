# 主题版本与模板语言差异

::: warning 之前的错误说法（已纠正）
本页早期版本错把所有主题统一称为「Slate 2.x / 3.x」（那是 Shopify 工具链的术语），且把 Liquid / Handlebars / Sline 三种模板语言的归属写反了。**已按 Shopline 官方文档全部修正**。如果你之前看过老版本，请清掉记忆。
:::

## 一句话区分

我们目前在用的主题，**横跨两个平台、三种模板语言**——千万不要混。

| 平台 | 主题版本 | 模板语言 | 当前在用的主题 |
|------|---------|---------|----------------|
| **Shopline** | **Online Store 3.0**（Bottle 系） | **Sline**（Shopline 自研） | **daramiyo · kenpogen · pettena-kr · sosove-jp** |
| **Shopify** | — | **Liquid** | **Giipet** |
| Shopline | Online Store 2.0 | **Handlebars** | _目前未使用，预留_ |

> **怎么 30 秒判断手上的主题是哪一类**：打开 `sections/` 目录看一眼。
>
> - 看到 `sections/<name>.liquid` 扁平文件，里面有 `{% if %}` `{% schema %}` —— **Shopify Liquid**
> - 看到 `sections/<name>/<name>.html` 文件夹，里面有 `&#123;&#123;#if&#125;&#125;` `&#123;&#123;#schema&#125;&#125;` `| asset_url()` —— **Shopline 3.x（Sline）**
> - 看到 `sections/*.html`（扁平 .html）+ Handlebars `helper` —— **Shopline 2.x**

## 三种模板语言对比

<table v-pre>
<thead>
<tr><th>项</th><th>Shopline 3.x（Sline）</th><th>Shopline 2.x（Handlebars）</th><th>Shopify（Liquid）</th></tr>
</thead>
<tbody>
<tr><td>模板引擎</td><td>Shopline 自研 <a href="https://developer.shopline.com/zh-hans-cn/docs/sline/sline-overview" target="_blank">Sline</a></td><td><a href="https://developer.shopline.com/docs/handlebars/basics/" target="_blank">Handlebars</a></td><td><a href="https://shopify.dev/docs/api/liquid" target="_blank">Liquid</a></td></tr>
<tr><td>官方主题示例</td><td><a href="https://github.com/shoplineos/Bottle" target="_blank">Bottle</a></td><td>—</td><td>Dawn / Slate 工具链</td></tr>
<tr><td>Section 文件</td><td><code>sections/&lt;name&gt;/&lt;name&gt;.html</code>（<strong>文件夹型</strong>）</td><td><code>sections/&lt;name&gt;.html</code>（<strong>扁平</strong>）</td><td><code>sections/&lt;name&gt;.liquid</code>（<strong>扁平</strong>）</td></tr>
<tr><td>Block 文件</td><td>独立子目录 <code>sections/&lt;name&gt;/blocks/*.html</code></td><td>内嵌在 section <code>.html</code> 里</td><td>内嵌在 section <code>.liquid</code> 里（<code>{% block %}</code>）</td></tr>
<tr><td>Schema</td><td>文件末尾 <code>&#123;&#123;#schema&#125;&#125; … &#123;&#123;/schema&#125;&#125;</code></td><td>文件末尾 <code>&#123;&#123;#schema&#125;&#125; … &#123;&#123;/schema&#125;&#125;</code></td><td>文件末尾 <code>{% schema %} … {% endschema %}</code></td></tr>
<tr><td>条件 / 循环</td><td><code>&#123;&#123;#if&#125;&#125;</code> <code>&#123;&#123;/if&#125;&#125;</code>、<code>&#123;&#123;#each&#125;&#125;</code> <code>&#123;&#123;/each&#125;&#125;</code></td><td><code>&#123;&#123;#if&#125;&#125;</code> <code>&#123;&#123;/if&#125;&#125;</code>、<code>&#123;&#123;#each&#125;&#125;</code> <code>&#123;&#123;/each&#125;&#125;</code></td><td><code>{% if %}</code> <code>{% endif %}</code>、<code>{% for %}</code> <code>{% endfor %}</code></td></tr>
<tr><td>变量输出</td><td><code>&#123;&#123;section.settings.title&#125;&#125;</code></td><td><code>&#123;&#123;section.settings.title&#125;&#125;</code></td><td><code>&#123;&#123; section.settings.title &#125;&#125;</code></td></tr>
<tr><td>不转义输出</td><td><strong><code>&#123;&#123;{var&#125;&#125;}</code></strong>（三个大括号）</td><td><strong><code>&#123;&#123;{var&#125;&#125;}</code></strong>（三个大括号）</td><td><code>&#123;&#123; var &#125;&#125;</code> 默认不转义；用 <code>| escape</code> 转义</td></tr>
<tr><td>Filter / Helper</td><td><code>&#123;&#123; price | money() &#125;&#125;</code>（带括号）</td><td>helper：<code>&#123;&#123;money price&#125;&#125;</code></td><td><code>&#123;&#123; price | money &#125;&#125;</code></td></tr>
<tr><td>引用静态资源</td><td><code>&#123;&#123; "logo.png" | asset_url() &#125;&#125;</code></td><td><code>&#123;&#123;asset_url "logo.png"&#125;&#125;</code></td><td><code>&#123;&#123; "logo.png" | asset_url &#125;&#125;</code></td></tr>
<tr><td>站点主题设置</td><td><code>theme.config.json</code> + <code>theme.schema.json</code></td><td><code>config/settings_schema.json</code></td><td><code>config/settings_schema.json</code></td></tr>
<tr><td>Layout</td><td><code>layout/theme.html</code></td><td><code>layout/theme.html</code></td><td><code>layout/theme.liquid</code></td></tr>
<tr><td>自动加载子组件</td><td><code>&#123;&#123;#component "image"&#125;&#125;</code> 直接调 components/ 下的复用组件</td><td>用 partial / helper</td><td><code>{% include 'name' %}</code> / <code>{% render 'name' %}</code></td></tr>
</tbody>
</table>

## 实际代码对比：渲染一个 section 的标题与图片

### Shopline 3.x（Sline）— 最常用

::: code-group

```html [sections/example/example.html]
<section class="example" data-section-id="{{section.id}}">
  {{#if section.settings.title}}
    <h2>{{section.settings.title}}</h2>
  {{/if}}

  {{#component "image"
    src=section.settings.image
    alt=section.settings.title
    /}}

  {{#blocks}}
    <div class="card">
      <p>{{block.settings.text}}</p>
    </div>
  {{/blocks}}
</section>

{{#schema}}
{
  "name": "示例区块",
  "settings": [
    { "type": "text", "id": "title", "label": "标题" },
    { "type": "image_picker", "id": "image", "label": "图片" }
  ],
  "blocks": [
    {
      "type": "card",
      "name": "卡片",
      "settings": [
        { "type": "text", "id": "text", "label": "文案" }
      ]
    }
  ],
  "max_blocks": 6
}
{{/schema}}
```

:::

### Shopify（Liquid）— Giipet 在用

::: code-group

```liquid [sections/example.liquid]
{%- if section.settings.title != blank -%}
  <h2>{{ section.settings.title }}</h2>
{%- endif -%}

<img
  src="{{ section.settings.image | image_url: width: 1200 }}"
  alt="{{ section.settings.title | escape }}"
  loading="lazy">

{%- for block in section.blocks -%}
  <div class="card">
    <p>{{ block.settings.text }}</p>
  </div>
{%- endfor -%}

{% schema %}
{
  "name": "示例区块",
  "settings": [
    { "type": "text", "id": "title", "label": "标题" },
    { "type": "image_picker", "id": "image", "label": "图片" }
  ],
  "blocks": [
    {
      "type": "card",
      "name": "卡片",
      "settings": [
        { "type": "text", "id": "text", "label": "文案" }
      ]
    }
  ]
}
{% endschema %}
```

:::

### Shopline 2.x（Handlebars）— 暂未使用，待补完整示例

::: code-group

```html [sections/example.html]
{{#if section.settings.title}}
  <h2>{{section.settings.title}}</h2>
{{/if}}

{{#each section.blocks}}
  <div class="card">
    <p>{{this.settings.text}}</p>
  </div>
{{/each}}

{{#schema}}
{ "name": "示例区块", "settings": [ ... ] }
{{/schema}}
```

:::

## 跨语言迁移注意事项

把同一个组件从 **Shopline 3.x（Sline）** 移到其它平台时，要逐项替换：

<table v-pre>
<thead>
<tr><th>原（Sline）</th><th>改成 Shopify Liquid</th><th>改成 Shopline 2.x Handlebars</th></tr>
</thead>
<tbody>
<tr><td><code>&#123;&#123;#if x&#125;&#125;…&#123;&#123;/if&#125;&#125;</code></td><td><code>{% if x %}…{% endif %}</code></td><td><code>&#123;&#123;#if x&#125;&#125;…&#123;&#123;/if&#125;&#125;</code>（一致）</td></tr>
<tr><td><code>&#123;&#123;#blocks&#125;&#125;…&#123;&#123;/blocks&#125;&#125;</code></td><td><code>{% for block in section.blocks %}…{% endfor %}</code></td><td><code>&#123;&#123;#each section.blocks&#125;&#125;…&#123;&#123;/each&#125;&#125;</code></td></tr>
<tr><td><code>&#123;&#123; section.settings.title &#125;&#125;</code></td><td><code>&#123;&#123; section.settings.title &#125;&#125;</code>（语法相同）</td><td><code>&#123;&#123;section.settings.title&#125;&#125;</code></td></tr>
<tr><td><code>&#123;&#123;{var&#125;&#125;}</code> 不转义</td><td><code>&#123;&#123; var &#125;&#125;</code>（默认不转义）</td><td><code>&#123;&#123;{var&#125;&#125;}</code>（一致）</td></tr>
<tr><td><code>&#123;&#123;#component "image" src=img /&#125;&#125;</code></td><td><code>{% render 'image', src: img %}</code> 或 <code>&lt;img&gt;</code></td><td>helper <code>&#123;&#123;image img&#125;&#125;</code></td></tr>
<tr><td><code>&#123;&#123; x | money() &#125;&#125;</code>（filter 带括号）</td><td><code>&#123;&#123; x | money &#125;&#125;</code>（无括号）</td><td>helper <code>&#123;&#123;money x&#125;&#125;</code></td></tr>
<tr><td><code>&#123;&#123;#schema&#125;&#125;…&#123;&#123;/schema&#125;&#125;</code></td><td><code>{% schema %}…{% endschema %}</code></td><td><code>&#123;&#123;#schema&#125;&#125;…&#123;&#123;/schema&#125;&#125;</code>（一致）</td></tr>
<tr><td><code>theme.config.json</code></td><td><code>config/settings_schema.json</code></td><td><code>config/settings_schema.json</code></td></tr>
</tbody>
</table>

## 参考资料（官方）

- [Shopline Online Store 3.0 主题概览（Bottle）](https://developer.shopline.com/zh-hans-cn/docs/online-store-3-0-themes/bottle)
- [Sline 模板语言概览](https://developer.shopline.com/zh-hans-cn/docs/sline/sline-overview)
- [Shopline Online Store 2.0 主题概览](https://developer.shopline.com/docs/themes-2-0/get-started/overview)
- [Shopline Handlebars 基础](https://developer.shopline.com/docs/handlebars/basics/)
- [Shopify Liquid 文档](https://shopify.dev/docs/api/liquid)
