import React, { useState, useEffect } from 'react';
import { UserProfile, Student, Teacher, Class } from '../types';
import { db, collection, getDocs } from '../firebase';
import { 
  Users, 
  UserSquare2, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Clock,
  CreditCard,
  Bus,
  UserCog,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DashboardProps {
  user: UserProfile;
  setActiveTab: (tab: string) => void;
}

export function Dashboard({ user, setActiveTab }: DashboardProps) {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    averageGrade: 0,
    totalFees: 0,
    routes: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [studentsSnap, teachersSnap, classesSnap, feesSnap, transportSnap] = await Promise.all([
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'teachers')),
        getDocs(collection(db, 'classes')),
        getDocs(collection(db, 'fees')),
        getDocs(collection(db, 'transport'))
      ]);

      const totalFees = feesSnap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);

      setStats({
        students: studentsSnap.size,
        teachers: teachersSnap.size,
        classes: classesSnap.size,
        averageGrade: 8.4, // Mocked for now
        totalFees,
        routes: transportSnap.size
      });
    };

    fetchStats();
  }, []);

  const data = [
    { name: '1º Ano', students: 45, color: '#10b981' },
    { name: '2º Ano', students: 38, color: '#3b82f6' },
    { name: '3º Ano', students: 42, color: '#f59e0b' },
    { name: '4º Ano', students: 35, color: '#ef4444' },
    { name: '5º Ano', students: 40, color: '#8b5cf6' },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-5"
    >
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-stone-900 leading-none">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight">Bem-vindo, {user.name.split(' ')[0]}</h1>
          <p className="text-stone-500 italic serif text-lg mt-1">Aqui está o resumo da sua escola hoje.</p>
        </div>
        <div className="flex items-center gap-3 bg-stone-100 px-4 py-2 rounded-xl border border-stone-200">
          <Calendar className="w-4 h-4 text-stone-500" />
          <span className="text-sm font-medium text-stone-700">22 de Março, 2026</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Total Alunos" value={stats.students} icon={Users} color="bg-emerald-500" />
        <StatCard title="Professores" value={stats.teachers} icon={UserSquare2} color="bg-blue-500" />
        <StatCard title="Turmas Ativas" value={stats.classes} icon={BookOpen} color="bg-amber-500" />
        <StatCard title="Média Geral" value={stats.averageGrade} icon={TrendingUp} color="bg-violet-500" />
        <StatCard title="Mensalidades" value={`R$ ${stats.totalFees.toFixed(2)}`} icon={CreditCard} color="bg-rose-500" />
        <StatCard title="Rotas Transp." value={stats.routes} icon={Bus} color="bg-cyan-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-stone-900">Distribuição de Alunos</h3>
            <div className="flex items-center gap-2 text-xs font-mono text-stone-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Por Série
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a8a29e', fontSize: 12, fontFamily: 'monospace' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a8a29e', fontSize: 12, fontFamily: 'monospace' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f5f5f4' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontFamily: 'monospace'
                  }}
                />
                <Bar dataKey="students" radius={[6, 6, 0, 0]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-stone-900 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-stone-400">Próximos Eventos</span>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-2 border-emerald-500 pl-4 py-1">
                <p className="text-sm font-bold">Reunião de Pais</p>
                <p className="text-xs text-stone-400 mt-1">Amanhã, às 14:00</p>
              </div>
              <div className="border-l-2 border-blue-500 pl-4 py-1">
                <p className="text-sm font-bold">Conselho de Classe</p>
                <p className="text-xs text-stone-400 mt-1">Sexta, às 09:00</p>
              </div>
              <div className="border-l-2 border-amber-500 pl-4 py-1">
                <p className="text-sm font-bold">Feira de Ciências</p>
                <p className="text-xs text-stone-400 mt-1">28 de Março</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
            <button className="w-full bg-white text-stone-900 py-3 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors">
              Ver Calendário Completo
            </button>
          </div>
          
          {/* Decorative element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
      </div>

      {user.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 flex flex-col items-start justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-900">Cadastrar Aluno</h3>
                <p className="text-emerald-700 mt-1 italic serif">Adicione novos estudantes à base de dados da escola.</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('students')}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md group"
            >
              Ir para Cadastro de Alunos
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-stone-100 border border-stone-200 rounded-3xl p-8 flex flex-col items-start justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-stone-900 flex items-center justify-center text-white shadow-lg shadow-stone-200">
                <UserCog className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900">Gestão de Usuários</h3>
                <p className="text-stone-700 mt-1 italic serif">Gerencie cargos e acessos de colaboradores e pais.</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('users')}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-md group"
            >
              Acessar Gestão de Usuários
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
