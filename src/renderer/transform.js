export function createTransform(tag) {
  return [
    // TODO: I don't know why perspective is 314, it just performances well.
    'perspective(314px)',
    `rotateY(${tag.fry || 0}deg)`,
    `rotateX(${tag.frx || 0}deg)`,
    `rotateZ(${-tag.frz || 0}deg)`,
    `scale(${tag.p ? 1 : (tag.fscx || 100) / 100},${tag.p ? 1 : (tag.fscy || 100) / 100})`,
    `skew(${tag.fax || 0}rad,${tag.fay || 0}rad)`,
  ].join(' ');
}

export function setTransformOrigin(dialogue, scale) {
  const { align, width, height, x, y, $div } = dialogue;
  const org = {};
  if (dialogue.org) {
    org.x = dialogue.org.x * scale;
    org.y = dialogue.org.y * scale;
  } else {
    org.x = [x, x + width / 2, x + width][align.h];
    org.y = [y + height, y + height / 2, y][align.v];
  }
  for (let i = $div.childNodes.length - 1; i >= 0; i -= 1) {
    const node = $div.childNodes[i];
    if (node.dataset.hasRotate === '') {
      // It's not extremely precise for offsets are round the value to an integer.
      const tox = org.x - x - node.offsetLeft;
      const toy = org.y - y - node.offsetTop;
      node.style.cssText += `transform-origin:${tox}px ${toy}px;`;
    }
  }
}
