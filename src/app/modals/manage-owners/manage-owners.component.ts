import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { UploadUsersFileService } from '../../services/manageUsers/upload-users-file.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-manage-owners',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './manage-owners.component.html',
  styleUrls: ['./manage-owners.component.css'],
})
export class ManageOwnersComponent implements OnInit{
  users: any[] = [];

  constructor(private uploadFile: UploadUsersFileService) {}

  ngOnInit(): void {
    this.refreshUserList();
  }

  upload(event: any) {
    const file = event.target.files[0];
  
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
  
      this.uploadFile.uploadFile(formData).pipe(
        filter(event => event.type === HttpEventType.Response)
      ).subscribe({
        next: (event) => {
          console.log(event.body);
          this.refreshUserList();
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
            allowOutsideClick: false
          }).then((result) => {
            if(result.isConfirmed){
              event.target.value = '';
            }
          });
        },
      });
    }
  }  

  refreshUserList() {
    this.uploadFile.viewUserList().subscribe({
      next: (data) => this.users = data,
      error: (error) => console.error('Error al obtener propietarios!', error.error.message)
    });
  }
}
