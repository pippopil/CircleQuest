/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Непредвиденная ошибка интерфейса',
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[CircleQuest ErrorBoundary]', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F6F0] text-stone-800 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FAF8F3] border border-[#5B8266]/25 rounded-2xl p-6 shadow-md space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-base font-bold text-stone-900">
                Произошёл сбой в приложении
              </h1>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ваши локальные данные в CircleQuest сохранены. Попробуйте обновить экран.
              </p>
              {this.state.errorMessage && (
                <p className="text-[11px] text-stone-500 bg-stone-100 rounded-xl p-2.5 mt-2 break-words">
                  {this.state.errorMessage}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#486B52] hover:bg-[#3B5944] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Перезагрузить приложение</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
