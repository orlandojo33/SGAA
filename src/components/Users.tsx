import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { db, collection, onSnapshot, updateDoc, doc, OperationType, handleFirestoreError } from '../firebase';
import { 
  Search, 
  Shield, 
  User, 
  UserCheck, 
  UserCog,
  MoreVertical,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UsersProps {
  user: UserProfile;
}

export function UsersManagement({ user }: UsersProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ ...doc.data() } as UserProfile)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    return () => unsub();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin': return <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>;
      case 'teacher': return <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><UserCheck className="w-3 h-3" /> Professor</span>;
      case 'parent': return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><User className="w-3 h-3" /> Responsável</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Gestão de Usuários</h1>
          <p className="text-stone-500 italic serif mt-1">Gerencie permissões e cargos dos usuários do sistema.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Usuário</th>
                <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Cargo Atual</th>
                <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Alterar Cargo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200 text-stone-500 font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900">{u.name}</p>
                        <p className="text-xs text-stone-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {getRoleBadge(u.role)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                        disabled={u.uid === user.uid}
                        className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                      >
                        <option value="parent">Responsável</option>
                        <option value="teacher">Professor</option>
                        <option value="admin">Administrador</option>
                      </select>
                      {u.uid === user.uid && (
                        <span className="text-[10px] text-stone-400 italic">(Você)</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <UserCog className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900">Dica para Testes</h4>
          <p className="text-sm text-amber-700 mt-1">
            Para testar o acesso como **Professor**, peça para outra pessoa entrar no sistema (ou use uma aba anônima com outra conta Google). 
            Depois, você como Administrador poderá alterar o cargo dela nesta tela.
          </p>
        </div>
      </div>
    </div>
  );
}
