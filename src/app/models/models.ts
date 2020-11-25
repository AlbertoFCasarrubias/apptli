export interface ConsultaModel {
    agua: number | string;
    bd: number | string;
    bi: number | string;
    cadera: number | string;
    cintura: number | string;
    date: number | string;
    edadMetabolica: number | string;
    edadOsea: number | string;
    grasa: number | string;
    grasaVisceral: number | string;
    pd: number | string;
    pi: number | string;
    peso: number | string;
    pecho: number | string;
    pesoMuscular: number | string;
}

export interface AntecedentesModel {
    alcoholismo: string;
    alergias: string;
    cirugias: string;
    enfermedades: string;
    medicamentos: string;
    tabaquismo: string;
}

export interface AlimenticiosModel {
    cena: string;
    colacionMatutina: string;
    colacionVespertina: string;
    comida: string;
    desayuno: string;
}

export interface UserModel {
    adminID: number;
    admin: boolean;
    age: string;
    alimenticios: AlimenticiosModel;
    antecedentes: AntecedentesModel;
    autoincrement: number;
    birthday: string;
    consultas: ConsultaModel[];
    createdAt: any;
    doctor: boolean;
    height: string;
    id: string;
    mail: string;
    name: string;
    patient: string;
    schedule: any;
    updatedAt: any;
    updatedBy: any;
}
