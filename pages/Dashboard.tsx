
import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Student } from '../types';

const Dashboard: React.FC = () => {
    const [students] = useLocalStorage<Student[]>('students', []);

    return (
        <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Bem-vindo ao SIGA</h1>
            <p className="text-lg text-gray-600 mb-8">Sistema Integrado de Gestão de Avaliação</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <UsersIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total de Alunos</p>
                        <p className="text-2xl font-bold text-gray-800">{students.length}</p>
                    </div>
                </div>
            </div>

            <div className="mt-10 bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Guia Rápido</h2>
                <ul className="list-disc list-inside space-y-3 text-gray-700">
                    <li>
                        <span className="font-semibold">Matrícula:</span> Registe novos alunos no sistema através do menu "Matrícula".
                    </li>
                    <li>
                        <span className="font-semibold">Avaliação Trimestral:</span> Lance as notas (MAC e NPT) para cada aluno por disciplina e trimestre.
                    </li>
                    <li>
                        <span className="font-semibold">Mapa Final (1ª-5ª):</span> Consulte o resumo anual e o estado final (Aprovado/Reprovado) dos alunos das classes sem exame.
                    </li>
                    <li>
                        <span className="font-semibold">Pauta Final (6ª):</span> Lance as notas de exame e recurso e consulte a pauta final para os alunos da 6ª Classe.
                    </li>
                </ul>
            </div>
        </div>
    );
};


const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.968 0M12 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM9 9.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM3.75 12a3 3 0 013-3h1.5M12 12.75a3 3 0 01-3 3H4.5a3 3 0 01-3-3V12a3 3 0 013-3h1.5" />
    </svg>
);


export default Dashboard;
