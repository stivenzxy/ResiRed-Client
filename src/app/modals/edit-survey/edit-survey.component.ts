import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ManageSurveysService } from '../../services/survey/manage-surveys.service';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { updateQuestionRequest } from '../../services/survey/updateQuestionRequest';
import { choiceInfoResponse } from '../../services/survey/choiceInfoResponse';
import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface Questions {}

@Component({
  selector: 'app-edit-survey',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './edit-survey.component.html',
  styleUrl: './edit-survey.component.css',
})
export class EditSurveyComponent {
  surveyId: number = 0;
  topic: string = '';
  questions: any[] = [];
  step = 0;
  expandedPanel: number | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { surveyId: number; topic: string },
    private surveyService: ManageSurveysService,
    private dialogRef: MatDialogRef<EditSurveyComponent>
  ) {
    this.surveyId = data.surveyId;
    this.topic = data.topic;

    this.loadQuestions();
    console.log(
      'Id de la encuesta en el editable',
      this.surveyId,
      'topic: ',
      this.topic
    );
  }

  updateTopic() {
    this.surveyService
      .updateSurveyTopic(this.surveyId, { topic: this.topic })
      .subscribe({
        next: (response) => {
          console.log('Actualizado!', response);
          this.dialogRef.close(this.topic);
        },
        error: (error) => {
          console.error('Error updating topic:', error);
        },
      });
  }

  loadQuestions() {
    this.surveyService.getSurveyQuestions(this.surveyId).subscribe({
      next: (questions) => {
        this.questions = questions;
      },
      error: (error) => {
        console.error('Error loading questions:', error);
      },
    });
  }

  addNewQuestion(): void {
    const newQuestion = {
      questionId: null,
      description: '',
      choices: [],
    };
    this.questions.push(newQuestion);
    this.expandedPanel = newQuestion.questionId;
  }

  createQuestion(question: any): void {
    if (!question.description.trim()) {
      Swal.fire({
        icon: 'info',
        title: 'Descripción vacía',
        text: 'Debes proporcionar una descripción para la pregunta.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    console.log(question);

    this.surveyService.addQuestionToSurvey(this.surveyId, question).subscribe({
      next: (response) => {
        console.log('Pregunta añadida:', response);
        question.questionId = response.questionId;

        Swal.fire({
          icon: 'success',
          title: '¡Pregunta añadida!',
          text: 'La nueva pregunta ha sido añadida exitosamente.',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Excelente',
        });
      },
      error: (error) => {
        console.error('Error añadiendo pregunta:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al añadir la nueva pregunta',
          confirmButtonColor: '#d33',
          confirmButtonText: 'Cerrar',
        });
      },
    });
  }

  updateQuestion(question: any) {
    let request: updateQuestionRequest = {
      description: question.description,
      choices: question.choices.map(
        (choice: any): choiceInfoResponse => ({
          choiceId: choice.choiceId,
          description: choice.description,
        })
      ),
    };

    const hasUnsavedChanges =
      question.questionId === null ||
      question.choices.some((choice: any) => choice.choiceId === null);

    if (hasUnsavedChanges) {
      Swal.fire({
        icon: 'info',
        title: 'Elementos sin guardar!',
        text: 'Debes guardar cada elemento nuevo antes de actualizar los cambios',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido',
      });
    } else {
      this.surveyService
        .updateQuestion(question.questionId, request)
        .subscribe({
          next: (response) => {
            console.log(response);
            Swal.fire(
              'Información Actualizada!',
              'La información de la pregunta se ha actualizado exitosamente',
              'success'
            );
          },
          error: (error) => {
            console.error(
              'Error al actualizar la información de la pregunta:',
              error
            );
            Swal.fire(
              'Error!',
              'Algo ha salido mal al intentar actualizar la información de la pregunta',
              'error'
            );
          },
        });
    }
  }

  deleteQuestion(question: any) {
    if (question.questionId === null) {
      this.questions = this.questions.filter(q => q !== question);
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: `No podrás revertir esta acción, la pregunta se eliminará permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.surveyService.deleteQuestion(question.questionId).subscribe({
          next: () => {
            Swal.fire(
              'Eliminado!',
              'La pregunta ha sido eliminada satisfactoriamente.',
              'success'
            );
            this.questions = this.questions.filter(
              (q) => q.questionId !== question.questionId
            );
          },
          error: (deleteQuestionError) => {
            console.error(
              'Error al eliminar la pregunta: ',
              deleteQuestionError
            );
            Swal.fire('Error!', 'No se pudo eliminar la pregunta.', 'error');
          },
        });
      }
    });
  }

  /** Choices */
  addNewChoice(question: any): void {
    const newChoice = { choiceId: null, description: '' };
    question.choices.push(newChoice);
  }

  saveNewChoice(questionId: number, choice: any) {
    if (!choice.description.trim()) {
      Swal.fire({
        icon: 'info',
        title: 'Campo vacío',
        text: 'Debes ingresar una descripción para la nueva opción.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido',
      });
    } else if(!questionId){
      Swal.fire({
        icon: 'warning',
        title: 'Campo Requerido!',
        text: 'Para añadir una nueva opción debes crear primero la pregunta',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido',
      });
    }else {
      this.surveyService
        .addChoiceToQuestion(questionId, choice.description)
        .subscribe({
          next: (response) => {
            console.log('Choice added:', response);
            choice.choiceId = response.choiceId;

            Swal.fire({
              icon: 'success',
              title: '¡Opción añadida!',
              text: 'La nueva opción de respuesta ha sido creada exitosamente.',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Excelente',
            });
          },
          error: (error) => {
            console.error('Error adding choice:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema al añadir la nueva opción de respuesta',
              confirmButtonColor: '#d33',
              confirmButtonText: 'Cerrar',
            });
          },
        });
    }
  }

  deleteChoice(choiceId: number | null, question: any) {
    if (choiceId !== null) {
      this.surveyService.deleteChoice(choiceId).subscribe({
        next: (response) => {
          console.log('Choice deleted:', response);
          this.removeChoiceFromQuestion(choiceId, question);
        },
        error: (error) => {
          console.error('Error deleting choice:', error);
        },
      });
    } else {
      this.removeChoiceFromQuestion(choiceId, question);
    }
  }

  private removeChoiceFromQuestion(choiceId: number | null, question: any) {
    const index = question.choices.findIndex(
      (c: any) => c.choiceId === choiceId
    );
    if (index > -1) {
      question.choices.splice(index, 1);
    }
  }

  /** Accordion */
  setExpandedPanel(id: number): void {
    this.expandedPanel = id;
  }
}