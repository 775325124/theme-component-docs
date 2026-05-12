# 人气视频（达人 / 种草视频墙）

::: info 适用范围
**Slate 3.x（Handlebars）** · 主题：daramiyo · kenpogen
:::

**适合做什么：** 一排展示多位达人：头像、昵称、短视频封面，下面带一句商品介绍，点整卡可跳到商品页。适合「Instagram 同款」「博主试穿」类内容。

![后台截图占位](/screenshots/kol-recommend.png)

## 整段标题区（右侧最上面几项）

| 你在后台看到的名称 | 怎么填 |
|--------------------|--------|
| Title | 大标题，例如「インフルエンサー着用動画」 |
| Subtitle | 小字说明，例如「Instagram でチェック」 |
| 标题对齐 | 标题靠左 / 居中 / 靠右 |
| 标题字号(PC) / 标题字号(Mobile) | 电脑和手机上的标题大小，拖动滑条即可 |
| Desktop Layout | **Grid**：电脑上一行最多约 5 张平铺；**Carousel**：电脑上一行横滑，旁边会出现左右箭头 |
| Background / Title Color | 整块背景色、标题颜色 |
| Button Hover | 轮播时左右箭头鼠标移上去的颜色 |

## 每一张「卡片」里填什么（添加块之后）

| 名称 | 怎么填 |
|------|--------|
| Main Image | 封面图（没视频时也会当主图） |
| Video URL | 填 **MP4 视频地址** 才会播视频；不填则只显示静态图 |
| KOL Avatar / KOL Name | 达人头像、昵称（如 @xxx） |
| Product Name | 卡片底部那行商品标题 |
| Tag | 小标签字，例如 Hot |
| Link | 顾客点整张卡片要去哪里（一般是商品链接） |

## 小提示

- 电脑：鼠标移到卡片上会自动播视频，移开就停。
- 手机：滑到屏幕里之后可能自动尝试播放（各手机浏览器规则略有不同）。
- 选了 **Carousel** 布局时，电脑上才会出现左右箭头。

## 维护者参考

::: details schema / 代码位置
- **Slate 3.x（Handlebars）** — 主题仓库内：`sections/kol-recommend/kol-recommend.html`（末尾 schema 块）+ `sections/kol-recommend/blocks/*.html`
- 修 schema 字段后请回来同步本页上方表格里的标签 / 默认值。
:::
