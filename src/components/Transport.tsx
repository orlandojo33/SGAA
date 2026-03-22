import React, { useState, useEffect } from 'react';
import { UserProfile, Transport } from '../types';
import { db, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, OperationType, handleFirestoreError } from '../firebase';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Check,
  Bus,
  MapPin,
  Users,
  UserSquare2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransportProps {
  user: UserProfile;
}

export function TransportComponent({ user }: TransportProps) {
  const [routes, setRoutes] = useState<Transport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Transport | null>(null);
  const [formData, setFormData] = useState({
    routeName: '',
    driverName: '',
    vehiclePlate: '',
    capacity: 0
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'transport'), (snap) => {
      setRoutes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transport)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'transport'));

    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, capacity: Number(formData.capacity) };
      if (editingRoute) {
        await updateDoc(doc(db, 'transport', editingRoute.id), data);
      } else {
        await addDoc(collection(db, 'transport'), data);
      }
      setIsModalOpen(false);
      setEditingRoute(null);
      setFormData({ routeName: '', driverName: '', vehiclePlate: '', capacity: 0 });
    } catch (err) {
      handleFirestoreError(err, editingRoute ? OperationType.UPDATE : OperationType.CREATE, 'transport');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir esta rota de transporte?')) {
      try {
        await deleteDoc(doc(db, 'transport', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `transport/${id}`);
      }
    }
  };

  const filteredRoutes = routes.filter(r => 
    r.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Transporte Escolar</h1>
          <p className="text-stone-500 italic serif mt-1">Gestão de rotas e frotas escolares.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por rota ou motorista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
          
          {user.role === 'admin' && (
            <button 
              onClick={() => {
                setEditingRoute(null);
                setFormData({ routeName: '', driverName: '', vehiclePlate: '', capacity: 0 });
                setIsModalOpen(true);
              }}
              className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-stone-800 transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Nova Rota
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoutes.map((route) => (
          <motion.div 
            key={route.id}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm group relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center border border-stone-200">
                <Bus className="w-6 h-6 text-stone-500" />
              </div>
              {user.role === 'admin' && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingRoute(route);
                      setFormData({ ...route });
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(route.id)}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-stone-900">{route.routeName}</h3>
            <div className="flex items-center gap-2 text-xs font-mono text-stone-400 uppercase tracking-widest mt-1">
              <MapPin className="w-3 h-3" />
              Placa: {route.vehiclePlate}
            </div>
            
            <div className="mt-6 pt-6 border-t border-stone-100 space-y-3">
              <div className="flex items-center gap-3 text-stone-600">
                <UserSquare2 className="w-4 h-4 text-stone-400" />
                <span className="text-sm font-medium">Motorista: {route.driverName}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-600">
                <Users className="w-4 h-4 text-stone-400" />
                <span className="text-sm font-medium">Capacidade: {route.capacity} Alunos</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredRoutes.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-stone-200 border-dashed">
            <div className="flex flex-col items-center gap-3 text-stone-400">
              <Bus className="w-12 h-12 opacity-20" />
              <p className="italic serif text-lg">Nenhuma rota de transporte encontrada.</p>
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
                  <h3 className="text-2xl font-bold text-stone-900">{editingRoute ? 'Editar Rota' : 'Nova Rota'}</h3>
                  <p className="text-stone-500 text-sm italic serif">Defina os detalhes do transporte.</p>
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
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Nome da Rota</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ex: Rota Sul - Manhã"
                      value={formData.routeName}
                      onChange={(e) => setFormData({...formData, routeName: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Motorista</label>
                    <input 
                      required
                      type="text" 
                      value={formData.driverName}
                      onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Placa</label>
                      <input 
                        required
                        type="text" 
                        value={formData.vehiclePlate}
                        onChange={(e) => setFormData({...formData, vehiclePlate: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Capacidade</label>
                      <input 
                        required
                        type="number" 
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="submit"
                    className="w-full px-6 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {editingRoute ? 'Salvar Alterações' : 'Criar Rota'}
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
