export type UserRole = 'admin' | 'teacher' | 'parent';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Student {
  id: string; // Nº de Processo
  name: string;
  gender: 'M' | 'F';
  birthDate: string;
  fatherName: string;
  motherName: string;
  birthProvince: string;
  birthMunicipality: string;
  idDocumentNumber: string;
  idDocumentIssueDate: string;
  guardianContact: string;
  parentId?: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  academicYear: number;
  studentId: string;
  gradeLevel: number; // 1ª à 6ª
  section: string; // A a Z
  status: 'active' | 'transferred' | 'dropped';
  classId?: string; // Optional link to a Class object if needed
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  subject: string;
  phone?: string;
}

export interface Class {
  id: string;
  name: string;
  gradeLevel: number;
  teacherId: string;
  year: number;
  section: string;
}

export interface GradeEntry {
  id: string;
  studentId: string;
  enrollmentId: string;
  subject: string;
  term: 1 | 2 | 3;
  mac: number; // Média de Avaliação Contínua (0-10)
  npt: number; // Nota de Prova Trimestral (0-10)
  mt: number; // Média Trimestral (Calculated)
}

export interface FinalGrade {
  id: string;
  studentId: string;
  enrollmentId: string;
  subject: string;
  mt1: number;
  mt2: number;
  mt3: number;
  mfd: number; // Média Final da Disciplina (Calculated)
  ne?: number; // Nota de Exame (6ª Classe)
  cf?: number; // Classificação Final (Calculated)
  nr?: number; // Nota de Recurso
  cfd?: number; // Classificação Final Definitiva
}

export interface Attendance {
  id: string;
  studentId: string;
  enrollmentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  month: string;
}

export interface Transport {
  id: string;
  routeName: string;
  driverName: string;
  vehiclePlate: string;
  capacity: number;
}
