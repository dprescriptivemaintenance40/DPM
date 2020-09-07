import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../environments/environment'

@Component({
    templateUrl: './login.component.html'
})
export class LoginComponent {
    constructor(public router: Router,
        public title: Title,
        public http: HttpClient) {
        this.title.setTitle("Login | Dynamic Preventative Maintenance");

    }

    Submit() {
        this.router.navigateByUrl("MainApp");
    }
}