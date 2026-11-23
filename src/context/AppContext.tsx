/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  CircleMember,
  Quest,
  QuestProof,
  SparkMessage,
  SafetyReport,
  NotificationItem,
  DNDSchedule,
  ActiveSession,
  ParentSettings,
  SafeZone,
  GeneratedQuestPayload,
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
import { vibrateQuestComplete, vibrateSparkSent } from '../utils/haptics';
import {
  db,
  hashPin,
  migrateFromLocalStorageAndSeed,
  enqueueSyncOperation,
  resetDatabaseToSeed,
} from '../db/database';

interface AppContextType {
  isLoading: boolean;
  loadError: string | null;
  pendingSyncCount: number;
  isOnline: boolean;
  lastCachedAt: string;

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
  parentSettings: ParentSettings;
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
  activeParentDashboardModal: boolean;

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
  openParentDashboardModal: () => void;
  closeParentDashboardModal: () => void;

  completeQuest: (
    questId: string,
    comment: string,
    imageUrl?: string,
    blurred?: boolean,
    photoBlob?: Blob
  ) => void;
  addGeneratedQuest: (payload: GeneratedQuestPayload) => Promise<void>;
  sendSpark: (toMemberId: string, stickerId: string, customNote?: string, questTitle?: string) => void;
  submitReport: (reason: SafetyReport['reason'], details?: string, anonymous?: boolean) => void;
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

  // Parent Dashboard actions
  verifyParentPin: (pin: string) => Promise<boolean>;
  updateParentPin: (newPin: string) => Promise<boolean>;
  toggleAccountPause: (paused: boolean) => Promise<void>;
  addSafeZone: (zone: Omit<SafeZone, 'id' | 'createdAt'>) => Promise<void>;
  removeSafeZone: (zoneId: string) => Promise<void>;
  retryLoad: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_PARENT_SETTINGS: ParentSettings = {
  id: 'default',
  pinHash: '',
  paused: false,
  safeZones: [],
  updatedAt: '',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastCachedAt, setLastCachedAt] = useState<string>(() => new Date().toISOString());

  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [circleName, setCircleName] = useState<string>('Зелёный Патруль');
  const [circleCode, setCircleCode] = useState<string>('GREEN-842');
  const [members, setMembers] = useState<CircleMember[]>(INITIAL_MEMBERS);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [sparksFeed, setSparksFeed] = useState<SparkMessage[]>(INITIAL_SPARKS_FEED);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [reports, setReports] = useState<SafetyReport[]>(INITIAL_REPORTS);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [dnd, setDnd] = useState<DNDSchedule>(INITIAL_DND);
  const [parentSettings, setParentSettings] = useState<ParentSettings>(INITIAL_PARENT_SETTINGS);

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
  const [activeParentDashboardModal, setActiveParentDashboardModal] = useState<boolean>(false);

  const hydrateFromDb = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const state = await migrateFromLocalStorageAndSeed();
      setUser(state.user);
      setCircleName(state.circleName);
      setCircleCode(state.circleCode);
      setMembers(state.members);
      setQuests(state.quests);
      setSparksFeed(state.sparksFeed);
      setNotifications(state.notifications);
      setReports(state.reports);
      setSessions(state.sessions);
      setDnd(state.dnd);
      setParentSettings(state.parentSettings);
      setPendingSyncCount(state.pendingSyncCount);
      setLastCachedAt(state.lastCachedAt);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка инициализации локальной базы данных';
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrateFromDb();
  }, [hydrateFromDb]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueSync = useCallback(
    (
      action: string,
      entityType: Parameters<typeof enqueueSyncOperation>[1],
      entityId: string,
      payloadObj: unknown
    ) => {
      void enqueueSyncOperation(action, entityType, entityId, payloadObj).then(() => {
        setPendingSyncCount((prev) => prev + 1);
      });
    },
    []
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3800);
  }, []);

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

  const openParentDashboardModal = () => setActiveParentDashboardModal(true);
  const closeParentDashboardModal = () => setActiveParentDashboardModal(false);

  // Complete quest
  const completeQuest = (
    questId: string,
    comment: string,
    imageUrl?: string,
    blurred: boolean = false,
    photoBlob?: Blob
  ) => {
    if (parentSettings.paused) {
      showToast('Аккаунт временно поставлен на паузу в родительском контроле');
      return;
    }

    const newProof: QuestProof = {
      id: `proof_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      timestamp: 'Только что',
      comment: comment.trim() || undefined,
      imageUrl: imageUrl || undefined,
      photoBlob,
      blurred: imageUrl ? true : blurred,
      isBlurred: imageUrl ? true : blurred,
      verified: true,
    };

    let updatedQuestSnapshot: Quest | null = null;

    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== questId) return q;
        if (q.isCompletedByMe) {
          showToast('Квест уже отмечен вами как выполненный');
          return q;
        }

        const proofForQuestArray: QuestProof = {
          ...newProof,
          photoBlob: undefined,
        };

        updatedQuestSnapshot = {
          ...q,
          isCompletedByMe: true,
          completedCount: Math.min(q.targetCount, q.completedCount + 1),
          proofs: [proofForQuestArray, ...q.proofs],
        };
        return {
          ...updatedQuestSnapshot,
          proofs: [newProof, ...q.proofs],
        };
      })
    );

    const nextMembers = members.map((m) =>
      m.id === user.id ? { ...m, completedThisWeek: m.completedThisWeek + 1, status: 'Квест недели выполнен! 🌿' } : m
    );
    setMembers(nextMembers);

    const nextCachedAt = new Date().toISOString();
    setLastCachedAt(nextCachedAt);

    void (async () => {
      if (updatedQuestSnapshot) {
        await db.quests.put(updatedQuestSnapshot);
      }
      await db.proofs.put({ ...newProof, questId });
      await db.circles.put({
        id: 'default_circle',
        name: circleName,
        code: circleCode,
        members: nextMembers,
        lastCachedAt: nextCachedAt,
      });
      queueSync('COMPLETE_QUEST', 'proof', newProof.id, {
        questId,
        hasBlob: Boolean(photoBlob),
        blurred: Boolean(imageUrl),
      });
    })();

    playSuccessChime();
    vibrateQuestComplete();
    showToast('Квест засчитан в общий прогресс Круга! Командный вклад растет 🌟');
  };

  // Add AI-generated quest
  const addGeneratedQuest = async (payload: GeneratedQuestPayload): Promise<void> => {
    const newQuest: Quest = {
      id: `quest_ai_${Date.now()}`,
      type: payload.category.toLowerCase().includes('детокс') ? 'detox' : 'kindness',
      title: payload.title,
      category: payload.category,
      description: payload.description,
      duration: payload.duration,
      targetCount: Math.max(1, members.length),
      completedCount: 0,
      isCompletedByMe: false,
      requiresPhoto: payload.requiresPhoto,
      proofs: [],
      icon: 'sparkles',
      tips: payload.tips,
      createdByAi: true,
    };

    const nextCachedAt = new Date().toISOString();
    setLastCachedAt(nextCachedAt);
    setQuests((prev) => [newQuest, ...prev]);
    await db.quests.put(newQuest);
    await db.circles.put({
      id: 'default_circle',
      name: circleName,
      code: circleCode,
      members,
      lastCachedAt: nextCachedAt,
    });
    queueSync('CREATE_AI_QUEST', 'quest', newQuest.id, newQuest);
    playSuccessChime();
    vibrateQuestComplete();
    showToast(`Добавлен новый квест для круга: «${newQuest.title}» ✨`);
  };

  // Send Spark
  const sendSpark = (toMemberId: string, stickerId: string, customNote?: string, questTitle?: string) => {
    if (parentSettings.paused) {
      showToast('Аккаунт временно поставлен на паузу в родительском контроле');
      return;
    }

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
    void db.sparks.put(newSpark);
    queueSync('SEND_SPARK', 'spark', newSpark.id, newSpark);

    playSparkTone(sticker.soundType);
    vibrateSparkSent();
    closeSparkModal();
    showToast(`Искра «${sticker.title}» бережно отправлена для ${targetMember.name} 💫`);
  };

  // Submit Safety Report (2-click)
  const submitReport = (reason: SafetyReport['reason'], details?: string, anonymous: boolean = true) => {
    if (!activeReportTarget) return;

    const newReport: SafetyReport = {
      id: `rep_${Date.now()}`,
      targetType: activeReportTarget.type,
      targetId: activeReportTarget.id,
      targetPreview: activeReportTarget.preview,
      targetAuthorName: activeReportTarget.name,
      reporterId: anonymous ? 'anonymous' : user.id,
      reason,
      details: details?.trim() || undefined,
      anonymous,
      status: 'pending',
      createdAt: 'Только что',
    };

    setReports((prev) => [newReport, ...prev]);
    void db.reports.put(newReport);
    queueSync('SUBMIT_REPORT', 'report', newReport.id, newReport);

    closeReportModal();
    showToast(
      anonymous
        ? 'Анонимная жалоба принята. Модераторы бережно проверят контент 🛡️'
        : 'Жалоба принята. Модераторы КругоКвеста бережно проверят контент 🛡️'
    );
  };

  // Moderator resolution
  const resolveReport = (reportId: string, action: 'hide' | 'warn' | 'dismiss', moderatorNote?: string) => {
    const targetReport = reports.find((r) => r.id === reportId);
    const statusMap = {
      hide: 'resolved_hidden' as const,
      warn: 'resolved_warned' as const,
      dismiss: 'resolved_dismissed' as const,
    };
    const nextStatus = statusMap[action];
    const resolvedNote =
      moderatorNote ||
      (action === 'hide' ? 'Контент скрыт из-за нарушения правил приватности' : 'Предупреждение автору');

    setReports((prev) =>
      prev.map((rep) =>
        rep.id === reportId
          ? {
              ...rep,
              status: nextStatus,
              moderatorNote: resolvedNote,
            }
          : rep
      )
    );

    if (targetReport) {
      const updatedRep: SafetyReport = {
        ...targetReport,
        status: nextStatus,
        moderatorNote: resolvedNote,
      };
      void db.reports.put(updatedRep);

      const statusNotification: NotificationItem = {
        id: `notif_rep_${Date.now()}`,
        type: 'gentle_reminder',
        title: 'Обновление по обращению в модерацию',
        body:
          action === 'hide'
            ? `Контент (${targetReport.targetAuthorName}) скрыт для защиты приватности.`
            : action === 'warn'
            ? `Автору (${targetReport.targetAuthorName}) направлено бережное напоминание о правилах.`
            : 'Модератор проверил обращение и оставил контент без изменений.',
        timestamp: 'Только что',
        read: false,
      };
      setNotifications((prev) => [statusNotification, ...prev]);
      void db.notifications.put(statusNotification);
    }

    if (action === 'hide' && targetReport && targetReport.targetType === 'proof') {
      setQuests((prev) =>
        prev.map((q) => {
          const filtered = q.proofs.filter((p) => p.id !== targetReport.targetId);
          if (filtered.length !== q.proofs.length) {
            const nextQ = { ...q, proofs: filtered };
            void db.quests.put(nextQ);
            return nextQ;
          }
          return q;
        })
      );
      void db.proofs.delete(targetReport.targetId);
    }

    showToast(
      `Решение по жалобе зафиксировано: ${
        action === 'hide' ? 'Контент скрыт' : action === 'warn' ? 'Вынесено предупреждение' : 'Жалоба отклонена'
      }`
    );
  };

  // Appeal flow
  const submitAppeal = (reportId: string, appealText: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const updated: SafetyReport = {
          ...r,
          appealed: true,
          appealText,
          appealStatus: 'pending',
        };
        void db.reports.put(updated);
        return updated;
      })
    );
    showToast('Апелляция отправлена на повторное рассмотрение старшим модератором');
  };

  const resolveAppeal = (reportId: string, approved: boolean) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const updated: SafetyReport = {
          ...r,
          appealStatus: approved ? 'approved' : 'rejected',
          status: approved ? 'resolved_dismissed' : r.status,
        };
        void db.reports.put(updated);
        return updated;
      })
    );
    showToast(`Апелляция ${approved ? 'удовлетворена, контент восстановлен' : 'отклонена'}`);
  };

  // Parental Consent
  const submitParentConsent = (parentEmail: string) => {
    const nextUser: UserProfile = {
      ...user,
      parentConsentVerified: true,
      parentEmail,
    };
    setUser(nextUser);
    void db.users.put(nextUser);
    queueSync('PARENT_CONSENT', 'user', nextUser.id, { parentEmail });
    closeParentConsentModal();
    showToast('Согласие родителя успешно подтверждено! Все защитные функции активны.');
  };

  // Update DND
  const updateDND = (schedule: Partial<DNDSchedule>) => {
    const nextDnd: DNDSchedule = { ...dnd, ...schedule };
    setDnd(nextDnd);
    void db.dnd.put({ id: 'default', ...nextDnd });
    queueSync('UPDATE_DND', 'dnd', 'default', nextDnd);
    showToast('Расписание тихих часов обновлено');
  };

  // Update User
  const updateUser = (updates: Partial<UserProfile>) => {
    const nextUser: UserProfile = { ...user, ...updates };
    if (updates.age && updates.age < 14 && !user.parentConsentVerified) {
      setActiveParentConsentModal(true);
    }
    setUser(nextUser);
    void db.users.put(nextUser);

    if (updates.name || updates.avatar) {
      const nextMembers = members.map((m) =>
        m.id === user.id
          ? {
              ...m,
              name: updates.name ? `${updates.name} (Вы)` : m.name,
              avatar: updates.avatar || m.avatar,
            }
          : m
      );
      setMembers(nextMembers);
      void db.circles.put({
        id: 'default_circle',
        name: circleName,
        code: circleCode,
        members: nextMembers,
      });
    }
    queueSync('UPDATE_USER', 'user', nextUser.id, updates);
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
    const nextMembers = [...members, newMember];
    const nextQuests = quests.map((q) => ({
      ...q,
      targetCount: Math.min(10, q.targetCount + 1),
    }));
    setMembers(nextMembers);
    setQuests(nextQuests);

    void db.circles.put({
      id: 'default_circle',
      name: circleName,
      code: circleCode,
      members: nextMembers,
    });
    void db.quests.bulkPut(nextQuests);
    queueSync('INVITE_MEMBER', 'circle', newId, newMember);

    showToast(`${name} добавлен в ваш Круг! Всего участников: ${members.length + 1}/10`);
    return true;
  };

  // Kick member
  const kickMember = (memberId: string) => {
    if (memberId === user.id) return;
    const memberName = members.find((m) => m.id === memberId)?.name || 'Участник';
    const nextMembers = members.filter((m) => m.id !== memberId);
    const nextQuests = quests.map((q) => {
      const nextTarget = Math.max(1, q.targetCount - 1);
      return {
        ...q,
        targetCount: nextTarget,
        completedCount: Math.min(nextTarget, q.completedCount),
      };
    });

    setMembers(nextMembers);
    setQuests(nextQuests);

    void db.circles.put({
      id: 'default_circle',
      name: circleName,
      code: circleCode,
      members: nextMembers,
    });
    void db.quests.bulkPut(nextQuests);
    showToast(`${memberName} исключен из Круга`);
  };

  // Leave circle
  const leaveCircle = () => {
    const nextMembers = members.filter((m) => m.id !== user.id);
    setMembers(nextMembers);
    void db.circles.put({
      id: 'default_circle',
      name: circleName,
      code: circleCode,
      members: nextMembers,
    });
    showToast('Вы покинули Круг');
  };

  // Transfer ownership
  const transferOwnership = (newOwnerId: string) => {
    const nextMembers = members.map((m) => ({
      ...m,
      isOwner: m.id === newOwnerId,
    }));
    const nextUser: UserProfile = {
      ...user,
      role: user.id === newOwnerId ? 'creator' : 'member',
    };
    setMembers(nextMembers);
    setUser(nextUser);
    void db.circles.put({
      id: 'default_circle',
      name: circleName,
      code: circleCode,
      members: nextMembers,
    });
    void db.users.put(nextUser);
    showToast('Права создателя Круга переданы');
  };

  // Session terminate
  const terminateSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    void db.sessions.delete(sessionId);
    showToast('Сессия на устройстве завершена');
  };

  const terminateAllOtherSessions = () => {
    const currentSessions = sessions.filter((s) => s.isCurrent);
    setSessions(currentSessions);
    void db.sessions.clear().then(() => db.sessions.bulkPut(currentSessions));
    showToast('Все другие активные устройства отключены');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const next = { ...n, read: true };
        void db.notifications.put(next);
        return next;
      })
    );
  };

  const markAllNotificationsRead = () => {
    const nextList = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(nextList);
    void db.notifications.bulkPut(nextList);
    showToast('Все уведомления прочитаны');
  };

  // Parent Dashboard actions
  const verifyParentPin = async (pin: string): Promise<boolean> => {
    const hashed = await hashPin(pin);
    return hashed === parentSettings.pinHash;
  };

  const updateParentPin = async (newPin: string): Promise<boolean> => {
    const hashed = await hashPin(newPin);
    const updated: ParentSettings = {
      ...parentSettings,
      pinHash: hashed,
      updatedAt: new Date().toISOString(),
    };
    setParentSettings(updated);
    await db.parentSettings.put(updated);
    queueSync('UPDATE_PARENT_PIN', 'parentSettings', updated.id, { updatedAt: updated.updatedAt });
    showToast('Родительский PIN-код успешно обновлён');
    return true;
  };

  const toggleAccountPause = async (paused: boolean): Promise<void> => {
    const updated: ParentSettings = {
      ...parentSettings,
      paused,
      updatedAt: new Date().toISOString(),
    };
    setParentSettings(updated);
    await db.parentSettings.put(updated);
    queueSync('TOGGLE_PAUSE', 'parentSettings', updated.id, { paused });
    showToast(paused ? 'Аккаунт поставлен на паузу' : 'Аккаунт снова активен');
  };

  const addSafeZone = async (zone: Omit<SafeZone, 'id' | 'createdAt'>): Promise<void> => {
    const newZone: SafeZone = {
      ...zone,
      id: `zone_${Date.now()}`,
      createdAt: 'Добавлено родителем',
    };
    const updated: ParentSettings = {
      ...parentSettings,
      safeZones: [newZone, ...parentSettings.safeZones],
      updatedAt: new Date().toISOString(),
    };
    setParentSettings(updated);
    await db.parentSettings.put(updated);
    queueSync('ADD_SAFE_ZONE', 'parentSettings', newZone.id, newZone);
    showToast(`Безопасная зона «${newZone.name}» добавлена`);
  };

  const removeSafeZone = async (zoneId: string): Promise<void> => {
    const updated: ParentSettings = {
      ...parentSettings,
      safeZones: parentSettings.safeZones.filter((z) => z.id !== zoneId),
      updatedAt: new Date().toISOString(),
    };
    setParentSettings(updated);
    await db.parentSettings.put(updated);
    queueSync('REMOVE_SAFE_ZONE', 'parentSettings', zoneId, { zoneId });
    showToast('Безопасная зона удалена');
  };

  // Reset to seed data
  const resetAllData = () => {
    void resetDatabaseToSeed().then((state) => {
      setUser(state.user);
      setCircleName(state.circleName);
      setCircleCode(state.circleCode);
      setMembers(state.members);
      setQuests(state.quests);
      setSparksFeed(state.sparksFeed);
      setNotifications(state.notifications);
      setReports(state.reports);
      setSessions(state.sessions);
      setDnd(state.dnd);
      setParentSettings(state.parentSettings);
      setPendingSyncCount(0);
      setActiveTab('quests');
      setRoleMode('user');
      showToast('База данных сброшена к начальному состоянию');
    });
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        loadError,
        pendingSyncCount,
        isOnline,
        lastCachedAt,
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
        parentSettings,
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
        activeParentDashboardModal,

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
        openParentDashboardModal,
        closeParentDashboardModal,

        completeQuest,
        addGeneratedQuest,
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

        verifyParentPin,
        updateParentPin,
        toggleAccountPause,
        addSafeZone,
        removeSafeZone,
        retryLoad: hydrateFromDb,
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
