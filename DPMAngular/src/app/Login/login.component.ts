import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Component({
    templateUrl: './login.component.html'
})
export class LoginComponent {
    public username: string = "admin";
    public password: string = "pass@123";
    constructor(public router: Router,
        public title: Title,
        public http: HttpClient) {
        this.title.setTitle("Login | Dynamic Preventative Maintenance");

    }

    Submit() {
        if (this.username == "admin" && this.password == "pass@123") {
            this.router.navigateByUrl("MainApp");
        } else {
            alert("user is invalid.")
        }

    }
}