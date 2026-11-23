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
import { ParentDashboardModal } from './components/ParentDashboardModal';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { activeTab, toast, isLoading, loadError, retryLoad, resetAllData } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] text-stone-800 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#486B52]/15 text-[#486B52] flex items-center justify-center mx-auto animate-pulse font-bold text-lg">
            🌿
          </div>
          <p className="text-xs font-medium text-stone-600">
            Загрузка локального круга CircleQuest...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] text-stone-800 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-[#FAF8F3] border border-red-200 rounded-2xl p-5 space-y-3 text-center shadow-sm">
          <h2 className="text-sm font-bold text-stone-900">Ошибка локального хранилища</h2>
          <p className="text-xs text-stone-600">{loadError}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void retryLoad()}
              className="flex-1 min-h-[44px] rounded-xl bg-[#486B52] text-white text-xs font-semibold"
            >
              Повторить
            </button>
            <button
              type="button"
              onClick={resetAllData}
              className="flex-1 min-h-[44px] rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold"
            >
              Сбросить БД
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      <ParentDashboardModal />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
