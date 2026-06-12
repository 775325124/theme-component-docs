# 详情页视频自动播放

::: info 元信息

- **场景**：商品详情页里的 `<video>` 自动静音循环播放，含懒加载 / 动态插入 / 移动端内联播放兼容
- **适用平台 / 语言**：Shopline 3.x · Sline
- **首次记录**：2026-06-12 · 客户/主题：通用（3.0 主题详情页）
- **依赖**：无（`MutationObserver`，现代浏览器均支持）
- **放置位置**：店铺后台「自定义代码」详情页注入，或主题详情页 section 末尾 `<script>`
:::

## 用途

3.0 主题详情页的视频默认不一定自动播放，且部分视频是**滚动到可视区才懒加载插入** DOM 的。这段代码会：

1. 给页面上所有 `<video>` 补齐 `autoplay / loop / muted / playsinline` 等属性，去掉控制条；
2. 监听 `canplay` / `loadeddata` 等事件，数据就绪即尝试播放；
3. 用 `MutationObserver` 捕捉**后续动态插入**的视频，一并处理；
4. 多次延迟兜底重试（处理网络慢、移动端首次播放被拦截）。

::: warning 移动端自动播放前提
浏览器只允许**静音**视频自动播放。代码已强制 `muted = true`，请勿在主题里再打开声音，否则移动端会被拦截。
:::

## 代码

::: code-group

```html [Shopline 3.x · Sline（详情页注入）]
<script>
  document.addEventListener('DOMContentLoaded', function () {

    function setupVideo(video) {
      video.setAttribute('autoplay', 'autoplay');
      video.setAttribute('loop', 'loop');
      video.setAttribute('muted', 'true');
      video.setAttribute('preload', 'auto');
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x-webkit-airplay', 'true');
      video.setAttribute('x5-video-player-type', 'h5');
      video.setAttribute('x5-video-orientation', 'portraint');
      video.removeAttribute('controls');

      video.muted = true;
      video.controls = false;
      video.loop = true;
      video.style.pointerEvents = 'none';
    }

    function playVideo(video) {
      var playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(function (e) {
          console.log('Video play failed:', e);
          setTimeout(function () {
            video.play().catch(function () {});
          }, 1000);
        });
      }
    }

    function initVideo(video) {
      setupVideo(video);

      if (video.readyState >= 3) { // HAVE_FUTURE_DATA 或更高
        playVideo(video);
      } else {
        video.addEventListener('canplay', function onCanPlay() {
          playVideo(video);
          video.removeEventListener('canplay', onCanPlay);
        });

        video.addEventListener('loadeddata', function onLoadedData() {
          playVideo(video);
          video.removeEventListener('loadeddata', onLoadedData);
        });

        video.addEventListener('error', function (e) {
          console.log('Video load error:', e);
        });

        video.addEventListener('stalled', function () {
          setTimeout(function () { playVideo(video); }, 1000);
        });

        video.addEventListener('waiting', function () {
          console.log('Video is waiting for more data...');
        });
      }

      // 兜底：延迟再尝试
      setTimeout(function () { if (video.paused) playVideo(video); }, 500);
      setTimeout(function () { if (video.paused) playVideo(video); }, 2000);
    }

    // 处理已有视频
    document.querySelectorAll('video').forEach(function (video) {
      initVideo(video);
    });

    // 处理动态插入的视频
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeName === 'VIDEO') {
            initVideo(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('video').forEach(function (video) {
              initVideo(video);
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
</script>
```

:::

## 注意事项

- 仅静音视频可自动播放；`muted = true` 不能去掉。
- `pointer-events: none` 让视频不响应点击（防止用户暂停）；若需要点击交互请删掉这行。
- `MutationObserver` 在 `document.body` 上常驻监听，整页生命周期内有效；单页应用切换页面不会重复绑定（脚本只跑一次）。
- 多个视频同时自动播放会增加流量与功耗，移动端尤其注意。
- `x5-video-*` 是 QQ / 微信 X5 内核专用属性，其它浏览器忽略，无副作用。

## 改动记录

- 2026-06-12：首次记录，from 3.0 主题详情页通用需求
