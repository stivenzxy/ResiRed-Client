import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from '../../services/auth/login.service';
import { UserDecodeToken } from '../../services/auth/userDecodeToken';
import { DemoService } from '../../services/auth/demo.service';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ManageOwnersComponent } from '../../modals/manage-owners/manage-owners.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatExpansionModule, MatButtonModule, MatTooltipModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy{
  userLoginOn:boolean = false;
  welcomeChar: string = '@';
  user?:UserDecodeToken;
  errorMessage:String = "";
  panelOpenState = false;
  isLoadedComponent: boolean = false;

  constructor(private loginService : LoginService, private demoService: DemoService, private dialog: MatDialog) {
    this.user = this.loginService.decodeToken();
  }

  ngOnInit(): void{
    this.isLoadedComponent = true;
    this.demoService.getMessage().subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error)
    });
    this.isLoadedComponent = true;
  }

  openManageUsersDialog() {
    const dialogRef = this.dialog.open(ManageOwnersComponent, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
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
