# ASS.js

[![GitHub Action](https://img.shields.io/github/actions/workflow/status/weizhenye/ASS/ci.yml?logo=github)](https://github.com/weizhenye/ASS/actions)
[![Codecov](https://img.shields.io/codecov/c/gh/weizhenye/ASS?logo=codecov)](https://codecov.io/gh/weizhenye/ASS)
[![License](https://img.shields.io/npm/l/assjs)](https://github.com/weizhenye/assjs/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/assjs?logo=npm)](https://www.npmjs.com/package/assjs)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/assjs?logo=jsdelivr)](https://www.jsdelivr.com/package/npm/assjs)
[![File size](https://img.shields.io/bundlejs/size/assjs)](https://bundlephobia.com/result?p=assjs)

ASS.js uses [ass-compiler](https://github.com/weizhenye/ass-compiler) to parse ASS subtitle file format, and then renders subtitles on HTML5 video.

[Demo](https://ass.js.org/)

[ASS specs](https://github.com/weizhenye/ASS/wiki/ASS-%E5%AD%97%E5%B9%95%E6%A0%BC%E5%BC%8F%E8%A7%84%E8%8C%83)(zh-Hans)

## Installation

```bash
npm install assjs
```

CDN: [jsDelivr](https://www.jsdelivr.com/package/npm/assjs), [unpkg](https://unpkg.com/assjs/)

ASS.js can be used as a JavaScript module:

```html
<script type="module">
import ASS from '/path/to/assjs/dist/ass.min.js';
</script>
```

or a classic script:

```html
<script src="/path/to/assjs/dist/ass.global.min.js">
```

## Usage

```html
<div id="player">
  <video id="video" src="./example.mp4"></video>
  <div id="ass-container"></div>
</div>
```

```js
import ASS from 'assjs';

const content = await fetch('/path/to/example.ass').then((res) => res.text());
const ass = new ASS(content, document.querySelector('#video'), {
  container: document.querySelector('#ass-container'),
});
```

`new ASS()` will append several elements to the container, and sync the render area's size with the video element. **You should set styles yourself to make sure the container is overlap on the video and match the position.** For example:

```html
<div id="player" style="position: relative;">
  <video id="video" src="./example.mp4" style="position: absolute; top: 0; left: 0;"></video>
  <div id="ass-container" style="position: absolute; top: 0; left: 0;"></div>
</div>
```

If you click the native fullscreen button in video element, only `<video>` will be fullscreened, so ASS will not show. You should use a custom button and call `document.querySelector('#player').requestFullscreen()` to ensure ASS is contained.

## API

#### Initialization

```js
const ass = new ASS(content, video, {
  // Subtitles will display in the container.
  container: document.getElementById('my-container'),

  // see resampling API below
  resampling: 'video_width',
});
```

#### Show

```js
ass.show();
```

#### Hide

```js
ass.hide();
```

#### Destroy

```js
ass.destroy();
```

#### Delay

```js
// Subtitles will be 5s later
ass.delay = 5;
// Subtitles will be 3s earlier
ass.delay = -3;
```

#### Resampling

When script resolution(PlayResX and PlayResY) don't match the video resolution, this API defines how it behaves. However, drawings and clips will be always depending on script origin resolution.

There are four valid values, we suppose video resolution is 1280x720 and script resolution is 640x480 in following situations:
* `video_width`: Script resolution will set to video resolution based on video width. Script resolution will set to 640x360, and scale = 1280 / 640 = 2.
* `video_height`(__default__): Script resolution will set to video resolution based on video height. Script resolution will set to 853.33x480, and scale = 720 / 480 = 1.5.
* `script_width`: Script resolution will not change but scale is based on script width. So scale = 1280 / 640 = 2. This may causes top and bottom subs disappear from video area.
* `script_height`: Script resolution will not change but scale is based on script height. So scale = 720 / 480 = 1.5. Script area will be centered in video area.

```js
ass.resampling = 'video_width';
```

## Browser Compatibility

ASS.js uses many Web APIs to render subtitles, some features will be disabled if you use a old browser.

| Feature | Web API | Chrome | Firefox | Safari |
| - | - | - | - | - |
| `\[i]clip` | [clip-path](https://caniuse.com/css-clip-path) | 55 | 3.5 | 13.1 |
| Auto resize | [ResizeObserver](https://caniuse.com/resizeobserver) | 64 | 69 | 13.1 |
| Animations<br>(`\t`, `\move`, `\fade`, Effect) | [registerProperty()](https://caniuse.com/mdn-api_css_registerproperty_static) | 78 | 128 | 16.4 |
| `\q0` | [text-wrap: balance](https://caniuse.com/css-text-wrap-balance) | 114 | 121 | 17.5 |
| `\bord0` when BorderStyle=3 | [@container](https://caniuse.com/mdn-css_at-rules_container_style_queries_for_custom_properties) | 111 | - | 18.0 |

## TODO

* [Script Info]
  * __WrapStyle__: 3
  * __Collisions__: Reverse
* [Events]
  * __Dialogue__
    + __Effect__
      - __Scroll up__: fadeawayheight
      - __Scroll down__: fadeawayheight
      - __Banner__: fadeawaywidth
    + __Text__ (override codes)
      - __\k, \kf, \ko, \kt, \K__: Karaoke
      - __\q__: 3
      - __\t([&lt;t1&gt;, &lt;t2&gt;, ][&lt;accel&gt;, ]&lt;style modifiers&gt;)__: &lt;accel&gt;, \2c, \2a, \\[i]clip

## Known issues

* `\N` in Aegisub has less height than `<br>` in browsers, subbers should avoid to use multiple `\N` to position a dialogue, use `\pos` instead.
* A dialogue with multiple `\t` is not rendered correctly, for transforms in browsers are order-sensitive.
* When a dialogue has Effect (Banner, Scroll up, Scroll down) and `\move` at the same time, only `\move` works.
* `\be` is just treated as `\blur`.
