import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {GetUserByMail, Login, Logout, SetCurrentCall, SetToken, SetUser, UpdateUser} from '../actions/app.action';
import {AuthService} from '../../services/auth/auth.service';
import {FirebaseService} from '../../services/firebase/firebase.service';
import {UserModel} from '../../models/models';

export interface AppStateModel {
    user: UserModel | null | string | object;
    currentCall: null | object;
    token: null | string;
}

@State<AppStateModel>({
    name: 'user',
    defaults: {
        user: null,
        currentCall: null,
        token: null
    }
})
@Injectable()
export class AppState {
    @Selector()
    static user(state: AppStateModel): any {
        return state.user;
    }

    @Selector()
    static token(state: AppStateModel): UserModel | null | string {
        return state.token;
    }

    @Selector()
    static currentCall(state: AppStateModel): object | null  {
        return state.currentCall;
    }

    @Selector()
    static isAuthenticated(state: AppStateModel): boolean {
        return !!state.user;
    }

    constructor(private authService: AuthService,
                private firebaseService: FirebaseService) {}

    @Action(Login)
    login(ctx: StateContext<AppStateModel>, action: Login) {
        return this.authService.doLogin(action.payload)
            .then( data => {
                console.log('DATA ', data.user);
                ctx.patchState({
                    user: data.user.email
                });
            })
            .catch(err => console.error(err));
    }

    @Action(GetUserByMail)
    getUserByMail(ctx: StateContext<AppStateModel>, action: GetUserByMail) {
        return new Promise(resolve => {
            this.firebaseService.getUserByMail(action.mail)
                .subscribe( data => {
                    ctx.patchState({
                        user: data[0]
                    });

                    resolve(data[0]);
                });
        });

    }

    @Action(Logout)
    logout(ctx: StateContext<AppStateModel>) {
        // const state = ctx.getState();
        return this.authService.doLogout()
            .then(() => {
                ctx.patchState({
                    user: null
                });
            })
            .catch(err => {
                console.error(err);
                ctx.patchState({
                    user: null
                });
            });
    }

    @Action(SetUser)
    setUser(ctx: StateContext<AppStateModel>, action: SetUser) {
        ctx.patchState({
            user: action.payload['email']
        });
    }

    @Action(SetCurrentCall)
    setCurrentCall(ctx: StateContext<AppStateModel>, action: SetCurrentCall) {
        ctx.patchState({
            currentCall: action.currentCall
        });
    }

    @Action(SetToken)
    setToken(ctx: StateContext<AppStateModel>, action: SetToken) {
        ctx.patchState({
            token: action.token
        });
    }
}
