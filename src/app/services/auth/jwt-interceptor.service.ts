import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class JwtInterceptorService implements HttpInterceptor {
  accessToken:string='';
  errorMessage:string='';

  constructor(private loginService : LoginService) { 
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  
    this.accessToken = this.loginService.currentUserData.value;

    console.log('interceptor is running')
    console.log('token refrescado en el interceptor: ',this.accessToken)

    if(this.accessToken) {
      req = req.clone({
        setHeaders: {
          //'Content-Type': 'application/json;charset=utf-8',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },   
      })
    }

    return next.handle(req);
  }
}