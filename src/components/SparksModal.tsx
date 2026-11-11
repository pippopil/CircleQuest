/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_SPARK_STICKERS } from '../utils/mockData';
import { SparkSticker } from '../types';
import { playSparkTone } from '../utils/audio';
import { Sparkles, X, Volume2, Send } from 'lucide-react';

export const SparksModal: React.FC = () => {
  const { activeSparkRecipient, closeSparkModal, sendSpark, quests } = useApp();
  const [selectedSticker, setSelectedSticker] = useState<SparkSticker>(INITIAL_SPARK_STICKERS[0]);
  const [customNote, setCustomNote] = useState('');
  const [selectedQuest, setSelectedQuest] = useState<string>('');

  if (!activeSparkRecipient) return null;

  const handleSelectSticker = (sticker: SparkSticker) => {
    setSelectedSticker(sticker);
    playSparkTone(sticker.soundType);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendSpark(
      activeSparkRecipient.id,
      selectedSticker.id,
      customNote.trim() || undefined,
      selectedQuest || undefined
    );
  };

  return (
    <div
      onClick={closeSparkModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F3] border border-[#5B8266]/20 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] cursor-default"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 bg-[#5B8266]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C86D51] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Отправить Искру для {activeSparkRecipient.name}
              </h2>
              <p className="text-[11px] text-stone-500">
                Анти-лайк: приватное тепло без публичных счетчиков
              </p>
            </div>
          </div>
          <button
            onClick={closeSparkModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSend} className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Stickers Grid */}
          <div>
            <label className="font-semibold text-stone-800 block mb-2 flex items-center justify-between">
              <span>Выбери стикер поддержки:</span>
              <span className="text-[10px] text-stone-400 font-normal flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-[#486B52]" /> Нажми, чтобы послушать
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INITIAL_SPARK_STICKERS.map((sticker) => {
                const isSelected = selectedSticker.id === sticker.id;
                return (
                  <button
                    type="button"
                    key={sticker.id}
                    onClick={() => handleSelectSticker(sticker)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-white border-[#C86D51] shadow-xs ring-2 ring-[#C86D51]/30 text-stone-900'
                        : 'bg-white/60 border-stone-200/80 text-stone-700 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <span className="text-2xl shrink-0 p-1 bg-stone-100 rounded-lg">
                      {sticker.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{sticker.title}</div>
                      <div className="text-[10px] text-stone-500 truncate">{sticker.message}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Link to a Quest (optional) */}
          <div>
            <label className="font-semibold text-stone-800 block mb-1">
              За какой квест (опционально):
            </label>
            <select
              value={selectedQuest}
              onChange={(e) => setSelectedQuest(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B8266]/30"
            >
              <option value="">Просто так, для хорошего настроения</option>
              {quests.map((q) => (
                <option key={q.id} value={q.title}>
                  {q.title} ({q.category})
                </option>
              ))}
            </select>
          </div>

          {/* Personal message */}
          <div>
            <label className="font-semibold text-stone-800 block mb-1">
              Твои добрые слова:
            </label>
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder={selectedSticker.message}
              rows={2}
              className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B8266]/30 placeholder:text-stone-400"
            />
          </div>

          {/* Preview Box */}
          <div className="p-3 bg-[#EEF3EE]/80 rounded-xl border border-[#5B8266]/20 text-stone-700 flex items-center gap-3">
            <span className="text-3xl">{selectedSticker.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-stone-900">{selectedSticker.title}</div>
              <div className="text-[11px] text-stone-600 truncate">
                {customNote.trim() || selectedSticker.message}
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeSparkModal}
              className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#C86D51] hover:bg-[#B35E44] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Отправить Искру</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
