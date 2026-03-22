import React, { useState, useEffect } from 'react';
import { UserProfile, Student, Enrollment, Class } from '../types';
import { db, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, OperationType, handleFirestoreError, setDoc } from '../firebase';
import { 
  Plus, 
  Search, 
  Users,
  MoreVertical, 
  Edit2, 
  Trash2, 
  UserPlus,
  X,
  Check,
  ClipboardList,
  UserCircle,
  Calendar,
  Phone,
  MapPin,
  FileText,
  ArrowRight,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StudentsProps {
  user: UserProfile;
}

export function Students({ user }: StudentsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'database' | 'enrollments'>('database');
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Student Modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentFormData, setStudentFormData] = useState({
    id: '',
    name: '',
    gender: 'M' as 'M' | 'F',
    birthDate: '',
    fatherName: '',
    motherName: '',
    birthProvince: '',
    birthMunicipality: '',
    idDocumentNumber: '',
    idDocumentIssueDate: '',
    guardianContact: '',
  });

  // Enrollment Modal
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedStudentForEnrollment, setSelectedStudentForEnrollment] = useState<Student | null>(null);
  const [enrollmentFormData, setEnrollmentFormData] = useState({
    academicYear: new Date().getFullYear(),
    gradeLevel: 1,
    section: 'A',
    status: 'active' as 'active' | 'transferred' | 'dropped'
  });

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(doc => ({ ...doc.data() } as Student)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'students'));

    const unsubEnrollments = onSnapshot(collection(db, 'enrollments'), (snap) => {
      setEnrollments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'enrollments'));

    return () => {
      unsubStudents();
      unsubEnrollments();
    };
  }, []);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...studentFormData,
        createdAt: new Date().toISOString()
      };
      // Use the provided ID (Process Number) as the document ID
      await setDoc(doc(db, 'students', studentFormData.id), data);
      setIsStudentModalOpen(false);
      setEditingStudent(null);
      resetStudentForm();
    } catch (err) {
      handleFirestoreError(err, editingStudent ? OperationType.UPDATE : OperationType.CREATE, 'students');
    }
  };

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForEnrollment) return;
    try {
      const data = {
        ...enrollmentFormData,
        studentId: selectedStudentForEnrollment.id
      };
      await addDoc(collection(db, 'enrollments'), data);
      setIsEnrollmentModalOpen(false);
      setSelectedStudentForEnrollment(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'enrollments');
    }
  };

  const resetStudentForm = () => {
    setStudentFormData({
      id: '',
      name: '',
      gender: 'M',
      birthDate: '',
      fatherName: '',
      motherName: '',
      birthProvince: '',
      birthMunicipality: '',
      idDocumentNumber: '',
      idDocumentIssueDate: '',
      guardianContact: '',
    });
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(en => {
    const student = students.find(s => s.id === en.studentId);
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           en.studentId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Gestão de Alunos</h1>
          <p className="text-stone-500 italic serif mt-1">Base de dados mestres e controle de matrículas.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou processo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
          
          {user.role === 'admin' && activeSubTab === 'database' && (
            <button 
              onClick={() => {
                setEditingStudent(null);
                resetStudentForm();
                setIsStudentModalOpen(true);
              }}
              className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-stone-800 transition-colors shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              Novo Cadastro
            </button>
          )}
        </div>
      </header>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveSubTab('database')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeSubTab === 'database' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
          )}
        >
          <UserCircle className="w-4 h-4" />
          Base de Dados
        </button>
        <button 
          onClick={() => setActiveSubTab('enrollments')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeSubTab === 'enrollments' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
          )}
        >
          <ClipboardList className="w-4 h-4" />
          Matrículas
        </button>
      </div>

      {activeSubTab === 'database' ? (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Nº Processo</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Nome Completo</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Idade</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Contacto</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-8 py-5 text-sm font-mono text-stone-500 font-bold">{student.id}</td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-stone-900">{student.name}</p>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">
                        {student.gender === 'M' ? 'Masculino' : 'Feminino'} • {student.birthDate}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-stone-600">
                        {calculateAge(student.birthDate)} anos
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-stone-600">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span className="text-xs">{student.guardianContact}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setSelectedStudentForEnrollment(student);
                            setIsEnrollmentModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Matricular
                        </button>
                        <button 
                          onClick={() => {
                            setEditingStudent(student);
                            setStudentFormData({ ...student });
                            setIsStudentModalOpen(true);
                          }}
                          className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Ano Letivo</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Aluno</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Classe/Turma</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Estado</th>
                  <th className="px-8 py-5 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEnrollments.map((en) => {
                  const student = students.find(s => s.id === en.studentId);
                  return (
                    <tr key={en.id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="px-8 py-5 text-sm font-mono text-stone-500">{en.academicYear}</td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-stone-900">{student?.name || '---'}</p>
                        <p className="text-xs text-stone-400">Proc: {en.studentId}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {en.gradeLevel}ª Classe • Turma {en.section}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          en.status === 'active' ? "bg-emerald-50 text-emerald-700" :
                          en.status === 'transferred' ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"
                        )}>
                          {en.status === 'active' ? 'Ativo' : en.status === 'transferred' ? 'Transferido' : 'Desistente'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <button className="p-2 text-stone-400 hover:text-stone-900 rounded-lg transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Master Data Modal */}
      <AnimatePresence>
        {isStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStudentModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <div>
                  <h3 className="text-2xl font-bold text-stone-900">{editingStudent ? 'Editar Cadastro' : 'Novo Cadastro de Aluno'}</h3>
                  <p className="text-stone-500 text-sm italic serif">Dados mestres de identificação do estudante.</p>
                </div>
                <button 
                  onClick={() => setIsStudentModalOpen(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
                >
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>
              
              <form onSubmit={handleStudentSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Identification */}
                  <div className="md:col-span-3">
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-600 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Identificação
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Nº Processo</label>
                        <input 
                          required
                          disabled={!!editingStudent}
                          type="text" 
                          value={studentFormData.id}
                          onChange={(e) => setStudentFormData({...studentFormData, id: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Nome Completo</label>
                        <input 
                          required
                          type="text" 
                          value={studentFormData.name}
                          onChange={(e) => setStudentFormData({...studentFormData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Gênero</label>
                    <select 
                      value={studentFormData.gender}
                      onChange={(e) => setStudentFormData({...studentFormData, gender: e.target.value as any})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Data de Nascimento</label>
                    <input 
                      required
                      type="date" 
                      value={studentFormData.birthDate}
                      onChange={(e) => setStudentFormData({...studentFormData, birthDate: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Contacto Encarregado</label>
                    <input 
                      required
                      type="text" 
                      value={studentFormData.guardianContact}
                      onChange={(e) => setStudentFormData({...studentFormData, guardianContact: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Filiação */}
                  <div className="md:col-span-3">
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-600 mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Filiação
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Nome do Pai</label>
                        <input 
                          type="text" 
                          value={studentFormData.fatherName}
                          onChange={(e) => setStudentFormData({...studentFormData, fatherName: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Nome da Mãe</label>
                        <input 
                          type="text" 
                          value={studentFormData.motherName}
                          onChange={(e) => setStudentFormData({...studentFormData, motherName: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Naturalidade */}
                  <div className="md:col-span-3">
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-600 mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Naturalidade
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Província</label>
                        <input 
                          type="text" 
                          value={studentFormData.birthProvince}
                          onChange={(e) => setStudentFormData({...studentFormData, birthProvince: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Município</label>
                        <input 
                          type="text" 
                          value={studentFormData.birthMunicipality}
                          onChange={(e) => setStudentFormData({...studentFormData, birthMunicipality: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documento */}
                  <div className="md:col-span-3">
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-600 mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Documento de Identificação
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Nº do Documento</label>
                        <input 
                          type="text" 
                          value={studentFormData.idDocumentNumber}
                          onChange={(e) => setStudentFormData({...studentFormData, idDocumentNumber: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Data de Emissão</label>
                        <input 
                          type="date" 
                          value={studentFormData.idDocumentIssueDate}
                          onChange={(e) => setStudentFormData({...studentFormData, idDocumentIssueDate: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsStudentModalOpen(false)}
                    className="flex-1 px-6 py-4 border border-stone-200 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {editingStudent ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {isEnrollmentModalOpen && selectedStudentForEnrollment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEnrollmentModalOpen(false)}
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
                  <h3 className="text-xl font-bold text-stone-900">Nova Matrícula</h3>
                  <p className="text-stone-500 text-xs italic serif">Vincular aluno a um ano letivo e turma.</p>
                </div>
                <button 
                  onClick={() => setIsEnrollmentModalOpen(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
                >
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>
              
              <form onSubmit={handleEnrollmentSubmit} className="p-8 space-y-6">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-stone-200 text-emerald-600 font-bold">
                    {selectedStudentForEnrollment.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">{selectedStudentForEnrollment.name}</p>
                    <p className="text-xs text-stone-400">Proc: {selectedStudentForEnrollment.id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Ano Letivo</label>
                    <input 
                      required
                      type="number" 
                      value={enrollmentFormData.academicYear}
                      onChange={(e) => setEnrollmentFormData({...enrollmentFormData, academicYear: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Classe</label>
                      <select 
                        value={enrollmentFormData.gradeLevel}
                        onChange={(e) => setEnrollmentFormData({...enrollmentFormData, gradeLevel: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      >
                        {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}ª Classe</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 ml-1">Turma</label>
                      <input 
                        required
                        type="text" 
                        maxLength={1}
                        value={enrollmentFormData.section}
                        onChange={(e) => setEnrollmentFormData({...enrollmentFormData, section: e.target.value.toUpperCase()})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit"
                  className="w-full px-6 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Confirmar Matrícula
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
