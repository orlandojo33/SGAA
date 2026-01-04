
import React from 'react';

interface PageHeaderProps {
    title: string;
    schoolInfo?: {
        anoLectivo: string;
        escola: string;
        classe: string;
        turma: string;
        professor: string;
        province?: string;
        city?: string;
    }
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, schoolInfo }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border-t-4 border-blue-600">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/3/33/Emblem_of_Angola.svg" alt="Emblema de Angola" className="h-20 w-20 mr-4" />
                    <div className="text-sm text-gray-700">
                        <p className="font-bold">REPÚBLICA DE ANGOLA</p>
                        <p>Governo Provincial {schoolInfo?.province ? `de ${schoolInfo.province}` : ''}</p>
                        <p>Administração Municipal {schoolInfo?.city ? `de ${schoolInfo.city}` : ''}</p>
                        <p className="font-semibold">Direcção Municipal da Educação</p>
                        <p>Reforma Educativa</p>
                    </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                    <p>C.P. Nº 52, Telef. Nº 261245083</p>
                    <p>Email: rmecot2010@hotmail.com</p>
                </div>
            </div>

            {schoolInfo && (
                 <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-800 mb-4">
                    <p><span className="font-semibold">Ano Lectivo:</span> {schoolInfo.anoLectivo}</p>
                    <p><span className="font-semibold">Escola:</span> {schoolInfo.escola}</p>
                    <p><span className="font-semibold">Classe:</span> {schoolInfo.classe}</p>
                    <p><span className="font-semibold">Turma:</span> {schoolInfo.turma}</p>
                    <p><span className="font-semibold">O(A) Prof:</span> {schoolInfo.professor}</p>
                </div>
            )}
           
            <h2 className="text-center text-xl font-bold text-gray-800 uppercase tracking-wider">{title}</h2>
        </div>
    );
};

export default PageHeader;