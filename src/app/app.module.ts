import {CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireModule} from '@angular/fire';
import {registerLocaleData} from '@angular/common';
import localeEs from '@angular/common/locales/es-MX';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {DragulaModule, DragulaService} from 'ng2-dragula';
import {NgxsModule} from '@ngxs/store';
import {AppState} from './store/states/app.state';
import {NgxsReduxDevtoolsPluginModule} from '@ngxs/devtools-plugin';
import {UsersState} from './store/states/users.state';
import {EventsState} from './store/states/events.state';
import {AgoraConfig, NgxAgoraModule} from 'ngx-agora';
import {AngularFireFunctionsModule} from '@angular/fire/functions';
import {AngularFireMessagingModule} from '@angular/fire/messaging';
import {AngularFirePerformanceModule, PerformanceMonitoringService} from '@angular/fire/performance';
import {ParseFilePage} from './pages/users/parse-file/parse-file.page';

const agoraConfig: AgoraConfig = {
    AppID: 'c7d5f3bc5f4345fcaa57bba1fc1e5f6d',
};

registerLocaleData(localeEs);

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        DragulaModule.forRoot(),
        AppRoutingModule,
        IonicModule.forRoot(),
        AngularFireAuthModule,
        AngularFirestoreModule,
        AngularFireStorageModule,
        AngularFireFunctionsModule,
        AngularFireMessagingModule,
        AngularFirePerformanceModule,
        AngularFireModule.initializeApp(environment.firebase),
        NgxsModule.forRoot([
            AppState,
            UsersState,
            EventsState
        ], {
            developmentMode: !environment.production
        }),
        NgxsReduxDevtoolsPluginModule.forRoot({
            disabled: environment.production,
        }),
        NgxAgoraModule.forRoot(agoraConfig),
        ServiceWorkerModule.register('combined-sw.js', {enabled: environment.production})],
    providers: [
        StatusBar,
        SplashScreen,
        DragulaService,
        PerformanceMonitoringService,
        {provide: LOCALE_ID, useValue: 'es-MX'},
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
