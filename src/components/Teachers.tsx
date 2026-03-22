import React, { useState, useEffect } from 'react';
import { UserProfile, Teacher } from '../types';
import { db, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, OperationType, handleFirestoreError } from '../firebase';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserPlus,
  X,
  Check,
  Phone,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TeachersProps {
  user: UserProfile;
}

export function Teachers({ user }: TeachersProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    phone: '',
    userId: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'teachers'), (snap) => {
      setTeachers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'teachers'));

    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await updateDoc(doc(db, 'teachers', editingTeacher.id), formData);
      } else {
        await addDoc(collection(db, 'teachers'), formData);
      }
      setIsModalOpen(false);
      setEditingTeacher(null);
      setFormData({ name: '', subject: '', phone: '', userId: '' });
    } catch (err) {
      handleFirestoreError(err, editingTeacher ? OperationType.UPDATE : OperationType.CREATE, 'teachers');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este professor?')) {
      try {
        await deleteDoc(doc(db, 'teachers', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `teachers/${id}`);
      }
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Corpo Docente</h1>
          <p className="text-stone-500 italic serif mt-1">Gerencie os professores e suas disciplinas.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou disciplina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
          
          {user.role === 'admin' && (
            <button 
              onClick={() => {
                setEditingTeacher(null);
                setFormData({ name: '', subject: '', phone: '', userId: '' });
                setIsModalOpen(true);
              }}
              className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-stone-800 transition-colors shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              Novo Professor
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <motion.div 
            key={teacher.id}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm group relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center border border-stone-200">
                <BookOpen className="w-6 h-6 text-stone-500" />
              </div>
              {user.role === 'admin' && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingTeacher(teacher);
                      setFormData({ ...teacher });
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(teacher.id)}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-stone-900">{teacher.name}</h3>
            <p className="text-sm text-emerald-600 font-medium mt-1">{teacher.subject}</p>
            
            <div className="mt-6 pt-6 border-t border-stone-100 flex items-center gap-4">
              <div className="flex items-center gap-2 text-stone-500">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-mono">{teacher.phone || '---'}</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredTeachers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-stone-200 border-dashed">
            <div className="flex flex-col items-center gap-3 text-stone-400">
              <BookOpen className="w-12 h-12 opacity-20" />
              <p className="italic serif text-lg">Nenhum professor encontrado.</p>
            </div>
          </div>
        )}
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
                  <h3 className="text-2xl font-bold text-stone-900">{editingTeacher ? 'Editar Professor' : 'Novo Professor'}</h3>
                  <p className="text-stone-500 text-sm italic serif">Dados profissionais do docente.</p>
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
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Nome Completo</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Disciplina</label>
                    <input 
                      required
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Telefone</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">User ID (Vínculo)</label>
                    <input 
                      required
                      type="text" 
                      value={formData.userId}
                      onChange={(e) => setFormData({...formData, userId: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="submit"
                    className="w-full px-6 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {editingTeacher ? 'Salvar Alterações' : 'Cadastrar Professor'}
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
