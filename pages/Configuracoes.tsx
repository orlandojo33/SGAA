import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { SchoolConfig, PROVINCIAS } from '../types';
import PageHeader from '../components/PageHeader';

const Configuracoes: React.FC = () => {
    const [schoolConfig, setSchoolConfig] = useLocalStorage<SchoolConfig>('schoolConfig', {
        schoolName: 'ESCOLA PRIMÁRIA Nº 1855 - DOMINGOS GUSMÃO',
        academicYear: new Date().getFullYear().toString(),
        province: 'Huíla',
        city: 'Lubango'
    });
    const [formData, setFormData] = useState<SchoolConfig>(schoolConfig);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        setFormData(schoolConfig);
    }, [schoolConfig]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSchoolConfig(formData);
        setSuccessMessage('Configurações salvas com sucesso!');
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader title="Configurações do Sistema" />
            
            <div className="bg-white p-8 rounded-lg shadow-md">
                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
                        <p className="font-bold">Sucesso</p>
                        <p>{successMessage}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Informações da Escola</legend>
                        <div className="space-y-4 mt-2">
                             <Input 
                                label="Nome da Escola" 
                                name="schoolName" 
                                value={formData.schoolName} 
                                onChange={handleChange} 
                                required 
                            />
                            <Input 
                                label="Ano Lectivo" 
                                name="academicYear" 
                                value={formData.academicYear} 
                                onChange={handleChange} 
                                required 
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <Select label="Província" name="province" value={formData.province} onChange={handleChange}>
                                    {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                                </Select>
                               <Input 
                                    label="Município" 
                                    name="city" 
                                    value={formData.city} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        </div>
                    </fieldset>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
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

export default Configuracoes;
