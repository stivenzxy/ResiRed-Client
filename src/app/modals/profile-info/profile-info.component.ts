import { Component, OnInit } from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { LoginService } from '../../services/auth/login.service';
import { UserDecodeToken } from '../../services/auth/userDecodeToken';

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.css',
})
export class ProfileInfoComponent implements OnInit {
  user?:UserDecodeToken;

  constructor(private loginService : LoginService) {
    this.user = this.loginService.decodeToken();
  }

  ngOnInit() {}
}