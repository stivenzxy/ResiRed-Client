import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { SurveyData } from '../../pages/surveys/surveys.component';
import { environment } from '../../../environments/environment';
import { updateQuestionRequest } from './updateQuestionRequest';

@Injectable({
  providedIn: 'root'
})
export class ManageSurveysService {
  constructor(private http: HttpClient) {}

  /** Surveys section */
  getSurveys(): Observable<SurveyData[]> {
    return this.http.get<SurveyData[]>(`${environment.urlHost}survey/list/unassigned`)
    .pipe(
      catchError(this.handleError)
    );
  }

  createNewSurvey(request: any) {
    return this.http.post(`${environment.urlHost}survey/create`, request)
    .pipe(
      catchError(this.handleError)
    );
  }

  updateSurveyTopic(surveyId: number, request: { topic: string }): Observable<any> {
    const id = surveyId;
    return this.http.put(`${environment.urlHost}survey/${id}/update/topic`, request)
    .pipe(
      catchError(this.handleError)
    );
  }  

  deleteSurvey(surveyId: number): Observable<any> {
    const id = surveyId;
    return this.http.delete(`${environment.urlHost}survey/${id}/delete`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /** Questions section */
  getSurveyQuestions(surveyId: number): Observable<any> {
    const id = surveyId;
    return this.http.get(`${environment.urlHost}survey/${id}/list/questions`)
    .pipe(
      catchError(this.handleError)
    );
  }
  
  addQuestionToSurvey(surveyId: number, questionData: any): Observable<any> {
    const id = surveyId;
    const request = questionData;
    return this.http.post(`${environment.urlHost}survey/${id}/add/question`, request)
    .pipe(
      catchError(this.handleError)
    );
  }
  
  updateQuestion(questionId: number, request: updateQuestionRequest): Observable<any> {
    const id = questionId;
    return this.http.put(`${environment.urlHost}question/${id}/update`, request)
    .pipe(
      catchError(this.handleError)
    );
  }

  deleteQuestion(questionId: number) {
    const id = questionId;
    return this.http.delete(`${environment.urlHost}question/${id}/delete`)
    .pipe(
      catchError(this.handleError)
    );
  }

  /** Choices section */
  deleteChoice(choiceId: number) : Observable<any> {
    const id = choiceId;
    return this.http.delete(`${environment.urlHost}question/delete/choice/${id}`)
    .pipe(
      catchError(this.handleError)
    );
  }

  addChoiceToQuestion(questionId: number, description: string): Observable<any> {
    const id = questionId;
    return this.http.post(`${environment.urlHost}question/${id}/add/choice`, { description: description })
    .pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.log('Se ha producido un error', error.error.message);
    } else {
      console.error('Codigo de retorno de estado', error.status, error.error.message);
    }
    return throwError(() => new Error('Algo salio mal, Intente nuevamente.'));
  }
}
