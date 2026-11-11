/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  ShieldCheck,
  HeartHandshake,
  Moon,
  Laptop,
  Smartphone,
  LogOut,
  Sparkles,
  ShieldAlert,
  Check,
  FileText,
  Tag,
  Clock,
  Shield,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    user,
    updateUser,
    dnd,
    updateDND,
    sessions,
    terminateSession,
    terminateAllOtherSessions,
    openParentConsentModal,
    openPrivacyPolicyModal,
    openModeratorModal,
    setRoleMode,
    showToast,
  } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [selectedAge, setSelectedAge] = useState<number>(user.age);

  const availableAvatars = ['🦊', '🦉', '🐻', '🦔', '🦌', '🐺', '🦝', '🦅', '🌿', '🌱'];
  const allInterests = [
    'Экология',
    'Фотография природы',
    'Стритбол',
    'Помощь животным',
    'Книги и комиксы',
    'Воркаут',
    'Скетчинг и арт',
    'Настольные игры',
    'Велосипед',
  ];

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateUser({ name: nameInput.trim() });
      setIsEditingName(false);
    }
  };

  const handleAgeChange = (newAge: number) => {
    setSelectedAge(newAge);
    const requiresConsent = newAge < 14;
    updateUser({
      age: newAge,
      parentConsentVerified: requiresConsent ? user.parentConsentVerified : true,
    });
    if (requiresConsent && !user.parentConsentVerified) {
      openParentConsentModal();
    } else {
      showToast(`Возраст обновлен: ${newAge} лет`);
    }
  };

  const toggleInterest = (tag: string) => {
    const current = [...user.interests];
    const exists = current.includes(tag);
    const updated = exists ? current.filter((t) => t !== tag) : [...current, tag];
    updateUser({ interests: updated });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Profile Card */}
      <div className="bg-[#FAF8F3] border border-[#5B8266]/20 rounded-2xl p-4 shadow-xs space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar with quick selector */}
            <div className="w-14 h-14 rounded-2xl bg-[#5B8266]/15 border border-[#5B8266]/25 flex items-center justify-center text-3xl shadow-xs">
              {user.avatar}
            </div>

            <div>
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="text-xs p-1.5 rounded-lg border border-stone-300 bg-white font-bold text-stone-900 w-28 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 bg-[#486B52] text-white rounded-lg text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-stone-900">{user.name}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-[11px] text-[#486B52] hover:underline font-medium"
                  >
                    Изменить
                  </button>
                </div>
              )}

              <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1.5">
                <span>{user.handle}</span>
                <span aria-hidden="true">·</span>
                <span>{user.age} лет</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#486B52] font-medium">Закрытый аккаунт</span>
              </div>
            </div>
          </div>

          {/* Age selector */}
          <div className="text-right">
            <span className="text-[10px] text-stone-400 font-medium block">Возраст:</span>
            <select
              value={selectedAge}
              onChange={(e) => handleAgeChange(Number(e.target.value))}
              className="mt-0.5 text-xs font-semibold p-1 rounded-lg border border-stone-200 bg-white text-stone-800"
            >
              {[12, 13, 14, 15, 16, 17].map((a) => (
                <option key={a} value={a}>
                  {a} лет {a < 14 ? '(требует согласия)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Avatar Picker */}
        <div>
          <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block mb-1">
            Выбрать аватар-символ:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {availableAvatars.map((emoji) => (
              <button
                key={emoji}
                onClick={() => updateUser({ avatar: emoji })}
                className={`w-8 h-8 rounded-xl text-lg flex items-center justify-center transition-all ${
                  user.avatar === emoji
                    ? 'bg-[#5B8266] text-white ring-2 ring-[#5B8266]/30 shadow-xs'
                    : 'bg-white border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parental Consent Status Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5B8266]/15 text-[#486B52] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900">Защита и возрастной контроль</h3>
              <p className="text-[11px] text-stone-500">
                {user.age < 14
                  ? 'Пользователь младше 14 лет (требуется согласие родителя)'
                  : 'Стандартный защитный режим для молодежи'}
              </p>
            </div>
          </div>

          {user.parentConsentVerified ? (
            <span className="text-[11px] font-semibold text-[#324C3A] bg-[#5B8266]/15 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3 text-[#486B52]" /> Подтверждено
            </span>
          ) : (
            <button
              onClick={openParentConsentModal}
              className="text-[11px] font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded-md shadow-xs"
            >
              Подтвердить родителем
            </button>
          )}
        </div>

        {user.parentEmail && (
          <div className="text-[11px] text-stone-600 bg-[#FAF8F3] p-2 rounded-lg border border-stone-100 flex items-center justify-between">
            <span>Email родителя: {user.parentEmail}</span>
            <button
              onClick={openParentConsentModal}
              className="text-[#486B52] underline font-medium hover:text-[#324C3A]"
            >
              Изменить
            </button>
          </div>
        )}
      </div>

      {/* Interests Tags (for Quest Personalization) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5">
        <div>
          <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#486B52]" />
            <span>Интересы (для подбора квестов круга)</span>
          </h3>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Нажмите, чтобы добавить или убрать тему из алгоритма генератора
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {allInterests.map((tag) => {
            const isSelected = user.interests.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleInterest(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[#486B52] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {isSelected ? `✓ ${tag}` : `+ ${tag}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gentle Notifications & Quiet Hours (DND) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4A7C92]/15 text-[#4A7C92] flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900">Бережные уведомления</h3>
              <p className="text-[11px] text-stone-500">Авто-тишина во время учебы и сна</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={dnd.enabled}
              onChange={(e) => updateDND({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#486B52]"></div>
          </label>
        </div>

        {dnd.enabled && (
          <div className="space-y-2 pt-1 border-t border-stone-100 text-xs">
            {/* School schedule */}
            <div className="flex items-center justify-between p-2 bg-[#FAF8F3] rounded-xl border border-stone-100">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-stone-700 font-medium">Режим учебы:</span>
              </div>
              <span className="text-stone-800 font-mono text-[11px] tabular-nums">
                {dnd.studyStart} – {dnd.studyEnd}
              </span>
            </div>

            {/* Sleep schedule */}
            <div className="flex items-center justify-between p-2 bg-[#FAF8F3] rounded-xl border border-stone-100">
              <div className="flex items-center gap-2">
                <Moon className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-stone-700 font-medium">Режим сна:</span>
              </div>
              <span className="text-stone-800 font-mono text-[11px] tabular-nums">
                {dnd.sleepStart} – {dnd.sleepEnd}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Teen Privacy Manifesto Button */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5B8266]/15 text-[#486B52] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900">Политика приватности для подростков</h3>
            <p className="text-[11px] text-stone-500">Простыми словами: что защищено</p>
          </div>
        </div>

        <button
          onClick={openPrivacyPolicyModal}
          className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
        >
          Читать
        </button>
      </div>

      {/* Active Sessions & Security */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-stone-900">Активные устройства ({sessions.length})</h3>
            <p className="text-[11px] text-stone-500">Управление безопасностью сессий</p>
          </div>
          {sessions.length > 1 && (
            <button
              onClick={terminateAllOtherSessions}
              className="text-[11px] text-red-600 hover:underline font-medium"
            >
              Завершить другие
            </button>
          )}
        </div>

        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="p-2.5 rounded-xl bg-[#FAF8F3] border border-stone-100 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                {s.device.includes('iPhone') ? (
                  <Smartphone className="w-4 h-4 text-stone-600" />
                ) : (
                  <Laptop className="w-4 h-4 text-stone-600" />
                )}
                <div>
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <span>{s.device}</span>
                    {s.isCurrent && (
                      <span className="text-[9px] bg-[#5B8266]/15 text-[#324C3A] font-bold px-1.5 py-0.2 rounded">
                        Это устройство
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {s.browser} · {s.location} · {s.lastActive}
                  </div>
                </div>
              </div>

              {!s.isCurrent && (
                <button
                  onClick={() => terminateSession(s.id)}
                  className="text-stone-400 hover:text-red-600 p-1 rounded-md"
                  title="Отключить устройство"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Moderator Panel Launcher */}
      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-700" />
          <span>Демо-доступ: Панель модератора квестов</span>
        </div>
        <button
          onClick={() => {
            setRoleMode('moderator');
            openModeratorModal();
          }}
          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
        >
          Открыть панель
        </button>
      </div>
    </div>
  );
};
