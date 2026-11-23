/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface AvatarPalette {
  bgStart: string;
  bgEnd: string;
  accents: string[];
  highlight: string;
}

function fnv1aHash(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function createPrng(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function selectPaletteFromInterests(interests: string[], seedRand: () => number): AvatarPalette {
  const joined = interests.join(' ').toLowerCase();

  if (joined.includes('эколог') || joined.includes('природ')) {
    return {
      bgStart: '#35543E',
      bgEnd: '#5B8266',
      accents: ['#A8CBB1', '#FAF8F3', '#E8C57B', '#7EA487'],
      highlight: '#F4D35E',
    };
  }
  if (joined.includes('стритбол') || joined.includes('воркаут') || joined.includes('велосип')) {
    return {
      bgStart: '#9B4D36',
      bgEnd: '#C86D51',
      accents: ['#F2DFC4', '#486B52', '#F4C97A', '#E89B7B'],
      highlight: '#FAF8F3',
    };
  }
  if (joined.includes('книг') || joined.includes('настольн')) {
    return {
      bgStart: '#32586A',
      bgEnd: '#4A7C92',
      accents: ['#EBDCC3', '#9BC4A5', '#D68A6B', '#9CC2D1'],
      highlight: '#FAF8F3',
    };
  }
  if (joined.includes('животн') || joined.includes('арт') || joined.includes('скетч')) {
    return {
      bgStart: '#5E4B3B',
      bgEnd: '#8B7056',
      accents: ['#9BC4A5', '#F4D35E', '#E39D7D', '#FAF8F3'],
      highlight: '#C8E2CE',
    };
  }

  const presets: AvatarPalette[] = [
    {
      bgStart: '#35543E',
      bgEnd: '#5B8266',
      accents: ['#C8E2CE', '#F4D35E', '#C86D51', '#FAF8F3'],
      highlight: '#FAF8F3',
    },
    {
      bgStart: '#3D5F6F',
      bgEnd: '#5B8266',
      accents: ['#EBDCC3', '#9CC2D1', '#F4C97A', '#FAF8F3'],
      highlight: '#F4D35E',
    },
  ];
  return presets[Math.floor(seedRand() * presets.length)] || presets[0];
}

/**
 * Generates a unique 256x256 abstract eco-art PNG Data URL on HTML5 Canvas,
 * deterministically seeded by the user's nickname, handle, interests, and variant.
 */
export function generateAbstractAvatarDataUrl(
  name: string,
  handle: string,
  interests: string[],
  variant: number = 0
): string {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Браузер не поддерживает 2D Canvas для генерации аватара');
  }

  const seedInput = `${name.trim()}|${handle.trim()}|${interests.slice().sort().join(',')}|v${variant}`;
  const rand = createPrng(fnv1aHash(seedInput));
  const palette = selectPaletteFromInterests(interests, rand);

  // 1. Rich angled gradient backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, size, size);
  bgGrad.addColorStop(0, palette.bgStart);
  bgGrad.addColorStop(1, palette.bgEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Soft organic aura glows
  for (let i = 0; i < 3; i += 1) {
    const cx = size * (0.2 + rand() * 0.6);
    const cy = size * (0.2 + rand() * 0.6);
    const radius = size * (0.35 + rand() * 0.35);
    const color = palette.accents[i % palette.accents.length];
    const radial = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
    radial.addColorStop(0, `${color}55`);
    radial.addColorStop(1, `${color}00`);
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Abstract layered botanical / geometric shapes driven by interests count & seed
  const shapeCount = 4 + (interests.length % 4);
  for (let i = 0; i < shapeCount; i += 1) {
    ctx.save();
    ctx.translate(size / 2 + (rand() - 0.5) * 70, size / 2 + (rand() - 0.5) * 70);
    ctx.rotate(rand() * Math.PI * 2);
    ctx.globalAlpha = 0.28 + rand() * 0.42;
    ctx.fillStyle = palette.accents[Math.floor(rand() * palette.accents.length)];

    const mode = Math.floor(rand() * 3);
    if (mode === 0) {
      // Smooth botanical leaf petal
      const w = 36 + rand() * 54;
      const h = 58 + rand() * 64;
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.bezierCurveTo(w, -h / 4, w, h / 4, 0, h / 2);
      ctx.bezierCurveTo(-w, h / 4, -w, -h / 4, 0, -h / 2);
      ctx.fill();
    } else if (mode === 1) {
      // Rounded geometric pill / facet
      const rw = 42 + rand() * 68;
      const rh = 24 + rand() * 36;
      const r = Math.min(rw, rh) / 2;
      ctx.beginPath();
      ctx.roundRect(-rw / 2, -rh / 2, rw, rh, r);
      ctx.fill();
    } else {
      // Concentric ring arc
      ctx.strokeStyle = palette.accents[Math.floor(rand() * palette.accents.length)];
      ctx.lineWidth = 6 + rand() * 10;
      ctx.lineCap = 'round';
      const arcR = 32 + rand() * 68;
      const startAngle = rand() * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(0, 0, arcR, startAngle, startAngle + Math.PI * (0.7 + rand() * 0.9));
      ctx.stroke();
    }
    ctx.restore();
  }

  // 4. Signature CircleQuest central orbit & constellation spark nodes
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.strokeStyle = `${palette.highlight}99`;
  ctx.lineWidth = 4;
  const orbitR = 52 + rand() * 24;
  ctx.beginPath();
  ctx.arc(0, 0, orbitR, 0, Math.PI * 2);
  ctx.stroke();

  const nodeCount = 3 + Math.floor(rand() * 4);
  const baseAngle = rand() * Math.PI * 2;
  for (let n = 0; n < nodeCount; n += 1) {
    const angle = baseAngle + (n * Math.PI * 2) / nodeCount;
    const nx = Math.cos(angle) * orbitR;
    const ny = Math.sin(angle) * orbitR;
    ctx.fillStyle = n === 0 ? palette.highlight : palette.accents[n % palette.accents.length];
    ctx.beginPath();
    ctx.arc(nx, ny, n === 0 ? 9 : 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Center core badge
  ctx.fillStyle = `${palette.highlight}E6`;
  ctx.beginPath();
  ctx.arc(0, 0, 14 + rand() * 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  return canvas.toDataURL('image/png');
}
