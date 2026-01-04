import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Student, StudentGrades, ClassLevel, Turma, Subject, SUBJECTS_1_TO_5, CLASS_LEVELS, TURMAS, Teacher, Assignment, SchoolConfig } from '../types';
import PageHeader from '../components/PageHeader';
import { calculateMT, getStatus1to5 } from '../lib/helpers';

const MapaFinal: React.FC = () => {
    const [students] = useLocalStorage<Student[]>('students', []);
    const [grades] = useLocalStorage<StudentGrades>('grades', {});
    const [teachers] = useLocalStorage<Teacher[]>('teachers', []);
    const [assignments] = useLocalStorage<Assignment[]>('assignments', []);
     const [schoolConfig] = useLocalStorage<SchoolConfig>('schoolConfig', {
        schoolName: 'ESCOLA PRIMÁRIA Nº 1855 - DOMINGOS GUSMÃO',
        academicYear: new Date().getFullYear().toString(),
        province: 'Huíla',
        city: 'Lubango'
    });
    
    const [selectedClass, setSelectedClass] = useState<ClassLevel>('1ª Classe');
    const [selectedTurma, setSelectedTurma] = useState<Turma>('A');

    const applicableClasses = CLASS_LEVELS.filter(c => c !== '6ª Classe');

    const filteredStudents = useMemo(() => {
        return students
            .filter(s => s.classLevel === selectedClass && s.turma === selectedTurma)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [students, selectedClass, selectedTurma]);

    const subjects: Subject[] = SUBJECTS_1_TO_5;
    
    const assignedTeacherName = useMemo(() => {
        const assignment = assignments.find(a => a.classLevel === selectedClass && a.turma === selectedTurma);
        if (assignment) {
            const teacher = teachers.find(t => t.id === assignment.teacherId);
            return teacher ? teacher.name : "Não atribuído";
        }
        return "Não atribuído";
    }, [assignments, teachers, selectedClass, selectedTurma]);

    const headerInfo = {
        anoLectivo: schoolConfig.academicYear,
        escola: schoolConfig.schoolName,
        province: schoolConfig.province,
        city: schoolConfig.city,
        classe: selectedClass,
        turma: selectedTurma,
        professor: assignedTeacherName
    };

    return (
        <div>
            <PageHeader title="Mapa Final de Aproveitamento" schoolInfo={headerInfo} />

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Classe" value={selectedClass} onChange={e => setSelectedClass(e.target.value as ClassLevel)}>
                        {applicableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                    <Select label="Turma" value={selectedTurma} onChange={e => setSelectedTurma(e.target.value as Turma)}>
                        {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                        <tr>
                            <th rowSpan={2} className="px-2 py-3 border">Nº</th>
                            <th rowSpan={2} className="px-4 py-3 border">Nome</th>
                            {subjects.map(subject => (
                                <th key={subject} colSpan={3} className="px-2 py-1 border text-center">{subject}</th>
                            ))}
                            <th rowSpan={2} className="px-4 py-3 border">Observação</th>
                        </tr>
                        <tr>
                            {subjects.map(subject => (
                                <React.Fragment key={`${subject}-trim`}>
                                    <th className="px-2 py-2 border text-center font-medium">T1</th>
                                    <th className="px-2 py-2 border text-center font-medium">T2</th>
                                    <th className="px-2 py-2 border text-center font-medium">T3</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student, index) => {
                            const studentGrades = grades[student.id] || {};
                            const status = getStatus1to5(student, grades, subjects);
                            return (
                                <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-2 py-2 border">{index + 1}</td>
                                    <th scope="row" className="px-4 py-2 border font-medium text-gray-900 whitespace-nowrap">{student.name}</th>
                                    {subjects.map(subject => {
                                        const subjectGradeData = studentGrades[subject];
                                        const mt1 = calculateMT(subjectGradeData?.T1.mac, subjectGradeData?.T1.npt);
                                        const mt2 = calculateMT(subjectGradeData?.T2.mac, subjectGradeData?.T2.npt);
                                        const mt3 = calculateMT(subjectGradeData?.T3.mac, subjectGradeData?.T3.npt);
                                        return (
                                            <React.Fragment key={`${student.id}-${subject}`}>
                                                <td className={`px-2 py-2 border text-center font-semibold ${mt1 !== null && mt1 < 5 ? 'text-red-600' : ''}`}>{mt1?.toFixed(2) ?? '-'}</td>
                                                <td className={`px-2 py-2 border text-center font-semibold ${mt2 !== null && mt2 < 5 ? 'text-red-600' : ''}`}>{mt2?.toFixed(2) ?? '-'}</td>
                                                <td className={`px-2 py-2 border text-center font-semibold ${mt3 !== null && mt3 < 5 ? 'text-red-600' : ''}`}>{mt3?.toFixed(2) ?? '-'}</td>
                                            </React.Fragment>
                                        );
                                    })}
                                    <td className={`px-4 py-2 border font-bold text-center ${status === 'Aprovado' ? 'text-green-600' : 'text-red-600'}`}>
                                        {status}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredStudents.length === 0 && <p className="text-center p-4 text-gray-500">Nenhum aluno encontrado para esta classe e turma.</p>}
            </div>
        </div>
    );
};

const Select: React.FC<{label: string} & React.SelectHTMLAttributes<HTMLSelectElement>> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black">
            {children}
        </select>
    </div>
);

export default MapaFinal;