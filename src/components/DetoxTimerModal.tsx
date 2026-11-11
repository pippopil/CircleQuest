/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { playSuccessChime, playDetoxTick } from '../utils/audio';
import { Moon, Play, Pause, X, Check, Volume2, VolumeX, Sparkles } from 'lucide-react';

export const DetoxTimerModal: React.FC = () => {
  const { activeDetoxModal, closeDetoxModal, completeQuest, quests } = useApp();
  
  const [targetMinutes, setTargetMinutes] = useState<number>(30);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Sync initial seconds when changing target minutes
  useEffect(() => {
    if (!isRunning) {
      setSecondsRemaining(targetMinutes * 60);
    }
  }, [targetMinutes, isRunning]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            playSuccessChime();
            return 0;
          }
          if (soundEnabled && prev % 10 === 0) {
            playDetoxTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, soundEnabled]);

  if (!activeDetoxModal) return null;

  const detoxQuest = quests.find((q) => q.type === 'detox');

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinishAndSave = () => {
    if (detoxQuest) {
      completeQuest(
        detoxQuest.id,
        `Провел(а) ${targetMinutes} минут в тишине без смартфона. Перезагрузка удалась! 🌿`
      );
    }
    closeDetoxModal();
  };

  // Quick finish for demo/testing
  const handleFastSimulate = () => {
    setSecondsRemaining(3);
    setIsRunning(true);
  };

  return (
    <div
      onClick={closeDetoxModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#141C16] text-[#E8EFE9] border border-[#5B8266]/30 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden flex flex-col p-6 text-center relative cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={closeDetoxModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 text-stone-400 text-xs font-medium uppercase tracking-wider mb-2">
          <Moon className="w-3.5 h-3.5 text-[#5B8266]" />
          <span>Детокс КругоКвеста</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          Время тишины без экранов
        </h2>
        <p className="text-xs text-stone-400 max-w-xs mx-auto mb-6">
          Положи телефон экраном вниз. Отдохни от ленты, почитай книгу или посмотри в окно.
        </p>

        {/* Breathing Animated Orb */}
        <div className="relative w-48 h-48 mx-auto my-2 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full bg-[#5B8266]/15 blur-xl transition-all duration-1000 ${
              isRunning ? 'scale-125 opacity-100 animate-pulse' : 'scale-90 opacity-40'
            }`}
          />
          <div className="relative w-40 h-40 rounded-full border-2 border-[#5B8266]/40 flex flex-col items-center justify-center bg-[#1B261E] shadow-inner">
            <span className="text-3xl font-mono font-bold tracking-tight text-white tabular-nums">
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-[11px] text-[#8EA895] mt-1">
              {isCompleted ? 'Детокс пройден! 🎉' : isRunning ? 'Вдох... Выдох...' : 'Нажмите старт'}
            </span>
          </div>
        </div>

        {/* Duration Selectors (when not running and not finished) */}
        {!isRunning && !isCompleted && (
          <div className="flex items-center justify-center gap-2 my-4">
            {[15, 30, 45].map((mins) => (
              <button
                key={mins}
                onClick={() => setTargetMinutes(mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  targetMinutes === mins
                    ? 'bg-[#5B8266] text-white shadow-xs'
                    : 'bg-white/10 text-stone-300 hover:bg-white/15'
                }`}
              >
                {mins} мин
              </button>
            ))}
          </div>
        )}

        {/* Sound toggle & fast test */}
        <div className="flex items-center justify-between text-xs text-stone-400 px-3 py-2 bg-white/5 rounded-xl my-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#5B8266]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Мягкий сигнал</span>
          </button>
          {!isCompleted && !isRunning && (
            <button
              onClick={handleFastSimulate}
              className="text-[11px] text-[#8EA895] hover:text-white underline"
            >
              Тест (3 сек)
            </button>
          )}
        </div>

        {/* Primary Controls */}
        <div className="mt-2 space-y-2">
          {isCompleted ? (
            <button
              onClick={handleFinishAndSave}
              className="w-full py-3 rounded-2xl bg-[#5B8266] hover:bg-[#4A6D54] text-white font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Засчитать квест в прогресс круга!</span>
            </button>
          ) : isRunning ? (
            <button
              onClick={() => setIsRunning(false)}
              className="w-full py-3 rounded-2xl bg-white/15 hover:bg-white/20 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>Поставить на паузу</span>
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(true)}
              className="w-full py-3 rounded-2xl bg-[#5B8266] hover:bg-[#4A6D54] text-white font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Начать детокс ({targetMinutes} мин)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
