import {UserModel} from '../../models/models';

export interface UsersStateModel {
    users: any | UserModel[] | null;
    patients: any | UserModel[] | null;
}

export class GetUsers {
    static readonly type = '[Users] get all users';
}

export class GetPatients {
    static readonly type = '[Users] get patients from doctor';
    constructor(public id: number) {
    }
}

export class GetUser {
    static readonly type = '[User] get an user';
    constructor(public id: number) {}
}

export class AddUser {
    static readonly type = '[User] add user';
    constructor(public payload: object) {}
}

export class DeleteUser {
    static readonly type = '[User] delete user';
    constructor(public payload: object) {}
}

export class UpdateUserData {
    static readonly type = '[User] update user';
    constructor(public payload: object) {}
}

export class SwapConsultaValues {
    static readonly type = '[User] swap consulta value';
    constructor(public idUser, public indexFrom, public indexTo, public valueFrom, public valueTo, public field) {}
}
