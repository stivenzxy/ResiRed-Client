import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {

  constructor(private http: HttpClient) { }

  requestResetPasswordCode(email: string): Observable<any> {
    console.log(email);
    return this.http.post(`${environment.authUrl}requestPasswordCode`, {email : email});
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.authUrl}resetPassword`, {
      token,
      newPassword
    });
  }
}
