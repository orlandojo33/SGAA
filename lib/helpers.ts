
import { SubjectGrades, Subject, StudentGrades, Student, ClassLevel } from '../types';

export const calculateMT = (mac: number | null, npt: number | null): number | null => {
    if (mac !== null && npt !== null && !isNaN(mac) && !isNaN(npt)) {
        return (mac + npt) / 2;
    }
    return null;
};

export const calculateMDF = (s: SubjectGrades | undefined): number | null => {
    if (!s) return null;
    const mt1 = calculateMT(s.T1.mac, s.T1.npt);
    const mt2 = calculateMT(s.T2.mac, s.T2.npt);
    const mt3 = calculateMT(s.T3.mac, s.T3.npt);
    const validMTs = [mt1, mt2, mt3].filter(mt => mt !== null) as number[];
    if (validMTs.length === 3) {
        return validMTs.reduce((a, b) => a + b, 0) / 3;
    }
    return null;
};

export const calculateCF = (mdf: number | null, ne: number | null): number | null => {
    if (mdf !== null && ne !== null && !isNaN(mdf) && !isNaN(ne)) {
        return mdf * 0.6 + ne * 0.4;
    }
    return null;
}

export const getFinalGrade = (subjectGrades: SubjectGrades | undefined): number | null => {
    if(!subjectGrades) return null;
    const mdf = calculateMDF(subjectGrades);
    if (subjectGrades.NE === undefined) { // For classes 1-5
        return mdf;
    }
    // For 6th class
    const cf = calculateCF(mdf, subjectGrades.NE ?? null);
    if (subjectGrades.NR !== null && subjectGrades.NR !== undefined && cf !== null && cf < 5) {
        return Math.max(cf, subjectGrades.NR);
    }
    return cf;
};

export const getStatus1to5 = (student: Student, grades: StudentGrades, subjects: Subject[]): string => {
    const studentGrades = grades[student.id];
    if (!studentGrades) return 'Indefinido';

    const finalGrades = subjects.map(s => calculateMDF(studentGrades[s]));

    if (finalGrades.some(g => g === null)) return 'Pendente';

    const negativas = finalGrades.filter(g => g !== null && g < 5);
    const numNegativas = negativas.length;

    if (numNegativas >= 3) {
        return 'Reprovado';
    }
    if (numNegativas === 2) {
        const indexLP = subjects.indexOf('L. Portuguesa');
        const indexMat = subjects.indexOf('Matemática');
        const hasNegativaLP = finalGrades[indexLP] !== null && finalGrades[indexLP]! < 5;
        const hasNegativaMat = finalGrades[indexMat] !== null && finalGrades[indexMat]! < 5;
        if (hasNegativaLP && hasNegativaMat) {
            return 'Reprovado';
        }
    }
    return 'Aprovado';
};


export const getStatus6 = (student: Student, grades: StudentGrades, subjects: Subject[]): string => {
    const studentGrades = grades[student.id];
    if (!studentGrades) return 'Indefinido';

    const mdfs = subjects.map(s => calculateMDF(studentGrades[s]));
    if (mdfs.some(mdf => mdf === null)) return 'Pendente (MDF)';

    const nes = subjects.map(s => studentGrades[s]?.NE ?? null);
    if(nes.some(ne => ne === null)) return 'Pendente (Exame)';

    const cfs = subjects.map(s => calculateCF(mdfs[subjects.indexOf(s)], nes[subjects.indexOf(s)]));

    const negativasCF = cfs.filter(cf => cf !== null && cf < 5);
    const numNegativasCF = negativasCF.length;

    // Check for recourse
    const nrs = subjects.map(s => studentGrades[s]?.NR ?? undefined);
    const needsRecourse = numNegativasCF > 0 && numNegativasCF <= 3;
    const recoursePending = needsRecourse && negativasCF.some((cf, index) => cfs[index]! < 5 && nrs[index] === undefined);
    if (recoursePending) return "Recurso (Pendente)";
    
    // Final status after recourse
    const finalGradesAfterRecourse = cfs.map((cf, index) => {
        const nr = nrs[index];
        if (cf !== null && cf < 5 && nr !== null && nr !== undefined) {
            return Math.max(cf, nr);
        }
        return cf;
    });

    const negativasFinal = finalGradesAfterRecourse.filter(g => g !== null && g < 5).length;
    
    if (negativasFinal >= 3) {
       if (numNegativasCF > 3) return 'Reprovado';
       return 'Recurso (Reprovado)';
    }

    if (negativasFinal === 2) {
        const indexLP = subjects.indexOf('L. Portuguesa');
        const indexMat = subjects.indexOf('Matemática');
        const hasNegativaLP = finalGradesAfterRecourse[indexLP]! < 5;
        const hasNegativaMat = finalGradesAfterRecourse[indexMat]! < 5;
        if (hasNegativaLP && hasNegativaMat) {
            if (numNegativasCF > 3) return 'Reprovado';
            return 'Recurso (Reprovado)';
        }
    }

    if (numNegativasCF > 3) return 'Reprovado';
    if (numNegativasCF > 0) return 'Recurso (Aprovado)';
    
    return 'Aprovado';
};
