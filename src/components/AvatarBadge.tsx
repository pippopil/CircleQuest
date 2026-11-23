/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AvatarBadgeProps {
  avatar: string;
  alt: string;
  className?: string;
  textClassName?: string;
}

export function isImageAvatar(avatar: string): boolean {
  return (
    avatar.startsWith('data:image/') ||
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('/')
  );
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  avatar,
  alt,
  className = 'w-11 h-11 rounded-2xl',
  textClassName = 'text-2xl',
}) => {
  if (isImageAvatar(avatar)) {
    return (
      <div
        className={`${className} overflow-hidden bg-[#5B8266]/10 border border-[#5B8266]/20 shrink-0 shadow-xs`}
      >
        <img
          src={avatar}
          alt={alt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} bg-[#5B8266]/12 border border-[#5B8266]/20 flex items-center justify-center ${textClassName} shrink-0 shadow-xs`}
      aria-label={alt}
    >
      <span>{avatar}</span>
    </div>
  );
};
