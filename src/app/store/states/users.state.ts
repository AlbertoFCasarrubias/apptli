import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {Login, Logout, SetUser} from '../actions/app.action';
import {AuthService} from '../../services/auth/auth.service';
import {AddUser, GetPatients, GetUser, GetUsers, UsersStateModel} from '../actions/users.action';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {catchError, map, tap} from 'rxjs/operators';


@State<UsersStateModel>({
    name: 'users',
    defaults: {
        users: null,
        patients: null
    }
})
@Injectable()
export class UsersState {
    @Selector()
    static users(state: UsersStateModel): object | null {
        return state.users;
    }

    @Selector()
    static patients(state: UsersStateModel): object | null {
        return state.patients;
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

    @Action(GetPatients)
    getPatients(ctx: StateContext<UsersStateModel>, payload: GetPatients) {
        this.firebaseService.getPatients(payload.id)
            .subscribe( data => {
                ctx.patchState({
                    patients: data
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

    @Action(AddUser)
    addUser(ctx: StateContext<UsersStateModel>, action: AddUser) {
        return this.firebaseService.createUser(action.payload)
            .then(data => {

                const {patients} = ctx.getState();
                //patients.push(data);
                console.log('DATA ', data, patients);

                ctx.patchState({
                    patients
                });
            });
    }

}
