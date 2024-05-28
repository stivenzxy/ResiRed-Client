import { Component, OnInit } from '@angular/core';
import { UserDecodeToken } from '../../services/auth/userDecodeToken';
import { LoginService } from '../../services/auth/login.service';
import { ManageAssembliesService } from '../../services/assembly/manage-assemblies.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Survey } from '../assembly-in-progress/assembly-in-progress.component';

@Component({
  selector: 'app-pre-assembly',
  standalone: true,
  imports: [],
  templateUrl: './pre-assembly.component.html',
  styleUrl: './pre-assembly.component.css',
})
export class PreAssemblyComponent implements OnInit {
  user?: UserDecodeToken;
  presentAssembly: any;
  accessCode?: number;
  surveys: Survey[] = [];

  constructor(
    private loginService: LoginService,
    private location: Location,
    private assemblyService: ManageAssembliesService,
    private router: Router,
    private http: HttpClient
  ) {
    this.user = this.loginService.decodeToken();
  }

  ngOnInit(): void {
    this.loadAssemblyData();
  }

  loadAssemblyData() {
    this.assemblyService.getScheduledAssembly().subscribe({
      next: (data) => {
        this.presentAssembly = data;
        console.log(data);
        if (this.presentAssembly?.assemblyId) {
          this.loadSurveys(this.presentAssembly.assemblyId);
        }
      },
      error: (error) => console.error('Error loading assembly', error),
    });
  }

  cancelAssembly(assemblyId: number) {
    Swal.fire({
      title: 'Seguro?',
      icon: 'question',
      text: 'Si cancelas la asamblea no estará disponible y nadie podrá unirse',
      showCancelButton: true,
      confirmButtonText: 'Estoy Seguro',
      cancelButtonText: 'Descartar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.assemblyService.cancelActualAssembly(assemblyId).subscribe({
          next: (response) => {
            console.log(response);
            Swal.fire({
              title: 'Finalizado!',
              icon: 'success',
              text: 'La asamblea se ha cancelado exitosamente',
              confirmButtonText: 'Inicio',
              showCancelButton: false,
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                this.location.replaceState('');
                this.router.navigate(['dashboard']);
              }
            });
          },
          error: (err) => {
            console.log(err);
            Swal.fire({
              title: 'Upss...!',
              icon: 'error',
              text: 'Algo ha salido mal, por favor intenta nuevamente o comunícate con soporte técnico',
              confirmButtonText: 'Volver',
              confirmButtonColor: 'orange',
              showCancelButton: false,
            });
          }
        });
      }
    });
    console.log(assemblyId);
  }

  generateAccessCode(assemblyId: number) {
    this.assemblyService.generateAccessCode(assemblyId).subscribe({
      next: (data) => {
        this.accessCode = data;
        console.log(data);
      },
      error: (error) => {
        console.error('Error generating access code', error);
        Swal.fire({
          title: 'Upss...!',
          icon: 'error',
          text: 'Algo ha salido mal, por favor intenta nuevamente o comunícate con soporte técnico',
          confirmButtonText: 'Volver',
          confirmButtonColor: 'gray',
          showCancelButton: false,
        });
      },
    });
  }

  joinAssembly() {
    Swal.fire({
      title: 'Ingrese el código de acceso',
      input: 'text',
      inputLabel: 'Código de acceso',
      inputPlaceholder: 'Ingrese el código aquí',
      showCancelButton: true,
      confirmButtonText: 'Unirme',
      cancelButtonText: 'Cancelar',
      preConfirm: (accessCode) => {
        if (!accessCode) {
          Swal.showValidationMessage('Debe ingresar un código de acceso');
          return false;
        }
        return accessCode;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const accessCode = result.value;
        const email = this.user?.email;
        if (email) {
          this.assemblyService.joinAssembly(this.presentAssembly?.assemblyId, +accessCode)
            .subscribe({
              next: (response: any) => {
                console.log('Joined Assembly:', response);
                if (response.detail.includes("exitosamente")) {
                    this.checkAssemblyStatus(this.presentAssembly?.assemblyId);
                } else {
                  Swal.fire({
                    title: 'Error',
                    icon: 'error',
                    text: response.detail,
                    confirmButtonText: 'Volver',
                    showCancelButton: false,
                    allowOutsideClick: false,
                  });
                }
              },
              error: (error) => {
                console.error('Error joining assembly', error);
                Swal.fire({
                  title: 'Upss...!',
                  icon: 'error',
                  text: 'Algo ha salido mal, por favor intenta nuevamente o comunícate con soporte técnico',
                  confirmButtonText: 'Volver',
                  confirmButtonColor: 'orange',
                  showCancelButton: false,
                });
              },
            });
        } else {
          Swal.fire({
            title: 'Error!',
            icon: 'error',
            text: 'No se pudo obtener el email del usuario',
            confirmButtonText: 'OK',
            showCancelButton: false,
          });
        }
      }
    });
  }

  checkAssemblyStatus(assemblyId: number) {
    Swal.fire({
      title: 'Esperando a que el administrador inicie la asamblea...',
      html: 'Por favor espere un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        const interval = setInterval(() => {
          this.assemblyService.getAssemblyStatus(assemblyId).subscribe({
            next: (status) => {
              console.log('Assembly Status:', status);
              if (status === 'STARTED') {
                clearInterval(interval);
                Swal.close();
                this.location.replaceState('');
                this.router.navigate(['assemblies/assembly-in-progress']);
              }
            },
            error: (error) => {
              console.error('Error fetching assembly status', error);
            }
          });
        }, 1000);  // Checkea cada segundo el status de la asamblea 
      }
    });
  }
  
  
  startAssembly(assemblyId: number) {
    this.assemblyService.startAssemblyAdmin(assemblyId).subscribe({
      next: (response) => {
        Swal.fire({
          title: response.detail.includes("correctamente") ? 'Asamblea Iniciada!' : 'No es posible iniciar!',
          icon: response.detail.includes("correctamente") ? 'success' : 'info',
          text: response.detail,
          confirmButtonText: response.detail.includes("correctamente") ? 'Continuar' : 'Volver',
          showCancelButton: false,
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed && response.detail.includes("correctamente")) {
            if (this.surveys.length > 0 && this.surveys[0].questions.length > 0) {
              const sortedQuestions = this.surveys[0].questions.sort((a, b) => a.questionId - b.questionId);
              const firstQuestionId = sortedQuestions[0].questionId;
              console.log('Setting first question:', firstQuestionId); // Verifica el questionId
              this.setCurrentQuestion(firstQuestionId);
            }
            this.location.replaceState('');
            this.router.navigate(['assemblies/assembly-in-progress']);
          }
        });
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  

  loadSurveys(assemblyId: number): void {
    this.assemblyService.getAssemblySurveys(assemblyId).subscribe({
      next: (data: Survey[]) => {
        console.log('estructura de los datos: ',data);
        this.surveys = data;
      },
      error: (error) => {
        console.error('Error loading surveys', error);
      },
    });
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
}