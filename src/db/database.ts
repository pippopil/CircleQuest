/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dexie, { type Table } from 'dexie';
import {
  ActiveSession,
  CircleMember,
  DNDSchedule,
  NotificationItem,
  ParentSettings,
  Quest,
  QuestProof,
  SafetyReport,
  SafeZone,
  SparkMessage,
  SyncQueueItem,
  UserProfile,
} from '../types';
import {
  INITIAL_DND,
  INITIAL_MEMBERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_QUESTS,
  INITIAL_REPORTS,
  INITIAL_SESSIONS,
  INITIAL_SPARKS_FEED,
  INITIAL_USER,
} from '../utils/mockData';

export interface CircleRecord {
  id: string;
  name: string;
  code: string;
  members: CircleMember[];
  lastCachedAt?: string;
}

export interface ProofRecord extends QuestProof {
  questId: string;
}

export interface DndRecord extends DNDSchedule {
  id: string;
}

class CircleQuestDatabase extends Dexie {
  users!: Table<UserProfile, string>;
  circles!: Table<CircleRecord, string>;
  quests!: Table<Quest, string>;
  proofs!: Table<ProofRecord, string>;
  sparks!: Table<SparkMessage, string>;
  reports!: Table<SafetyReport, string>;
  notifications!: Table<NotificationItem, string>;
  sessions!: Table<ActiveSession, string>;
  dnd!: Table<DndRecord, string>;
  parentSettings!: Table<ParentSettings, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('CircleQuestDB');
    this.version(1).stores({
      users: 'id',
      circles: 'id',
      quests: 'id, type',
      proofs: 'id, questId, userId',
      sparks: 'id, toUserId, fromUserId',
      reports: 'id, status, targetId',
      notifications: 'id, read',
      sessions: 'id, isCurrent',
      dnd: 'id',
      parentSettings: 'id',
      syncQueue: '++id, entityType, synced, createdAt',
    });
  }
}

export const db = new CircleQuestDatabase();

const LEGACY_STORAGE_PREFIX = 'circlequest_state_v1';

const DEFAULT_SAFE_ZONES: SafeZone[] = [
  {
    id: 'zone_school',
    name: 'Школа и сквер рядом',
    latitude: 55.7558,
    longitude: 37.6173,
    radiusMeters: 350,
    createdAt: 'По умолчанию',
  },
  {
    id: 'zone_park',
    name: 'Домашний двор и парк',
    latitude: 55.7512,
    longitude: 37.6285,
    radiusMeters: 500,
    createdAt: 'По умолчанию',
  },
];

export async function hashPin(pin: string): Promise<string> {
  const normalized = pin.trim();
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`circlequest_pin_salt_${normalized}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic fallback for restricted non-secure environments
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return `fallback_${hash.toString(16)}`;
}

function readLegacyJson<T>(suffix: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${LEGACY_STORAGE_PREFIX}_${suffix}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readLegacyString(suffix: string, fallback: string): string {
  try {
    return localStorage.getItem(`${LEGACY_STORAGE_PREFIX}_${suffix}`) || fallback;
  } catch {
    return fallback;
  }
}

function clearLegacyLocalStorage(): void {
  try {
    const suffixes = [
      'user',
      'circlename',
      'circlecode',
      'members',
      'quests',
      'sparks',
      'notifs',
      'reports',
      'sessions',
      'dnd',
    ];
    for (const suffix of suffixes) {
      localStorage.removeItem(`${LEGACY_STORAGE_PREFIX}_${suffix}`);
    }
  } catch {
    // Ignore storage cleanup errors
  }
}

export interface HydratedAppState {
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
  pendingSyncCount: number;
  lastCachedAt: string;
}

export async function createDefaultParentSettings(): Promise<ParentSettings> {
  return {
    id: 'default',
    pinHash: await hashPin('1234'),
    paused: false,
    safeZones: DEFAULT_SAFE_ZONES,
    updatedAt: new Date().toISOString(),
  };
}

export async function migrateFromLocalStorageAndSeed(): Promise<HydratedAppState> {
  const existingUsersCount = await db.users.count();

  if (existingUsersCount === 0) {
    const user = readLegacyJson<UserProfile>('user', INITIAL_USER);
    const circleName = readLegacyString('circlename', 'Зелёный Патруль');
    const circleCode = readLegacyString('circlecode', 'GREEN-842');
    const members = readLegacyJson<CircleMember[]>('members', INITIAL_MEMBERS);
    const quests = readLegacyJson<Quest[]>('quests', INITIAL_QUESTS);
    const sparksFeed = readLegacyJson<SparkMessage[]>('sparks', INITIAL_SPARKS_FEED);
    const notifications = readLegacyJson<NotificationItem[]>('notifs', INITIAL_NOTIFICATIONS);
    const reports = readLegacyJson<SafetyReport[]>('reports', INITIAL_REPORTS);
    const sessions = readLegacyJson<ActiveSession[]>('sessions', INITIAL_SESSIONS);
    const dnd = readLegacyJson<DNDSchedule>('dnd', INITIAL_DND);
    const defaultParent = await createDefaultParentSettings();

    const flattenedProofs: ProofRecord[] = quests.flatMap((q) =>
      q.proofs.map((p) => ({
        ...p,
        questId: q.id,
      }))
    );

    await db.transaction(
      'rw',
      [
        db.users,
        db.circles,
        db.quests,
        db.proofs,
        db.sparks,
        db.reports,
        db.notifications,
        db.sessions,
        db.dnd,
        db.parentSettings,
      ],
      async () => {
        await db.users.put(user);
        await db.circles.put({
          id: 'default_circle',
          name: circleName,
          code: circleCode,
          members,
          lastCachedAt: new Date().toISOString(),
        });
        await db.quests.bulkPut(quests);
        if (flattenedProofs.length > 0) {
          await db.proofs.bulkPut(flattenedProofs);
        }
        if (sparksFeed.length > 0) {
          await db.sparks.bulkPut(sparksFeed);
        }
        if (notifications.length > 0) {
          await db.notifications.bulkPut(notifications);
        }
        if (reports.length > 0) {
          await db.reports.bulkPut(reports);
        }
        if (sessions.length > 0) {
          await db.sessions.bulkPut(sessions);
        }
        await db.dnd.put({ id: 'default', ...dnd });
        await db.parentSettings.put(defaultParent);
      }
    );

    clearLegacyLocalStorage();
  }

  const [
    users,
    circle,
    quests,
    proofs,
    sparksFeed,
    notifications,
    reports,
    sessions,
    dndRecord,
    parentRecord,
    pendingSyncCount,
  ] = await Promise.all([
    db.users.toArray(),
    db.circles.get('default_circle'),
    db.quests.toArray(),
    db.proofs.toArray(),
    db.sparks.toArray(),
    db.notifications.toArray(),
    db.reports.toArray(),
    db.sessions.toArray(),
    db.dnd.get('default'),
    db.parentSettings.get('default'),
    db.syncQueue.filter((item) => !item.synced).count().catch(() => 0),
  ]);

  const fallbackParent = parentRecord || (await createDefaultParentSettings());
  if (!parentRecord) {
    await db.parentSettings.put(fallbackParent);
  }

  // Hydrate proofs with Blob URLs if photoBlob exists without data URL
  const hydratedQuests = quests.map((quest) => {
    const questProofs = proofs.filter((p) => p.questId === quest.id);
    if (questProofs.length === 0) return quest;

    const mergedProofs = quest.proofs.map((existing) => {
      const dbProof = questProofs.find((p) => p.id === existing.id);
      if (!dbProof) return existing;
      if (!existing.imageUrl && dbProof.photoBlob) {
        return {
          ...existing,
          photoBlob: dbProof.photoBlob,
          imageUrl: URL.createObjectURL(dbProof.photoBlob),
          blurred: true,
          isBlurred: true,
        };
      }
      return {
        ...existing,
        photoBlob: dbProof.photoBlob,
      };
    });

    return {
      ...quest,
      proofs: mergedProofs,
    };
  });

  const dnd: DNDSchedule = dndRecord
    ? {
        enabled: dndRecord.enabled,
        studyMode: dndRecord.studyMode,
        studyStart: dndRecord.studyStart,
        studyEnd: dndRecord.studyEnd,
        sleepMode: dndRecord.sleepMode,
        sleepStart: dndRecord.sleepStart,
        sleepEnd: dndRecord.sleepEnd,
      }
    : INITIAL_DND;

  return {
    user: users[0] || INITIAL_USER,
    circleName: circle?.name || 'Зелёный Патруль',
    circleCode: circle?.code || 'GREEN-842',
    members: circle?.members || INITIAL_MEMBERS,
    quests: hydratedQuests.length > 0 ? hydratedQuests : INITIAL_QUESTS,
    sparksFeed,
    notifications,
    reports,
    sessions,
    dnd,
    parentSettings: fallbackParent,
    pendingSyncCount,
    lastCachedAt: circle?.lastCachedAt || new Date().toISOString(),
  };
}

export async function enqueueSyncOperation(
  action: string,
  entityType: SyncQueueItem['entityType'],
  entityId: string,
  payloadObj: unknown
): Promise<void> {
  try {
    await db.syncQueue.add({
      action,
      entityType,
      entityId,
      payload: JSON.stringify(payloadObj),
      createdAt: new Date().toISOString(),
      synced: false,
    });
  } catch {
    // Non-fatal offline queue write
  }
}

export async function resetDatabaseToSeed(): Promise<HydratedAppState> {
  clearLegacyLocalStorage();
  await db.transaction(
    'rw',
    [
      db.users,
      db.circles,
      db.quests,
      db.proofs,
      db.sparks,
      db.reports,
      db.notifications,
      db.sessions,
      db.dnd,
      db.parentSettings,
      db.syncQueue,
    ],
    async () => {
      await Promise.all([
        db.users.clear(),
        db.circles.clear(),
        db.quests.clear(),
        db.proofs.clear(),
        db.sparks.clear(),
        db.reports.clear(),
        db.notifications.clear(),
        db.sessions.clear(),
        db.dnd.clear(),
        db.parentSettings.clear(),
        db.syncQueue.clear(),
      ]);
    }
  );
  return migrateFromLocalStorageAndSeed();
}
