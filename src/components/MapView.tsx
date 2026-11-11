/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_MAP_SPOTS } from '../utils/mockData';
import { MapSpot } from '../types';
import {
  Compass,
  MapPin,
  TreePine,
  HeartHandshake,
  Moon,
  Sun,
  Navigation,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const MapView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [selectedSpot, setSelectedSpot] = useState<MapSpot>(INITIAL_MAP_SPOTS[0]);
  const [filterCategory, setFilterCategory] = useState<'all' | 'eco' | 'kindness' | 'detox' | 'workout'>('all');

  const spots = INITIAL_MAP_SPOTS.filter((s) => {
    if (filterCategory === 'all') return true;
    return s.category === filterCategory;
  });

  const getPinIcon = (cat: string) => {
    switch (cat) {
      case 'eco':
        return <TreePine className="w-3.5 h-3.5" />;
      case 'kindness':
        return <HeartHandshake className="w-3.5 h-3.5" />;
      case 'detox':
        return <Moon className="w-3.5 h-3.5" />;
      case 'workout':
        return <Sun className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  const getPinColor = (cat: string) => {
    switch (cat) {
      case 'eco':
        return 'bg-[#486B52] text-white';
      case 'kindness':
        return 'bg-[#C86D51] text-white';
      case 'detox':
        return 'bg-[#4A7C92] text-white';
      case 'workout':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-stone-700 text-white';
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Map Header */}
      <div className="bg-[#FAF8F3] border border-[#5B8266]/20 rounded-2xl p-4 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
              <Compass className="w-3.5 h-3.5 text-[#486B52]" />
              <span>Офлайн-карта района</span>
              <span aria-hidden="true">·</span>
              <span>Без передачи точных GPS данных</span>
            </div>
            <h2 className="text-base font-bold text-stone-900 mt-0.5">
              Точки добрых дел и детокса
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Настоящие локации для квестов рядом с вами: скверы, кормушки, эко-пункты и воркаут.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/60 rounded-xl overflow-x-auto no-scrollbar">
        {[
          { id: 'all' as const, label: 'Все локации' },
          { id: 'eco' as const, label: 'Эко-пункты' },
          { id: 'kindness' as const, label: 'Добро и животные' },
          { id: 'detox' as const, label: 'Тихие скверы' },
          { id: 'workout' as const, label: 'Спорт' },
        ].map((tab) => {
          const isActive = filterCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all text-center whitespace-nowrap shrink-0 ${
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

      {/* Interactive Vector Neighborhood Map */}
      <div className="relative w-full h-72 sm:h-80 bg-[#E8EFE9] border border-[#5B8266]/25 rounded-3xl overflow-hidden shadow-inner select-none">
        {/* Background stylized SVG map paths (streets, river, park green zones) */}
        <svg className="w-full h-full absolute inset-0" xmlns="http://www.w3.org/2000/svg">
          {/* Park green zone 1 */}
          <path
            d="M 50,30 Q 150,20 220,80 T 300,160 Q 240,240 120,200 Z"
            fill="#D5E5D8"
            opacity="0.8"
          />
          {/* Park green zone 2 */}
          <path
            d="M 280,180 Q 400,160 480,220 T 580,300 Q 440,340 320,280 Z"
            fill="#D5E5D8"
            opacity="0.7"
          />
          {/* Lake / Pond */}
          <path
            d="M 320,70 Q 380,50 430,90 T 400,150 Q 340,160 310,120 Z"
            fill="#C9DEE8"
            opacity="0.9"
          />
          {/* River branch */}
          <path
            d="M -20,120 Q 140,110 260,150 T 600,130"
            fill="none"
            stroke="#BDD7E3"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Streets */}
          <path
            d="M 0,220 L 600,220 M 180,0 L 180,360 M 380,0 L 380,360 M 60,60 L 520,320"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M 0,220 L 600,220 M 180,0 L 180,360 M 380,0 L 380,360"
            fill="none"
            stroke="#EDE8DC"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Tree decorations */}
        <div className="absolute top-10 left-16 text-lg opacity-40">🌲</div>
        <div className="absolute top-16 left-28 text-sm opacity-35">🌳</div>
        <div className="absolute bottom-20 right-20 text-lg opacity-40">🌲</div>
        <div className="absolute bottom-28 right-36 text-sm opacity-35">🌳</div>
        <div className="absolute top-24 right-32 text-xs opacity-50">🦆</div>

        {/* User Location Pulse (Simulated friendly indicator) */}
        <div className="absolute top-[48%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-[#5B8266]/20 animate-ping absolute" />
          <div className="w-4 h-4 rounded-full bg-[#486B52] border-2 border-white shadow-md flex items-center justify-center text-[8px] text-white font-bold">
            Вы
          </div>
        </div>

        {/* Map Pins */}
        {spots.map((spot) => {
          const isSelected = selectedSpot?.id === spot.id;
          const pinColor = getPinColor(spot.category);

          return (
            <button
              key={spot.id}
              onClick={() => setSelectedSpot(spot)}
              style={{ top: `${spot.coords.y}%`, left: `${spot.coords.x}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-transform ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
              title={spot.title}
            >
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center shadow-md border-2 border-white transition-all ${pinColor} ${
                  isSelected ? 'ring-4 ring-[#486B52]/30' : ''
                }`}
              >
                {getPinIcon(spot.category)}
              </div>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md pointer-events-none shadow-xs">
                {spot.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Spot Details Card */}
      {selectedSpot && (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getPinColor(
                  selectedSpot.category
                )}`}
              >
                {getPinIcon(selectedSpot.category)}
              </div>
              <div>
                <div className="text-[11px] text-stone-500 font-medium">
                  {selectedSpot.categoryLabel} · <span className="text-stone-400">~300 м от вас</span>
                </div>
                <h3 className="text-sm font-bold text-stone-900 mt-0.5">
                  {selectedSpot.title}
                </h3>
                <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <Navigation className="w-3 h-3 text-[#486B52]" />
                  <span>{selectedSpot.address}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed bg-[#FAF8F3] p-2.5 rounded-xl border border-stone-100">
            {selectedSpot.description}
          </p>

          <div className="pt-1 flex items-center justify-between gap-2">
            <div className="text-[11px] text-[#486B52] font-semibold flex items-center gap-1 truncate">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{selectedSpot.questAction}</span>
            </div>

            <button
              onClick={() => setActiveTab('quests')}
              className="px-3.5 py-2 rounded-xl bg-[#486B52] hover:bg-[#3B5944] text-white text-xs font-semibold shadow-xs flex items-center gap-1 shrink-0 transition-transform active:scale-98"
            >
              <span>К заданиям</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
