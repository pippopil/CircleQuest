/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Quest, QuestType } from '../types';
import { AndroidInstallBanner } from './AndroidInstallBanner';
import {
  Sun,
  HeartHandshake,
  Moon,
  TreePine,
  CheckCircle2,
  Users,
  Camera,
  Flag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldAlert,
  Info,
  Clock,
  Check,
} from 'lucide-react';

export const QuestsView: React.FC = () => {
  const {
    quests,
    members,
    circleName,
    completeQuest,
    openDetoxModal,
    openSparkModal,
    openReportModal,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | QuestType>('all');
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>('quest_kindness_birds');
  const [proofModalQuest, setProofModalQuest] = useState<Quest | null>(null);
  const [proofComment, setProofComment] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [applyBlur, setApplyBlur] = useState(false);
  const [faceWarningDismissed, setFaceWarningDismissed] = useState(false);

  // Filter quests
  const filteredQuests = quests.filter((q) => {
    if (activeFilter === 'all') return true;
    return q.type === activeFilter;
  });

  // Calculate team progress
  const totalTarget = quests.reduce((acc, q) => acc + q.targetCount, 0);
  const totalCompleted = quests.reduce((acc, q) => acc + q.completedCount, 0);
  const progressPercent = Math.round((totalCompleted / Math.max(1, totalTarget)) * 100);

  const getQuestIcon = (type: QuestType) => {
    switch (type) {
      case 'sync':
        return <Sun className="w-5 h-5 text-amber-700" />;
      case 'kindness':
        return <HeartHandshake className="w-5 h-5 text-[#486B52]" />;
      case 'detox':
        return <Moon className="w-5 h-5 text-[#4A7C92]" />;
      default:
        return <TreePine className="w-5 h-5 text-[#486B52]" />;
    }
  };

  const sampleProofPhotos = [
    {
      title: 'Кормушка с семечками',
      url: 'https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Лесная тропа в сквере',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Эко-бокс с батарейками',
      url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleOpenProofModal = (quest: Quest) => {
    setProofModalQuest(quest);
    setProofComment('');
    setProofImageUrl(sampleProofPhotos[0].url);
    setApplyBlur(false);
    setFaceWarningDismissed(false);
  };

  const handleCloseProofModal = () => {
    setProofModalQuest(null);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofModalQuest) return;
    completeQuest(
      proofModalQuest.id,
      proofComment.trim() || 'Квест выполнен в копилку нашего круга! 🌿',
      proofModalQuest.requiresPhoto ? proofImageUrl : undefined,
      applyBlur
    );
    handleCloseProofModal();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Android Beta Mobile Install Prompt */}
      <AndroidInstallBanner />

      {/* Team Progress Card (Anti-competition, team focus) */}
      <div className="bg-[#FAF8F3] border border-[#5B8266]/20 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
              <span>Недельный ритм</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#486B52] font-bold">Командный успех</span>
            </div>
            <h2 className="text-base font-bold text-stone-900 mt-0.5">
              {circleName} делает добрые дела
            </h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-[#324C3A] tabular-nums">
              {progressPercent}%
            </span>
            <div className="text-[10px] text-stone-500">общий прогресс</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E5DFD3] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#486B52] h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-600">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#486B52]" />
            <span>Вклад всего круга: {totalCompleted} из {totalTarget} отметок</span>
          </span>
          <span className="text-stone-400">Без личных рейтингов</span>
        </div>
      </div>

      {/* Segmented Filter Buttons */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/60 rounded-xl">
        {[
          { id: 'all' as const, label: 'Все задания' },
          { id: 'sync' as const, label: 'Синхрон' },
          { id: 'kindness' as const, label: 'Твори добро' },
          { id: 'detox' as const, label: 'Детокс' },
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center whitespace-nowrap ${
                isActive
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Quests List */}
      <div className="space-y-3">
        {filteredQuests.map((quest) => {
          const isExpanded = expandedQuestId === quest.id;
          const isDone = quest.isCompletedByMe;

          return (
            <div
              key={quest.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-2xs transition-all ${
                isDone ? 'border-[#5B8266]/30 bg-emerald-50/15' : 'border-stone-200/90'
              }`}
            >
              {/* Card Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#5B8266]/10 flex items-center justify-center shrink-0 border border-[#5B8266]/15">
                      {getQuestIcon(quest.type)}
                    </div>
                    <div className="min-w-0">
                      {/* Quiet Unboxed Metadata */}
                      <div className="text-[11px] text-stone-500 flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-[#486B52]">{quest.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{quest.duration || 'Неделя'}</span>
                        {quest.requiresPhoto && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-800 font-medium">Фото без лиц</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 mt-0.5 leading-snug">
                        {quest.title}
                      </h3>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {quest.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar per quest */}
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-20 bg-stone-100 rounded-full h-2 overflow-hidden shrink-0">
                      <div
                        className="bg-[#486B52] h-full rounded-full"
                        style={{
                          width: `${Math.round((quest.completedCount / quest.targetCount) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-stone-600 font-medium tabular-nums shrink-0">
                      {quest.completedCount}/{quest.targetCount} в круге
                    </span>
                  </div>

                  {/* Complete Button */}
                  <div className="shrink-0">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#324C3A] bg-[#5B8266]/15 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#486B52]" />
                        <span>Выполнено</span>
                      </span>
                    ) : quest.type === 'detox' ? (
                      <button
                        onClick={openDetoxModal}
                        className="px-3.5 py-1.5 bg-[#4A7C92] hover:bg-[#3B6577] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-transform active:scale-98"
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span>Включить таймер</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenProofModal(quest)}
                        className="px-3.5 py-1.5 bg-[#486B52] hover:bg-[#3B5944] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-transform active:scale-98"
                      >
                        {quest.requiresPhoto ? <Camera className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        <span>{quest.requiresPhoto ? 'Сдать отчет' : 'Отметить'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Proofs toggle */}
                {quest.proofs.length > 0 && (
                  <button
                    onClick={() => setExpandedQuestId(isExpanded ? null : quest.id)}
                    className="mt-2.5 w-full pt-2 border-t border-stone-100 text-[11px] text-stone-500 hover:text-stone-800 flex items-center justify-between font-medium"
                  >
                    <span>
                      Отчеты друзей ({quest.proofs.length})
                    </span>
                    <span className="flex items-center gap-0.5">
                      {isExpanded ? 'Скрыть' : 'Показать'}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                )}
              </div>

              {/* Expanded Proofs List */}
              {isExpanded && quest.proofs.length > 0 && (
                <div className="bg-[#FAF8F3] border-t border-stone-200/70 p-3 space-y-2.5">
                  {quest.proofs.map((proof) => (
                    <div
                      key={proof.id}
                      className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{proof.userAvatar}</span>
                          <span className="text-xs font-semibold text-stone-900">{proof.userName}</span>
                          <span className="text-[10px] text-stone-400 tabular-nums">· {proof.timestamp}</span>
                        </div>
                        {/* 2-Click Report Button */}
                        <button
                          onClick={() =>
                            openReportModal({
                              type: 'proof',
                              id: proof.id,
                              name: proof.userName,
                              preview: proof.comment || 'Фотоотчет квеста',
                            })
                          }
                          className="text-stone-400 hover:text-red-700 p-1 rounded-md hover:bg-stone-100 transition-colors"
                          title="Пожаловаться модератору (2 клика)"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {proof.comment && (
                        <p className="text-xs text-stone-700 leading-relaxed pl-1">
                          {proof.comment}
                        </p>
                      )}

                      {/* Photo proof with face safety check reminder */}
                      {proof.imageUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-stone-200/80 max-h-48 bg-stone-100">
                          <img
                            src={proof.imageUrl}
                            alt="Отчет квеста"
                            referrerPolicy="no-referrer"
                            className={`w-full h-44 object-cover ${proof.blurred ? 'blur-xs scale-105' : ''}`}
                          />
                          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span>Приватность подтверждена</span>
                          </div>
                        </div>
                      )}

                      {/* Quick Spark button to cheer friend */}
                      <div className="pt-1 flex items-center justify-end">
                        <button
                          onClick={() => {
                            const friend = members.find((m) => m.id === proof.userId);
                            if (friend) openSparkModal(friend);
                          }}
                          className="text-[11px] font-medium text-[#C86D51] hover:text-[#B35E44] flex items-center gap-1 p-1 hover:bg-[#C86D51]/10 rounded-lg transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Поддержать Искрой</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Proof Submission Modal */}
      {proofModalQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F3] border border-[#5B8266]/20 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-stone-200/80 bg-[#5B8266]/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Отчет: {proofModalQuest.title}
                </h3>
                <p className="text-[11px] text-stone-500">
                  {proofModalQuest.requiresPhoto
                    ? 'Требуется фото без лиц для защиты приватности'
                    : 'Текстовый комментарий для круга'}
                </p>
              </div>
              <button
                onClick={handleCloseProofModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
              {/* Teen Privacy Face Check Reminder */}
              {proofModalQuest.requiresPhoto && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>Правило безопасного фотоотчета:</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-normal">
                    Не фотографируйте лица людей, документы или номерные знаки. Показывайте только результат доброго дела (кормушку, птиц, мешок вторсырья, посаженное дерево).
                  </p>
                </div>
              )}

              {/* Photo Selector */}
              {proofModalQuest.requiresPhoto && (
                <div className="space-y-2">
                  <label className="font-semibold text-stone-700 block">
                    Выберите сделанное фото для отчета:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {sampleProofPhotos.map((photo, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setProofImageUrl(photo.url)}
                        className={`relative rounded-xl overflow-hidden border-2 aspect-video group ${
                          proofImageUrl === photo.url
                            ? 'border-[#486B52] ring-2 ring-[#486B52]/30'
                            : 'border-stone-200 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded truncate">
                          {photo.title}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Blur privacy toggle */}
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-stone-200 text-stone-700">
                    <input
                      type="checkbox"
                      checked={applyBlur}
                      onChange={(e) => setApplyBlur(e.target.checked)}
                      className="rounded text-[#486B52] focus:ring-[#486B52]"
                    />
                    <span className="text-[11px]">
                      Применить легкое размытие заднего плана ради приватности
                    </span>
                  </label>
                </div>
              )}

              {/* Comment Input */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Как все прошло? (комментарий для друзей)
                </label>
                <textarea
                  value={proofComment}
                  onChange={(e) => setProofComment(e.target.value)}
                  placeholder="Расскажи в пару предложений: где делал, что получилось?"
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B8266]/30 placeholder:text-stone-400"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseProofModal}
                  className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#486B52] hover:bg-[#3B5944] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Отправить отчет в Круг</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
