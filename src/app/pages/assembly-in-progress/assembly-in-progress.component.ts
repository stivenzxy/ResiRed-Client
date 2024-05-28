import { Component, OnInit, OnDestroy } from '@angular/core';
import { ManageAssembliesService } from '../../services/assembly/manage-assemblies.service';
import { CommonModule, Location } from '@angular/common';
import { UserDecodeToken } from '../../services/auth/userDecodeToken';
import { LoginService } from '../../services/auth/login.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

export interface Choice {
  choiceId: number;
  description: string;
}

export interface Question {
  questionId: number;
  description: string;
  topic?: string;
  choices: Choice[];
}

export interface Survey {
  surveyId: number;
  topic: string;
  questions: Question[];
}

@Component({
  selector: 'app-assembly-in-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assembly-in-progress.component.html',
  styleUrls: ['./assembly-in-progress.component.css'],
})
export class AssemblyInProgressComponent implements OnInit, OnDestroy {
  surveys: Survey[] = [];
  currentSurveyIndex: number = 0;
  currentQuestionIndex: number = 0;
  user?: UserDecodeToken;

  assemblyInProgress?: any;
  assemblyStatus?: any;
  currentQuestion?: Question;
  intervalId?: any;
  selectedChoiceId?: number; // Almacena la opción seleccionada
  //voted: boolean = false; // Bandera para deshabilitar los inputs después de votar

  constructor(
    private assemblyService: ManageAssembliesService,
    private loginService: LoginService,
    private router: Router,
    private location: Location,
  ) {
    this.user = this.loginService.decodeToken();
  }

  ngOnInit(): void {
    console.log(this.user); // Verificar el valor del usuario
    this.loadAssemblyInProgress();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadAssemblyInProgress() {
    this.assemblyService.getStartedAssembly().subscribe({
      next: (data) => {
        this.assemblyInProgress = data;
        console.log('Assembly in progress:', this.assemblyInProgress);
        if (this.assemblyInProgress) {
          this.getAssemblyStatus(this.assemblyInProgress.assemblyId);
          this.loadSurveys(this.assemblyInProgress.assemblyId);
          if (this.user?.role === 'OWNER') {
            this.startPolling(this.assemblyInProgress.assemblyId);
          }
        }
      },
      error: (error) => {
        console.error('Error loading assembly in progress:', error);
      },
    });
  }

  loadSurveys(assemblyId: number): void {
    this.assemblyService.getAssemblySurveys(assemblyId).subscribe({
      next: (data: Survey[]) => {
        console.log('Surveys loaded:', data); // Verificar los datos cargados
        this.surveys = data;
      },
      error: (error) => {
        console.error('Error loading surveys', error);
      },
    });
  }

  nextQuestion(): void {
    if (
      this.currentQuestionIndex <
      this.surveys[this.currentSurveyIndex].questions.length - 1
    ) {
      this.currentQuestionIndex++;
    } else if (this.currentSurveyIndex < this.surveys.length - 1) {
      this.currentSurveyIndex++;
      this.currentQuestionIndex = 0;
    }
    this.setCurrentQuestion(
      this.surveys[this.currentSurveyIndex].questions[this.currentQuestionIndex]
        .questionId
    );
  }

  setCurrentQuestion(questionId: number): void {
    this.assemblyService.setCurrentQuestion(questionId).subscribe({
      next: (response) => {
        console.log('Current question set:', response);
      },
      error: (error) => {
        console.error('Error setting current question:', error);
      },
    });
  }

  getCurrentQuestion(assemblyId: number): void {
    this.assemblyService.getCurrentQuestion(assemblyId).subscribe({
      next: (question) => {
        if (this.currentQuestion && this.currentQuestion.questionId === question.questionId) {
          // Si la pregunta es la misma, conserva la selección
          question.choices.forEach((choice:any) => {
            if (choice.choiceId === this.selectedChoiceId) {
              choice['selected'] = true;
            }
          });
        }
        this.currentQuestion = question;
        console.log('Current question:', this.currentQuestion);
      },
      error: (err) => {
        console.error('Error getting current question:', err);
      },
    });
  }

  startPolling(assemblyId: number): void {
    this.getCurrentQuestion(assemblyId); 
    this.getAssemblyStatus(assemblyId); // Check initial status
    this.intervalId = setInterval(() => {
      this.getCurrentQuestion(assemblyId);
      this.getAssemblyStatus(assemblyId);
    }, 500); // Checkea cada medio segundo
  }

  getAssemblyStatus(assemblyId: number): void {
    this.assemblyService.getAssemblyStatus(assemblyId).subscribe({
      next: (status) => {
        this.assemblyStatus = status;
        console.log('Assembly status:', this.assemblyStatus);
        if (this.assemblyStatus === 'FINISHED') {
          clearInterval(this.intervalId);
          Swal.fire({
            title: 'Asamblea finalizada',
            icon: 'info',
            text: 'La asamblea ha finalizado, serás redirigido al dashboard.',
            confirmButtonText: 'De acuerdo',
            showCancelButton: false,
            allowOutsideClick: false,
          }).then(() => {
            this.router.navigate(['vote-results']);
          });
        }
      },
      error: (err) => {
        console.error('Error getting assembly status:', err);
      },
    });
  }

  selectChoice(choiceId: number): void {
    this.selectedChoiceId = choiceId;
    console.log('Selected choice:', choiceId);
  }

  vote(event: Event): void {
    event.preventDefault(); // Prevenir el comportamiento por defecto del botón de submit

    if (this.currentQuestion) {
      if (this.selectedChoiceId === undefined || this.selectedChoiceId === null) {
        Swal.fire({
          title: 'Tu voto en esta pregunta no será contado',
          icon: 'warning',
          text: 'Al votar sin elegir una opción no estas contribuyendo a mejorar el conjunto >:(',
          confirmButtonText: 'De acuerdo',
          showCancelButton: false,
          allowOutsideClick: false
        });
      }

      console.log('votado en la pregunta', this.currentQuestion.questionId, ' y la opcion', this.selectedChoiceId);

      this.assemblyService.submitVote(this.currentQuestion.questionId, this.selectedChoiceId!).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Voto exitoso!',
            icon: 'success',
            text: response.detail,
            confirmButtonText: 'De acuerdo',
            showCancelButton: false,
          });
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  }
  
  finishAssembly(assemblyId: number): void {  
    this.assemblyService.finishAssembly(assemblyId).subscribe({
      next: (response) => {
       console.log(response);
       Swal.fire({
        title: 'Asamblea finalizada!',
        icon: 'info',
        text: 'Los resultados de las votaciones se muestran a continuación',
        confirmButtonText: 'De acuerdo',
        showCancelButton: false,
        allowOutsideClick: false
       }).then((result) => {
        if(result.isConfirmed) {
          this.location.replaceState(''),
          this.router.navigate(['vote-results']);
        }
       })
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
}