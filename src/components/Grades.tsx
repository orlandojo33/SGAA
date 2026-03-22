import React, { useState, useEffect } from 'react';
import { UserProfile, GradeEntry, FinalGrade, Student, Enrollment, Class } from '../types';
import { db, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, OperationType, handleFirestoreError, query, where } from '../firebase';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Check,
  FileSpreadsheet,
  Filter,
  Calculator,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GradesProps {
  user: UserProfile;
}

export function Grades({ user }: GradesProps) {
  const [activeTab, setActiveTab] = useState<'quarterly' | 'final'>('quarterly');
  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([]);
  const [finalGrades, setFinalGrades] = useState<FinalGrade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGradeEntry, setEditingGradeEntry] = useState<GradeEntry | null>(null);
  const [editingFinalGrade, setEditingFinalGrade] = useState<FinalGrade | null>(null);
  
  const [gradeEntryFormData, setGradeEntryFormData] = useState({
    enrollmentId: '',
    subject: '',
    term: 1 as 1 | 2 | 3,
    mac: 0,
    npt: 0
  });

  const [finalGradeFormData, setFinalGradeFormData] = useState({
    enrollmentId: '',
    subject: '',
    mt1: 0,
    mt2: 0,
    mt3: 0,
    ne: 0,
    nr: 0
  });

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(doc => ({ ...doc.data() } as Student)));
    });

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snap) => {
      setClasses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class)));
    });

    const unsubEnrollments = onSnapshot(collection(db, 'enrollments'), (snap) => {
      setEnrollments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment)));
    });

    return () => {
      unsubStudents();
      unsubClasses();
      unsubEnrollments();
    };
  }, []);

  useEffect(() => {
    const unsubEntries = onSnapshot(collection(db, 'gradeEntries'), (snap) => {
      setGradeEntries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GradeEntry)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'gradeEntries'));

    const unsubFinals = onSnapshot(collection(db, 'finalGrades'), (snap) => {
      setFinalGrades(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinalGrade)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'finalGrades'));

    return () => {
      unsubEntries();
      unsubFinals();
    };
  }, []);

  const calculateMT = (mac: number, npt: number) => {
    return Number(((mac + npt) / 2).toFixed(1));
  };

  const calculateMFD = (mt1: number, mt2: number, mt3: number) => {
    return Number(((mt1 + mt2 + mt3) / 3).toFixed(1));
  };

  const calculateCF = (mfd: number, ne: number | undefined, gradeLevel: number) => {
    if (gradeLevel === 6 && ne !== undefined) {
      return Number(((mfd * 0.6) + (ne * 0.4)).toFixed(1));
    }
    return mfd;
  };

  const handleGradeEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const enrollment = enrollments.find(en => en.id === gradeEntryFormData.enrollmentId);
      if (!enrollment) return;

      const mt = calculateMT(gradeEntryFormData.mac, gradeEntryFormData.npt);
      const data = {
        ...gradeEntryFormData,
        studentId: enrollment.studentId,
        mt
      };

      if (editingGradeEntry) {
        await updateDoc(doc(db, 'gradeEntries', editingGradeEntry.id), data);
      } else {
        await addDoc(collection(db, 'gradeEntries'), data);
      }
      setIsModalOpen(false);
      setEditingGradeEntry(null);
      setGradeEntryFormData({ enrollmentId: '', subject: '', term: 1, mac: 0, npt: 0 });
    } catch (err) {
      handleFirestoreError(err, editingGradeEntry ? OperationType.UPDATE : OperationType.CREATE, 'gradeEntries');
    }
  };

  const handleFinalGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const enrollment = enrollments.find(en => en.id === finalGradeFormData.enrollmentId);
      if (!enrollment) return;

      const mfd = calculateMFD(finalGradeFormData.mt1, finalGradeFormData.mt2, finalGradeFormData.mt3);
      const cf = calculateCF(mfd, finalGradeFormData.ne, enrollment.gradeLevel);
      
      const data = {
        ...finalGradeFormData,
        studentId: enrollment.studentId,
        mfd,
        cf,
        cfd: finalGradeFormData.nr ? Math.max(cf, finalGradeFormData.nr) : cf
      };

      if (editingFinalGrade) {
        await updateDoc(doc(db, 'finalGrades', editingFinalGrade.id), data);
      } else {
        await addDoc(collection(db, 'finalGrades'), data);
      }
      setIsModalOpen(false);
      setEditingFinalGrade(null);
      setFinalGradeFormData({ enrollmentId: '', subject: '', mt1: 0, mt2: 0, mt3: 0, ne: 0, nr: 0 });
    } catch (err) {
      handleFirestoreError(err, editingFinalGrade ? OperationType.UPDATE : OperationType.CREATE, 'finalGrades');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Deseja realmente excluir este lançamento?')) {
      try {
        await deleteDoc(doc(db, 'gradeEntries', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `gradeEntries/${id}`);
      }
    }
  };

  const handleDeleteFinal = async (id: string) => {
    if (confirm('Deseja realmente excluir este resultado final?')) {
      try {
        await deleteDoc(doc(db, 'finalGrades', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `finalGrades/${id}`);
      }
    }
  };

  const filteredEnrollments = selectedClassId 
    ? enrollments.filter(en => {
        const cls = classes.find(c => c.id === selectedClassId);
        return en.gradeLevel === cls?.gradeLevel && en.section === cls?.section && en.academicYear === cls?.year;
      })
    : enrollments;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Boletim Escolar</h1>
          <p className="text-stone-500 italic serif mt-1">Lançamento e consulta de notas e resultados finais.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-2 shadow-sm">
            <Filter className="w-4 h-4 text-stone-400" />
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none"
            >
              <option value="">Todas as Turmas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          {(user.role === 'admin' || user.role === 'teacher') && (
            <button 
              onClick={() => {
                setEditingGradeEntry(null);
                setEditingFinalGrade(null);
                if (activeTab === 'quarterly') {
                  setGradeEntryFormData({ enrollmentId: '', subject: '', term: 1, mac: 0, npt: 0 });
                } else {
                  setFinalGradeFormData({ enrollmentId: '', subject: '', mt1: 0, mt2: 0, mt3: 0, ne: 0, nr: 0 });
                }
                setIsModalOpen(true);
              }}
              className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-stone-800 transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'quarterly' ? 'Lançar Nota Trimestral' : 'Lançar Resultado Final'}
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('quarterly')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'quarterly' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
          )}
        >
          <Calculator className="w-4 h-4" />
          Notas Trimestrais
        </button>
        <button 
          onClick={() => setActiveTab('final')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'final' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
          )}
        >
          <GraduationCap className="w-4 h-4" />
          Resultados Finais
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'quarterly' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Aluno</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Disciplina</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Trimestre</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 text-center">MAC</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 text-center">NPT</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 text-center">MT</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {gradeEntries.filter(ge => !selectedClassId || enrollments.find(en => en.id === ge.enrollmentId)?.gradeLevel === classes.find(c => c.id === selectedClassId)?.gradeLevel).map((entry) => {
                  const student = students.find(s => s.id === entry.studentId);
                  return (
                    <tr key={entry.id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-stone-900">{student?.name || '---'}</p>
                        <p className="text-[10px] text-stone-400 font-mono">Proc: {entry.studentId}</p>
                      </td>
                      <td className="px-8 py-5 text-sm text-stone-700 font-medium">{entry.subject}</td>
                      <td className="px-8 py-5 text-xs text-stone-500">{entry.term}º Trimestre</td>
                      <td className="px-8 py-5 text-center font-mono text-sm">{entry.mac.toFixed(1)}</td>
                      <td className="px-8 py-5 text-center font-mono text-sm">{entry.npt.toFixed(1)}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={cn(
                          "inline-block w-10 h-10 leading-10 rounded-xl font-bold text-sm",
                          entry.mt >= 5 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}>
                          {entry.mt.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(user.role === 'admin' || user.role === 'teacher') && (
                            <>
                              <button 
                                onClick={() => {
                                  setEditingGradeEntry(entry);
                                  setGradeEntryFormData({ ...entry });
                                  setIsModalOpen(true);
                                }}
                                className="p-2 text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Aluno</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Disciplina</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 text-center">MT1</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 text-center">MT2</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 text-center">MT3</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 text-center">MFD</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 text-center">NE</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 text-center">CF</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {finalGrades.map((final) => {
                  const student = students.find(s => s.id === final.studentId);
                  return (
                    <tr key={final.id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-stone-900">{student?.name || '---'}</p>
                        <p className="text-[10px] text-stone-400 font-mono">Proc: {final.studentId}</p>
                      </td>
                      <td className="px-8 py-5 text-sm text-stone-700 font-medium">{final.subject}</td>
                      <td className="px-8 py-5 text-center font-mono text-xs text-stone-500">{final.mt1.toFixed(1)}</td>
                      <td className="px-8 py-5 text-center font-mono text-xs text-stone-500">{final.mt2.toFixed(1)}</td>
                      <td className="px-8 py-5 text-center font-mono text-xs text-stone-500">{final.mt3.toFixed(1)}</td>
                      <td className="px-8 py-5 text-center font-bold text-stone-700">{final.mfd.toFixed(1)}</td>
                      <td className="px-8 py-5 text-center font-mono text-xs text-stone-500">{final.ne?.toFixed(1) || '---'}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={cn(
                          "inline-block px-3 py-1 rounded-lg font-bold text-xs",
                          (final.cfd || final.cf || 0) >= 5 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}>
                          {(final.cfd || final.cf || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(user.role === 'admin' || user.role === 'teacher') && (
                            <>
                              <button 
                                onClick={() => {
                                  setEditingFinalGrade(final);
                                  setFinalGradeFormData({ ...final, ne: final.ne || 0, nr: final.nr || 0 });
                                  setIsModalOpen(true);
                                }}
                                className="p-2 text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteFinal(final.id)}
                                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <div>
                  <h3 className="text-2xl font-bold text-stone-900">
                    {activeTab === 'quarterly' 
                      ? (editingGradeEntry ? 'Editar Nota Trimestral' : 'Lançar Nota Trimestral')
                      : (editingFinalGrade ? 'Editar Resultado Final' : 'Lançar Resultado Final')}
                  </h3>
                  <p className="text-stone-500 text-sm italic serif">Insira o desempenho do aluno.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
                >
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>
              
              <form onSubmit={activeTab === 'quarterly' ? handleGradeEntrySubmit : handleFinalGradeSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Matrícula (Aluno)</label>
                    <select 
                      required
                      value={activeTab === 'quarterly' ? gradeEntryFormData.enrollmentId : finalGradeFormData.enrollmentId}
                      onChange={(e) => {
                        if (activeTab === 'quarterly') {
                          setGradeEntryFormData({...gradeEntryFormData, enrollmentId: e.target.value});
                        } else {
                          setFinalGradeFormData({...finalGradeFormData, enrollmentId: e.target.value});
                        }
                      }}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="">Selecionar Aluno Matriculado</option>
                      {filteredEnrollments.map(en => {
                        const student = students.find(s => s.id === en.studentId);
                        return (
                          <option key={en.id} value={en.id}>
                            {student?.name} ({en.gradeLevel}ª {en.section} - {en.academicYear})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Disciplina</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ex: Matemática"
                      value={activeTab === 'quarterly' ? gradeEntryFormData.subject : finalGradeFormData.subject}
                      onChange={(e) => {
                        if (activeTab === 'quarterly') {
                          setGradeEntryFormData({...gradeEntryFormData, subject: e.target.value});
                        } else {
                          setFinalGradeFormData({...finalGradeFormData, subject: e.target.value});
                        }
                      }}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {activeTab === 'quarterly' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Trimestre</label>
                        <select 
                          value={gradeEntryFormData.term}
                          onChange={(e) => setGradeEntryFormData({...gradeEntryFormData, term: parseInt(e.target.value) as 1|2|3})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        >
                          <option value={1}>1º Trimestre</option>
                          <option value={2}>2º Trimestre</option>
                          <option value={3}>3º Trimestre</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">MAC (0-10)</label>
                          <input 
                            required
                            type="number" 
                            step="0.1"
                            min="0"
                            max="10"
                            value={gradeEntryFormData.mac}
                            onChange={(e) => setGradeEntryFormData({...gradeEntryFormData, mac: Number(e.target.value)})}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">NPT (0-10)</label>
                          <input 
                            required
                            type="number" 
                            step="0.1"
                            min="0"
                            max="10"
                            value={gradeEntryFormData.npt}
                            onChange={(e) => setGradeEntryFormData({...gradeEntryFormData, npt: Number(e.target.value)})}
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                        </div>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Média Trimestral (MT)</span>
                          <span className="text-xl font-bold text-emerald-600">
                            {calculateMT(gradeEntryFormData.mac, gradeEntryFormData.npt).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">MT1</label>
                          <input 
                            required
                            type="number" 
                            step="0.1"
                            value={finalGradeFormData.mt1}
                            onChange={(e) => setFinalGradeFormData({...finalGradeFormData, mt1: Number(e.target.value)})}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">MT2</label>
                          <input 
                            required
                            type="number" 
                            step="0.1"
                            value={finalGradeFormData.mt2}
                            onChange={(e) => setFinalGradeFormData({...finalGradeFormData, mt2: Number(e.target.value)})}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">MT3</label>
                          <input 
                            required
                            type="number" 
                            step="0.1"
                            value={finalGradeFormData.mt3}
                            onChange={(e) => setFinalGradeFormData({...finalGradeFormData, mt3: Number(e.target.value)})}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                          />
                        </div>
                      </div>
                      
                      {enrollments.find(en => en.id === finalGradeFormData.enrollmentId)?.gradeLevel === 6 && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Exame (NE)</label>
                            <input 
                              type="number" 
                              step="0.1"
                              value={finalGradeFormData.ne}
                              onChange={(e) => setFinalGradeFormData({...finalGradeFormData, ne: Number(e.target.value)})}
                              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Recurso (NR)</label>
                            <input 
                              type="number" 
                              step="0.1"
                              value={finalGradeFormData.nr}
                              onChange={(e) => setFinalGradeFormData({...finalGradeFormData, nr: Number(e.target.value)})}
                              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl"
                            />
                          </div>
                        </div>
                      )}

                      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Média Final (MFD)</span>
                          <span className="text-lg font-bold text-stone-700">
                            {calculateMFD(finalGradeFormData.mt1, finalGradeFormData.mt2, finalGradeFormData.mt3).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Classificação Final (CF)</span>
                          <span className="text-xl font-bold text-emerald-600">
                            {calculateCF(
                              calculateMFD(finalGradeFormData.mt1, finalGradeFormData.mt2, finalGradeFormData.mt3),
                              finalGradeFormData.ne,
                              enrollments.find(en => en.id === finalGradeFormData.enrollmentId)?.gradeLevel || 0
                            ).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="submit"
                    className="w-full px-6 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {activeTab === 'quarterly' 
                      ? (editingGradeEntry ? 'Salvar Alterações' : 'Registrar Nota')
                      : (editingFinalGrade ? 'Salvar Alterações' : 'Registrar Resultado')}
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
