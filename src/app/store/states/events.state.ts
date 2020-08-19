import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {Login, Logout, SetUser} from '../actions/app.action';
import {AuthService} from '../../services/auth/auth.service';
import {GetUser, GetUsers, UsersStateModel} from '../actions/users.action';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {catchError, map, tap} from 'rxjs/operators';
import {of} from 'rxjs';
import {EventsStateModel, GetEvents} from '../actions/events.action';

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
    getEvents(ctx: StateContext<EventsStateModel>) {
        this.firebaseService.getSchedules()
            .subscribe( data => {
                ctx.patchState({
                    schedule: data
                });
            }, error => console.error(error));
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

}
