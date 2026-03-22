import React, { useState, useEffect } from 'react';
import { UserProfile, Attendance as AttendanceData, Student, Class } from '../types';
import { db, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, OperationType, handleFirestoreError, query, where, getDocs, setDoc } from '../firebase';
import { 
  Plus, 
  Search, 
  X,
  Check,
  ClipboardCheck,
  Calendar,
  Filter,
  User,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AttendanceProps {
  user: UserProfile;
}

export function Attendance({ user }: AttendanceProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    });

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snap) => {
      setClasses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class)));
    });

    return () => {
      unsubStudents();
      unsubClasses();
    };
  }, []);

  useEffect(() => {
    if (!selectedClassId || !selectedDate) return;

    const q = query(
      collection(db, 'attendance'), 
      where('classId', '==', selectedClassId),
      where('date', '==', selectedDate)
    );

    const unsubAttendance = onSnapshot(q, (snap) => {
      setAttendanceRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceData)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'attendance'));

    return () => unsubAttendance();
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = async (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (!selectedClassId || !selectedDate) return;

    const existing = attendanceRecords.find(r => r.studentId === studentId);
    
    try {
      if (existing) {
        await updateDoc(doc(db, 'attendance', existing.id), { status });
      } else {
        await addDoc(collection(db, 'attendance'), {
          studentId,
          classId: selectedClassId,
          date: selectedDate,
          status
        });
      }
    } catch (err) {
      handleFirestoreError(err, existing ? OperationType.UPDATE : OperationType.CREATE, 'attendance');
    }
  };

  const filteredStudents = students.filter(s => s.classId === selectedClassId);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Chamada Diária</h1>
          <p className="text-stone-500 italic serif mt-1">Controle de presença e pontualidade.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-2 shadow-sm">
            <Filter className="w-4 h-4 text-stone-400" />
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none"
            >
              <option value="">Selecionar Turma</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-stone-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none"
            />
          </div>
        </div>
      </header>

      {!selectedClassId ? (
        <div className="bg-stone-100 rounded-3xl border border-stone-200 border-dashed p-20 text-center">
          <div className="flex flex-col items-center gap-4 text-stone-400">
            <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center">
              <Filter className="w-8 h-8" />
            </div>
            <p className="italic serif text-xl">Selecione uma turma para iniciar a chamada.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900">Lista de Presença</h3>
                <p className="text-xs text-stone-500 uppercase font-mono tracking-widest">
                  {classes.find(c => c.id === selectedClassId)?.name} • {format(new Date(selectedDate), "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-mono text-stone-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Presente
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Falta
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                Atraso
              </div>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {filteredStudents.map((student) => {
              const record = attendanceRecords.find(r => r.studentId === student.id);
              const status = record?.status;

              return (
                <div key={student.id} className="p-6 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200">
                      <User className="w-5 h-5 text-stone-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">{student.name}</p>
                      <p className="text-xs text-stone-400 font-mono">{student.registrationNumber || '---'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleStatusChange(student.id, 'present')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        status === 'present' 
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                          : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                      }`}
                    >
                      P
                    </button>
                    <button 
                      onClick={() => handleStatusChange(student.id, 'absent')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        status === 'absent' 
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                          : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                      }`}
                    >
                      F
                    </button>
                    <button 
                      onClick={() => handleStatusChange(student.id, 'late')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        status === 'late' 
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
                          : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                      }`}
                    >
                      A
                    </button>
                  </div>
                </div>
              );
            })}
            
            {filteredStudents.length === 0 && (
              <div className="p-20 text-center">
                <div className="flex flex-col items-center gap-3 text-stone-400">
                  <AlertCircle className="w-12 h-12 opacity-20" />
                  <p className="italic serif text-lg">Nenhum aluno matriculado nesta turma.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
