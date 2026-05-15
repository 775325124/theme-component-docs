# 婴儿车对比表

::: info 适用范围
**Shopify（Liquid）** · 主题：pettena-jp
:::

**适合做什么：** 把多款婴儿车放在一张横向可滑动的对比表里，包含产品图、价格、折叠方式、载重、评级图标等关键参数，帮助顾客快速对比选购。

> 配合用法：每款参与对比的商品需要先创建**元对象**并绑定到商品元字段 `custom.stroller_compare_info`（详见下方「元对象配置」）。

![后台截图占位](/screenshots/stroller-compare-table.png)

## 整段（分区）设置

| 名称 | 怎么填 |
|------|--------|
| Heading | 对比表顶部标题，留空则不显示 |
| Heading tag | 标题级别：H2 / H3 / H4，默认 H2 |
| Product list | 选择参与对比的商品，最多 12 个 |
| 链接文字 | 每列商品图下方的链接文字，默认「もっと見る」 |
| Link color | 链接颜色，默认蓝色 |
| Padding top | 0～100 px，每次 5 px，默认 40 |
| Padding bottom | 0～100 px，每次 5 px，默认 40 |

## 元对象配置（技术前置）

::: warning 重要
对比表的数据**不在分区后台填写**，而是来自每个商品的元字段引用的**元对象（Metaobject）**。没有配置元对象的商品不会显示对比数据。
:::

### 第一步：创建元对象定义

在 Shopify 后台 **设置 → 自定义数据 → 元对象** 中新建定义，建议命名为 `stroller_compare_info`，并添加以下字段：

| 字段键名 | 类型 | 说明 |
|----------|------|------|
| name | 单行文本 | 显示名称（覆盖商品标题） |
| badge_main | 单行文本 | 徽章主文案，例如「🏆 No.1 人気」 |
| badge_sub | 单行文本 | 徽章副文案，例如「初心者向け」 |
| image | 文件（图片） | 对比表中的商品图（留空则用商品主图） |
| price | 单行文本 | 价格文字，例如「¥39,800」 |
| fold_method | 单行文本 | 折叠方式，例如「片手ワンタッチ」 |
| cot_detach | 单行文本 | 座舱分离图标：填 `double` / `single` / `triangle` / `cross` |
| load_capacity | 单行文本 | 耐荷重，例如「15kg」 |
| weight | 单行文本 | 重量，例如「6.2kg」 |
| carry_size | 单行文本 | 车厢内部尺寸 |
| fold_size | 单行文本 | 折叠后尺寸 |
| canopy_adjust | 单行文本 | 顶篷调节方式 |
| material | 单行文本 | 材质 |
| driving_icon | 单行文本 | 走行性能图标：`double` / `single` / `triangle` / `cross` |
| driving_text | 单行文本 | 走行性能说明文字 |
| storage_icon | 单行文本 | 收纳携带性图标：同上 |
| storage_text | 单行文本 | 收纳携带性说明文字 |
| living_icon | 单行文本 | 居住性图标：同上 |
| living_text | 单行文本 | 居住性说明文字 |
| scene | 单行文本 | 适用场景 |

### 第二步：创建元对象条目

为每款婴儿车创建一条元对象条目，填入上述参数。

### 第三步：绑定到商品元字段

在 **设置 → 自定义数据 → 商品** 中创建元字段：

| 项目 | 填什么 |
|------|--------|
| 命名空间 & 键名 | `custom.stroller_compare_info` |
| 类型 | 元对象引用 → 选择上面创建的元对象定义 |

然后在每个需要参与对比的商品编辑页中，找到该元字段，选择对应的元对象条目。

## 评级图标说明

对比表中部分行使用图标来表示等级：

| 图标名 | 视觉效果 | 含义建议 |
|--------|----------|----------|
| double | ◎ 双圈 | 最优 / 非常好 |
| single | ○ 单圈 | 良好 |
| triangle | △ 三角 | 一般 |
| cross | × 叉号 | 不支持 / 较弱 |

## 对比表固定行（从上到下）

| 行 | 显示内容 |
|----|----------|
| 产品图 | 元对象 image 字段，留空则用商品主图 |
| 链接 | 指向商品详情页，文字来自分区设置 |
| 名称 | 元对象 name 字段，留空则用商品标题 |
| 徽章 | badge_main + badge_sub |
| 価格 | price |
| 折りたたみ方 | fold_method |
| コットの分離 | cot_detach（图标） |
| 耐荷重 | load_capacity |
| 重量 | weight |
| キャリー内寸 | carry_size |
| カートの折り畳みサイズ | fold_size |
| キャノピーの調整 | canopy_adjust |
| 材質 | material |
| 走行性能 | driving_icon（图标）+ driving_text |
| 収納・携帯性 | storage_icon（图标）+ storage_text |
| 居住性 | living_icon（图标）+ living_text |
| 利用シーン適性 | scene |

## 常见疑问

| 现象 | 原因 / 处理 |
|------|------------|
| 某款商品列是空的 | 该商品未绑定元字段 `custom.stroller_compare_info` 或元对象条目字段未填写 |
| 图片不显示 | 检查元对象的 image 字段是否上传了图片；若留空会尝试使用商品主图 |
| 评级图标不显示 | 图标字段只接受 `double` / `single` / `triangle` / `cross` 四个值，拼写要完全一致 |
| 移动端表格看不全 | 正常现象——表格支持横向滑动，左侧标签列会固定不动 |
