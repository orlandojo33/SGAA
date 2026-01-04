
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Matricula from './pages/Matricula';
import AvaliacaoTrimestral from './pages/AvaliacaoTrimestral';
import MapaFinal from './pages/MapaFinal';
import PautaFinal from './pages/PautaFinal';
import GestaoProfessores from './pages/GestaoProfessores';
import AtribuirProfessores from './pages/AtribuirProfessores';
import Configuracoes from './pages/Configuracoes';
import { Page } from './types';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'matricula':
                return <Matricula />;
            case 'professores':
                return <GestaoProfessores />;
            case 'atribuicoes':
                return <AtribuirProfessores />;
            case 'avaliacao':
                return <AvaliacaoTrimestral />;
            case 'mapa_final':
                return <MapaFinal />;
            case 'pauta_final':
                return <PautaFinal />;
            case 'configuracoes':
                return <Configuracoes />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;