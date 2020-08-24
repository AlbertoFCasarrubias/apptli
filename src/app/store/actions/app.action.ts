export class Login {
    static readonly type = '[User] Login';
    constructor(public payload: { username: string; password: string }) {}
}

export class SetUser {
    static readonly type = '[User] Set user';
    constructor(public payload: object) {}
}

export class UpdateUser {
    static readonly type = '[User] update user';
    constructor(public payload: object) {}
}

export class GetUserByMail {
    static readonly type = '[User] get user by mail';
    constructor(public mail: string) {}
}

export class Logout {
    static readonly type = '[User] Logout';
}

export class SetCurrentCall {
    static readonly type = '[Schedule] set current call';
    constructor(public currentCall: object) {}
}

export class SetToken {
    static readonly type = '[User] set token';
    constructor(public token: string) {}
}
