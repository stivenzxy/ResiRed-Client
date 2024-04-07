import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest } from './loginRequest';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserDecodeToken } from './userDecodeToken';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private tokenCheckInterval: any;
  currentUserLoginOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  currentUserData: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private http: HttpClient, private router: Router) {
    this.initialize();
    //window.addEventListener('beforeunload', () => this.stopTokenCheck());
  }

  private initialize(): void {
    // Verifica y establece el estado inicial basado en el token existente
    if (typeof window !== 'undefined') {
      const accessToken = sessionStorage.getItem('accessToken');
      const isLoggedIn = accessToken !== null && !this.isTokenExpired(accessToken);
      this.currentUserLoginOn.next(isLoggedIn);
      this.currentUserData.next(accessToken || '');
      if (isLoggedIn) {
        this.startTokenCheck(); // Inicia la verificación periódica si el usuario está logueado
      }
    }
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http
      .post<any>(`${environment.urlHost}auth/login`, credentials)
      .pipe(
        tap((userData: any) => {
          sessionStorage.setItem('accessToken', userData.accessToken);
          sessionStorage.setItem('refreshToken', userData.refreshToken); // Almacena el refresh token
          this.currentUserData.next(userData.accessToken);
          this.currentUserLoginOn.next(true);
          this.startTokenCheck();
        }),
        map((userData) => userData.accessToken),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.log('Se ha producido un error', error.error);
    } else {
      console.error('Codigo de retorno de estado', error.status, error.error);
    }
    return throwError(() => new Error('Algo salio mal, Intente nuevamente.'));
  }

  get userData(): Observable<string> {
    return this.currentUserData.asObservable();
  }

  get userLoginOn(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }

  // En LoginService
  get userToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  decodeToken(): UserDecodeToken | undefined {
    const accessToken = this.currentUserData.value;
    if (accessToken) {
      const decoded = jwtDecode<any>(accessToken);
      const mapped: UserDecodeToken = {
        ...decoded,
        email: decoded.sub,
      };
      return mapped;
    }
    return undefined;
  }

  refreshToken(): Observable<any> {
    const refreshToken = sessionStorage.getItem('refreshToken');
    return this.http
      .post<any>(`${environment.urlHost}auth/refresh`, {
        refreshToken: refreshToken,
      })
      .pipe(
        tap((tokens: any) => {
          sessionStorage.setItem('accessToken', tokens.accessToken);
          console.log("token refrescado: ", tokens.accessToken);
          sessionStorage.setItem('refreshToken', tokens.refreshToken);
          this.currentUserData.next(tokens.accessToken); // Actualiza el BehaviorSubject con el nuevo token
          this.currentUserLoginOn.next(true);
          this.startTokenCheck();
        }),
        catchError(this.handleError)
      );
  }

  isTokenExpired(accessToken: string | null): boolean {
    if (accessToken) {
      const decoded = jwtDecode<any>(accessToken);
      return Date.now() >= decoded.exp * 1000;
    }
    return true;
  }

  private startTokenCheck(): void {
    this.stopTokenCheck();
    this.tokenCheckInterval = setInterval(() => {
      if (this.isTokenExpired(sessionStorage.getItem("accessToken"))) {
        this.refreshToken().subscribe({
          error: () => this.logout(), // Si el refresh falla, cierra la sesión
        });
      }
    }, 60000); // Comprueba cada minuto
  }

  private stopTokenCheck(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  logout(): void {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http.post(`${environment.urlHost}auth/logout`, { refreshToken: refreshToken })
        .subscribe({
          next: () => {
            this.clearSession();
            this.router.navigate(['login'], { replaceUrl: true });
          },
          error: (error) => {
            console.error('Error durante el logout:', error);
            this.clearSession();
            this.router.navigate(['login'], { replaceUrl: true });
          }
        });
    } else {
      this.clearSession();
      this.router.navigate(['login'], { replaceUrl: true });
    }
  }
  
  private clearSession(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    this.stopTokenCheck();
    this.currentUserLoginOn.next(false);
  }
  
}