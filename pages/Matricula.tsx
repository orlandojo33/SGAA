import React, { useState } from 'react';
import { Student, Gender, ClassLevel, Turma, CLASS_LEVELS, TURMAS, PROVINCIAS } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import PageHeader from '../components/PageHeader';

const Matricula: React.FC = () => {
    const [students, setStudents] = useLocalStorage<Student[]>('students', []);
    const [formData, setFormData] = useState<Omit<Student, 'id'>>({
        name: '',
        gender: Gender.MALE,
        dob: '',
        filiacao: { mae: '', pai: '' },
        naturalidade: { municipio: '', provincia: 'Bengo' },
        identificacao: { numero: '', dataEmissao: '' },
        classLevel: '1ª Classe',
        turma: 'A',
    });
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            if (name.includes('.')) {
                const [parent, child] = name.split('.');
                if (parent === 'filiacao' || parent === 'naturalidade' || parent === 'identificacao') {
                    return {
                        ...prev,
                        [parent]: {
                            ...prev[parent],
                            [child]: value,
                        },
                    };
                }
            }
            return {
                ...prev,
                [name]: value,
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newStudent: Student = {
            id: new Date().getTime().toString(), // simple unique id
            ...formData,
        };
        setStudents([...students, newStudent]);
        setSuccessMessage(`Aluno(a) ${newStudent.name} matriculado(a) com sucesso!`);
        
        // Reset form
        setFormData({
            name: '', gender: Gender.MALE, dob: '',
            filiacao: { mae: '', pai: '' },
            naturalidade: { municipio: '', provincia: 'Bengo' },
            identificacao: { numero: '', dataEmissao: '' },
            classLevel: '1ª Classe', turma: 'A',
        });

        setTimeout(() => setSuccessMessage(null), 5000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader title="Formulário de Matrícula" />
            
            <div className="bg-white p-8 rounded-lg shadow-md">
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
                        <p className="font-bold">Sucesso</p>
                        <p>{successMessage}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Section title="Dados Pessoais">
                        <Input label="Nome Completo" name="name" value={formData.name} onChange={handleChange} required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select label="Gênero" name="gender" value={formData.gender} onChange={handleChange}>
                                {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                            </Select>
                            <Input label="Data de Nascimento" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
                        </div>
                    </Section>

                    <Section title="Filiação">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nome do Pai" name="filiacao.pai" value={formData.filiacao.pai} onChange={handleChange} required />
                            <Input label="Nome da Mãe" name="filiacao.mae" value={formData.filiacao.mae} onChange={handleChange} required />
                        </div>
                    </Section>

                    <Section title="Naturalidade">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select label="Província" name="naturalidade.provincia" value={formData.naturalidade.provincia} onChange={handleChange}>
                                {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                            </Select>
                            <Input label="Município" name="naturalidade.municipio" value={formData.naturalidade.municipio} onChange={handleChange} required />
                        </div>
                    </Section>

                    <Section title="Identificação">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nº do Documento" name="identificacao.numero" value={formData.identificacao.numero} onChange={handleChange} />
                            <Input label="Data de Emissão" name="identificacao.dataEmissao" type="date" value={formData.identificacao.dataEmissao} onChange={handleChange} />
                        </div>
                    </Section>

                    <Section title="Dados da Matrícula">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select label="Classe" name="classLevel" value={formData.classLevel} onChange={handleChange}>
                                {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                            <Select label="Turma" name="turma" value={formData.turma} onChange={handleChange}>
                               {TURMAS.map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </div>
                    </Section>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200">
                            Matricular Aluno
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <fieldset className="border-t pt-4">
        <legend className="text-lg font-semibold text-gray-700 px-2 -mt-7 bg-white">{title}</legend>
        <div className="pt-2 space-y-4">{children}</div>
    </fieldset>
);

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


export default Matricula;