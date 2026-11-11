/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, HeartHandshake, X, Lock, CheckCircle2 } from 'lucide-react';

export const ParentConsentModal: React.FC = () => {
  const { user, activeParentConsentModal, closeParentConsentModal, submitParentConsent } = useApp();
  const [parentEmail, setParentEmail] = useState(user.parentEmail || '');
  const [agreedTerms, setAgreedTerms] = useState(false);

  if (!activeParentConsentModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentEmail || !parentEmail.includes('@')) return;
    submitParentConsent(parentEmail);
  };

  return (
    <div
      onClick={closeParentConsentModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F3] border border-[#5B8266]/20 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200/70 bg-[#5B8266]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5B8266] text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Защита и согласие родителей</h2>
              <p className="text-[11px] text-stone-500">Стандарты безопасности для участников до 14 лет</p>
            </div>
          </div>
          <button
            onClick={closeParentConsentModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-stone-700 space-y-2">
            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#486B52]" />
              <span>Почему это необходимо?</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              По закону о защите персональных данных детей и подростков (COPPA / GDPR / законодательство РФ), для участия в онлайн-сервисах требуется подтверждение от родителей или опекунов.
            </p>
            <div className="pt-1 border-t border-stone-100 space-y-1 text-stone-600">
              <div className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#486B52] shrink-0" />
                <span>CircleQuest не содержит открытых профилей и лент</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#486B52] shrink-0" />
                <span>Никакой рекламы, рекомендательных алгоритмов и продажи данных</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#486B52] shrink-0" />
                <span>Круг виден только подтвержденным друзьям</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-stone-800 block">
              Email родителя или законного представителя:
            </label>
            <input
              type="email"
              required
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="parent@example.com"
              className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B8266]/30"
            />
            <p className="text-[10px] text-stone-500">
              На этот адрес направляется копия условий приватности и ссылка для родительского контроля.
            </p>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded text-[#486B52] focus:ring-[#486B52]"
            />
            <span className="text-[11px] text-stone-600 leading-normal">
              Родитель ознакомился с правилами CircleQuest и подтверждает создание закрытого аккаунта для безопасных квестов.
            </span>
          </label>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeParentConsentModal}
              className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              Позже
            </button>
            <button
              type="submit"
              disabled={!agreedTerms || !parentEmail}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#486B52] hover:bg-[#3B5944] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Подтвердить согласие</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
