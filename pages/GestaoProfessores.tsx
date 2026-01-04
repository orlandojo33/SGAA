import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Teacher, NivelAcademico, NIVEIS_ACADEMICOS } from '../types';
import PageHeader from '../components/PageHeader';

const GestaoProfessores: React.FC = () => {
    const [teachers, setTeachers] = useLocalStorage<Teacher[]>('teachers', []);
    const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
        name: '',
        dob: '',
        areaFormacao: '',
        nivelAcademico: 'Licenciatura',
        dataInicioFuncao: ''
    });
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newTeacher: Teacher = {
            id: new Date().getTime().toString(),
            ...formData,
        };

        setTeachers([...teachers, newTeacher]);
        setSuccessMessage(`Professor(a) ${newTeacher.name} adicionado(a) com sucesso!`);
        
        setFormData({
            name: '',
            dob: '',
            areaFormacao: '',
            nivelAcademico: 'Licenciatura',
            dataInicioFuncao: ''
        });

        setTimeout(() => setSuccessMessage(null), 5000);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <PageHeader title="Gestão de Professores" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Professor</h3>
                         {successMessage && (
                            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded-md text-sm" role="alert">
                                {successMessage}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Nome Completo" name="name" value={formData.name} onChange={handleChange} required />
                            <Input label="Data de Nascimento" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
                            <Input label="Área de Formação" name="areaFormacao" value={formData.areaFormacao} onChange={handleChange} placeholder="Ex: Ensino Primário" required />
                            <Select label="Nível Académico" name="nivelAcademico" value={formData.nivelAcademico} onChange={handleChange}>
                                {NIVEIS_ACADEMICOS.map(n => <option key={n} value={n}>{n}</option>)}
                            </Select>
                            <Input label="Data de Início de Função" name="dataInicioFuncao" type="date" value={formData.dataInicioFuncao} onChange={handleChange} required />
                            
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200"
                            >
                                Adicionar
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Professores</h3>
                        <div className="overflow-x-auto">
                            {teachers.length > 0 ? (
                                <table className="min-w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                                        <tr>
                                            <th className="py-3 px-4">Nº</th>
                                            <th className="py-3 px-4">Nome</th>
                                            <th className="py-3 px-4">Área de Formação</th>
                                            <th className="py-3 px-4">Nível Académico</th>
                                            <th className="py-3 px-4">Início de Função</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {teachers.map((teacher, index) => (
                                            <tr key={teacher.id} className="hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                                                <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">{teacher.name}</td>
                                                <td className="py-3 px-4 text-gray-600">{teacher.areaFormacao}</td>
                                                <td className="py-3 px-4 text-gray-600">{teacher.nivelAcademico}</td>
                                                <td className="py-3 px-4 text-gray-600">{teacher.dataInicioFuncao ? new Date(teacher.dataInicioFuncao).toLocaleDateString('pt-PT') : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center text-gray-500 py-4">Nenhum professor cadastrado.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const Input: React.FC<InputProps> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input {...props} id={props.name} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black" />
    </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
}
const Select: React.FC<SelectProps> = ({ label, children, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-700">{label}</label>
        <select {...props} id={props.name} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black">
            {children}
        </select>
    </div>
);

export default GestaoProfessores;