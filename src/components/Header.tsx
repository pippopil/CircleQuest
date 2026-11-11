/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Shield, RotateCcw, Moon, Sparkles, UserCheck, Users } from 'lucide-react';
import { NotificationsModal } from './NotificationsModal';

export const Header: React.FC = () => {
  const {
    circleName,
    members,
    notifications,
    dnd,
    roleMode,
    setRoleMode,
    resetAllData,
    openModeratorModal,
    openInviteModal,
  } = useApp();

  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Check if quiet mode / study mode is active (based on current time)
  const isQuietTimeActive = dnd.enabled && (dnd.studyMode || dnd.sleepMode);

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#F8F6F0]/90 backdrop-blur-md border-b border-[#5B8266]/15 transition-all">
        <div className="max-w-4xl mx-auto px-4 h-15 flex items-center justify-between gap-3">
          {/* Brand & Circle Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#5B8266]/15 flex items-center justify-center text-[#324C3A] font-bold text-lg shrink-0 border border-[#5B8266]/20 shadow-xs">
              🌿
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-stone-900 tracking-tight truncate">
                  {circleName}
                </h1>
                <button
                  onClick={openInviteModal}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#486B52] bg-[#5B8266]/10 hover:bg-[#5B8266]/20 px-2 py-0.5 rounded-md transition-colors"
                  title="Пригласить в круг"
                >
                  <Users className="w-3 h-3" />
                  <span>{members.length}/10</span>
                </button>
              </div>
              <div className="text-[11px] text-stone-500 flex items-center gap-1.5 truncate">
                <span>Закрытый круг</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{members.length} друзей</span>
                {isQuietTimeActive && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-0.5 text-[#486B52] font-medium">
                      <Moon className="w-2.5 h-2.5" /> Бережный режим
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Utility Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mode Switcher / Admin Trigger */}
            <button
              onClick={() => {
                if (roleMode === 'user') {
                  setRoleMode('moderator');
                  openModeratorModal();
                } else {
                  setRoleMode('user');
                }
              }}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors border ${
                roleMode === 'moderator'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-stone-100/80 text-stone-700 border-stone-200 hover:bg-stone-200/80'
              }`}
              title="Переключить панель модератора"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{roleMode === 'moderator' ? 'Модератор' : 'Модерация'}</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setShowNotifs(true)}
              className="relative w-9 h-9 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-200/70 transition-colors"
              aria-label="Уведомления"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C86D51]" />
              )}
            </button>

            {/* Quick Reset Button */}
            <button
              onClick={resetAllData}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition-colors"
              title="Сбросить демо-данные"
              aria-label="Сброс данных"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      {showNotifs && <NotificationsModal onClose={() => setShowNotifs(false)} />}
    </>
  );
};
