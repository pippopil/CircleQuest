/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, X, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export const AndroidInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // If already installed or dismissed by user
  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (!res) setShowGuide(true);
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-[#486B52] to-[#34513E] text-white rounded-2xl p-3 shadow-md mb-3 transition-all relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Android Beta
                </span>
                <span className="text-[10px] text-white/80 tabular-nums">
                  v1.0.0-beta.1 (#101)
                </span>
              </div>
              <p className="text-xs font-semibold text-white mt-0.5 truncate">
                Тестирование на телефоне Android
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-white text-[#2B4734] hover:bg-[#FAF8F3] rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Установить</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"
              title="Скрыть"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Android Installation Instructions Modal */}
      {showGuide && (
        <div
          onClick={() => setShowGuide(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F3] border border-[#5B8266]/30 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 cursor-default text-stone-800"
          >
            <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#486B52] text-white flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Установка на телефон Android
                  </h3>
                  <span className="text-[11px] text-[#486B52] font-semibold">
                    Сборка #101 · v1.0.0-beta.1
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-stone-700 leading-relaxed">
              <p className="font-semibold text-stone-900">
                Как запустить CircleQuest как полноценное приложение на Android:
              </p>
              
              <div className="p-3 bg-white rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#486B52] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Откройте ссылку приложения в браузере <strong>Google Chrome</strong> или <strong>Яндекс</strong> на вашем Android-устройстве.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#486B52] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Нажмите меню браузера <strong>три точки (⋮)</strong> в верхнем правом углу.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#486B52] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Выберите пункт <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[#25422C] text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#486B52] shrink-0" />
                <span>
                  Иконка 🌿 появится на рабочем столе смартфона и приложение будет открываться на весь экран без адресной строки!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#486B52] hover:bg-[#3B5944] text-white text-xs font-bold transition-colors"
            >
              Понятно, протестировать
            </button>
          </div>
        </div>
      )}
    </>
  );
};
