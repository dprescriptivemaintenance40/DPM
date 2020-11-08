import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './Admin/admin.component';
import { UserComponent } from './User/user.component';
import { MainAppComponent } from './main-app.component';
import { MainAppRoutingModule } from './main-app.routing';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module'
import { HighchartsChartModule } from 'highcharts-angular';
import { RuleEngineComponent } from './RuleEngine/rule-engine.component'
import { WeibullAnalysis } from './WeibullAnalysis/weibull-analysis.component'
import { ForecastComponent } from './Forecast/forecast.component';
@NgModule({
    declarations: [AdminComponent, UserComponent,
        MainAppComponent, RuleEngineComponent,
        WeibullAnalysis,
        ForecastComponent
    ],
    imports: [
        CommonModule,
        MainAppRoutingModule,
        FormsModule,
        SharedModule,
        HighchartsChartModule
    ],
    bootstrap: [MainAppComponent]
})
export class MainAppModule {

}