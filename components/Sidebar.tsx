
import React from 'react';
import { Page } from '../types';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
    page: Page;
    label: string;
    icon: React.ReactNode;
    currentPage: Page;
    onClick: (page: Page) => void;
}> = ({ page, label, icon, currentPage, onClick }) => {
    const isActive = currentPage === page;
    return (
        <li
            onClick={() => onClick(page)}
            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
                isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            <span className="mr-3">{icon}</span>
            <span className="font-medium">{label}</span>
        </li>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
    return (
        <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-2xl">
            <div className="text-center mb-10 mt-4">
                <h1 className="text-2xl font-bold text-white">SIGA</h1>
                <p className="text-xs text-gray-400">Gestão de Avaliação</p>
            </div>
            <nav className="flex flex-col flex-grow">
                <ul className="flex-grow">
                    <NavItem
                        page="dashboard"
                        label="Dashboard"
                        icon={<HomeIcon />}
                        currentPage={currentPage}
                        onClick={setCurrentPage}
                    />
                    <NavItem
                        page="matricula"
                        label="Matrícula"
                        icon={<UserPlusIcon />}
                        currentPage={currentPage}
                        onClick={setCurrentPage}
                    />
                     <NavItem
                        page="professores"
                        label="Professores"
                        icon={<UsersIcon />}
                        currentPage={currentPage}
                        onClick={setCurrentPage}
                    />
                    <NavItem
                        page="atribuicoes"
                        label="Atribuir Professores"
                        icon={<ClipboardCheckIcon />}
                        currentPage={currentPage}
                        onClick={setCurrentPage}
                    />
                    <NavItem
                        page="avaliacao"
                        label="Avaliação Trimestral"
                        icon={<ClipboardIcon />}
                        currentPage={currentPage}
                        onClick={setCurrentPage}
                    />
                    <NavItem
                        page="mapa_final"
                        label="Mapa Final (1ª-5ª)"
                        icon={<DocumentTextIcon />}
                        currentPage={currentPage}
                        onClick={setCurrentPage}
                    />
                     <NavItem
                        page="pauta_final"
                        label="Pauta Final (6ª)"
                        icon={<AcademicCapIcon />}
                        currentPage={currentPage}
                        onClick={setCurrentPage}
                    />
                </ul>
                 <ul>
                     <NavItem
                        page="configuracoes"
                        label="Configurações"
                        icon={<CogIcon />}
                        currentPage={currentPage}
                        onClick={setCurrentPage}
                    />
                </ul>
            </nav>
        </aside>
    );
};

// Icons
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const UserPlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
);

const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const DocumentTextIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const AcademicCapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ClipboardCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


export default Sidebar;