import React from 'react';
import { UserProfile } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  BookOpen, 
  ClipboardCheck, 
  GraduationCap,
  FileSpreadsheet,
  CreditCard,
  Bus,
  Settings,
  UserCog
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ user, activeTab, setActiveTab }: SidebarProps) {
  const categories = [
    {
      label: 'Geral',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'parent'] },
      ]
    },
    {
      label: 'Pedagógica',
      items: [
        { id: 'classes', label: 'Turmas', icon: BookOpen, roles: ['admin', 'teacher'] },
        { id: 'grades', label: 'Notas', icon: FileSpreadsheet, roles: ['admin', 'teacher', 'parent'] },
        { id: 'attendance', label: 'Presença', icon: ClipboardCheck, roles: ['admin', 'teacher'] },
      ]
    },
    {
      label: 'Administrativa',
      items: [
        { id: 'students', label: 'Alunos', icon: Users, roles: ['admin', 'teacher'] },
        { id: 'teachers', label: 'Professores', icon: UserSquare2, roles: ['admin'] },
        { id: 'transport', label: 'Transporte', icon: Bus, roles: ['admin', 'teacher', 'parent'] },
        { id: 'users', label: 'Gestão de Usuários', icon: UserCog, roles: ['admin'] },
      ]
    },
    {
      label: 'Financeira',
      items: [
        { id: 'fees', label: 'Mensalidades', icon: CreditCard, roles: ['admin', 'parent'] },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-stone-900 text-white flex flex-col sticky top-0 h-screen shrink-0 overflow-y-auto">
      <div className="p-8 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <GraduationCap className="w-6 h-6 text-stone-900" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">EscolaFácil</h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-8">
        {categories.map((category) => {
          const filteredItems = category.items.filter(item => item.roles.includes(user.role));
          if (filteredItems.length === 0) return null;

          return (
            <div key={category.label} className="space-y-2">
              <h3 className="px-4 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500">
                {category.label}
              </h3>
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                      activeTab === item.id 
                        ? "bg-white/10 text-emerald-400 shadow-inner" 
                        : "text-stone-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      activeTab === item.id ? "text-emerald-400" : "text-stone-500 group-hover:text-stone-300"
                    )} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono mb-1">Versão</p>
          <p className="text-xs font-mono text-stone-300">v1.0.4-stable</p>
        </div>
      </div>
    </aside>
  );
}
