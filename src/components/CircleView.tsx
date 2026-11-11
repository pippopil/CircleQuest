/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { playSparkTone } from '../utils/audio';
import {
  Users,
  Sparkles,
  UserPlus,
  Shield,
  Volume2,
  MoreVertical,
  UserMinus,
  Crown,
  LogOut,
  QrCode,
  Copy,
  Check,
  Heart,
  Flag,
} from 'lucide-react';

export const CircleView: React.FC = () => {
  const {
    circleName,
    circleCode,
    members,
    user,
    sparksFeed,
    openSparkModal,
    openInviteModal,
    openReportModal,
    kickMember,
    leaveCircle,
    transferOwnership,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'members' | 'sparks'>('members');
  const [selectedMemberMenu, setSelectedMemberMenu] = useState<string | null>(null);

  const isCreator = user.role === 'creator';

  const handlePlaySpark = (soundType: any) => {
    playSparkTone(soundType);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Circle Banner */}
      <div className="bg-[#FAF8F3] border border-[#5B8266]/20 rounded-2xl p-4 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-[#486B52]" />
              <span>Закрытый приватный круг</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{members.length}/10 мест</span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 mt-0.5">{circleName}</h2>
            <p className="text-xs text-stone-600 mt-1">
              Пространство только для вас пятерых. Никаких чужих глаз и алгоритмов.
            </p>
          </div>

          <button
            onClick={openInviteModal}
            className="px-3 py-1.5 bg-[#486B52] hover:bg-[#3B5944] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-transform active:scale-98 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Позвать друга</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Members / Sparks Feed */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/60 rounded-xl">
        <button
          onClick={() => setActiveSubTab('members')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
            activeSubTab === 'members'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Друзья в Круге ({members.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('sparks')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
            activeSubTab === 'sparks'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
          <span>Искры поддержки ({sparksFeed.length})</span>
        </button>
      </div>

      {/* TAB 1: Members Roster */}
      {activeSubTab === 'members' && (
        <div className="space-y-2.5">
          {members.map((member) => {
            const isMe = member.id === user.id;
            const isOwner = member.isOwner;

            return (
              <div
                key={member.id}
                className="p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-2xs flex items-center justify-between gap-3 relative"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#5B8266]/10 flex items-center justify-center text-2xl shrink-0 border border-[#5B8266]/15">
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-stone-900 truncate">
                        {member.name}
                      </h3>
                      {isOwner && (
                        <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-md font-medium flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> Создатель
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate mt-0.5">
                      {member.status}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1">
                      <span>Квестов на этой неделе:</span>
                      <strong className="text-[#486B52] tabular-nums font-semibold">
                        {member.completedThisWeek}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!isMe && (
                    <button
                      onClick={() => openSparkModal(member)}
                      className="px-2.5 py-1.5 bg-[#C86D51]/10 hover:bg-[#C86D51]/20 text-[#B35E44] rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
                      title="Отправить Искру поддержки"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Искра</span>
                    </button>
                  )}

                  {/* Creator / Member Menu */}
                  {!isMe && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setSelectedMemberMenu(selectedMemberMenu === member.id ? null : member.id)
                        }
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown */}
                      {selectedMemberMenu === member.id && (
                        <div className="absolute right-0 top-9 z-20 w-44 bg-white border border-stone-200 rounded-xl shadow-lg p-1 text-xs space-y-1">
                          <button
                            onClick={() => {
                              setSelectedMemberMenu(null);
                              openReportModal({
                                type: 'member',
                                id: member.id,
                                name: member.name,
                                preview: member.status,
                              });
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span>Пожаловаться</span>
                          </button>

                          {isCreator && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedMemberMenu(null);
                                  transferOwnership(member.id);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-stone-700 hover:bg-stone-50 flex items-center gap-1.5"
                              >
                                <Crown className="w-3.5 h-3.5 text-amber-600" />
                                <span>Сделать создателем</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedMemberMenu(null);
                                  kickMember(member.id);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-stone-700 hover:bg-stone-50 flex items-center gap-1.5"
                              >
                                <UserMinus className="w-3.5 h-3.5 text-stone-500" />
                                <span>Исключить из Круга</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Quick Invite slot if less than 10 */}
          {members.length < 10 && (
            <button
              onClick={openInviteModal}
              className="w-full p-3.5 border-2 border-dashed border-stone-300 hover:border-[#486B52] rounded-2xl text-stone-500 hover:text-[#486B52] flex items-center justify-center gap-2 text-xs font-semibold transition-colors bg-white/40"
            >
              <UserPlus className="w-4 h-4" />
              <span>Свободный слот (+{10 - members.length} мест) · Пригласить друга</span>
            </button>
          )}

          {/* Leave Circle (if not sole owner) */}
          <div className="pt-3 text-center">
            <button
              onClick={leaveCircle}
              className="text-stone-400 hover:text-red-600 text-xs inline-flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Покинуть этот круг</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Sparks Feed (Anti-Likes) */}
      {activeSubTab === 'sparks' && (
        <div className="space-y-3">
          {/* Anti-like explanation banner */}
          <div className="p-3 bg-[#FAF8F3] border border-[#C86D51]/20 rounded-xl flex items-start gap-2.5 text-xs">
            <Sparkles className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900">Искры вместо лайков:</strong>
              <p className="text-stone-600 text-[11px] mt-0.5 leading-normal">
                В CircleQuest нет публичных счетчиков «кто популярнее». Каждая Искра — это личная эмоциональная поддержка и теплый звук колокольчика.
              </p>
            </div>
          </div>

          {/* Sparks list */}
          {sparksFeed.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">
              Пока нет Искр. Отправьте первую поддержку другу!
            </div>
          ) : (
            sparksFeed.map((spark) => (
              <div
                key={spark.id}
                onClick={() => handlePlaySpark(spark.soundType)}
                className="p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-2xs hover:border-[#C86D51]/40 transition-all cursor-pointer space-y-2 group"
                title="Нажмите, чтобы прослушать аккорд Искры"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1 bg-stone-100 rounded-lg">
                      {spark.stickerEmoji}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        {spark.fromUserName} → {spark.toUserName}
                      </div>
                      <div className="text-[10px] text-stone-400 tabular-nums">
                        {spark.timestamp}
                        {spark.questTitle && ` · за «${spark.questTitle}»`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#C86D51] font-medium opacity-80 group-hover:opacity-100">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Слушать</span>
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl text-xs text-stone-700 border border-stone-100 flex items-center justify-between">
                  <span>{spark.customNote || spark.stickerTitle}</span>
                  <span className="text-xs font-semibold text-[#C86D51]">{spark.stickerTitle}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
