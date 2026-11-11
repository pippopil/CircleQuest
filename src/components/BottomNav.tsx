/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Sparkles, TreePine, Users, User, ShieldCheck } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, sparksFeed } = useApp();

  const unreadSparks = sparksFeed.filter((s) => !s.read).length;

  const tabs = [
    {
      id: 'quests' as const,
      label: 'Квесты',
      icon: TreePine,
    },
    {
      id: 'circle' as const,
      label: 'Наш Круг',
      icon: Users,
      badge: unreadSparks > 0,
    },
    {
      id: 'map' as const,
      label: 'Карта',
      icon: Compass,
    },
    {
      id: 'profile' as const,
      label: 'Профиль',
      icon: ShieldCheck,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F3]/95 backdrop-blur-md border-t border-[#5B8266]/15 pb-safe transition-all shadow-sm">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="group relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-transform active:scale-95"
              aria-label={tab.label}
            >
              <div className="relative">
                <div
                  className={`w-10 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-[#5B8266]/20 text-[#2B4734]'
                      : 'text-stone-500 group-hover:text-stone-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                </div>
                {tab.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#C86D51]" />
                )}
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors whitespace-nowrap ${
                  isActive ? 'text-[#2B4734] font-semibold' : 'text-stone-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
