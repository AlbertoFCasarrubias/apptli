export interface EventsStateModel {
    schedule: object | null;
}

export class GetEvents {
    static readonly type = '[Schedule] get all events';
}

export class AddEvent {
    static readonly type = '[Schedule] add event';
    constructor(public payload: object) {
    }
}

export class UpdateEvent {
    static readonly type = '[Schedule] update event';
    constructor(public payload: object) {
    }
}


