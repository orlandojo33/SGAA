import React, { useState, useEffect } from 'react';
import { UserProfile, Fee, Student } from '../types';
import { db, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, OperationType, handleFirestoreError } from '../firebase';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Check,
  CreditCard,
  AlertCircle,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FeesProps {
  user: UserProfile;
}

export function Fees({ user }: FeesProps) {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    amount: 0,
    dueDate: '',
    status: 'pending' as 'paid' | 'pending' | 'overdue',
    month: ''
  });

  useEffect(() => {
    const unsubFees = onSnapshot(collection(db, 'fees'), (snap) => {
      setFees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'fees'));

    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    });

    return () => {
      unsubFees();
      unsubStudents();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, amount: Number(formData.amount) };
      if (editingFee) {
        await updateDoc(doc(db, 'fees', editingFee.id), data);
      } else {
        await addDoc(collection(db, 'fees'), data);
      }
      setIsModalOpen(false);
      setEditingFee(null);
      setFormData({ studentId: '', amount: 0, dueDate: '', status: 'pending', month: '' });
    } catch (err) {
      handleFirestoreError(err, editingFee ? OperationType.UPDATE : OperationType.CREATE, 'fees');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este registro de mensalidade?')) {
      try {
        await deleteDoc(doc(db, 'fees', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `fees/${id}`);
      }
    }
  };

  const filteredFees = fees.filter(f => {
    const student = students.find(s => s.id === f.studentId);
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.month.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Gestão de Mensalidades</h1>
          <p className="text-stone-500 italic serif mt-1">Controle financeiro e pagamentos dos alunos.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por aluno ou mês..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
          
          {user.role === 'admin' && (
            <button 
              onClick={() => {
                setEditingFee(null);
                setFormData({ studentId: '', amount: 0, dueDate: '', status: 'pending', month: '' });
                setIsModalOpen(true);
              }}
              className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-stone-800 transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Nova Mensalidade
            </button>
          )}
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Aluno</th>
                <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Mês</th>
                <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Vencimento</th>
                <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Valor</th>
                <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-stone-900">
                      {students.find(s => s.id === fee.studentId)?.name || 'Desconhecido'}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-sm text-stone-600">{fee.month}</td>
                  <td className="px-8 py-5 text-sm font-mono text-stone-500">{fee.dueDate}</td>
                  <td className="px-8 py-5 text-sm font-bold text-stone-900">R$ {fee.amount.toFixed(2)}</td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      fee.status === 'paid' ? "bg-emerald-50 text-emerald-700" : 
                      fee.status === 'overdue' ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    )}>
                      {fee.status === 'paid' ? 'Pago' : fee.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.role === 'admin' && (
                        <>
                          <button 
                            onClick={() => {
                              setEditingFee(fee);
                              setFormData({ ...fee });
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(fee.id)}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-stone-400">
                      <CreditCard className="w-12 h-12 opacity-20" />
                      <p className="italic serif text-lg">Nenhum registro de mensalidade encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <div>
                  <h3 className="text-2xl font-bold text-stone-900">{editingFee ? 'Editar Mensalidade' : 'Nova Mensalidade'}</h3>
                  <p className="text-stone-500 text-sm italic serif">Controle de pagamento do aluno.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
                >
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Aluno</label>
                    <select 
                      required
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="">Selecionar Aluno</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Mês</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ex: Março/2026"
                        value={formData.month}
                        onChange={(e) => setFormData({...formData, month: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Valor (R$)</label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Data de Vencimento</label>
                    <input 
                      required
                      type="date" 
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                      <option value="overdue">Atrasado</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="submit"
                    className="w-full px-6 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {editingFee ? 'Salvar Alterações' : 'Registrar Mensalidade'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
