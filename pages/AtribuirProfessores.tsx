import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Teacher, Assignment, ClassLevel, Turma, CLASS_LEVELS, TURMAS } from '../types';
import PageHeader from '../components/PageHeader';

const AtribuirProfessores: React.FC = () => {
    const [teachers] = useLocalStorage<Teacher[]>('teachers', []);
    const [assignments, setAssignments] = useLocalStorage<Assignment[]>('assignments', []);
    
    const [selectedClass, setSelectedClass] = useState<ClassLevel>('1ª Classe');
    const [selectedTurma, setSelectedTurma] = useState<Turma>('A');
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacherId) return;

        const assignmentId = `${selectedClass}-${selectedTurma}`;
        const existingAssignmentIndex = assignments.findIndex(a => a.id === assignmentId);

        const newAssignment: Assignment = {
            id: assignmentId,
            classLevel: selectedClass,
            turma: selectedTurma,
            teacherId: selectedTeacherId,
        };

        if (existingAssignmentIndex > -1) {
            const updatedAssignments = [...assignments];
            updatedAssignments[existingAssignmentIndex] = newAssignment;
            setAssignments(updatedAssignments);
        } else {
            setAssignments([...assignments, newAssignment]);
        }
        
        const teacherName = teachers.find(t => t.id === selectedTeacherId)?.name;
        setSuccessMessage(`Professor ${teacherName} atribuído à ${selectedClass} - Turma ${selectedTurma} com sucesso!`);
        setTimeout(() => setSuccessMessage(null), 5000);
    };
    
    const assignmentsWithNames = useMemo(() => {
        return assignments.map(assignment => {
            const teacher = teachers.find(t => t.id === assignment.teacherId);
            return {
                ...assignment,
                teacherName: teacher ? teacher.name : "Professor não encontrado"
            };
        }).sort((a,b) => a.id.localeCompare(b.id));
    }, [assignments, teachers]);

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader title="Atribuir Professores às Turmas" />

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Atribuir Turma</h3>
                         {successMessage && (
                            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded-md text-sm" role="alert">
                                {successMessage}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Select label="Classe" value={selectedClass} onChange={e => setSelectedClass(e.target.value as ClassLevel)}>
                                {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                            <Select label="Turma" value={selectedTurma} onChange={e => setSelectedTurma(e.target.value as Turma)}>
                                {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                            <Select label="Professor" value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)} required>
                                <option value="">Selecione um professor</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </Select>

                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200"
                            >
                                Salvar Atribuição
                            </button>
                        </form>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Atribuições Actuais</h3>
                         <div className="overflow-y-auto max-h-96">
                             {assignmentsWithNames.length > 0 ? (
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-2 px-3 text-left font-medium text-gray-600">Classe</th>
                                            <th className="py-2 px-3 text-left font-medium text-gray-600">Turma</th>
                                            <th className="py-2 px-3 text-left font-medium text-gray-600">Professor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {assignmentsWithNames.map((a) => (
                                            <tr key={a.id}>
                                                <td className="py-2 px-3 text-gray-800">{a.classLevel}</td>
                                                <td className="py-2 px-3 text-gray-800">{a.turma}</td>
                                                <td className="py-2 px-3 text-gray-800 font-medium">{a.teacherName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center text-gray-500 py-4">Nenhuma atribuição realizada.</p>
                            )}
                        </div>
                    </div>
                </div>
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


export default AtribuirProfessores;
