import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageAssembliesService {
  constructor(private http: HttpClient) { }

  createAssembly(request: any): Observable<any> {
    return this.http.post(`${environment.urlHost}assembly/create`, request);
  }
}
