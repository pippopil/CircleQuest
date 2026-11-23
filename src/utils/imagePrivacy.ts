/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProcessedPrivacyImage {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  blurred: true;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Не удалось загрузить изображение для проверки приватности'));
    img.src = src;
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Не удалось преобразовать размытое фото в файл'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        quality
      );
    } catch {
      reject(new Error('Доступ к обработке изображения ограничен политикой безопасности (CORS)'));
    }
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Ошибка чтения обработанного изображения'));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка кодирования изображения'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Deterministically blurs an uploaded or selected image on an HTML5 Canvas
 * using both downscale/upscale pixel-diffusion and CSS canvas blur filter so
 * faces and personal details cannot be recovered even if a browser ignores ctx.filter.
 */
export async function blurImageWithCanvas(source: File | string): Promise<ProcessedPrivacyImage> {
  let objectUrl: string | null = null;
  try {
    let imageSrc: string;
    if (typeof source !== 'string') {
      if (!source.type.startsWith('image/')) {
        throw new Error('Пожалуйста, выберите файл изображения (JPG, PNG или WebP)');
      }
      objectUrl = URL.createObjectURL(source);
      imageSrc = objectUrl;
    } else {
      imageSrc = source;
    }

    const img = await loadImageElement(imageSrc);
    const maxDim = 720;
    const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
    const targetWidth = Math.max(120, Math.round((img.width || 480) * scale));
    const targetHeight = Math.max(90, Math.round((img.height || 320) * scale));

    // Step 1: Downsample onto tiny buffer canvas to destroy facial detail deterministically
    const tinyCanvas = document.createElement('canvas');
    tinyCanvas.width = Math.max(24, Math.round(targetWidth / 14));
    tinyCanvas.height = Math.max(18, Math.round(targetHeight / 14));
    const tinyCtx = tinyCanvas.getContext('2d');
    if (!tinyCtx) {
      throw new Error('Браузер не поддерживает 2D Canvas для защиты фото');
    }
    tinyCtx.imageSmoothingEnabled = true;
    tinyCtx.drawImage(img, 0, 0, tinyCanvas.width, tinyCanvas.height);

    // Step 2: Draw upsampled pixelated image + gaussian blur filter onto final canvas
    const outCanvas = document.createElement('canvas');
    outCanvas.width = targetWidth;
    outCanvas.height = targetHeight;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) {
      throw new Error('Не удалось инициализировать защитный фильтр Canvas');
    }

    outCtx.imageSmoothingEnabled = true;
    if ('filter' in outCtx) {
      outCtx.filter = 'blur(12px)';
    }
    outCtx.drawImage(tinyCanvas, -12, -12, targetWidth + 24, targetHeight + 24);
    outCtx.filter = 'none';

    // Subtle warm eco-privacy tint & badge watermark
    outCtx.fillStyle = 'rgba(72, 107, 82, 0.10)';
    outCtx.fillRect(0, 0, targetWidth, targetHeight);

    const blob = await canvasToJpegBlob(outCanvas, 0.82);
    const dataUrl = await blobToDataUrl(blob);

    return {
      dataUrl,
      blob,
      width: targetWidth,
      height: targetHeight,
      blurred: true,
    };
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}

/**
 * Generates local offline eco-themed SVG data URLs so demo sample proofs
 * work offline in Android WebView and pass Canvas export without CORS errors.
 */
export function createSampleEcoImage(kind: 'feeder' | 'forest' | 'battery'): string {
  const templates: Record<'feeder' | 'forest' | 'battery', string> = {
    feeder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#D7E6D5"/>
          <stop offset="100%" stop-color="#EBDCC3"/>
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#bg)"/>
      <circle cx="330" cy="48" r="24" fill="#F4C97A" opacity="0.75"/>
      <path d="M0 190 Q120 165 250 185 T400 175 L400 240 L0 240 Z" fill="#84A88B"/>
      <rect x="194" y="105" width="12" height="100" rx="4" fill="#7D5A3C"/>
      <polygon points="130,105 200,52 270,105" fill="#486B52"/>
      <rect x="148" y="105" width="104" height="52" rx="6" fill="#FAF8F3" stroke="#7D5A3C" stroke-width="5"/>
      <ellipse cx="200" cy="146" rx="34" ry="8" fill="#C9A25E"/>
      <circle cx="176" cy="130" r="10" fill="#5B8266"/>
      <circle cx="185" cy="126" r="6" fill="#324C3A"/>
      <polygon points="190,126 196,128 190,130" fill="#D98A3C"/>
    </svg>`,
    forest: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#CDE0D4"/>
          <stop offset="100%" stop-color="#F2EAD9"/>
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#sky)"/>
      <path d="M0 160 Q200 120 400 160 L400 240 L0 240 Z" fill="#A6C1A8"/>
      <path d="M165 240 Q188 185 198 155 Q206 185 245 240 Z" fill="#DFCBB0"/>
      <polygon points="85,175 115,92 145,175" fill="#486B52"/>
      <rect x="111" y="175" width="8" height="24" fill="#6D4F37"/>
      <polygon points="265,175 300,76 335,175" fill="#385741"/>
      <rect x="296" y="175" width="8" height="26" fill="#6D4F37"/>
      <circle cx="54" cy="135" r="24" fill="#5B8266"/>
      <circle cx="352" cy="142" r="22" fill="#6D9477"/>
    </svg>`,
    battery: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240">
      <rect width="400" height="240" fill="#EFE9DB"/>
      <rect x="125" y="42" width="150" height="164" rx="18" fill="#486B52"/>
      <rect x="142" y="64" width="116" height="122" rx="12" fill="#FAF8F3"/>
      <circle cx="200" cy="112" r="26" fill="#5B8266" opacity="0.22"/>
      <path d="M188 112 L200 94 L212 112 L205 112 L205 128 L195 128 L195 112 Z" fill="#486B52"/>
      <rect x="165" y="152" width="70" height="14" rx="7" fill="#C86D51" opacity="0.85"/>
    </svg>`,
  };

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(templates[kind])}`;
}
