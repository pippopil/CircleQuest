/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, X, EyeOff, UserCheck, Trash2, Heart, Lock } from 'lucide-react';

export const PrivacyPolicyModal: React.FC = () => {
  const { activePrivacyPolicyModal, closePrivacyPolicyModal } = useApp();

  if (!activePrivacyPolicyModal) return null;

  return (
    <div
      onClick={closePrivacyPolicyModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F3] border border-[#5B8266]/20 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 bg-[#5B8266]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5B8266] text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Понятная приватность для подростков</h2>
              <p className="text-[11px] text-stone-500">Без юридической скуки: что мы бережем и почему</p>
            </div>
          </div>
          <button
            onClick={closePrivacyPolicyModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-stone-700 flex-1 leading-relaxed">
          {/* Section 1 */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold">
              <EyeOff className="w-4 h-4 text-[#C86D51]" />
              <span>Главное правило: Никаких публичных лент</span>
            </div>
            <p className="text-stone-600">
              В CircleQuest нет открытого интернета, рекомендаций и чужих глаз. Твои квесты, отчеты и Искры видят ТОЛЬКО те друзья, которых ты сам позвал в свой Круг (до 10 человек). Тебя невозможно «загуглить» или найти через глобальный поиск.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold">
              <UserCheck className="w-4 h-4 text-[#486B52]" />
              <span>Что мы сохраняем (и только для работы)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
              <li><strong>Твой никнейм и аватар-эмодзи:</strong> чтобы друзья в Круге узнавали тебя.</li>
              <li><strong>Интересы:</strong> чтобы подсказывать крутые офлайн-квесты.</li>
              <li><strong>Отметки о квестах:</strong> чтобы рассчитывать общий командный прогресс круга.</li>
              <li><strong>Искры поддержки:</strong> теплые стикеры, которыми вы обмениваетесь.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-[#24422B] font-bold">
              <Lock className="w-4 h-4 text-[#486B52]" />
              <span>Чего мы НИКОГДА не делаем</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#2F4D37]">
              <div className="p-2 bg-white/70 rounded-lg">🚫 Не продаем данные рекламодателям</div>
              <div className="p-2 bg-white/70 rounded-lg">🚫 Не ведем скрытую геолокацию</div>
              <div className="p-2 bg-white/70 rounded-lg">🚫 Не используем ловушки внимания (FOMO)</div>
              <div className="p-2 bg-white/70 rounded-lg">🚫 Не требуем фото твоего лица</div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold">
              <Trash2 className="w-4 h-4 text-stone-500" />
              <span>Твой полный контроль</span>
            </div>
            <p className="text-stone-600">
              Ты в любой момент можешь выйти из Круга, завершить сессии на чужих устройствах или нажать «Сбросить данные». Все твои фотоотчеты удаляются безвозвратно.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-200/80 bg-stone-50/60 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">Редакция 2026 года · Сертифицировано для детей</span>
          <button
            onClick={closePrivacyPolicyModal}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#486B52] hover:bg-[#3B5944] rounded-xl shadow-xs transition-colors"
          >
            Понятно, спасибо!
          </button>
        </div>
      </div>
    </div>
  );
};
