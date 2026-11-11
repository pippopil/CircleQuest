/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuestType = 'sync' | 'kindness' | 'detox';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  age: number;
  avatar: string; // Emoji, SVG icon, or friendly illustration
  interests: string[];
  role: 'creator' | 'member';
  parentConsentVerified: boolean;
  parentEmail?: string;
}

export interface CircleMember {
  id: string;
  name: string;
  avatar: string;
  status: string;
  completedThisWeek: number;
  isOwner?: boolean;
}

export interface QuestProof {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: string;
  comment?: string;
  imageUrl?: string;
  blurred?: boolean;
  verified: boolean;
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  category: string;
  description: string;
  duration?: string;
  targetCount: number; // e.g. 5 members in circle
  completedCount: number; // how many members completed
  isCompletedByMe: boolean;
  requiresPhoto: boolean;
  proofs: QuestProof[];
  icon: string;
  tips: string;
}

export interface SparkSticker {
  id: string;
  title: string;
  emoji: string;
  soundType: 'warm_chime' | 'gentle_harp' | 'high_bell' | 'serene_drop';
  message: string;
  color: string;
}

export interface SparkMessage {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  toUserName: string;
  stickerId: string;
  stickerTitle: string;
  stickerEmoji: string;
  stickerColor: string;
  soundType: 'warm_chime' | 'gentle_harp' | 'high_bell' | 'serene_drop';
  questTitle?: string;
  customNote?: string;
  timestamp: string;
  read: boolean;
}

export interface SafetyReport {
  id: string;
  targetType: 'proof' | 'member' | 'spark';
  targetId: string;
  targetPreview: string;
  targetAuthorName: string;
  reporterId: string;
  reason: 'face_or_personal_data' | 'bullying_or_harassment' | 'dangerous_act' | 'inappropriate_content' | 'spam';
  details?: string;
  status: 'pending' | 'resolved_hidden' | 'resolved_warned' | 'resolved_dismissed';
  createdAt: string;
  moderatorNote?: string;
  appealed?: boolean;
  appealText?: string;
  appealStatus?: 'pending' | 'approved' | 'rejected';
}

export interface NotificationItem {
  id: string;
  type: 'spark' | 'quest_sync' | 'team_progress' | 'gentle_reminder';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface MapSpot {
  id: string;
  title: string;
  category: 'eco' | 'kindness' | 'detox' | 'workout';
  categoryLabel: string;
  address: string;
  coords: { x: number; y: number }; // Percentage relative on custom neighborhood vector map
  description: string;
  questAction: string;
  questId?: string;
}

export interface DNDSchedule {
  enabled: boolean;
  studyMode: boolean; // 08:30 - 15:00
  studyStart: string;
  studyEnd: string;
  sleepMode: boolean; // 22:00 - 07:30
  sleepStart: string;
  sleepEnd: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  browser: string;
  lastActive: string;
  isCurrent: boolean;
}
