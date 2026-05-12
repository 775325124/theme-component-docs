# 如何在手册里「登记」新组件（跨主题统筹）

手册仓库与具体主题（daramiyo、kenpogen 等）**分开**。每当你在任何主题里开发了一个**新的自定义 Section / 分区**，请在本仓库按下面做，保证**所有客户/运营**只看这一份在线手册即可。

## 1. 更新组件总览表

编辑 **[组件总览](/components/)** 对应的源文件：`components/index.md`。

在表格里增加一行，建议至少包含：

| 列 | 写什么 |
|----|--------|
| 后台里大概叫什么 | 主题编辑器里出现的分区名称 |
| 一句话用途 | 给顾客/运营看的说明 |
| 适用主题 / 客户 | 例如：`daramiyo`、`kenpogen`、某客户店名（避免误以为全店都有） |
| 详细说明 | 链到下面新建的那一页 |

## 2. 新增一篇组件说明

1. 复制 `components/` 下任意一篇现有说明（如 `kol-recommend.md`）。
2. 改名，例如 `components/hero-banner-pro.md`。
3. 全文改成新组件的：适合做什么、分区设置表、子块表、常见问题。
4. 总览表里的链接指向新路径，例如 `/components/hero-banner-pro`。

## 3. 左侧导航（可选）

编辑 `.vitepress/config.mts` → `themeConfig.sidebar` →「组件说明」分组，增加：

```ts
{ text: '新组件显示名', link: '/components/hero-banner-pro' },
```

## 4. 预览与发布

```bash
npm run dev     # 本地检查
git add .
git commit -m "docs: register hero-banner-pro (daramiyo + kenpogen)"
git push
```

等待 GitHub Actions 部署完成后，线上地址即更新。

## 5. 主题代码仓库里建议写什么

只写一行「配置说明见：」+ **手册固定 URL**，不要复制大段文档，避免两处不一致。
