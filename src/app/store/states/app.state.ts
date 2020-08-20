import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {AppStateModel, GetUserByMail, Login, Logout, SetUser} from '../actions/app.action';
import {AuthService} from '../../services/auth/auth.service';
import {FirebaseService} from '../../services/firebase/firebase.service';

@State<AppStateModel>({
    name: 'user',
    defaults: {
        user: null
    }
})
@Injectable()
export class AppState {
    @Selector()
    static user(state: AppStateModel): object | null | string {
        return state.user;
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
    getUserByUID(ctx: StateContext<AppStateModel>, action: GetUserByMail) {
        return this.firebaseService.getUserByMail(action.mail)
            .subscribe( data => {
                ctx.patchState({
                    user: data[0]
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
}
