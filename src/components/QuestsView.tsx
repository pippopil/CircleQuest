/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { GeneratedQuestPayload, Quest, QuestType } from '../types';
import { AndroidInstallBanner } from './AndroidInstallBanner';
import {
  blurImageWithCanvas,
  createSampleEcoImage,
  ProcessedPrivacyImage,
} from '../utils/imagePrivacy';
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
  Check,
  Upload,
  Loader2,
  PauseCircle,
  AlertCircle,
  WifiOff,
  HardDriveDownload,
} from 'lucide-react';

const SAMPLE_PROOF_PHOTOS = [
  {
    title: 'Кормушка с семечками',
    url: createSampleEcoImage('feeder'),
  },
  {
    title: 'Лесная тропа в сквере',
    url: createSampleEcoImage('forest'),
  },
  {
    title: 'Эко-бокс с батарейками',
    url: createSampleEcoImage('battery'),
  },
];

export const QuestsView: React.FC = () => {
  const {
    user,
    quests,
    members,
    circleName,
    parentSettings,
    completeQuest,
    addGeneratedQuest,
    openDetoxModal,
    openSparkModal,
    openReportModal,
    showToast,
    isOnline,
    lastCachedAt,
    pendingSyncCount,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | QuestType>('all');
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>('quest_kindness_birds');
  const [proofModalQuest, setProofModalQuest] = useState<Quest | null>(null);
  const [proofComment, setProofComment] = useState('');
  const [selectedSourceLabel, setSelectedSourceLabel] = useState<string>('');
  const [processedPhoto, setProcessedPhoto] = useState<ProcessedPrivacyImage | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Quest Generator state
  const [isGeneratingQuest, setIsGeneratingQuest] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Filter quests
  const filteredQuests = quests.filter((q) => {
    if (activeFilter === 'all') return true;
    return q.type === activeFilter;
  });

  // Calculate team progress
  const totalTarget = quests.reduce((acc, q) => acc + q.targetCount, 0);
  const totalCompleted = quests.reduce((acc, q) => acc + q.completedCount, 0);
  const progressPercent = Math.round((totalCompleted / Math.max(1, totalTarget)) * 100);

  const getQuestIcon = (type: QuestType, createdByAi?: boolean) => {
    if (createdByAi) {
      return <Sparkles className="w-5 h-5 text-[#486B52]" />;
    }
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

  const processPhotoForPrivacy = async (source: File | string, label: string) => {
    setIsProcessingPhoto(true);
    setPhotoError(null);
    setSelectedSourceLabel(label);
    try {
      const processed = await blurImageWithCanvas(source);
      setProcessedPhoto(processed);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Не удалось применить защитное размытие к фото';
      setProcessedPhoto(null);
      setPhotoError(msg);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleOpenProofModal = (quest: Quest) => {
    if (parentSettings.paused) {
      showToast('Аккаунт временно поставлен на паузу в родительском контроле');
      return;
    }
    setProofModalQuest(quest);
    setProofComment('');
    setProcessedPhoto(null);
    setPhotoError(null);
    setSelectedSourceLabel('');
    if (quest.requiresPhoto) {
      void processPhotoForPrivacy(SAMPLE_PROOF_PHOTOS[0].url, SAMPLE_PROOF_PHOTOS[0].title);
    }
  };

  const handleCloseProofModal = () => {
    setProofModalQuest(null);
    setProcessedPhoto(null);
    setPhotoError(null);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void processPhotoForPrivacy(file, file.name);
    e.target.value = '';
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofModalQuest) return;
    if (parentSettings.paused) {
      showToast('Аккаунт на паузе — отправка отчетов ограничена');
      return;
    }
    if (proofModalQuest.requiresPhoto && !processedPhoto) {
      setPhotoError('Для фотоотчета обязательно дождитесь защитного размытия изображения.');
      return;
    }

    completeQuest(
      proofModalQuest.id,
      proofComment.trim() || 'Квест выполнен в копилку нашего круга! 🌿',
      proofModalQuest.requiresPhoto ? processedPhoto?.dataUrl : undefined,
      Boolean(proofModalQuest.requiresPhoto && processedPhoto),
      proofModalQuest.requiresPhoto ? processedPhoto?.blob : undefined
    );
    handleCloseProofModal();
  };

  const handleGenerateAiQuest = async () => {
    if (isGeneratingQuest) return;
    if (!isOnline) {
      setGenerationError(
        'Нет подключения к интернету. Текущие квесты доступны из локального кэша, а генерация новых идей откроется онлайн.'
      );
      return;
    }
    setIsGeneratingQuest(true);
    setGenerationError(null);
    try {
      const response = await fetch('/api/generate-quest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          circleName,
          interests: user.interests,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as Partial<
        GeneratedQuestPayload & { error: string }
      >;

      if (!response.ok) {
        throw new Error(
          data.error || `Ошибка сервера генерации квестов (${response.status})`
        );
      }

      if (!data.title || !data.description || !data.category) {
        throw new Error('Сервер вернул неполное описание квеста.');
      }

      await addGeneratedQuest({
        title: data.title,
        description: data.description,
        category: data.category,
        duration: data.duration || 'Неделя',
        requiresPhoto: Boolean(data.requiresPhoto),
        tips:
          data.tips ||
          'Соблюдай приватность: на фото должны быть только предметы или природа.',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось придумать новый квест. Попробуйте ещё раз.';
      setGenerationError(message);
    } finally {
      setIsGeneratingQuest(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Android Beta Mobile Install Prompt */}
      <AndroidInstallBanner />

      {/* Offline Cached Quests Banner */}
      {!isOnline && (
        <div className="p-3.5 bg-[#EEF3EE] border border-[#5B8266]/35 rounded-2xl flex items-start gap-2.5 text-xs text-[#2B4734]">
          <WifiOff className="w-4 h-4 text-[#486B52] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold">Офлайн-режим: квесты загружены из кэша</div>
            <p className="text-[11px] text-[#324C3A]/90 leading-snug">
              Все задания и отчёты доступны без интернета (IndexedDB + Service Worker). Новые отметки сохранятся локально{pendingSyncCount > 0 ? ` (в очереди: ${pendingSyncCount})` : ''}.
            </p>
          </div>
        </div>
      )}

      {/* Parental Pause Banner */}
      {parentSettings.paused && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <PauseCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Аккаунт поставлен на паузу</div>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Родитель временно приостановил отправку новых отчетов и Искр. Настройки доступны в Профиле по PIN-коду.
            </p>
          </div>
        </div>
      )}

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

        <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-stone-600">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#486B52]" />
            <span>Вклад всего круга: {totalCompleted} из {totalTarget} отметок</span>
          </span>
          <span className="text-stone-400 flex items-center gap-1 shrink-0" title={`Кэш обновлён: ${new Date(lastCachedAt).toLocaleTimeString('ru-RU')}`}>
            <HardDriveDownload className="w-3 h-3 text-[#486B52]" />
            <span>Кэш офлайн</span>
          </span>
        </div>
      </div>

      {/* AI Quest Generator Action */}
      <div className="bg-white border border-[#5B8266]/25 rounded-2xl p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#486B52] shrink-0" />
              <span>Новый офлайн-квест по интересам круга</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5 truncate">
              Учитывает интересы: {user.interests.slice(0, 3).join(', ') || 'Экология'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleGenerateAiQuest()}
            disabled={isGeneratingQuest}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#486B52] hover:bg-[#3B5944] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-60 transition-colors"
          >
            {isGeneratingQuest ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Подбор...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Придумать квест</span>
              </>
            )}
          </button>
        </div>

        {generationError && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[11px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{generationError}</span>
          </div>
        )}
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
              className={`flex-1 min-h-[36px] py-1.5 text-xs font-semibold rounded-lg transition-all text-center whitespace-nowrap ${
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
                      {getQuestIcon(quest.type, quest.createdByAi)}
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
                            <span className="text-amber-800 font-medium">Фото без лиц (авто-размытие)</span>
                          </>
                        )}
                        {quest.createdByAi && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#324C3A] font-semibold">Идея для Круга</span>
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
                          width: `${Math.round((quest.completedCount / Math.max(1, quest.targetCount)) * 100)}%`,
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
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#324C3A] bg-[#5B8266]/15 px-3 py-2 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#486B52]" />
                        <span>Выполнено</span>
                      </span>
                    ) : quest.type === 'detox' ? (
                      <button
                        onClick={openDetoxModal}
                        className="min-h-[44px] px-3.5 py-2 bg-[#4A7C92] hover:bg-[#3B6577] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-transform active:scale-98"
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span>Включить таймер</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenProofModal(quest)}
                        disabled={parentSettings.paused}
                        className="min-h-[44px] px-3.5 py-2 bg-[#486B52] hover:bg-[#3B5944] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-transform active:scale-98 disabled:opacity-50"
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
                          className="text-stone-400 hover:text-red-700 p-1.5 rounded-md hover:bg-stone-100 transition-colors"
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

                      {/* Photo proof (processed through Canvas privacy blur) */}
                      {proof.imageUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-stone-200/80 max-h-48 bg-stone-100">
                          <img
                            src={proof.imageUrl}
                            alt="Отчет квеста"
                            className="w-full h-44 object-cover"
                          />
                          <div className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span>
                              {proof.blurred || proof.isBlurred
                                ? 'Защита приватности: Canvas-размытие'
                                : 'Приватность подтверждена'}
                            </span>
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
                          className="text-[11px] font-medium text-[#C86D51] hover:text-[#B35E44] flex items-center gap-1 p-1.5 hover:bg-[#C86D51]/10 rounded-lg transition-colors"
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
        <div
          onClick={handleCloseProofModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F3] border border-[#5B8266]/20 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] cursor-default"
          >
            <div className="p-4 border-b border-stone-200/80 bg-[#5B8266]/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Отчет: {proofModalQuest.title}
                </h3>
                <p className="text-[11px] text-stone-500">
                  {proofModalQuest.requiresPhoto
                    ? 'Фото автоматически размывается на устройстве'
                    : 'Текстовый комментарий для круга'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseProofModal}
                className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
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
                    <span>Автоматическая защита приватности (Canvas):</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-normal">
                    Не фотографируйте лица людей или документы. Дополнительно каждое фото необратимо размывается перед сохранением в локальную базу.
                  </p>
                </div>
              )}

              {/* Photo Selector & Real File Upload */}
              {proofModalQuest.requiresPhoto && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="font-semibold text-stone-700">
                      Загрузите фото или выберите пример:
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelected}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-[#486B52]/40 text-[#324C3A] hover:bg-[#5B8266]/10 font-semibold text-[11px] flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Своё фото</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_PROOF_PHOTOS.map((photo, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => void processPhotoForPrivacy(photo.url, photo.title)}
                        className={`relative rounded-xl overflow-hidden border-2 aspect-video group ${
                          selectedSourceLabel === photo.title
                            ? 'border-[#486B52] ring-2 ring-[#486B52]/30'
                            : 'border-stone-200 opacity-85 hover:opacity-100'
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

                  {/* Canvas Blurred Preview */}
                  {isProcessingPhoto && (
                    <div className="p-4 rounded-xl bg-white border border-stone-200 flex items-center justify-center gap-2 text-stone-600">
                      <Loader2 className="w-4 h-4 animate-spin text-[#486B52]" />
                      <span>Применяем защитное Canvas-размытие...</span>
                    </div>
                  )}

                  {photoError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-start gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{photoError}</span>
                    </div>
                  )}

                  {processedPhoto && !isProcessingPhoto && (
                    <div className="space-y-1">
                      <div className="text-[11px] text-[#324C3A] font-medium flex items-center justify-between">
                        <span>Предпросмотр (лица скрыты):</span>
                        <span className="text-stone-400 truncate max-w-[160px]">{selectedSourceLabel}</span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-[#5B8266]/30 bg-stone-100">
                        <img
                          src={processedPhoto.dataUrl}
                          alt="Размытый предпросмотр отчета"
                          className="w-full h-36 object-cover"
                        />
                      </div>
                    </div>
                  )}
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
                  className="min-h-[44px] px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-xl"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={
                    parentSettings.paused ||
                    isProcessingPhoto ||
                    (proofModalQuest.requiresPhoto && !processedPhoto)
                  }
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-[#486B52] hover:bg-[#3B5944] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
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
