import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  getAssemblies(): Observable<any> {
    return this.http.get<any>(`${environment.urlHost}assembly/history`);
  }

  getScheduledAssembly(): Observable<any> {
    return this.http.get<any>(`${environment.urlHost}assembly/check/scheduled`);
  }

  getStartedAssembly(): Observable<any> {
    return this.http.get<any>(`${environment.urlHost}assembly/check/started`);
  }

  getFinishedAssembly(): Observable<any> {
    return this.http.get<any>(`${environment.urlHost}assembly/check/finished`);
  }

  cancelActualAssembly(assemblyId: number): Observable<any> {
    const id = assemblyId;
    return this.http.put(`${environment.urlHost}assembly/cancel/${id}`, {})
  }

  generateAssemblyCode(assemblyId: number): Observable<any> {
    const id = assemblyId;
    return this.http.get<any>(`${environment.urlHost}`);
  }

  generateAccessCode(assemblyId: number): Observable<any> {
    const id = assemblyId;
    return this.http.get<any>(`${environment.urlHost}assembly/generate/passcode/${id}`);
  }

  joinAssembly(assemblyId: number, passcode: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
    return this.http.post(`${environment.urlHost}assembly/join/${assemblyId}/${passcode}`, {}, { headers });
  }

  startAssemblyAdmin(assemblyId: number): Observable<any> {
    return this.http.put(`${environment.urlHost}assembly/start/${assemblyId}`, {});
  }

  getAssemblyStatus(assemblyId: number): Observable<any> {
    return this.http.get(`${environment.urlHost}assembly/status/${assemblyId}`, {responseType: 'text' });
  }

  getAssemblySurveys(assemblyId: number): Observable<any> {
    return this.http.get(`${environment.urlHost}survey/list/${assemblyId}`);
  }

  setCurrentQuestion(questionId: number): Observable<any> {
    const id = questionId;
    return this.http.put(`${environment.urlHost}question/set/current/${id}`, {});
  }

  getCurrentQuestion(assemblyId: number): Observable<any> {
    return this.http.get<any>(`${environment.urlHost}question/get/current/${assemblyId}`);
  }

  submitVote(questionId: number, choiceId: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
    return this.http.post(`${environment.urlHost}question/${questionId}/vote/${choiceId}`, {}, { headers });
  }

  finishAssembly(assemblyId: number): Observable<any> {
    return this.http.put(`${environment.urlHost}assembly/finish/${assemblyId}`, {});
  }

  VoteResults(assemblyId: number): Observable<any> {
    return this.http.get<any>(`${environment.urlHost}assembly/${assemblyId}/list/results`)
  }
}