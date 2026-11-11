/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SafetyReport } from '../types';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

export const ReportModal: React.FC = () => {
  const { activeReportTarget, closeReportModal, submitReport } = useApp();
  const [selectedReason, setSelectedReason] = useState<SafetyReport['reason']>('face_or_personal_data');
  const [details, setDetails] = useState('');

  if (!activeReportTarget) return null;

  const reasons: { id: SafetyReport['reason']; title: string; desc: string }[] = [
    {
      id: 'face_or_personal_data',
      title: 'Видно лицо или личные данные',
      desc: 'В CircleQuest запрещено публиковать лица людей без согласия ради приватности.',
    },
    {
      id: 'bullying_or_harassment',
      title: 'Грубость, травля или буллинг',
      desc: 'Оскорбления, насмешки над друзьями или токсичное общение.',
    },
    {
      id: 'dangerous_act',
      title: 'Опасный трюк или вред здоровью',
      desc: 'Действия, которые могут нанести вред участникам или природе.',
    },
    {
      id: 'inappropriate_content',
      title: 'Неуместный или пугающий контент',
      desc: 'Материалы, не подходящие для подросткового круга.',
    },
    {
      id: 'spam',
      title: 'Спам или флуд',
      desc: 'Реклама, повторяющиеся бессмысленные сообщения.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(selectedReason, details);
  };

  return (
    <div
      onClick={closeReportModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F3] border border-stone-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 bg-red-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Пожаловаться модераторам</h2>
              <p className="text-[11px] text-stone-500">2 клика — и мы бережно проверим контент</p>
            </div>
          </div>
          <button
            onClick={closeReportModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Target Info */}
        <div className="px-4 py-2.5 bg-stone-100/70 border-b border-stone-200/60 text-xs text-stone-600">
          <span className="text-stone-400">Объект жалобы:</span>{' '}
          <strong className="text-stone-800">{activeReportTarget.name}</strong> ·{' '}
          <span className="italic truncate">{activeReportTarget.preview}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">
              Выберите причину обращения:
            </label>
            {reasons.map((r) => {
              const isSelected = selectedReason === r.id;
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-start gap-3 ${
                    isSelected
                      ? 'bg-white border-[#5B8266] shadow-xs text-stone-900 ring-1 ring-[#5B8266]'
                      : 'bg-white/60 border-stone-200/70 text-stone-700 hover:bg-white hover:border-stone-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-[#5B8266] bg-[#5B8266] text-white'
                        : 'border-stone-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900">{r.title}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5 leading-normal">{r.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Уточнение (опционально):
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Что именно вас побеспокоило? Модераторы разберутся конфиденциально."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#5B8266]/30 placeholder:text-stone-400"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeReportModal}
              className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-xl shadow-xs transition-colors"
            >
              Отправить жалобу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
