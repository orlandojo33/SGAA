import React from 'react';
import { UserProfile } from '../types';
import { Sidebar } from './Sidebar';
import { LogOut, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function Layout({ user, activeTab, setActiveTab, onLogout, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-mono uppercase tracking-widest text-stone-400">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-stone-900">{user.name}</p>
                <p className="text-xs text-stone-500 uppercase font-mono tracking-tighter">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
                <UserIcon className="w-5 h-5 text-stone-500" />
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="p-2 text-stone-400 hover:text-red-500 transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        <div className="p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
