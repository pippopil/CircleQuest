/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Copy, Check, X, QrCode, UserPlus, Users, Shield } from 'lucide-react';

export const InviteModal: React.FC = () => {
  const {
    circleName,
    circleCode,
    members,
    activeInviteModal,
    closeInviteModal,
    inviteMemberByName,
    showToast,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦝');

  if (!activeInviteModal) return null;

  const inviteUrl = `https://circlequest.app/join/${circleCode}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    showToast('Ссылка на закрытый круг скопирована в буфер обмена');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddDemoFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    const success = inviteMemberByName(newFriendName.trim(), selectedAvatar);
    if (success) {
      setNewFriendName('');
    }
  };

  const sampleNames = ['Алина', 'Кирилл', 'Полина', 'Ярослав', 'Даша'];

  return (
    <div
      onClick={closeInviteModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F3] border border-[#5B8266]/20 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] cursor-default"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 bg-[#5B8266]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5B8266] text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Пригласить близкого друга</h2>
              <p className="text-[11px] text-stone-500">
                Закрытый круг: максимум 10 человек ({members.length}/10)
              </p>
            </div>
          </div>
          <button
            onClick={closeInviteModal}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Privacy Note */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-[#486B52] shrink-0 mt-0.5" />
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Круг «<strong>{circleName}</strong>» полностью изолирован от публичного интернета. Приглашайте только тех, с кем общаетесь в реальной жизни.
            </p>
          </div>

          {/* Code Box */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200 text-center shadow-2xs space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Код приглашения в Круг
            </span>
            <div className="font-mono text-2xl font-extrabold text-[#324C3A] tracking-wider select-all">
              {circleCode}
            </div>

            <div className="pt-1 flex items-center justify-center gap-2">
              <button
                onClick={handleCopy}
                className="w-full py-2.5 px-4 rounded-xl bg-[#486B52] hover:bg-[#3B5944] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Скопировано!' : 'Скопировать ссылку-приглашение'}</span>
              </button>
            </div>
          </div>

          {/* QR Code Graphic Preview */}
          <div className="p-3 bg-stone-100/70 rounded-xl border border-stone-200/70 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
              <QrCode className="w-8 h-8 text-[#324C3A]" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-stone-900">QR-код для быстрой встречи</div>
              <div className="text-[11px] text-stone-500">
                Друг может отсканировать прямо с твоего экрана на перемене или тренировке
              </div>
            </div>
          </div>

          {/* Quick Demo Friend Simulation */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2.5">
            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-[#486B52]" />
              <span>Добавить друга для проверки MVP:</span>
            </div>
            <form onSubmit={handleAddDemoFriend} className="flex gap-2">
              <input
                type="text"
                value={newFriendName}
                onChange={(e) => setNewFriendName(e.target.value)}
                placeholder="Имя друга (напр. Алина)"
                disabled={members.length >= 10}
                className="flex-1 p-2 rounded-xl border border-stone-200 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B8266]/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newFriendName.trim() || members.length >= 10}
                className="px-3 py-2 bg-[#5B8266] text-white rounded-xl text-xs font-semibold hover:bg-[#486B52] disabled:opacity-40 transition-colors"
              >
                Добавить
              </button>
            </form>
            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-stone-400">Быстрый выбор:</span>
              {sampleNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setNewFriendName(name)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 hover:bg-stone-200"
                >
                  +{name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-200/80 bg-stone-50/60 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            Осталось мест в круге: <strong className="text-stone-800">{10 - members.length}</strong>
          </span>
          <button
            onClick={closeInviteModal}
            className="px-4 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
