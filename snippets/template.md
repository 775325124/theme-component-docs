# &lt;场景中文名&gt;

> 这是新片段的模板。复制本文件为 `<slug>.md`，把所有 `<...>` 占位符替换为实际内容。**不要直接修改本模板文件**——它是骨架。

::: info 元信息
- **场景**：&lt;一句话用途&gt;
- **适用版本**：&lt;Slate 2.x / Slate 3.x / 两版都有&gt;
- **首次记录**：YYYY-MM-DD · 客户/主题：&lt;某店铺名 或 "通用"&gt;
- **依赖**：&lt;jQuery / 某 CDN / 无&gt;
- **放置位置**：&lt;主题 layout / 商品页 / 全站 footer / 后台「自定义代码」框&gt;
:::

## 用途

&lt;2~3 句话讲清楚这段代码解决了什么问题。例如：「移动端用户向下滚动浏览商品时，希望把顶部 header 自动收起来腾出可视区域；滚回顶部时再回来。」&gt;

## 代码

::: code-group

```handlebars [Slate 3.x（Handlebars，daramiyo / kenpogen / pettena-kr）]
{{!-- 在主题里把这段放到 sections/<your-section>/<your-section>.html，或层级合适的 layout --}}
<script>
  // <代码或 // TODO 待补>
</script>
```

```liquid [Slate 2.x（Liquid / sline，Giipet）]
{%- comment -%}
  在 sections/<your-section>.liquid 或 layout/theme.liquid 合适位置贴入
{%- endcomment -%}
<script>
  // <代码或 // TODO 待补>
</script>
```

```css [CSS（两版通用）]
/* CSS 是纯标准语法，2.x / 3.x 一致 */
.your-selector {
  /* TODO 待补 */
}
```

:::

> 上面三栏不一定全用——只有一种语言时把其它栏删掉。同一场景只有 2.x **或** 只有 3.x 写法时也只保留对应一栏。

## 注意事项

- &lt;浏览器兼容、性能、安全提醒，例如：「依赖 `IntersectionObserver`，iOS Safari 12+ 才支持」、「`document.write` 在已加载完的页面会清空全页，谨慎使用」&gt;
- &lt;副作用 / 副跌坑，例如：「这段会监听全局 scroll，多页面同时启用会重复绑定，记得用 `[data-once]` 节流」&gt;

## 改动记录

- YYYY-MM-DD：首次记录，from &lt;客户/主题&gt;
- YYYY-MM-DD：&lt;后续什么改动&gt;

## 相关组件

&lt;若该片段配合某个 [组件](/components/) 使用，链过去；否则删本节&gt;
