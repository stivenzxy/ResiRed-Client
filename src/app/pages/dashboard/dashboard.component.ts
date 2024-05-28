import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from '../../services/auth/login.service';
import { UserDecodeToken } from '../../services/auth/userDecodeToken';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ManageOwnersComponent } from '../../modals/manage-owners/manage-owners.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ManageAssembliesService } from '../../services/assembly/manage-assemblies.service';
import Swal from 'sweetalert2'
import { Router } from '@angular/router';

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
  upcomingAssembly: any = null;

  constructor(private loginService : LoginService, private dialog: MatDialog, 
    private assemblyService: ManageAssembliesService, private router: Router) {
    this.user = this.loginService.decodeToken();
  }

  ngOnInit(): void{
    this.isLoadedComponent = true;
    this.loadScheduledAssembly();
  }

  openManageUsersDialog() {
    const dialogRef = this.dialog.open(ManageOwnersComponent, {
      disableClose: true,
      width: '800px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  loadScheduledAssembly() {
    this.assemblyService.getScheduledAssembly().subscribe({
      next: (data) => {
        this.upcomingAssembly = data;
        console.log(data);
      },
      error: (error) => console.error('Error loading assembly', error),
    });
  }

  joinAssembly() {
    this.assemblyService.getScheduledAssembly().subscribe({
      next: (assembly) => {
        if (assembly.isAvailable) {
          this.router.navigate(["pre-assembly"]);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'No disponible',
            text: 'La asamblea aún no está disponible.',
            confirmButtonText: 'Cerrar'
          });
        }
      },

      error: (error) => {
        console.error('Error checking assembly availability', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al verificar la disponibilidad de la asamblea.',
          confirmButtonText: 'Cerrar'
        });
      }
    });
  }

  logout() : void {
    this.loginService.logout();
  }

  ngOnDestroy(): void {
  }
}
