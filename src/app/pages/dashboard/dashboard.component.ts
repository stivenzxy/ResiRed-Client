import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from '../../services/auth/login.service';
import { UserDecodeToken } from '../../services/auth/userDecodeToken';
import { DemoService } from '../../services/auth/demo.service';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ManageOwnersComponent } from '../../modals/manage-owners/manage-owners.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ManageAssembliesService } from '../../services/assembly/manage-assemblies.service';
import Swal from 'sweetalert2'

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

  constructor(private loginService : LoginService, private demoService: DemoService, private dialog: MatDialog, private assemblyService: ManageAssembliesService) {
    this.user = this.loginService.decodeToken();
  }

  ngOnInit(): void{
    this.isLoadedComponent = true;
    this.demoService.getMessage().subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error)
    });
    this.isLoadedComponent = true;

    this.loadScheduledAssembly();
  }

  openManageUsersDialog() {
    const dialogRef = this.dialog.open(ManageOwnersComponent, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  loadScheduledAssembly() {
    this.assemblyService.getScheduledAssemblie().subscribe({
      next: (data) => {
        this.upcomingAssembly = data;
        console.log(data);
      },
      error: (error) => console.error('Error loading assembly', error),
    });
  }

  joinAssembly(assemblyId: number) {
    this.assemblyService.checkAssemblyAvailability(assemblyId).subscribe({
      next: (response) => {
        if (response.isAvailable) {
          Swal.fire({
            icon: 'info',
            title: 'Ya te puedes unir a la asamblea!',
            text: 'Ya te puedes unir, pero esta funcionalidad no esta terminada :p',
            confirmButtonText: 'Entendido'
          });
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
