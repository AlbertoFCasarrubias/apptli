export interface EventsStateModel {
    schedule: object | null;
}

export class GetEvents {
    static readonly type = '[Schedule] get all events';
}


