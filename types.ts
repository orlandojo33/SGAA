
export enum Gender {
    MALE = 'Masculino',
    FEMALE = 'Feminino',
}

export type ClassLevel = '1ª Classe' | '2ª Classe' | '3ª Classe' | '4ª Classe' | '5ª Classe' | '6ª Classe';
export const CLASS_LEVELS: ClassLevel[] = ['1ª Classe', '2ª Classe', '3ª Classe', '4ª Classe', '5ª Classe', '6ª Classe'];

export type Turma = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
export const TURMAS: Turma[] = ['A', 'B', 'C', 'D', 'E']; // Simplified for demo

export const PROVINCIAS: string[] = [
    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
    'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte',
    'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

export interface SchoolConfig {
    schoolName: string;
    academicYear: string;
    province: string;
    city: string;
}

export interface Student {
    id: string;
    name: string;
    gender: Gender;
    dob: string;
    filiacao: { mae: string; pai: string; };
    naturalidade: { municipio: string; provincia: string; };
    identificacao: { numero: string; dataEmissao: string; };
    turma: Turma;
    classLevel: ClassLevel;
}

export type NivelAcademico = 'Técnico Médio' | 'Bacharelato' | 'Licenciatura' | 'Mestrado' | 'Doutoramento';
export const NIVEIS_ACADEMICOS: NivelAcademico[] = ['Técnico Médio', 'Bacharelato', 'Licenciatura', 'Mestrado', 'Doutoramento'];

export interface Teacher {
    id: string;
    name: string;
    dob: string;
    areaFormacao: string;
    nivelAcademico: NivelAcademico;
    dataInicioFuncao: string;
}

export interface Assignment {
    id: string; // Unique ID for the assignment, e.g., "1ª Classe-A"
    classLevel: ClassLevel;
    turma: Turma;
    teacherId: string;
}

export type Subject1to5 = 'L. Portuguesa' | 'Matemática' | 'Est. do Meio' | 'E.M.P' | 'Ed. Musical' | 'Ed. Física' | 'L. de Angola';
export const SUBJECTS_1_TO_5: Subject1to5[] = ['L. Portuguesa', 'Matemática', 'Est. do Meio', 'E.M.P', 'Ed. Musical', 'Ed. Física', 'L. de Angola'];

export type Subject6 = 'L. Portuguesa' | 'Matemática' | 'C. da Natureza' | 'História' | 'Geografia' | 'E.M.C' | 'E.M.P' | 'Ed. Musical' | 'Ed. Física' | 'L. de Angola';
export const SUBJECTS_6: Subject6[] = ['L. Portuguesa', 'Matemática', 'C. da Natureza', 'História', 'Geografia', 'E.M.C', 'E.M.P', 'Ed. Musical', 'Ed. Física', 'L. de Angola'];

export type Subject = Subject1to5 | Subject6;

export interface TrimesterGrade {
    mac: number | null;
    npt: number | null;
}

export interface SubjectGrades {
    T1: TrimesterGrade;
    T2: TrimesterGrade;
    T3: TrimesterGrade;
    NE?: number | null; // Nota de Exame
    NR?: number | null; // Nota de Recurso
}

export type StudentGrades = {
    [studentId: string]: {
        [subject in Subject]?: SubjectGrades;
    };
};

export type Trimester = 'T1' | 'T2' | 'T3';

export type Page = 'dashboard' | 'matricula' | 'avaliacao' | 'mapa_final' | 'pauta_final' | 'professores' | 'atribuicoes' | 'configuracoes';