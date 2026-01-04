import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Student, StudentGrades, Turma, Subject, SUBJECTS_6, TURMAS, Teacher, Assignment, SchoolConfig } from '../types';
import PageHeader from '../components/PageHeader';
import { calculateMDF, calculateCF, getStatus6 } from '../lib/helpers';

const PautaFinal: React.FC = () => {
    const [students] = useLocalStorage<Student[]>('students', []);
    const [grades, setGrades] = useLocalStorage<StudentGrades>('grades', {});
    const [teachers] = useLocalStorage<Teacher[]>('teachers', []);
    const [assignments] = useLocalStorage<Assignment[]>('assignments', []);
    const [schoolConfig] = useLocalStorage<SchoolConfig>('schoolConfig', {
        schoolName: 'ESCOLA PRIMÁRIA Nº 1855 - DOMINGOS GUSMÃO',
        academicYear: new Date().getFullYear().toString(),
        province: 'Huíla',
        city: 'Lubango'
    });
    
    const [selectedTurma, setSelectedTurma] = useState<Turma>('A');

    const filteredStudents = useMemo(() => {
        return students
            .filter(s => s.classLevel === '6ª Classe' && s.turma === selectedTurma)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [students, selectedTurma]);

    const subjects: Subject[] = SUBJECTS_6;
    
    const handleGradeChange = (studentId: string, subject: Subject, type: 'NE' | 'NR', value: string) => {
        const numericValue = value === '' ? null : parseFloat(value);
        if (numericValue !== null && (isNaN(numericValue) || numericValue < 0 || numericValue > 10)) {
            return;
        }

        setGrades(prevGrades => {
            const newGrades = JSON.parse(JSON.stringify(prevGrades));
            if (!newGrades[studentId]) newGrades[studentId] = {};
            if (!newGrades[studentId][subject]) {
                 newGrades[studentId][subject] = {
                    T1: { mac: null, npt: null }, T2: { mac: null, npt: null }, T3: { mac: null, npt: null },
                };
            }
            newGrades[studentId][subject][type] = numericValue;
            return newGrades;
        });
    };

    const assignedTeacherName = useMemo(() => {
        const assignment = assignments.find(a => a.classLevel === '6ª Classe' && a.turma === selectedTurma);
        if (assignment) {
            const teacher = teachers.find(t => t.id === assignment.teacherId);
            return teacher ? teacher.name : "Não atribuído";
        }
        return "Não atribuído";
    }, [assignments, teachers, selectedTurma]);

    const headerInfo = {
        anoLectivo: schoolConfig.academicYear,
        escola: schoolConfig.schoolName,
        province: schoolConfig.province,
        city: schoolConfig.city,
        classe: "6ª Classe",
        turma: selectedTurma,
        professor: assignedTeacherName
    };

    return (
        <div>
            <PageHeader title={`Pauta Nº ___ / ${schoolConfig.academicYear}`} schoolInfo={headerInfo} />

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                 <Select label="Turma" value={selectedTurma} onChange={e => setSelectedTurma(e.target.value as Turma)}>
                        {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                        <tr>
                            <th rowSpan={2} className="px-2 py-3 border">Nº</th>
                            <th rowSpan={2} className="px-4 py-3 border">Nome</th>
                            <th rowSpan={2} className="px-1 py-3 border text-center">Sexo</th>
                            {subjects.map(subject => (
                                <th key={subject} colSpan={5} className="px-2 py-1 border text-center">{subject}</th>
                            ))}
                            <th rowSpan={2} className="px-4 py-3 border">Observação Final</th>
                        </tr>
                        <tr>
                            {subjects.map(subject => (
                                <React.Fragment key={`${subject}-sub`}>
                                    <th className="px-1 py-2 border text-center font-medium">MDF</th>
                                    <th className="px-1 py-2 border text-center font-medium">NE</th>
                                    <th className="px-1 py-2 border text-center font-bold bg-gray-200">CF</th>
                                    <th className="px-1 py-2 border text-center font-medium">NR</th>
                                    <th className="px-1 py-2 border text-center font-bold bg-blue-100">MF</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student, index) => {
                             const studentGrades = grades[student.id] || {};
                             const status = getStatus6(student, grades, subjects);
                            return (
                                <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-2 py-2 border">{index + 1}</td>
                                    <th scope="row" className="px-4 py-2 border font-medium text-gray-900 whitespace-nowrap">{student.name}</th>
                                    <td className="px-1 py-2 border text-center">{student.gender === 'Masculino' ? 'M' : 'F'}</td>
                                    {subjects.map(subject => {
                                        const sGrades = studentGrades[subject];
                                        const mdf = calculateMDF(sGrades);
                                        const cf = calculateCF(mdf, sGrades?.NE ?? null);
                                        const finalGradeAfterRecourse = cf !== null && cf < 5 && sGrades?.NR !== null && sGrades?.NR !== undefined ? Math.max(cf, sGrades.NR) : cf;

                                        return (
                                            <React.Fragment key={`${student.id}-${subject}`}>
                                                <td className={`px-1 py-2 border text-center font-semibold ${mdf !== null && mdf < 5 ? 'text-red-600' : ''}`}>{mdf?.toFixed(2) ?? '-'}</td>
                                                <td className="p-0 border">
                                                    <GradeInput value={sGrades?.NE ?? ''} onChange={e => handleGradeChange(student.id, subject, 'NE', e.target.value)} />
                                                </td>
                                                <td className={`px-1 py-2 border text-center font-bold ${cf !== null && cf < 5 ? 'text-red-600' : ''}`}>{cf?.toFixed(2) ?? '-'}</td>
                                                <td className="p-0 border">
                                                    <GradeInput value={sGrades?.NR ?? ''} onChange={e => handleGradeChange(student.id, subject, 'NR', e.target.value)} disabled={cf === null || cf >= 5} />
                                                </td>
                                                <td className={`px-1 py-2 border text-center font-bold ${finalGradeAfterRecourse !== null && finalGradeAfterRecourse < 5 ? 'text-red-600' : 'text-blue-700'}`}>{finalGradeAfterRecourse?.toFixed(2) ?? '-'}</td>
                                            </React.Fragment>
                                        );
                                    })}
                                    <td className={`px-4 py-2 border font-bold text-center ${status.includes('Aprovado') ? 'text-green-600' : status.includes('Reprovado') ? 'text-red-600' : 'text-yellow-600'}`}>
                                        {status}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredStudents.length === 0 && <p className="text-center p-4 text-gray-500">Nenhum aluno encontrado para a 6ª Classe nesta turma.</p>}
            </div>
        </div>
    );
};


const GradeInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        type="number"
        {...props}
        className="w-full h-full px-1 py-2 border-0 text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-black"
        min="0"
        max="10"
        step="0.01"
    />
);


const Select: React.FC<{label: string} & React.SelectHTMLAttributes<HTMLSelectElement>> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="block w-full max-w-xs px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black">
            {children}
        </select>
    </div>
);


export default PautaFinal;