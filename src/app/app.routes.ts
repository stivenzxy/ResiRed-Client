import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './services/auth/auth.guard';
import { authLoggedInGuard } from './services/auth/auth-logged-in.guard';


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [authLoggedInGuard]},
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]}
];
