import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: './main-app.component.html'
})
export class MainAppComponent {
    constructor(public router: Router) {

    }

    openNav() {
        document.getElementById("mySidenav").style.width = "250px";
    }

    closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    }

    Logout() {
        localStorage.clear();
        this.router.navigateByUrl('Login')
    }
}