/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCheck, Sparkles, Trophy, Bell, Shield, Moon } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const NotificationsModal: React.FC<Props> = ({ onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
  } = useApp();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F3] border border-[#5B8266]/20 rounded-2xl max-w-md w-full shadow-xl overflow-hidden flex flex-col max-h-[85vh] cursor-default"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200/70 flex items-center justify-between bg-stone-50/60">
          <div>
            <h2 className="text-base font-bold text-stone-900">Бережные уведомления</h2>
            <p className="text-xs text-stone-500">Без спешки, спама и искусственной тревожности</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quiet Mode Banner */}
        <div className="px-4 py-2.5 bg-[#5B8266]/10 border-b border-[#5B8266]/15 flex items-center justify-between text-xs text-[#324C3A]">
          <div className="flex items-center gap-2">
            <Moon className="w-3.5 h-3.5 shrink-0" />
            <span>Учебные часы и сон защищены от звуков</span>
          </div>
          <button
            onClick={() => {
              onClose();
              setActiveTab('profile');
            }}
            className="font-medium underline hover:text-[#1F3325]"
          >
            Настроить
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2.5 divide-y divide-stone-100 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-sm">
              Нет новых уведомлений
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`pt-2.5 first:pt-0 cursor-pointer transition-colors p-2 rounded-xl ${
                  n.read ? 'opacity-70 bg-transparent' : 'bg-white shadow-xs border border-stone-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5B8266]/15 text-[#324C3A] flex items-center justify-center shrink-0 mt-0.5">
                    {n.type === 'spark' && <Sparkles className="w-4 h-4 text-[#C86D51]" />}
                    {n.type === 'team_progress' && <Trophy className="w-4 h-4 text-[#486B52]" />}
                    {n.type === 'gentle_reminder' && <Bell className="w-4 h-4 text-[#4A7C92]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold text-stone-900 truncate">{n.title}</h3>
                      <span className="text-[10px] text-stone-400 shrink-0 tabular-nums">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{n.body}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-stone-200/70 bg-stone-50/60 flex items-center justify-between">
            <button
              onClick={markAllNotificationsRead}
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Прочитать все</span>
            </button>
            <button
              onClick={onClose}
              className="text-xs font-medium text-[#486B52] hover:text-[#324C3A]"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
