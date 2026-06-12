# 结账页加购埋点上报

::: info 元信息

- **场景**：在 Shopline 3.0 结账页（checkout）触发 `addToCart` 埋点，把订单 / 商品 / 设备信息上报到第三方追踪接口
- **适用平台 / 语言**：Shopline 3.x · Sline（结账页 / checkout 自定义代码）
- **首次记录**：2026-06-12 · 客户/主题：通用
- **依赖**：结账页可用的 <code v-pre>{{{json checkout}}}</code>、<code v-pre>{{{json localization.country.currency}}}</code> 模板变量；追踪接口 `api.nuawuk.com`
- **放置位置**：店铺后台「结账与账户」→ 自定义脚本 / 结账页注入代码
:::

## 用途

进入结账页时，读取 Shopline 注入的 `checkout` 模板数据（商品、总价、币种），叠加设备 / 时区 / 来源（`utm_medium`）/ 访客 uid 等信息，拼成一张 `tracking_third.gif` 像素请求上报，用于投放侧的转化追踪。

整段包在 `try/catch` 里，任何异常都**静默吞掉**，不影响结账流程。

::: warning 平台变量与依赖
- <code v-pre>{{{json checkout}}}</code> 等是 **Handlebars 三花括号原样输出**，必须放在 Shopline 结账页能解析模板的注入位置，普通商品页拿不到。
- 访客 uid 存在 `localStorage.__gk_event_poster_uid`；来源参数读自 `localStorage.__gk_query`，需配合落地页写入逻辑。
- 上报域名 `api.nuawuk.com` 为内部追踪服务，更换投放方案时记得同步。
:::

## 代码

::: code-group

```html [Shopline 3.x · Sline（结账页注入）]
<script>
  try {
    (function () {
      if (location.href.indexOf('http') !== 0) {
        return;
      }
      var checkoutData = {{{json checkout}}};
      var currency = {{{json localization.country.currency}}};

      function getTimezoneName() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      function getTimezoneOffset() {
        var timezoneOffset = new Date().getTimezoneOffset();
        return timezoneOffset > 0
          ? '西' + parseInt(timezoneOffset / 60) + '区'
          : '东' + Math.abs(parseInt(timezoneOffset / 60)) + '区';
      }
      function getRandomId() {
        function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        var ms = new Date().getTime();
        return ms + S4() + S4() + S4();
      }

      var uid = '';
      function getUid() {
        if (uid) return uid;
        uid = localStorage.getItem('__gk_event_poster_uid');
        if (uid) return uid;
        uid = getRandomId();
        localStorage.setItem('__gk_event_poster_uid', uid);
        return uid;
      }

      function getQueryParams() {
        var queryObj = localStorage.getItem('__gk_query');
        if (queryObj) return JSON.parse(queryObj);
        return {};
      }
      function getFrom() {
        return getQueryParams().utm_medium || '';
      }

      function getProductInfos() {
        return checkoutData.productInfos.map(function (item) {
          return {
            productName: item.productName,
            productNum: item.productNum,
            productPrice: item.productPrice / 100,
            productSkuAttrList: item.productSkuAttrList,
            url: item.url.replace(/\&/g, '__and__'),
          };
        });
      }

      function getBase() {
        return {
          url: location.href,
          uid: getUid(),
          referrer: document.referrer,
          host: location.host,
          currencyCode: currency.iso_code,
          from: getFrom(),
          queryParams: JSON.stringify(getQueryParams()),
          navigatorPlatform: navigator.platform,
          navigatorLanguage: navigator.language,
          navigatorWebdriver: navigator.webdriver,
          navigatorProduct: navigator.product,
          timezoneName: getTimezoneName(),
          timezoneOffset: getTimezoneOffset(),
          timestamp: new Date().getTime(),
          totalPrice: checkoutData.total_price / 100,
          productInfos: getProductInfos(),
        };
      }

      function send(eventName, options, time) {
        options = options || {};
        var data = getBase();
        data.url = data.url.replace(/\&/g, '__and__');
        data.referrer = data.referrer.replace(/\&/g, '__and__');
        data.eventName = eventName;
        data = Object.assign({}, data, options);
        if (time && time > 0) data.time = time;

        var datastr = JSON.stringify(data)
          .replace(/\&/g, '__and__')
          .replace(/#/g, ' ');
        var src =
          'https://api.nuawuk.com/shopapi/tracking_third.gif?tracking_data=' +
          datastr + '&t=' + new Date().getTime();
        var img = new Image();
        img.src = src;
      }

      send('addToCart');
    })();
  } catch (error) {}
</script>
```

:::

## 注意事项

- 整段 `try/catch` 静默处理异常，避免影响结账；调试时可临时把 `catch` 里加 `console.error`。
- `&` → `__and__`、`#` → 空格的转义是为了让数据塞进 GIF 的 querystring 不被截断；接收端需做反向还原。
- 像素请求用 `new Image().src` 发出，**无回调**，发出即走，不保证送达。
- 仅在结账页触发一次 `addToCart`；如需其它事件，复用 `send('eventName', {...})`。
- 涉及第三方上报与设备信息，注意目标市场的隐私合规（GDPR / 同意管理）。

## 改动记录

- 2026-06-12：首次记录，from 3.0 结账页加购埋点
