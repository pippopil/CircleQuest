/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GenerateQuestRequestBody {
  circleName?: unknown;
  interests?: unknown;
}

interface GeneratedQuestResult {
  title: string;
  description: string;
  category: string;
  duration: string;
  requiresPhoto: boolean;
  tips: string;
}

const PORT = Number(process.env.PORT) || 3000;

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/generate-quest', async (req: Request, res: Response) => {
    const body = (req.body || {}) as GenerateQuestRequestBody;
    const circleName =
      typeof body.circleName === 'string' && body.circleName.trim().length > 0
        ? body.circleName.trim().slice(0, 80)
        : 'Зелёный Патруль';

    const interests = Array.isArray(body.interests)
      ? body.interests
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map((item) => item.trim().slice(0, 40))
          .slice(0, 8)
      : ['Экология', 'Прогулки'];

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error:
          'Генератор квестов недоступен: на сервере не задан ключ GEMINI_API_KEY.',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = [
        `Придумай один новый безопасный офлайн-квест на русском языке для закрытого подросткового круга друзей "${circleName}" (возраст 12–17 лет).`,
        `Интересы участников: ${interests.join(', ')}.`,
        'Требования безопасности:',
        '1) Только доброе дело, экология, прогулка в парке/дворе, творчество или цифровой детокс в реальном мире.',
        '2) Никаких соревнований, рейтингов, денег, покупок, опасных трюков или контактов с незнакомцами.',
        '3) Если квест предполагает фото (requiresPhoto: true), фото должно показывать предмет или природу (кормушку, дерево, рисунок, книгу), но НИКОГДА лица людей.',
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Ты — бережный наставник молодежного офлайн-сообщества CircleQuest. Отвечай строго в заданной JSON-схеме на русском языке.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Короткое вдохновляющее название квеста (до 60 символов)',
              },
              description: {
                type: Type.STRING,
                description: 'Понятное описание задания на 1-2 предложения без нравоучений',
              },
              category: {
                type: Type.STRING,
                description: 'Короткая категория, например: Экология, Доброе дело, Цифровой детокс, Прогулка',
              },
              duration: {
                type: Type.STRING,
                description: 'Длительность, например: 25 минут или До воскресенья',
              },
              requiresPhoto: {
                type: Type.BOOLEAN,
                description: 'Нужно ли безопасное фото результата без лиц',
              },
              tips: {
                type: Type.STRING,
                description: 'Практический совет по безопасности и приватности для подростка',
              },
            },
            required: ['title', 'description', 'category', 'duration', 'requiresPhoto', 'tips'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({
          error: 'Модель не вернула содержимое квеста. Попробуйте повторить запрос.',
        });
        return;
      }

      const parsed = JSON.parse(rawText) as Partial<GeneratedQuestResult>;
      if (
        typeof parsed.title !== 'string' ||
        typeof parsed.description !== 'string' ||
        typeof parsed.category !== 'string'
      ) {
        res.status(502).json({
          error: 'Получен некорректный формат квеста от сервера генерации.',
        });
        return;
      }

      const payload: GeneratedQuestResult = {
        title: parsed.title.trim(),
        description: parsed.description.trim(),
        category: parsed.category.trim(),
        duration: typeof parsed.duration === 'string' && parsed.duration.trim() ? parsed.duration.trim() : 'Неделя',
        requiresPhoto: Boolean(parsed.requiresPhoto),
        tips:
          typeof parsed.tips === 'string' && parsed.tips.trim()
            ? parsed.tips.trim()
            : 'Соблюдай безопасность и не снимай лица людей на фото.',
      };

      res.json(payload);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[api/generate-quest] error:', message);
      res.status(502).json({
        error: 'Не удалось связаться с сервисом генерации квестов. Проверьте подключение и ключ API.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });

    // HMR is disabled in this environment; serve a clean no-WebSocket @vite/client
    // module implementing style and hot-context exports without opening port 24678.
    app.get('/@vite/client', (_req: Request, res: Response) => {
      res.type('application/javascript').send(`
const sheetsMap = new Map();

export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
    sheetsMap.set(id, style);
  } else {
    style.textContent = content;
  }
}

export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
    sheetsMap.delete(id);
  }
}

export function createHotContext() {
  const noop = () => {};
  return {
    data: {},
    accept: noop,
    acceptExports: noop,
    dispose: noop,
    prune: noop,
    invalidate: noop,
    on: noop,
    off: noop,
    send: noop,
  };
}

export function injectQuery(url) {
  return url;
}

export class ErrorOverlay extends HTMLElement {}
`);
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CircleQuest server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err: unknown) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
