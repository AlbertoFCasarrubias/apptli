import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {Login, Logout, SetUser} from '../actions/app.action';
import {AuthService} from '../../services/auth/auth.service';
import {GetUser, GetUsers, UsersStateModel} from '../actions/users.action';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {catchError, map, tap} from 'rxjs/operators';
import {of} from 'rxjs';
import {AddEvent, EventsStateModel, GetEvents, UpdateEvent} from '../actions/events.action';

@State<EventsStateModel>({
    name: 'schedule',
    defaults: {
        schedule: null
    }
})
@Injectable()
export class EventsState {
    @Selector()
    static schedule(state: EventsStateModel): object | null {
        return state.schedule;
    }

    constructor(private firebaseService: FirebaseService) {}

    @Action(GetEvents)
    getEvents(ctx: StateContext<EventsStateModel>, action: GetEvents) {
        return new Promise((resolve, reject) => {
            this.firebaseService.getSchedules(action.users)
                .subscribe( data => {
                    ctx.patchState({
                        schedule: data
                    });
                    resolve(data);
                }, error => reject(error));
        });
    }

    @Action(GetUser)
    getUser(ctx: StateContext<UsersStateModel>, action: GetUser) {
        return this.firebaseService.getUser(action.id)
            .pipe(
                tap(data => {
                    console.log('DATA ', data);
                })
            );
    }

    @Action(AddEvent)
    addEvent(ctx: StateContext<EventsStateModel>, action: AddEvent) {
        return new Promise((resolve, reject) => {
            this.firebaseService.createSchedule(action.payload)
                .then(data => {
                    resolve(action.payload);
                })
                .catch(err => reject(err));
        });
    }

    @Action(UpdateEvent)
    updateEvent(ctx: StateContext<EventsStateModel>, action: UpdateEvent) {
        return new Promise((resolve, reject) => {
            this.firebaseService.updateSchedule(action.payload)
                .then(data => {
                    resolve(action.payload);
                })
                .catch(err => reject(err));
        });
    }

}
