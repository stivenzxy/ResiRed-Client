import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadUsersFileService {

  constructor(private http: HttpClient) { }

  uploadFile(formData: FormData): Observable<any>{
    return this.http.post(`http://localhost:8081/auth/registerUsers`, formData, {
      reportProgress: true,
      observe: 'events'
    })
  }

  viewUserList(){
    return this.http.get<any[]>(`${environment.urlHost}users/owners`);
  }
}
