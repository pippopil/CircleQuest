/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Check, X, AlertTriangle, EyeOff, MessageSquare, RefreshCw, Send, ShieldCheck, Sparkles } from 'lucide-react';

export const ModeratorModal: React.FC = () => {
  const {
    reports,
    activeModeratorModal,
    closeModeratorModal,
    resolveReport,
    submitAppeal,
    resolveAppeal,
    roleMode,
    setRoleMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'appeals' | 'autocheck'>('queue');
  const [appealInput, setAppealInput] = useState<{ reportId: string; text: string }>({ reportId: '', text: '' });
  
  // Auto-check sandbox
  const [testText, setTestText] = useState('Всем привет! Мы отлично провели время в парке.');
  const [autoCheckResult, setAutoCheckResult] = useState<{ safe: boolean; tags: string[] }>({
    safe: true,
    tags: ['Отсутствуют токсичные выражения', 'Личные данные не обнаружены'],
  });

  if (!activeModeratorModal) return null;

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const resolvedReports = reports.filter((r) => r.status !== 'pending');
  const appealedReports = reports.filter((r) => r.appealed);

  const handleTestAutoCheck = (text: string) => {
    setTestText(text);
    const forbidden = ['дурак', 'идиот', 'ненавижу', 'тупой', 'мат', 'телефон 89'];
    const hasForbidden = forbidden.some((w) => text.toLowerCase().includes(w));
    if (hasForbidden) {
      setAutoCheckResult({
        safe: false,
        tags: ['Обнаружены потенциально грубые выражения или контакты', 'Рекомендуется ручная модерация'],
      });
    } else {
      setAutoCheckResult({
        safe: true,
        tags: ['Текст соответствует правилам дружелюбного круга', 'Личные контакты защищены'],
      });
    }
  };

  const reasonLabels: Record<string, string> = {
    face_or_personal_data: 'Видно лицо / данные',
    bullying_or_harassment: 'Травля / буллинг',
    dangerous_act: 'Опасный трюк',
    inappropriate_content: 'Неуместный контент',
    spam: 'Спам / флуд',
  };

  return (
    <div
      onClick={closeModeratorModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F3] border border-amber-300 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] cursor-default"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 bg-amber-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-stone-900">
                  Панель модерации и безопасности CircleQuest
                </h2>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                  Admin MVP
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Защита подростков: 2-кликовые жалобы, аудит и апелляции
              </p>
            </div>
          </div>
          <button
            onClick={closeModeratorModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100/60 px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'border-[#486B52] text-[#2F4D37] font-semibold bg-white/60'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Очередь жалоб</span>
            {pendingReports.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingReports.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('appeals')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'appeals'
                ? 'border-[#486B52] text-[#2F4D37] font-semibold bg-white/60'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Апелляции ({appealedReports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('autocheck')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'autocheck'
                ? 'border-[#486B52] text-[#2F4D37] font-semibold bg-white/60'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Авто-проверка контента</span>
          </button>
        </div>

        {/* Tab 1: Queue */}
        {activeTab === 'queue' && (
          <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
            {pendingReports.length === 0 ? (
              <div className="text-center py-10 bg-white/70 rounded-2xl border border-stone-200/80">
                <ShieldCheck className="w-10 h-10 text-[#486B52] mx-auto mb-2" />
                <div className="font-bold text-stone-900 text-sm">Все чисто! Очередь пуста</div>
                <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
                  Новых жалоб на данный момент нет. Сообщество соблюдает правила доброжелательности.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="font-semibold text-stone-700">Ожидают решения ({pendingReports.length}):</div>
                {pendingReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 bg-white rounded-xl border border-red-200/90 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-semibold text-[10px]">
                          {reasonLabels[rep.reason] || rep.reason}
                        </span>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-600 font-medium">{rep.targetAuthorName}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 tabular-nums">{rep.createdAt}</span>
                    </div>

                    <div className="p-2.5 bg-stone-50 rounded-lg text-stone-700 border border-stone-100">
                      <div className="text-stone-500 text-[10px] uppercase font-semibold">Контент:</div>
                      <div className="font-medium text-stone-800 mt-0.5">{rep.targetPreview}</div>
                      {rep.details && (
                        <div className="mt-1 text-[11px] text-stone-500 italic">
                          Уточнение заявителя: &ldquo;{rep.details}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => resolveReport(rep.id, 'hide')}
                        className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-medium text-[11px] flex items-center gap-1 shadow-2xs"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Скрыть контент</span>
                      </button>
                      <button
                        onClick={() => resolveReport(rep.id, 'warn')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px] flex items-center gap-1 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Предупредить автора</span>
                      </button>
                      <button
                        onClick={() => resolveReport(rep.id, 'dismiss')}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-[11px]"
                      >
                        Отклонить жалобу
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resolved History */}
            {resolvedReports.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="font-semibold text-stone-600">Рассмотренные ранее ({resolvedReports.length}):</div>
                <div className="space-y-2">
                  {resolvedReports.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-2.5 bg-white/70 rounded-xl border border-stone-200 flex items-center justify-between text-[11px]"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium text-stone-800 truncate">
                          {rep.targetAuthorName}: {rep.targetPreview}
                        </div>
                        <div className="text-stone-500 text-[10px]">
                          Вердикт: {rep.status === 'resolved_hidden' ? '❌ Скрыто' : rep.status === 'resolved_warned' ? '⚠️ Предупреждение' : '✓ Отклонено'}
                        </div>
                      </div>
                      <span className="text-stone-400 shrink-0">{rep.createdAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Appeals */}
        {activeTab === 'appeals' && (
          <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 leading-relaxed text-[11px]">
              <strong>Механизм апелляции:</strong> Если автор отчета или участник считает, что модератор ошибся (например, на фото был не прохожий, а скульптура или семечки), он может подать пояснение.
            </div>

            {appealedReports.length === 0 ? (
              <div className="text-center py-6 text-stone-400">
                Активных апелляций нет. Вы можете сымитировать подачу апелляции ниже.
              </div>
            ) : (
              appealedReports.map((r) => (
                <div key={r.id} className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                  <div className="font-semibold text-stone-900">
                    Апелляция по объекту: {r.targetPreview}
                  </div>
                  <div className="p-2 bg-stone-50 rounded-lg text-stone-700 italic">
                    &ldquo;{r.appealText}&rdquo;
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => resolveAppeal(r.id, true)}
                      className="px-3 py-1 rounded-lg bg-[#486B52] text-white font-medium hover:bg-[#3B5944]"
                    >
                      Одобрить и восстановить
                    </button>
                    <button
                      onClick={() => resolveAppeal(r.id, false)}
                      className="px-3 py-1 rounded-lg bg-stone-200 text-stone-700 font-medium hover:bg-stone-300"
                    >
                      Оставить решение в силе
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Test appeal simulator */}
            <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
              <div className="font-semibold text-stone-800">
                Симуляция подачи апелляции пользователем:
              </div>
              <textarea
                value={appealInput.text}
                onChange={(e) => setAppealInput({ reportId: resolvedReports[0]?.id || 'demo', text: e.target.value })}
                placeholder="«Добрый день! На моем фото в парке был картонный силуэт, лиц людей нет, прошу восстановить отчет.»"
                rows={2}
                className="w-full p-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#486B52]/30"
              />
              <button
                onClick={() => {
                  if (appealInput.text.trim()) {
                    submitAppeal(resolvedReports[0]?.id || reports[0]?.id, appealInput.text);
                    setAppealInput({ reportId: '', text: '' });
                  }
                }}
                disabled={!appealInput.text.trim()}
                className="px-3 py-1.5 rounded-lg bg-[#486B52] text-white font-medium text-xs disabled:opacity-50"
              >
                Отправить апелляцию в очередь
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Auto-check Sandbox */}
        {activeTab === 'autocheck' && (
          <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
            <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
              <div className="font-semibold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#486B52]" />
                <span>Автоматический фильтр контента (Текст и Приватность)</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Каждый комментарий и фотоотчет перед публикацией в Круге проверяется алгоритмами безопасности на грубость, контактные телефоны и наличие лиц.
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-stone-700 block">
                Протестируйте текст комментария:
              </label>
              <textarea
                value={testText}
                onChange={(e) => handleTestAutoCheck(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#486B52]/30 bg-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleTestAutoCheck('Классная утренняя разминка! Всем отличного дня 🌱')}
                  className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-[11px] hover:bg-stone-200"
                >
                  Пример: Дружелюбный
                </button>
                <button
                  type="button"
                  onClick={() => handleTestAutoCheck('Ты тупой идиот, звони мне на телефон 89160000000')}
                  className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-[11px] hover:bg-red-100"
                >
                  Пример: Нарушение
                </button>
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${
              autoCheckResult.safe ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <div className="font-semibold flex items-center gap-1.5">
                {autoCheckResult.safe ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                <span>{autoCheckResult.safe ? 'Контент безопасен для публикации' : 'Контент отклонен авто-фильтром'}</span>
              </div>
              <ul className="mt-1 list-disc list-inside text-[11px] opacity-90 pl-1">
                {autoCheckResult.tags.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <button
            onClick={() => {
              setRoleMode('user');
              closeModeratorModal();
            }}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            ← Вернуться в режим участника
          </button>
          <button
            onClick={closeModeratorModal}
            className="px-4 py-1.5 rounded-xl bg-stone-800 text-white font-medium text-xs hover:bg-stone-900"
          >
            Закрыть панель
          </button>
        </div>
      </div>
    </div>
  );
};
