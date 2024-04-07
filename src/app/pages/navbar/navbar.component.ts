import { Component, ElementRef, HostListener, Renderer2, OnDestroy } from '@angular/core';
import { LoginService } from '../../services/auth/login.service';
import { UserDecodeToken } from '../../services/auth/userDecodeToken';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnDestroy{
  isUserMenuOpen = false;
  isNavbarOpen = false;
  userLoginOn:boolean = false;
  user?:UserDecodeToken;
  errorMessage:String = "";

  private globalClickListener!: () => void;

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  constructor(private elementRef: ElementRef, private renderer: Renderer2, private loginService : LoginService) {
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

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;

    if (this.isUserMenuOpen) {
      this.globalClickListener = this.renderer.listen('document', 'click', (event) => {
        this.onClick(event);
      });
    } else {
      this.removeGlobalListener();
    }
  }

  onClick(event: MouseEvent) {
    // Verifica si el clic fue fuera del elemento del dropdown o del botón
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

  ngOnDestroy() {
    this.removeGlobalListener(); // Asegura que el listener se elimine cuando el componente se destruya
  }
}
