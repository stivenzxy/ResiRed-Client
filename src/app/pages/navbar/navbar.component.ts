import {
  Component,
  ElementRef,
  Renderer2,
  OnDestroy,
  Input,
  OnInit,
} from '@angular/core';
import { LoginService } from '../../services/auth/login.service';
import { UserDecodeToken } from '../../services/auth/userDecodeToken';
import { RouterLink, RouterModule } from '@angular/router';
import { navbarData } from './nav.data';
import { dropdownProfileData } from './dropdwon.profile';
import { INavbarData } from './INavData';
import { MatDialog } from '@angular/material/dialog';
import { ProfileInfoComponent } from '../../modals/profile-info/profile-info.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterModule],
  providers: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnDestroy, OnInit {
  isUserMenuOpen = false;
  isNavbarOpen = false;
  userLoginOn: boolean = false;
  user?: UserDecodeToken;
  errorMessage: String = '';
  navData = navbarData;
  dropdownData = dropdownProfileData;

  private globalClickListener!: () => void;

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private loginService: LoginService,
    public dialog: MatDialog
  ) {
    this.user = this.loginService.decodeToken();
  }

  ngOnInit(): void {
    this.adjustNavbarVisibility();
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;

    if (this.isUserMenuOpen) {
      this.globalClickListener = this.renderer.listen(
        'document',
        'click',
        (event) => {
          this.onClick(event);
        }
      );
    } else {
      this.removeGlobalListener();
    }
  }

  switchProfileOption(itemProfile: INavbarData) {
    if (itemProfile.label === 'Perfil') {
      this.openProfileInfoDialog();
    } else if (itemProfile.label === 'Salir') {
      this.logout();
    }
  }

  adjustNavbarVisibility() {
    const userRole = this.user?.role;

    this.navData.forEach((item) => {
      if (item.routeLink === 'surveys' && userRole === 'OWNER') {
        item.visible = false;
      } else {
        item.visible = true;
      }
    });
  }

  openProfileInfoDialog() {
    this.toggleUserMenu();
    const dialogRef = this.dialog.open(ProfileInfoComponent, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onClick(event: MouseEvent) {
    // Verifica si el click fue fuera del elemento del dropdown o del botón
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isUserMenuOpen = false;
      this.removeGlobalListener(); // Importante para evitar fugas de memoria
    }
  }

  removeGlobalListener() {
    if (this.globalClickListener) {
      this.globalClickListener();
    }
  }

  logout(): void {
    this.loginService.logout();
  }

  ngOnDestroy() {
    this.removeGlobalListener(); // Asegura que el listener se elimine cuando el componente se destruya
  }
}
