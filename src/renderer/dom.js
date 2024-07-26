import { color2rgba, initAnimation } from '../utils.js';
import { createDrawing } from './drawing.js';
import { getRealFontSize } from './font-size.js';
import { createCSSStroke } from './stroke.js';
import { rotateTags, scaleTags, skewTags, createTransform } from './transform.js';

function encodeText(text, q) {
  return text
    .replace(/\\h/g, ' ')
    .replace(/\\N/g, '\n')
    .replace(/\\n/g, q === 2 ? '\n' : ' ');
}

export function createDialogue(dialogue, store) {
  const { video, styles, info } = store;
  const $div = document.createElement('div');
  $div.className = 'ASS-dialogue';
  const df = document.createDocumentFragment();
  const { align, slices, start, end } = dialogue;
  const animationOptions = {
    duration: (end - start) * 1000,
    delay: Math.min(0, start - (video.currentTime - store.delay)) * 1000,
    fill: 'forwards',
  };
  const animations = [];
  slices.forEach((slice) => {
    const sliceTag = styles[slice.style].tag;
    const borderStyle = styles[slice.style].style.BorderStyle;
    slice.fragments.forEach((fragment) => {
      const { text, drawing } = fragment;
      const tag = { ...sliceTag, ...fragment.tag };
      let cssText = 'display:inline-block;';
      const cssVars = [
        ['--ass-align-h', ['left', 'center', 'right'][align.h]],
        ['--ass-align-v', ['bottom', 'center', 'top'][align.v]],
      ];
      if (!drawing) {
        cssText += `font-family:"${tag.fn}",Arial;`;
        cssText += `font-size:calc(var(--ass-scale) * ${getRealFontSize(tag.fn, tag.fs)}px);`;
        cssText += `line-height:calc(var(--ass-scale) * ${tag.fs}px);`;
        cssText += `color:${color2rgba(tag.a1 + tag.c1)};`;
        const scale = /yes/i.test(info.ScaledBorderAndShadow) ? store.scale : 1;
        if (borderStyle === 1) {
          cssVars.push(...createCSSStroke(tag, scale));
        }
        if (borderStyle === 3) {
          // TODO: \bord0\shad16
          const bc = color2rgba(tag.a3 + tag.c3);
          const bx = tag.xbord * scale;
          const by = tag.ybord * scale;
          const sc = color2rgba(tag.a4 + tag.c4);
          const sx = tag.xshad * scale;
          const sy = tag.yshad * scale;
          cssText += (
            `${bx || by ? `background-color:${bc};` : ''}`
            + `border:0 solid ${bc};`
            + `border-width:${bx}px ${by}px;`
            + `margin:${-bx}px ${-by}px;`
            + `box-shadow:${sx}px ${sy}px ${sc};`
          );
        }
        cssText += tag.b ? `font-weight:${tag.b === 1 ? 'bold' : tag.b};` : '';
        cssText += tag.i ? 'font-style:italic;' : '';
        cssText += (tag.u || tag.s) ? `text-decoration:${tag.u ? 'underline' : ''} ${tag.s ? 'line-through' : ''};` : '';
        cssText += tag.fsp ? `letter-spacing:calc(var(--ass-scale) * ${tag.fsp}px);` : '';
        // TODO: q0 and q3 is same for now, at least better than nothing.
        if (tag.q === 0 || tag.q === 3) {
          cssText += 'text-wrap:balance;';
        }
        if (tag.q === 1) {
          cssText += 'word-break:break-word;white-space:normal;';
        }
        if (tag.q === 2) {
          cssText += 'word-break:normal;white-space:nowrap;';
        }
      }
      if (drawing && tag.pbo) {
        const pbo = -tag.pbo * (tag.fscy || 100) / 100;
        cssText += `vertical-align:calc(var(--ass-scale) * ${pbo}px);`;
      }

      cssVars.push(...createTransform(tag));
      const hasRotate = rotateTags.some((x) => tag[x] || tag.t?.[x]);
      const hasScale = scaleTags.some((x) => tag[x] !== 100 || tag.t?.[x] !== 100);
      const hasSkew = skewTags.some((x) => tag[x] || tag.t?.[x]);
      encodeText(text, tag.q).split('\n').forEach((content, idx) => {
        const $span = document.createElement('span');
        const $ssspan = document.createElement('span');
        if (hasScale || hasSkew) {
          if (hasScale) {
            $ssspan.dataset.scale = '';
          }
          if (hasSkew) {
            $ssspan.dataset.skew = '';
          }
          $ssspan.textContent = content;
        }
        if (hasRotate) {
          $span.dataset.rotate = '';
        }
        if (drawing) {
          $span.dataset.drawing = '';
          const obj = createDrawing(fragment, sliceTag, store);
          if (!obj) return;
          $span.style.cssText = obj.cssText;
          $span.append(obj.$svg);
        } else {
          $span.dataset.text = '';
          if (idx) {
            df.append(document.createElement('br'));
          }
          if (!content) return;
          if (hasScale || hasSkew) {
            $span.append($ssspan);
          } else {
            $span.textContent = content;
          }
          if (tag.xbord || tag.ybord || tag.xshad || tag.yshad) {
            $span.dataset.stroke = content;
          }
        }
        // TODO: maybe it can be optimized
        $span.style.cssText += cssText;
        cssVars.forEach(([k, v]) => {
          $span.style.setProperty(k, v);
        });
        if (fragment.keyframes) {
          const animation = initAnimation(
            $span,
            fragment.keyframes,
            { ...animationOptions, duration: fragment.duration },
          );
          animations.push(animation);
        }
        df.append($span);
      });
    });
  });
  if (dialogue.keyframes) {
    animations.push(initAnimation($div, dialogue.keyframes, animationOptions));
  }
  $div.append(df);
  return { $div, animations };
}
