# 评论日期自动更新（多列）

::: info 元信息

- **场景**：商品评论插件列表的日期按「近 7 天加权分布」自动刷新，支持多列 / 分页 / 翻页后仍保持同一套日期规则
- **适用平台 / 语言**：Shopline 2.x · Handlebars
- **首次记录**：2026-06-26 · 客户/主题：通用（2.0 主题 · 商品评论插件）
- **依赖**：Shopline 商品评论插件 DOM（`.plugin-product-comment-*`）；`MutationObserver`（现代浏览器均支持）
- **放置位置**：店铺后台「自定义代码」商品详情页 `<script>`，或主题商品页 layout / section 末尾
:::

## 用途

2.0 主题挂载的商品评论插件，评论日期往往固定不变或会被插件脚本反复写回。这段代码会：

1. 以**当天 0 点**为锚点，按 7 天权重 `[30, 30, 8, 8, 8, 8, 8]` 把评论分配到「昨天～7 天前」；
2. 支持**多列评论列表 + 分页**：按全局序号（跨页）分配日期，翻页后同一评论仍对应同一天；
3. 监听评论 DOM 变化与分页点击，在插件晚于首屏渲染或改回日期时**多次重试并锁定**已分配日期；
4. 跨天（午夜）自动清空缓存并重新分配。

日期格式：`YYYY/MM/DD`（如 `2026/06/25`）。

::: tip 权重含义
`DAY_WEIGHTS = [30, 30, 8, 8, 8, 8, 8]` 表示约 60% 评论落在「昨天 / 前天」，其余均匀落在再往前 5 天。总评论数变化时会按权重重新分摊到各天。
:::

## 代码

::: code-group

```html [Shopline 2.x · Handlebars（商品详情页注入）]
<script>
(function () {
    'use strict';

    const DAY_WEIGHTS = [30, 30, 8, 8, 8, 8, 8];
    const TOTAL_WEIGHT = DAY_WEIGHTS.reduce((a, b) => a + b, 0);

    let todayKey = '';
    let todayAnchor = null;
    let isApplying = false;
    let globalOffsetCache = { total: -1, offsets: [] };

    const getTodayAnchor = () => {
        const now = new Date();
        const key = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        if (key !== todayKey) {
            todayKey = key;
            todayAnchor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            globalOffsetCache = { total: -1, offsets: [] };
        }
        return todayAnchor;
    };

    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return y + '/' + m + '/' + d;
    };

    const dateFromOffset = (dayOffset) => {
        const base = getTodayAnchor();
        const date = new Date(base);
        date.setDate(date.getDate() - dayOffset - 1);
        return formatDate(date);
    };

    const buildGlobalOffsets = (totalCount) => {
        if (totalCount <= 0) return [0];

        if (globalOffsetCache.total === totalCount && globalOffsetCache.offsets.length === totalCount) {
            return globalOffsetCache.offsets;
        }

        const counts = DAY_WEIGHTS.map((w) => Math.floor((w / TOTAL_WEIGHT) * totalCount));
        let sum = counts.reduce((a, b) => a + b, 0);

        const remainders = DAY_WEIGHTS
            .map((w, i) => ({ i, r: (w / TOTAL_WEIGHT) * totalCount - counts[i] }))
            .sort((a, b) => b.r - a.r);

        let ri = 0;
        while (sum < totalCount) {
            counts[remainders[ri++ % remainders.length].i]++;
            sum++;
        }

        const offsets = [];
        for (let d = 0; d < DAY_WEIGHTS.length; d++) {
            for (let c = 0; c < counts[d]; c++) offsets.push(d);
        }

        globalOffsetCache = { total: totalCount, offsets };
        return offsets;
    };

    const getDayOffsetByGlobalIndex = (globalIndex, totalCount) => {
        const offsets = buildGlobalOffsets(totalCount);
        if (globalIndex < 0) return 0;
        if (globalIndex >= offsets.length) return DAY_WEIGHTS.length - 1;
        return offsets[globalIndex];
    };

    const debounce = (fn, delay) => {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    const findDateElement = (item) => {
        return item.querySelector('.plugin-product-comment-date')
            || item.querySelector('[class*="comment-date"]');
    };

    const getPaginationMeta = (root) => {
        const svg = root.querySelector('[total][pageSize], svg[total]');
        const items = root.querySelectorAll('.plugin-product-comment-userInfo');

        let total = svg ? Number(svg.getAttribute('total')) : 0;
        let pageSize = svg ? Number(svg.getAttribute('pageSize')) : items.length;
        let page = svg ? Number(svg.getAttribute('current')) : 1;

        if (!total || !Number.isFinite(total)) {
            const pageItems = root.querySelectorAll('.isv-web-pagination-item:not(.isv-web-pagination-jump-next)');
            const pageNumbers = [...pageItems]
                .map((el) => Number(el.textContent.trim()))
                .filter((n) => Number.isFinite(n) && n > 0);
            const lastPage = pageNumbers.length ? Math.max(...pageNumbers) : 1;
            pageSize = items.length || pageSize || 6;
            total = lastPage * pageSize;
        }

        if (!page || !Number.isFinite(page)) {
            const active = root.querySelector('.isv-web-pagination-item-active, .plugin-product-comment--item-active');
            page = Number((active && active.textContent) || '1');
        }

        if (!pageSize || !Number.isFinite(pageSize)) pageSize = items.length || 6;
        if (!page || !Number.isFinite(page) || page < 1) page = 1;

        return { total, pageSize, page };
    };

    const applyDateToItem = (item, dateText) => {
        const dateEl = findDateElement(item);
        if (!dateEl) return;
        if (dateEl.textContent.trim() !== dateText) {
            dateEl.textContent = dateText;
        }
        item.setAttribute('data-comment-date-assigned', dateText);
    };

    const updateItemDates = (root) => {
        if (isApplying) return;
        isApplying = true;

        try {
            const items = root.querySelectorAll('.plugin-product-comment-userInfo');
            if (!items.length) return;

            getTodayAnchor();
            const { total, pageSize, page } = getPaginationMeta(root);
            const pageStart = (page - 1) * pageSize;

            items.forEach((item, index) => {
                const globalIndex = pageStart + index;
                const dayOffset = getDayOffsetByGlobalIndex(globalIndex, total);
                applyDateToItem(item, dateFromOffset(dayOffset));
            });
        } catch (e) {
        } finally {
            isApplying = false;
        }
    };

    const reapplyAssignedDates = (root) => {
        if (isApplying) return;
        isApplying = true;

        try {
            root.querySelectorAll('.plugin-product-comment-userInfo').forEach((item) => {
                const assigned = item.getAttribute('data-comment-date-assigned');
                if (assigned) applyDateToItem(item, assigned);
            });
        } catch (e) {
        } finally {
            isApplying = false;
        }
    };

    const scheduleBeatPlugin = (root) => {
        [0, 100, 300, 600, 1000, 2000, 3500].forEach((delay) => {
            setTimeout(() => {
                updateItemDates(root);
                reapplyAssignedDates(root);
            }, delay);
        });
    };

    const observeList = (root) => {
        if (root.dataset.commentDateObserved === '1') return;
        root.dataset.commentDateObserved = '1';

        const debouncedUpdate = debounce(() => {
            updateItemDates(root);
            scheduleBeatPlugin(root);
        }, 200);

        const debouncedReapply = debounce(() => reapplyAssignedDates(root), 100);

        const observer = new MutationObserver((mutations) => {
            if (isApplying) return;

            let shouldUpdate = false;
            let shouldReapply = false;

            for (const mutation of mutations) {
                const target = mutation.target.nodeType === 3
                    ? mutation.target.parentElement
                    : mutation.target;

                if (!target || !root.contains(target)) continue;

                if (target.closest && target.closest('.plugin-product-comment-date')) {
                    shouldReapply = true;
                } else if (
                    target.closest('.plugin-product-comment-userInfo')
                    || target.closest('.plugin-product-comment-commentItem')
                    || target.closest('.plugin-product-comment-detail-list')
                    || target.closest('.plugin-product-comment-detail-mobile-list')
                    || target.closest('.isv-web-pagination')
                    || target.closest('.plugin-product-comment-pcPagination')
                ) {
                    shouldUpdate = true;
                }
            }

            if (shouldUpdate) debouncedUpdate();
            else if (shouldReapply) debouncedReapply();
        });

        observer.observe(root, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['class', 'current', 'total']
        });

        document.addEventListener('click', (e) => {
            const hit = e.target.closest(
                '.isv-web-pagination-item, .isv-web-pagination-prev, .isv-web-pagination-next, .isv-web-pagination-jump-next, .plugin-product-comment--item, .plugin-product-comment--prev, .plugin-product-comment--next, .plugin-product-comment--jump-next'
            );
            if (hit && root.contains(hit)) {
                setTimeout(() => debouncedUpdate(), 50);
                setTimeout(() => debouncedUpdate(), 400);
            }
        });
    };

    const initOneList = (listElement) => {
        updateItemDates(listElement);
        scheduleBeatPlugin(listElement);
        observeList(listElement);
    };

    const initCommentDate = () => {
        document.querySelectorAll('.plugin-product-comment-CommentList').forEach(initOneList);

        const fallback = document.querySelector('#plugin-product-comment, .plugin-product-comment');
        if (fallback && !fallback.dataset.commentDateObserved) {
            initOneList(fallback);
        }
    };

    const scheduleMidnightRefresh = () => {
        const now = new Date();
        const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
        setTimeout(() => {
            todayKey = '';
            todayAnchor = null;
            globalOffsetCache = { total: -1, offsets: [] };
            document.querySelectorAll('[data-comment-date-assigned]').forEach((el) => {
                el.removeAttribute('data-comment-date-assigned');
            });
            document.querySelectorAll('[data-comment-date-observed]').forEach((el) => {
                el.removeAttribute('data-comment-date-observed');
            });
            initCommentDate();
            scheduleMidnightRefresh();
        }, next - now);
    };

    const waitForComment = (maxTries = 80) => {
        let tries = 0;
        const timer = setInterval(() => {
            const found = document.querySelector('.plugin-product-comment-CommentList, #plugin-product-comment, .plugin-product-comment');
            if (found) {
                clearInterval(timer);
                initCommentDate();
                scheduleMidnightRefresh();
            } else if (++tries >= maxTries) {
                clearInterval(timer);
            }
        }, 300);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForComment);
    } else {
        waitForComment();
    }

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.product-plugin-comment-rate-star, [class*="comment"][class*="star"]');
        if (trigger) {
            setTimeout(initCommentDate, 300);
            setTimeout(initCommentDate, 1000);
        }
    }, true);
})();
</script>
```

:::

## 工作原理简述

| 步骤 | 说明 |
|------|------|
| 等待评论插件 | 轮询最多约 24 秒，直到出现 `.plugin-product-comment-CommentList` 或 `#plugin-product-comment` |
| 读取分页信息 | 从 `svg[total][pageSize][current]` 或分页 DOM 推算总条数、当前页、每页条数 |
| 全局序号 | `globalIndex = (page - 1) * pageSize + 当前页内 index`，保证翻页后同一逻辑位置对应同一天 |
| 分配日期 | 按 `DAY_WEIGHTS` 把各 globalIndex 映射到 0～6 天偏移，再格式化为 `YYYY/MM/DD` |
| 对抗插件回写 | `scheduleBeatPlugin` 在 0～3500ms 多次重试；`data-comment-date-assigned` 记录已分配值，插件改回时 `reapplyAssignedDates` 再写一次 |
| 跨天刷新 | 次日 0:00:05 清空缓存并重新初始化 |

## 注意事项

- 强依赖 **Shopline 商品评论插件** 的 class 名（如 `.plugin-product-comment-userInfo`、`.plugin-product-comment-date`）；插件大版本升级后需复核选择器。
- 日期是**展示层改写**，不修改后台真实评论时间；仅用于前台「看起来较新」的分布效果。
- 同一页面若存在**多个** `.plugin-product-comment-CommentList`，会分别初始化；多列布局通常共用一个列表容器，一般无冲突。
- `document` 级分页 / 星级点击监听在多个列表时可能重复触发，但 `debounce` 与 `isApplying` 可减轻抖动。
- 修改「近几天占比」时只改顶部的 `DAY_WEIGHTS` 数组即可，权重不必加起来等于 100，脚本会按比例归一化。

## 常见疑问

| 现象 | 原因 / 处理 |
|------|------------|
| 日期闪一下又变回旧的 | 评论插件晚于脚本写 DOM；依赖 `scheduleBeatPlugin` 与 `MutationObserver`，一般会自动恢复 |
| 翻页后日期乱了 | 检查分页 DOM 是否仍带 `total` / `pageSize` / `current`；若无，脚本会按可见页码估算总条数 |
| 跨天后仍是昨天 | 用户未刷新页面时靠 `scheduleMidnightRefresh`；长时间不关 tab 会在 0 点后约 5 秒刷新 |
| 完全没生效 | 评论插件未挂载或 class 变更；用开发者工具确认是否存在 `.plugin-product-comment-CommentList` |

## 改动记录

- 2026-06-26：首次记录，from 2.0 主题商品评论插件（多列 + 分页）
