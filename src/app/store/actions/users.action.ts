export interface UsersStateModel {
    users: object | null;
    patients: object | null;
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
