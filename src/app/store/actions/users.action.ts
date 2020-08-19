export interface UsersStateModel {
    users: object | null;
}

export class GetUsers {
    static readonly type = '[Users] get all users';
}

export class GetUser {
    static readonly type = '[User] get an user';
    constructor(public id: number) {}
}
