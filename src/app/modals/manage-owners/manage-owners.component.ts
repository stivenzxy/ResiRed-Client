import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { UploadUsersFileService } from '../../services/manageUsers/upload-users-file.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SurveyData } from '../../pages/surveys/surveys.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-manage-owners',
  standalone: true,
  imports: [
    MatDialogModule, 
    MatButtonModule,
    CommonModule,   
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatSortModule,
    MatFormFieldModule,
    MatButtonModule,
    CommonModule,],
  templateUrl: './manage-owners.component.html',
  styleUrls: ['./manage-owners.component.css'],
})
export class ManageOwnersComponent implements OnInit {
  users: any[] = [];
  displayedColumns: string[] = ['email', 'firstname', 'address'];
  dataSource = new MatTableDataSource<SurveyData>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private uploadFile: UploadUsersFileService) { }

  ngOnInit(): void {
    this.loadUserList();
  }

  upload(event: any) {
    const file = event.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.uploadFile
        .uploadFile(formData)
        .pipe(filter((event) => event.type === HttpEventType.Response))
        .subscribe({
          next: (event) => {
            console.log(event.body);
            this.loadUserList();
            Swal.fire({
              icon: 'success',
              title: '¡Archivo cargado con éxito!',
              text: 'Los usuarios han sido actualizados.',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Ok',
            });
            event.target.value = '';
          },
          error: (err) => {
            Swal.fire({
              icon: 'info',
              title: 'Upss!...',
              text: `${err.error.message}`,
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Cerrar',
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                event.target.value = '';
              }
            });
          },
        });
    }
  }

  loadUserList() {
    this.uploadFile.viewUserList().subscribe((data) => {
      this.dataSource.data = data;
      console.log(data);
      if (this.paginator && this.sort) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });
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
}
