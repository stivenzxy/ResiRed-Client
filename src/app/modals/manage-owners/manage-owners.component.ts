import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { UploadUsersFileService } from '../../services/manageUsers/upload-users-file.service';
import { response } from 'express';

@Component({
  selector: 'app-manage-owners',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './manage-owners.component.html',
  styleUrls: ['./manage-owners.component.css'],
})
export class ManageOwnersComponent {
  constructor(private uploadFile: UploadUsersFileService) {}

  upload(event: any) {
    const file = event.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.uploadFile.uploadFile(formData).subscribe({
        next: (response) => {
          console.log(response);
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
          })
        },
      });
    }
  }
}
