import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ManageSurveysService } from '../../services/survey/manage-surveys.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { EditSurveyComponent } from '../../modals/edit-survey/edit-survey.component';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface SurveyData {
  surveyId: number;
  dateCreated?: string;
  topic: string;
}

@Component({
  selector: 'app-surveys',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSortModule,
    MatInputModule,
    MatTooltipModule,
    MatExpansionModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './surveys.component.html',
  styleUrl: './surveys.component.css',
})
export class SurveysComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['Tema', 'Fecha_creacion', 'Accion'];
  dataSource = new MatTableDataSource<SurveyData>();
  surveyForm: FormGroup = new FormGroup('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private surveyService: ManageSurveysService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder
  ) {
    this.loadSurveyData();
    this.surveyForm = this.formBuilder.group({
      topic: ['', Validators.required], // El tema es obligatorio
      questions: this.formBuilder.array([], Validators.required) // Debe haber almenos una pregunta
    });
  }

  ngOnInit() {}

  loadSurveyData() {
    this.surveyService.getSurveys().subscribe((data) => {
      this.dataSource.data = data;
      console.log(data);
      if (this.paginator && this.sort) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
  }

  editSurvey(surveyId: number, topic: string): void {
    this.openEditSurveyDialog(surveyId, topic);
  }

  deleteSurvey(surveyId: number, topic: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `No podrás revertir esta acción, la encuesta "${topic}" se eliminará permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.surveyService.deleteSurvey(surveyId).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(
              (survey) => survey.surveyId !== surveyId
            );
            Swal.fire(
              'Eliminado!',
              'La encuesta ha sido eliminada satisfactoriamente.',
              'success'
            );
          },
          error: (deleteSurveyError) => {
            console.error('Error al eliminar la encuesta: ', deleteSurveyError);
            Swal.fire('Error!', 'No se pudo eliminar la encuesta.', 'error');
          },
        });
      }
    });
  }

  openEditSurveyDialog(id: number, topic: string) {
    const dialogRef = this.dialog.open(EditSurveyComponent, {
      disableClose: true,
      data: { surveyId: id, topic: topic },
      height: '400px',
      width: '800px',
    });

    dialogRef.afterClosed().subscribe((updatedTopic) => {
      if (updatedTopic) {
        const index = this.dataSource.data.findIndex(
          (survey) => survey.surveyId === id
        );
        if (index !== -1) {
          this.dataSource.data[index].topic = updatedTopic;
          this.dataSource = new MatTableDataSource(this.dataSource.data);
        }
      }
    });
  }

  /** Create New Survey*/
  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  addQuestion() {
    const questionGroup = this.formBuilder.group({
      description: ['', Validators.required], // Campo requerido
      choices: this.formBuilder.array([], Validators.required) // Debe haber almenos una opción
    });
    this.questions.push(questionGroup);
  }

  addChoice(questionIndex: number) {
    const choices = this.questions.at(questionIndex).get('choices') as FormArray;
    choices.push(this.formBuilder.control('', Validators.required)); // Opción requerida
  }

  getChoices(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('choices') as FormArray;
  }

  submitNewSurvey() {
    if (this.surveyForm.valid) {
      this.surveyService.createNewSurvey(this.surveyForm.value).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: '¡Encuesta creada exitosamente!',
            text: 'La nueva encuesta ha sido añadida exitosamente al listado de encuestas.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
          }).then((result) => {
            if (result.isConfirmed) {
              this.resetForm(); 
              this.loadSurveyData();
            }
          });
          console.log('Encuesta creada', response);
        },
        error: (error) => console.error('Error creando encuesta', error)
      });
    } else {
      this.surveyForm.markAllAsTouched(); 
  
      if (this.surveyForm.get('topic')?.hasError('required')) {
        Swal.fire('Error', 'El tema de la encuesta es obligatorio.', 'error');
        return;
      }
  
      const questionsInvalid = this.questions.controls.some(question => {
        return question.get('description')?.hasError('required');
      });
  
      if (questionsInvalid) {
        Swal.fire('Error', 'Todas las preguntas deben estar completas.', 'error');
        return;
      }
  
      const choicesInvalid = this.questions.controls.some(question => {
        const choices = question.get('choices') as FormArray;
        return choices.length === 0 || choices.controls.some(choice => choice.hasError('required'));
      });
  
      if (choicesInvalid) {
        Swal.fire('Error', 'Cada pregunta debe tener al menos una opción válida.', 'error');
        return;
      }
    }
  }

  resetForm() {
    this.surveyForm.reset({
      topic: '',
      questions: []
    });
    while (this.questions.length !== 0) {
      this.questions.removeAt(0);
    }
  }
  
  
  ngAfterViewInit() {
    if (this.dataSource.data.length) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Remove from view */
  removeQuestion(index: number) {
    const questions = this.questions as FormArray;
    questions.removeAt(index);
  }

  removeAnswer(questionIndex: number, answerIndex: number) {
    const answers = this.questions
      .at(questionIndex)
      .get('choices') as FormArray;
    answers.removeAt(answerIndex);
  }
}