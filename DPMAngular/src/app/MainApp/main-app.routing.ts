import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MainAppComponent } from "./main-app.component";
import { AdminComponent } from "./Admin/admin.component";
import { UserComponent } from "./User/user.component";
import { RuleEngineComponent } from './RuleEngine/rule-engine.component';
import { WeibullAnalysis } from './WeibullAnalysis/weibull-analysis.component';
import {ForecastComponent} from './Forecast/forecast.component'

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: MainAppComponent,
                children: [
                    { path: '', redirectTo: "RuleEngine", pathMatch: "full" },
                    { path: 'Admin', component: AdminComponent },
                    { path: 'User', component: UserComponent },
                    { path: 'RuleEngine', component: RuleEngineComponent },
                    { path: 'WeibullAnalysis', component: WeibullAnalysis },
                    { path: 'Forecast', component: ForecastComponent },
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