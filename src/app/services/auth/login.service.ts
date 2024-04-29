import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { LoginRequest } from './loginRequest';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserDecodeToken } from './userDecodeToken';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private tokenCheckInterval: any;
  currentUserLoginOn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  currentUserData: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initialize();
    }
  }

  private initialize(): void {
    if (isPlatformBrowser(this.platformId)) {
      const accessToken = localStorage.getItem('accessToken');
      const isLoggedIn = accessToken !== null && !this.isTokenExpired(accessToken);
      this.currentUserLoginOn.next(isLoggedIn);
      this.currentUserData.next(accessToken || '');

      if (isLoggedIn) {
        this.startTokenCheck();
      }
    }
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http
      .post<any>(`http://localhost:8081/auth/login`, credentials)
      .pipe(
        tap((userData: any) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('accessToken', userData.accessToken);
            localStorage.setItem('refreshToken', userData.refreshToken);
          }
          this.currentUserData.next(userData.accessToken);
          this.currentUserLoginOn.next(true);
          this.startTokenCheck();
          this.router.navigate(['dashboard'], { replaceUrl: true });
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

  get userToken(): string | null {
    return localStorage.getItem('accessToken');
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
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http
      .post<any>(`http://localhost:8081/auth/refresh`, {
        refreshToken: refreshToken,
      })
      .pipe(
        tap((tokens: any) => {
          localStorage.setItem('accessToken', tokens.accessToken);
          console.log('token refrescado: ', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
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
      if (this.isTokenExpired(localStorage.getItem('accessToken'))) {
        this.refreshToken().subscribe({
          error: () => this.logout(), // Si el refresh no funciona, cierra la sesión
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
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.http
        .post(`http://localhost:8081/auth/logout`, {
          refreshToken: refreshToken,
        })
        .subscribe({
          next: () => {
            this.clearSession();
            this.router.navigate(['login'], { replaceUrl: true });
          },
          error: (error) => {
            console.error('Error durante el logout:', error);
            this.clearSession();
            this.router.navigate(['login'], { replaceUrl: true });
          },
        });
    } else {
      this.clearSession();
      this.router.navigate(['login'], { replaceUrl: true });
    }
  }

  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.stopTokenCheck();
    this.currentUserLoginOn.next(false);
  }
}