/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { QuestsView } from './components/QuestsView';
import { CircleView } from './components/CircleView';
import { MapView } from './components/MapView';
import { ProfileView } from './components/ProfileView';

// Modals
import { DetoxTimerModal } from './components/DetoxTimerModal';
import { SparksModal } from './components/SparksModal';
import { ReportModal } from './components/ReportModal';
import { ParentConsentModal } from './components/ParentConsentModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { InviteModal } from './components/InviteModal';
import { ModeratorModal } from './components/ModeratorModal';

const AppContent: React.FC = () => {
  const { activeTab, toast } = useApp();

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-stone-800 flex flex-col antialiased">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] px-4 py-2.5 bg-stone-900/90 backdrop-blur-md text-white text-xs font-medium rounded-2xl shadow-xl flex items-center justify-center text-center animate-in fade-in slide-in-from-top-3 duration-300">
          <span>{toast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col bg-[#FAF8F3] min-h-screen sm:shadow-sm sm:border-x sm:border-[#5B8266]/10">
        <Header />

        <main className="flex-1 p-4">
          {activeTab === 'quests' && <QuestsView />}
          {activeTab === 'circle' && <CircleView />}
          {activeTab === 'map' && <MapView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>

        <BottomNav />
      </div>

      {/* Interactive Global Modals */}
      <DetoxTimerModal />
      <SparksModal />
      <ReportModal />
      <ParentConsentModal />
      <PrivacyPolicyModal />
      <InviteModal />
      <ModeratorModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
