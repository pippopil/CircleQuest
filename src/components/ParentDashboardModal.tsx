/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  MapPin,
  Plus,
  Trash2,
  X,
  Clock,
  Moon,
  KeyRound,
  EyeOff,
  Compass,
} from 'lucide-react';

export const ParentDashboardModal: React.FC = () => {
  const {
    activeParentDashboardModal,
    closeParentDashboardModal,
    user,
    members,
    quests,
    sparksFeed,
    dnd,
    updateDND,
    parentSettings,
    verifyParentPin,
    updateParentPin,
    toggleAccountPause,
    addSafeZone,
    removeSafeZone,
    showToast,
  } = useApp();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // New SafeZone form
  const [zoneName, setZoneName] = useState('');
  const [zoneLat, setZoneLat] = useState('55.7558');
  const [zoneLng, setZoneLng] = useState('37.6173');
  const [zoneRadius, setZoneRadius] = useState('350');

  // Change PIN form
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  if (!activeParentDashboardModal) return null;

  const handleClose = () => {
    setPinInput('');
    setPinError('');
    setIsUnlocked(false);
    closeParentDashboardModal();
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pinInput.trim())) {
      setPinError('Введите 4 цифры PIN-кода');
      return;
    }
    setIsVerifying(true);
    setPinError('');
    try {
      const ok = await verifyParentPin(pinInput.trim());
      if (ok) {
        setIsUnlocked(true);
        setPinInput('');
      } else {
        setPinError('Неверный PIN-код. Для демо по умолчанию: 1234');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Геолокация не поддерживается на этом устройстве');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setZoneLat(pos.coords.latitude.toFixed(5));
        setZoneLng(pos.coords.longitude.toFixed(5));
        showToast('Координаты получены для настройки безопасной зоны');
      },
      () => {
        showToast('Нет доступа к геолокации — введите координаты вручную');
      },
      { timeout: 6000 }
    );
  };

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = Number(zoneLat);
    const lng = Number(zoneLng);
    const radius = Number(zoneRadius);
    if (!zoneName.trim() || Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radius) || radius < 50) {
      showToast('Проверьте название, координаты и радиус (от 50 м)');
      return;
    }
    await addSafeZone({
      name: zoneName.trim(),
      latitude: lat,
      longitude: lng,
      radiusMeters: Math.round(radius),
    });
    setZoneName('');
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) {
      showToast('Новый PIN должен состоять ровно из 4 цифр');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('Введённые PIN-коды не совпадают');
      return;
    }
    const ok = await updateParentPin(newPin);
    if (ok) {
      setNewPin('');
      setConfirmPin('');
    }
  };

  const myMember = members.find((m) => m.id === user.id);
  const completedQuestsCount = quests.filter((q) => q.isCompletedByMe).length;
  const sparksSentByChild = sparksFeed.filter((s) => s.fromUserId === user.id).length;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F3] border border-[#5B8266]/25 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] cursor-default"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 bg-[#5B8266]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#486B52] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Родительский дашборд</h2>
              <p className="text-[11px] text-stone-500">
                Безопасный контроль без чтения личных сообщений
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
            aria-label="Закрыть родительский дашборд"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {!isUnlocked ? (
          <form onSubmit={handleUnlock} className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#486B52]/10 text-[#486B52] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-stone-900">Вход по родительскому PIN</h3>
              <p className="text-xs text-stone-500">
                Введите 4-значный PIN-код для настройки режима тишины, безопасных зон и паузы.
              </p>
              <p className="text-[11px] text-[#486B52] font-medium">
                PIN по умолчанию для проверки: 1234
              </p>
            </div>

            <div className="max-w-[200px] mx-auto space-y-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                autoFocus
                className="w-full min-h-[44px] text-center text-lg tracking-[0.5em] font-bold rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#486B52]/40"
              />
              {pinError && <p className="text-[11px] text-red-600 font-medium">{pinError}</p>}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full max-w-[220px] min-h-[44px] mx-auto px-4 py-2.5 rounded-xl bg-[#486B52] hover:bg-[#3B5944] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {isVerifying ? 'Проверка...' : 'Открыть настройки'}
            </button>
          </form>
        ) : (
          <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Privacy notice */}
            <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-start gap-2.5 text-stone-600">
              <EyeOff className="w-4 h-4 text-[#486B52] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Для сохранения доверия подростка дашборд показывает только сводную активность (квесты и Искры), не раскрывая тексты переписки с друзьями.
              </p>
            </div>

            {/* Activity Summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-white border border-stone-200 text-center">
                <div className="text-lg font-extrabold text-[#324C3A] tabular-nums">
                  {completedQuestsCount}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Квестов за неделю</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-stone-200 text-center">
                <div className="text-lg font-extrabold text-[#C86D51] tabular-nums">
                  {sparksSentByChild}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Отправлено Искр</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-stone-200 text-center">
                <div className="text-lg font-extrabold text-[#4A7C92] tabular-nums">
                  {myMember?.completedThisWeek ?? completedQuestsCount}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Отметок в Круге</div>
              </div>
            </div>

            {/* Account Pause Control */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                parentSettings.paused
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-white border-stone-200'
              }`}
            >
              <div className="space-y-0.5">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  {parentSettings.paused ? (
                    <PauseCircle className="w-4 h-4 text-amber-700" />
                  ) : (
                    <PlayCircle className="w-4 h-4 text-[#486B52]" />
                  )}
                  <span>
                    {parentSettings.paused ? 'Аккаунт на паузе' : 'Аккаунт активен'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  {parentSettings.paused
                    ? 'Отправка новых отчетов и Искр временно заблокирована.'
                    : 'Ребенок может выполнять задания и поддерживать друзей.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void toggleAccountPause(!parentSettings.paused)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                  parentSettings.paused
                    ? 'bg-[#486B52] hover:bg-[#3B5944] text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {parentSettings.paused ? 'Возобновить' : 'Поставить на паузу'}
              </button>
            </div>

            {/* Quiet Hours DND Controls */}
            <div className="p-3.5 bg-white rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-[#4A7C92]" />
                  <span>Расписание тихих часов (DND)</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateDND({ enabled: !dnd.enabled })}
                  className={`min-h-[36px] px-3 rounded-lg text-[11px] font-semibold ${
                    dnd.enabled
                      ? 'bg-[#486B52]/15 text-[#324C3A]'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {dnd.enabled ? 'Включено' : 'Отключено'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-[#FAF8F3] rounded-xl border border-stone-100 space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Учёба</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={dnd.studyStart}
                      onChange={(e) => updateDND({ studyStart: e.target.value })}
                      className="w-full text-[11px] p-1 rounded-lg border border-stone-200 bg-white"
                    />
                    <span>–</span>
                    <input
                      type="time"
                      value={dnd.studyEnd}
                      onChange={(e) => updateDND({ studyEnd: e.target.value })}
                      className="w-full text-[11px] p-1 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-[#FAF8F3] rounded-xl border border-stone-100 space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-700">
                    <Moon className="w-3.5 h-3.5" />
                    <span>Сон</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={dnd.sleepStart}
                      onChange={(e) => updateDND({ sleepStart: e.target.value })}
                      className="w-full text-[11px] p-1 rounded-lg border border-stone-200 bg-white"
                    />
                    <span>–</span>
                    <input
                      type="time"
                      value={dnd.sleepEnd}
                      onChange={(e) => updateDND({ sleepEnd: e.target.value })}
                      className="w-full text-[11px] p-1 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Safe Zones Management */}
            <div className="p-3.5 bg-white rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#486B52]" />
                  <span>Безопасные зоны ({parentSettings.safeZones.length})</span>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-[11px] text-[#486B52] hover:underline font-semibold flex items-center gap-1"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Мои координаты</span>
                </button>
              </div>

              <div className="space-y-2">
                {parentSettings.safeZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-2.5 bg-[#FAF8F3] rounded-xl border border-stone-100 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-900 truncate">{zone.name}</div>
                      <div className="text-[10px] text-stone-500 tabular-nums">
                        {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)} · радиус {zone.radiusMeters} м
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeSafeZone(zone.id)}
                      className="min-w-[44px] min-h-[44px] rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center shrink-0"
                      aria-label={`Удалить зону ${zone.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddZone} className="space-y-2 pt-2 border-t border-stone-100">
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="Название (например: Секция или Бабушкин двор)"
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-200 bg-[#FAF8F3] text-xs"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={zoneLat}
                    onChange={(e) => setZoneLat(e.target.value)}
                    placeholder="Широта"
                    className="min-h-[40px] px-2.5 rounded-xl border border-stone-200 bg-[#FAF8F3] text-[11px] tabular-nums"
                  />
                  <input
                    type="text"
                    value={zoneLng}
                    onChange={(e) => setZoneLng(e.target.value)}
                    placeholder="Долгота"
                    className="min-h-[40px] px-2.5 rounded-xl border border-stone-200 bg-[#FAF8F3] text-[11px] tabular-nums"
                  />
                  <input
                    type="number"
                    min={50}
                    max={5000}
                    value={zoneRadius}
                    onChange={(e) => setZoneRadius(e.target.value)}
                    placeholder="Радиус, м"
                    className="min-h-[40px] px-2.5 rounded-xl border border-stone-200 bg-[#FAF8F3] text-[11px] tabular-nums"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#486B52] hover:bg-[#3B5944] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить безопасную зону</span>
                </button>
              </form>
            </div>

            {/* Update PIN */}
            <form
              onSubmit={handleUpdatePin}
              className="p-3.5 bg-white rounded-2xl border border-stone-200 space-y-2.5"
            >
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-stone-600" />
                <span>Сменить родительский PIN</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Новый PIN (4 цифры)"
                  className="min-h-[44px] px-3 rounded-xl border border-stone-200 bg-[#FAF8F3] text-xs"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Повторите PIN"
                  className="min-h-[44px] px-3 rounded-xl border border-stone-200 bg-[#FAF8F3] text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold"
              >
                Сохранить новый PIN
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
