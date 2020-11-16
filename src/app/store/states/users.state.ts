import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {AddUser, GetPatients, GetUser, GetUsers, UpdateUserData, UsersStateModel} from '../actions/users.action';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {tap} from 'rxjs/operators';


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
        return new Promise((resolve, reject) =>{
            this.firebaseService.getUsers()
                .subscribe( data => {
                    ctx.patchState({
                        users: data
                    });
                    resolve(data);
                }, error => reject(error));
        });
    }

    @Action(GetPatients)
    getPatients(ctx: StateContext<UsersStateModel>, payload: GetPatients) {
        return new Promise((resolve, reject) =>{
            this.firebaseService.getPatients(payload.id)
                .subscribe( data => {
                    ctx.patchState({
                        patients: data
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

    @Action(AddUser)
    addUser(ctx: StateContext<UsersStateModel>, action: AddUser) {
        return this.firebaseService.createUser(action.payload)
            .then(data => {

                const {patients} = ctx.getState();

                ctx.patchState({
                    patients
                });
            });
    }

    @Action(UpdateUserData)
    updateUser(ctx: StateContext<UsersStateModel>, action: UpdateUserData) {
        console.log('DATA UPDATE ', action);
        const {users, patients} = ctx.getState();
        const userID = action.payload['id'];

        return this.firebaseService.updateUser(action.payload)
            .then(data => {
                const user = users.findIndex(u => u.id === userID);
                const patient = patients.findIndex(u => u.id === userID);

                if(user !== -1) {
                    const tmp = Object.assign([], users);
                    tmp[user] = action.payload;
                    ctx.patchState({
                        users: tmp
                    });
                }

                if(patient !== -1){
                    const tmp = Object.assign([], patients);
                    tmp[patient] = action.payload;
                    ctx.patchState({
                        patients: tmp
                    });
                }
            });
    }
}
