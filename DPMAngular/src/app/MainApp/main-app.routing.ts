import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MainAppComponent } from "./main-app.component";
import { AdminComponent } from "./Admin/admin.component";
import { UserComponent } from "./User/user.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: MainAppComponent,
                children: [
                    { path: '', redirectTo: "Admin", pathMatch: "full" },
                    { path: 'Admin', component: AdminComponent },
                    { path: 'User', component: UserComponent },
                ]
            },

        ])
    ],
    exports: [
        RouterModule
    ]
})
export class MainAppRoutingModule {

}