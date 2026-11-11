/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  CircleMember,
  Quest,
  SparkMessage,
  SafetyReport,
  NotificationItem,
  DNDSchedule,
  ActiveSession,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_MEMBERS,
  INITIAL_QUESTS,
  INITIAL_SPARKS_FEED,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_SESSIONS,
  INITIAL_DND,
  INITIAL_SPARK_STICKERS,
} from '../utils/mockData';
import { playSparkTone, playSuccessChime } from '../utils/audio';

interface AppContextType {
  user: UserProfile;
  circleName: string;
  circleCode: string;
  members: CircleMember[];
  quests: Quest[];
  sparksFeed: SparkMessage[];
  notifications: NotificationItem[];
  reports: SafetyReport[];
  sessions: ActiveSession[];
  dnd: DNDSchedule;
  activeTab: 'quests' | 'circle' | 'map' | 'profile';
  roleMode: 'user' | 'moderator';
  toast: string | null;
  
  // Modals
  activeDetoxModal: boolean;
  activeSparkRecipient: CircleMember | null;
  activeReportTarget: { type: 'proof' | 'member' | 'spark'; id: string; name: string; preview: string } | null;
  activeParentConsentModal: boolean;
  activePrivacyPolicyModal: boolean;
  activeInviteModal: boolean;
  activeModeratorModal: boolean;

  // Actions
  setActiveTab: (tab: 'quests' | 'circle' | 'map' | 'profile') => void;
  setRoleMode: (mode: 'user' | 'moderator') => void;
  showToast: (msg: string) => void;
  openDetoxModal: () => void;
  closeDetoxModal: () => void;
  openSparkModal: (recipient: CircleMember) => void;
  closeSparkModal: () => void;
  openReportModal: (target: { type: 'proof' | 'member' | 'spark'; id: string; name: string; preview: string }) => void;
  closeReportModal: () => void;
  openParentConsentModal: () => void;
  closeParentConsentModal: () => void;
  openPrivacyPolicyModal: () => void;
  closePrivacyPolicyModal: () => void;
  openInviteModal: () => void;
  closeInviteModal: () => void;
  openModeratorModal: () => void;
  closeModeratorModal: () => void;

  completeQuest: (questId: string, comment: string, imageUrl?: string, blurred?: boolean) => void;
  sendSpark: (toMemberId: string, stickerId: string, customNote?: string, questTitle?: string) => void;
  submitReport: (reason: SafetyReport['reason'], details?: string) => void;
  resolveReport: (reportId: string, action: 'hide' | 'warn' | 'dismiss', moderatorNote?: string) => void;
  submitAppeal: (reportId: string, appealText: string) => void;
  resolveAppeal: (reportId: string, approved: boolean) => void;
  submitParentConsent: (parentEmail: string) => void;
  updateDND: (schedule: Partial<DNDSchedule>) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  inviteMemberByName: (name: string, avatar?: string) => boolean;
  kickMember: (memberId: string) => void;
  leaveCircle: () => void;
  transferOwnership: (newOwnerId: string) => void;
  terminateSession: (sessionId: string) => void;
  terminateAllOtherSessions: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'circlequest_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [circleName, setCircleName] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_circlename`) || 'Зелёный Патруль';
  });

  const [circleCode, setCircleCode] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_circlecode`) || 'GREEN-842';
  });

  const [members, setMembers] = useState<CircleMember[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_members`);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_quests`);
    return saved ? JSON.parse(saved) : INITIAL_QUESTS;
  });

  const [sparksFeed, setSparksFeed] = useState<SparkMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sparks`);
    return saved ? JSON.parse(saved) : INITIAL_SPARKS_FEED;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [reports, setReports] = useState<SafetyReport[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_reports`);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [sessions, setSessions] = useState<ActiveSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [dnd, setDnd] = useState<DNDSchedule>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_dnd`);
    return saved ? JSON.parse(saved) : INITIAL_DND;
  });

  const [activeTab, setActiveTab] = useState<'quests' | 'circle' | 'map' | 'profile'>('quests');
  const [roleMode, setRoleMode] = useState<'user' | 'moderator'>('user');
  const [toast, setToast] = useState<string | null>(null);

  // Modals state
  const [activeDetoxModal, setActiveDetoxModal] = useState<boolean>(false);
  const [activeSparkRecipient, setActiveSparkRecipient] = useState<CircleMember | null>(null);
  const [activeReportTarget, setActiveReportTarget] = useState<{
    type: 'proof' | 'member' | 'spark';
    id: string;
    name: string;
    preview: string;
  } | null>(null);
  const [activeParentConsentModal, setActiveParentConsentModal] = useState<boolean>(false);
  const [activePrivacyPolicyModal, setActivePrivacyPolicyModal] = useState<boolean>(false);
  const [activeInviteModal, setActiveInviteModal] = useState<boolean>(false);
  const [activeModeratorModal, setActiveModeratorModal] = useState<boolean>(false);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(user));
      localStorage.setItem(`${STORAGE_KEY}_circlename`, circleName);
      localStorage.setItem(`${STORAGE_KEY}_circlecode`, circleCode);
      localStorage.setItem(`${STORAGE_KEY}_members`, JSON.stringify(members));
      localStorage.setItem(`${STORAGE_KEY}_quests`, JSON.stringify(quests));
      localStorage.setItem(`${STORAGE_KEY}_sparks`, JSON.stringify(sparksFeed));
      localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_reports`, JSON.stringify(reports));
      localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(sessions));
      localStorage.setItem(`${STORAGE_KEY}_dnd`, JSON.stringify(dnd));
    } catch {
      // Ignore storage quota or sandbox restrictions
    }
  }, [user, circleName, circleCode, members, quests, sparksFeed, notifications, reports, sessions, dnd]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3800);
  };

  const openDetoxModal = () => setActiveDetoxModal(true);
  const closeDetoxModal = () => setActiveDetoxModal(false);

  const openSparkModal = (recipient: CircleMember) => setActiveSparkRecipient(recipient);
  const closeSparkModal = () => setActiveSparkRecipient(null);

  const openReportModal = (target: { type: 'proof' | 'member' | 'spark'; id: string; name: string; preview: string }) => {
    setActiveReportTarget(target);
  };
  const closeReportModal = () => setActiveReportTarget(null);

  const openParentConsentModal = () => setActiveParentConsentModal(true);
  const closeParentConsentModal = () => setActiveParentConsentModal(false);

  const openPrivacyPolicyModal = () => setActivePrivacyPolicyModal(true);
  const closePrivacyPolicyModal = () => setActivePrivacyPolicyModal(false);

  const openInviteModal = () => setActiveInviteModal(true);
  const closeInviteModal = () => setActiveInviteModal(false);

  const openModeratorModal = () => setActiveModeratorModal(true);
  const closeModeratorModal = () => setActiveModeratorModal(false);

  // Complete quest
  const completeQuest = (questId: string, comment: string, imageUrl?: string, blurred: boolean = false) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== questId) return q;
        if (q.isCompletedByMe) {
          showToast('Квест уже отмечен вами как выполненный');
          return q;
        }

        const newProof = {
          id: `proof_${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          timestamp: 'Только что',
          comment: comment.trim() || undefined,
          imageUrl: imageUrl || undefined,
          blurred,
          verified: true,
        };

        return {
          ...q,
          isCompletedByMe: true,
          completedCount: Math.min(q.targetCount, q.completedCount + 1),
          proofs: [newProof, ...q.proofs],
        };
      })
    );

    // Update user stats in members list
    setMembers((prev) =>
      prev.map((m) =>
        m.id === user.id ? { ...m, completedThisWeek: m.completedThisWeek + 1, status: 'Квест недели выполнен! 🌿' } : m
      )
    );

    playSuccessChime();
    showToast('Квест засчитан в общий прогресс Круга! Командный вклад растет 🌟');
  };

  // Send Spark
  const sendSpark = (toMemberId: string, stickerId: string, customNote?: string, questTitle?: string) => {
    const targetMember = members.find((m) => m.id === toMemberId);
    if (!targetMember) return;

    const sticker = INITIAL_SPARK_STICKERS.find((s) => s.id === stickerId) || INITIAL_SPARK_STICKERS[0];

    const newSpark: SparkMessage = {
      id: `spark_${Date.now()}`,
      fromUserId: user.id,
      fromUserName: user.name,
      fromUserAvatar: user.avatar,
      toUserId: targetMember.id,
      toUserName: targetMember.name,
      stickerId: sticker.id,
      stickerTitle: sticker.title,
      stickerEmoji: sticker.emoji,
      stickerColor: sticker.color,
      soundType: sticker.soundType,
      questTitle: questTitle || undefined,
      customNote: customNote?.trim() || sticker.message,
      timestamp: 'Только что',
      read: true,
    };

    setSparksFeed((prev) => [newSpark, ...prev]);
    playSparkTone(sticker.soundType);
    closeSparkModal();
    showToast(`Искра «${sticker.title}» бережно отправлена для ${targetMember.name} 💫`);
  };

  // Submit Safety Report (2-click)
  const submitReport = (reason: SafetyReport['reason'], details?: string) => {
    if (!activeReportTarget) return;

    const newReport: SafetyReport = {
      id: `rep_${Date.now()}`,
      targetType: activeReportTarget.type,
      targetId: activeReportTarget.id,
      targetPreview: activeReportTarget.preview,
      targetAuthorName: activeReportTarget.name,
      reporterId: user.id,
      reason,
      details: details?.trim() || undefined,
      status: 'pending',
      createdAt: 'Только что',
    };

    setReports((prev) => [newReport, ...prev]);
    closeReportModal();
    showToast('Жалоба принята. Модераторы КругоКвеста бережно проверят контент 🛡️');
  };

  // Moderator resolution
  const resolveReport = (reportId: string, action: 'hide' | 'warn' | 'dismiss', moderatorNote?: string) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id !== reportId) return rep;
        const statusMap = {
          hide: 'resolved_hidden' as const,
          warn: 'resolved_warned' as const,
          dismiss: 'resolved_dismissed' as const,
        };
        return {
          ...rep,
          status: statusMap[action],
          moderatorNote: moderatorNote || (action === 'hide' ? 'Контент скрыт из-за нарушения правил приватности' : 'Предупреждение автору'),
        };
      })
    );

    // If hidden, hide the proof from quests
    if (action === 'hide') {
      const rep = reports.find((r) => r.id === reportId);
      if (rep && rep.targetType === 'proof') {
        setQuests((prev) =>
          prev.map((q) => ({
            ...q,
            proofs: q.proofs.filter((p) => p.id !== rep.targetId),
          }))
        );
      }
    }

    showToast(`Решение по жалобе зафиксировано: ${action === 'hide' ? 'Контент скрыт' : action === 'warn' ? 'Вынесено предупреждение' : 'Жалоба отклонена'}`);
  };

  // Appeal flow
  const submitAppeal = (reportId: string, appealText: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              appealed: true,
              appealText,
              appealStatus: 'pending',
            }
          : r
      )
    );
    showToast('Апелляция отправлена на повторное рассмотрение старшим модератором');
  };

  const resolveAppeal = (reportId: string, approved: boolean) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              appealStatus: approved ? 'approved' : 'rejected',
              status: approved ? 'resolved_dismissed' : r.status,
            }
          : r
      )
    );
    showToast(`Апелляция ${approved ? 'удовлетворена, контент восстановлен' : 'отклонена'}`);
  };

  // Parental Consent
  const submitParentConsent = (parentEmail: string) => {
    setUser((prev) => ({
      ...prev,
      parentConsentVerified: true,
      parentEmail,
    }));
    closeParentConsentModal();
    showToast('Согласие родителя успешно подтверждено! Все защитные функции активны.');
  };

  // Update DND
  const updateDND = (schedule: Partial<DNDSchedule>) => {
    setDnd((prev) => ({ ...prev, ...schedule }));
    showToast('Расписание тихих часов обновлено');
  };

  // Update User
  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      // Check if age updated < 14
      if (updates.age && updates.age < 14 && !prev.parentConsentVerified) {
        setActiveParentConsentModal(true);
      }
      return updated;
    });
    // Sync with members
    if (updates.name || updates.avatar) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === user.id
            ? {
                ...m,
                name: updates.name ? `${updates.name} (Вы)` : m.name,
                avatar: updates.avatar || m.avatar,
              }
            : m
        )
      );
    }
    showToast('Профиль сохранен');
  };

  // Invite member
  const inviteMemberByName = (name: string, avatar: string = '🌱'): boolean => {
    if (members.length >= 10) {
      showToast('В Круге уже максимум — 10 участников!');
      return false;
    }
    const newId = `user_${Date.now()}`;
    const newMember: CircleMember = {
      id: newId,
      name: name.trim(),
      avatar,
      status: 'Присоединился к Кругу 🌿',
      completedThisWeek: 0,
    };
    setMembers((prev) => [...prev, newMember]);
    setQuests((prev) =>
      prev.map((q) => ({
        ...q,
        targetCount: Math.min(10, q.targetCount + 1),
      }))
    );
    showToast(`${name} добавлен в ваш Круг! Всего участников: ${members.length + 1}/10`);
    return true;
  };

  // Kick member
  const kickMember = (memberId: string) => {
    if (memberId === user.id) return;
    const memberName = members.find((m) => m.id === memberId)?.name || 'Участник';
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setQuests((prev) =>
      prev.map((q) => ({
        ...q,
        targetCount: Math.max(1, q.targetCount - 1),
        completedCount: Math.min(Math.max(1, q.targetCount - 1), q.completedCount),
      }))
    );
    showToast(`${memberName} исключен из Круга`);
  };

  // Leave circle
  const leaveCircle = () => {
    setMembers((prev) => prev.filter((m) => m.id !== user.id));
    showToast('Вы покинули Круг');
  };

  // Transfer ownership
  const transferOwnership = (newOwnerId: string) => {
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        isOwner: m.id === newOwnerId,
      }))
    );
    setUser((prev) => ({
      ...prev,
      role: prev.id === newOwnerId ? 'creator' : 'member',
    }));
    showToast('Права создателя Круга переданы');
  };

  // Session terminate
  const terminateSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast('Сессия на устройстве завершена');
  };

  const terminateAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showToast('Все другие активные устройства отключены');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Все уведомления прочитаны');
  };

  // Reset to seed data
  const resetAllData = () => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setCircleName('Зелёный Патруль');
    setCircleCode('GREEN-842');
    setMembers(INITIAL_MEMBERS);
    setQuests(INITIAL_QUESTS);
    setSparksFeed(INITIAL_SPARKS_FEED);
    setNotifications(INITIAL_NOTIFICATIONS);
    setReports(INITIAL_REPORTS);
    setSessions(INITIAL_SESSIONS);
    setDnd(INITIAL_DND);
    setActiveTab('quests');
    setRoleMode('user');
    showToast('Данные сброшены к начальному состоянию');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        circleName,
        circleCode,
        members,
        quests,
        sparksFeed,
        notifications,
        reports,
        sessions,
        dnd,
        activeTab,
        roleMode,
        toast,
        activeDetoxModal,
        activeSparkRecipient,
        activeReportTarget,
        activeParentConsentModal,
        activePrivacyPolicyModal,
        activeInviteModal,
        activeModeratorModal,

        setActiveTab,
        setRoleMode,
        showToast,
        openDetoxModal,
        closeDetoxModal,
        openSparkModal,
        closeSparkModal,
        openReportModal,
        closeReportModal,
        openParentConsentModal,
        closeParentConsentModal,
        openPrivacyPolicyModal,
        closePrivacyPolicyModal,
        openInviteModal,
        closeInviteModal,
        openModeratorModal,
        closeModeratorModal,

        completeQuest,
        sendSpark,
        submitReport,
        resolveReport,
        submitAppeal,
        resolveAppeal,
        submitParentConsent,
        updateDND,
        updateUser,
        inviteMemberByName,
        kickMember,
        leaveCircle,
        transferOwnership,
        terminateSession,
        terminateAllOtherSessions,
        markNotificationRead,
        markAllNotificationsRead,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
