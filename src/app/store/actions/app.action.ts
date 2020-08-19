export interface AppStateModel {
    user: object | null | string;
}

export class Login {
    static readonly type = '[User] Login';
    constructor(public payload: { username: string; password: string }) {}
}

export class SetUser {
    static readonly type = '[User] Set user';
    constructor(public payload: object) {}
}

export class Logout {
    static readonly type = '[User] Logout';
}

