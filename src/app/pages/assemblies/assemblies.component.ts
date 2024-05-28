import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ManageSurveysService } from '../../services/survey/manage-surveys.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SurveyData } from '../surveys/surveys.component';
import { AddSurveyToAssemblyComponent } from '../../modals/add-survey-to-assembly/add-survey-to-assembly.component';
import { MatDialog } from '@angular/material/dialog';
import { ManageAssembliesService } from '../../services/assembly/manage-assemblies.service';
import Swal from 'sweetalert2';
import { UserDecodeToken } from '../../services/auth/userDecodeToken';
import { LoginService } from '../../services/auth/login.service';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-assemblies',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatInputModule,
    MatButtonModule,
    MatNativeDateModule,
    MatSelectModule,
    RouterOutlet,
    MatPaginatorModule,
    CommonModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './assemblies.component.html',
  styleUrls: ['./assemblies.component.css'],
})
export class AssembliesComponent implements OnInit {
  user?: UserDecodeToken;
  assemblyForm: FormGroup = new FormGroup('');
  assemblies: any[] = [];
  surveys: SurveyData[] = [];
  selectedSurveys: Set<number> = new Set();
  minDate: Date;
  maxDate: Date;
  assemblyInProgress?: any;
  assemblyStatus?: any;
  upcomingAssembly: any = null;

  isPreAssemblyRoute: boolean = false;

  pageSize = 2;
  currentPage = 0;
  pagedAssemblies:any = [];

  constructor(
    private formBuilder: FormBuilder,
    private surveyService: ManageSurveysService,
    private dialog: MatDialog,
    private assemblyService: ManageAssembliesService,
    private loginService: LoginService,
    private router: Router,
    private location: Location
  ) {
    this.user = this.loginService.decodeToken();

    const today = new Date();
    this.minDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    this.maxDate = new Date(today.getFullYear() + 1, 11, 31);
  }

  ngOnInit(): void {
    this.assemblyForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      surveys: [this.selectedSurveys],
    });
    this.loadSurveys();
    this.loadAssembliesHistory();
    this.loadAssemblyInProgress();
    this.updatePagedAssemblies();
  }

  loadSurveys(): void {
    this.surveyService.getSurveys().subscribe({
      next: (data) => (this.surveys = data),
      error: (error) => console.error('Error loading surveys', error),
    });
  }

  openSurveySelector(): void {
    const dialogRef = this.dialog.open(AddSurveyToAssemblyComponent, {
      width: '400px',
      data: {
        surveys: this.surveys,
        selected: Array.from(this.selectedSurveys),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedSurveys = new Set(result);
        this.assemblyForm
          .get('surveys')
          ?.setValue(Array.from(this.selectedSurveys), { emitEvent: false });
      }
    });
  }

  submitNewAssembly(): void {
    if (this.assemblyForm.valid) {
      const assemblyData = this.assemblyForm.value;
      assemblyData.surveys = Array.from(this.selectedSurveys);

      this.assemblyService.createAssembly(assemblyData).subscribe({
        next: (response) => {
          console.log('Assembly created successfully:', response);
          Swal.fire({
            icon: 'success',
            title: '¡Asamblea creada exitosamente!',
            text: 'La nueva asamblea ha sido añadida exitosamente.',
            confirmButtonColor: '#3085d6',
            allowOutsideClick: false,
            confirmButtonText: 'Aceptar',
          }).then((result) => {
            if (result.isConfirmed) {
              this.resetForm();
            }
          });
        },
        error: (error) => {
          console.error('Error creating assembly:', error);
        },
      });
    } else {
      console.error('Form is not valid');
      this.assemblyForm.markAllAsTouched();
    }
  }

  private resetForm(): void {
    this.assemblyForm.reset();
    this.selectedSurveys.clear();
  }

  loadAssembliesHistory() {
    this.assemblyService.getAssemblies().subscribe({
      next: (data) => {
        this.assemblies = data;
        console.log(data);
        this.updatePagedAssemblies();
      },
      error: (error) => {
        console.error('Error loading the assemblies:', error);
      },
    });
  }

  loadAssemblyInProgress() {
    this.assemblyService.getStartedAssembly().subscribe({
      next: (data) => {
        this.assemblyInProgress = data;
        console.log('Assembly in progress:', this.assemblyInProgress);
        if (this.assemblyInProgress) {
          this.getAssemblyStatus(this.assemblyInProgress.assemblyId);
        }
      },
      error: (error) => {
        console.error('Error loading assembly in progress:', error);
      },
    });
  }

  getAssemblyStatus(assemblyId: number) {
    if (!assemblyId) return;

    this.assemblyService.getAssemblyStatus(assemblyId).subscribe({
      next: (status) => {
        this.assemblyStatus = status;
        console.log(
          'Assembly status in assemblies component:',
          this.assemblyStatus
        );
      },
      error: (err) => {
        console.error('Error getting assembly status:', err);
      },
    });
  }

  joinAssembly() {
    this.assemblyService.getScheduledAssembly().subscribe({
      next: (assembly) => {
        if (assembly.isAvailable) {
          this.router.navigate(['pre-assembly']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'No disponible',
            text: 'La asamblea aún no está disponible.',
            confirmButtonText: 'Cerrar',
          });
        }
      },

      error: (error) => {
        console.error('Error checking assembly availability', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al verificar la disponibilidad de la asamblea.',
          confirmButtonText: 'Cerrar',
        });
      },
    });
  }

  handleAssemblyClick(assembly: any) {
    if (assembly.status === 'FINISHED') {
      this.assemblyService.VoteResults(assembly.id).subscribe({
        next: (response) => {
          console.log(response);
          this.location.replaceState(''),
            this.router.navigate(['vote-results']);
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      Swal.fire({
        title: 'Lo sentimos',
        icon: 'info',
        text: 'La asamblea seleccionada fue cancelada, por tanto no existe mas información asociada a esta',
        confirmButtonText: 'Aceptar',
        showCancelButton: false
      });
    }
  }

  updatePagedAssemblies() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedAssemblies = this.assemblies.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePagedAssemblies();
  }
}
