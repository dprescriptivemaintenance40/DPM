import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router'
import { LoginComponent } from './Login/login.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            { path: '', component: LoginComponent },
            { path: 'Login', component: LoginComponent },
            { path: 'MainApp', loadChildren: () => import("../app/MainApp/main-app.module").then(m => m.MainAppModule) },
        ])
    ],
    exports:[
        RouterModule
    ]
})
export class AppRoutingModule {

}