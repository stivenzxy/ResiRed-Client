import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from '../../services/auth/login.service';
import { UserDecodeToken } from '../../services/auth/userDecodeToken';
import { DemoService } from '../../services/auth/demo.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy{
  userLoginOn:boolean = false;
  //userData?:User;
  user?:UserDecodeToken;
  errorMessage:String = "";

  constructor(private loginService : LoginService, private demoService: DemoService) {
    this.user = this.loginService.decodeToken();
  
    this.loginService.currentUserLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
      },
      error: (error) => {
        this.errorMessage = error;
      }
    });
  }

  ngOnInit(): void{
    this.demoService.getMessage().subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error)
    });
  }


  logout() : void {
    this.loginService.logout();
  }

  ngOnDestroy(): void {
      //this.loginService.currentUserData.unsubscribe();
      //this.loginService.currentUserLoginOn.unsubscribe();
  }
}
