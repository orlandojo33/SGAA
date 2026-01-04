import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Student, StudentGrades, ClassLevel, Turma, Trimester, Subject, SUBJECTS_1_TO_5, SUBJECTS_6, CLASS_LEVELS, TURMAS, Teacher, Assignment, SchoolConfig } from '../types';
import PageHeader from '../components/PageHeader';
import { calculateMT } from '../lib/helpers';

const AvaliacaoTrimestral: React.FC = () => {
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
    
    const [selectedClass, setSelectedClass] = useState<ClassLevel>('1ª Classe');
    const [selectedTurma, setSelectedTurma] = useState<Turma>('A');
    const [selectedTrimester, setSelectedTrimester] = useState<Trimester>('T1');

    const filteredStudents = useMemo(() => {
        return students
            .filter(s => s.classLevel === selectedClass && s.turma === selectedTurma)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [students, selectedClass, selectedTurma]);

    const subjects: Subject[] = useMemo(() => {
        return ['1ª Classe', '2ª Classe', '3ª Classe', '4ª Classe', '5ª Classe'].includes(selectedClass)
            ? SUBJECTS_1_TO_5
            : SUBJECTS_6;
    }, [selectedClass]);

    const handleGradeChange = (studentId: string, subject: Subject, type: 'mac' | 'npt', value: string) => {
        const numericValue = value === '' ? null : parseFloat(value);
        if (numericValue !== null && (isNaN(numericValue) || numericValue < 0 || numericValue > 10)) {
            return;
        }

        setGrades(prevGrades => {
            const newGrades = JSON.parse(JSON.stringify(prevGrades));
            
            if (!newGrades[studentId]) newGrades[studentId] = {};
            if (!newGrades[studentId][subject]) {
                 newGrades[studentId][subject] = {
                    T1: { mac: null, npt: null },
                    T2: { mac: null, npt: null },
                    T3: { mac: null, npt: null },
                };
            }
            if (!newGrades[studentId][subject]![selectedTrimester]) {
                newGrades[studentId][subject]![selectedTrimester] = { mac: null, npt: null };
            }

            newGrades[studentId][subject]![selectedTrimester][type] = numericValue;
            
            return newGrades;
        });
    };

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
        professor: assignedTeacherName,
    };

    return (
        <div>
            <PageHeader title="Mapa de Avaliação Trimestral" schoolInfo={headerInfo} />

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select label="Classe" value={selectedClass} onChange={e => setSelectedClass(e.target.value as ClassLevel)}>
                        {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                    <Select label="Turma" value={selectedTurma} onChange={e => setSelectedTurma(e.target.value as Turma)}>
                        {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                     <Select label="Trimestre" value={selectedTrimester} onChange={e => setSelectedTrimester(e.target.value as Trimester)}>
                        <option value="T1">1º Trimestre</option>
                        <option value="T2">2º Trimestre</option>
                        <option value="T3">3º Trimestre</option>
                    </Select>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                        <tr>
                            <th scope="col" className="px-2 py-3 border" rowSpan={2}>Nº</th>
                            <th scope="col" className="px-4 py-3 border" rowSpan={2}>Nome</th>
                            <th scope="col" className="px-1 py-3 border" rowSpan={2}>Sexo</th>
                            {subjects.map(subject => (
                                <th key={subject} scope="col" className="px-2 py-1 border text-center" colSpan={3}>{subject}</th>
                            ))}
                        </tr>
                        <tr>
                            {subjects.map(subject => (
                                <React.Fragment key={`${subject}-sub`}>
                                    <th className="px-2 py-2 border text-center font-medium">MAC</th>
                                    <th className="px-2 py-2 border text-center font-medium">NPT</th>
                                    <th className="px-2 py-2 border text-center font-semibold bg-gray-200">MT</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student, index) => {
                            const studentGrades = grades[student.id] || {};
                            return (
                                <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-2 py-2 border">{index + 1}</td>
                                    <th scope="row" className="px-4 py-2 border font-medium text-gray-900 whitespace-nowrap">{student.name}</th>
                                    <td className="px-1 py-2 border text-center">{student.gender === 'Masculino' ? 'M' : 'F'}</td>
                                    {subjects.map(subject => {
                                        const grade = studentGrades[subject]?.[selectedTrimester] || { mac: null, npt: null };
                                        const mt = calculateMT(grade.mac, grade.npt);
                                        return (
                                            <React.Fragment key={`${student.id}-${subject}`}>
                                                <td className="p-0 border">
                                                    <GradeInput type="number" value={grade.mac ?? ''} onChange={e => handleGradeChange(student.id, subject, 'mac', e.target.value)} />
                                                </td>
                                                <td className="p-0 border">
                                                    <GradeInput type="number" value={grade.npt ?? ''} onChange={e => handleGradeChange(student.id, subject, 'npt', e.target.value)} />
                                                </td>
                                                <td className={`px-2 py-2 border text-center font-bold ${mt !== null && mt < 5 ? 'text-red-600' : 'text-gray-800'}`}>
                                                    {mt !== null ? mt.toFixed(2) : '-'}
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
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

const GradeInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props}
        className="w-full h-full px-2 py-2 border-0 text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
        min="0"
        max="10"
        step="0.01"
    />
);

const Select: React.FC<{label: string} & React.SelectHTMLAttributes<HTMLSelectElement>> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select {...props} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black">
            {children}
        </select>
    </div>
);

export default AvaliacaoTrimestral;