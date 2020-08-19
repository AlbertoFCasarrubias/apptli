import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {Login, Logout, SetUser} from '../actions/app.action';
import {AuthService} from '../../services/auth/auth.service';
import {GetUser, GetUsers, UsersStateModel} from '../actions/users.action';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {catchError, map, tap} from 'rxjs/operators';
import {of} from 'rxjs';

@State<UsersStateModel>({
    name: 'users',
    defaults: {
        users: null
    }
})
@Injectable()
export class UsersState {
    @Selector()
    static users(state: UsersStateModel): object | null {
        return state.users;
    }

    constructor(private firebaseService: FirebaseService) {}

    @Action(GetUsers)
    getUsers(ctx: StateContext<UsersStateModel>) {
        this.firebaseService.getUsers()
            .subscribe( data => {
                ctx.patchState({
                    users: data
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
