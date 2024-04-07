// En tu servicio Angular
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DemoService {
  constructor(private http: HttpClient) {}

  getMessage() {
    return this.http.get(`${environment.apiUrl}demo`,  { responseType: 'text' });
  }
}
