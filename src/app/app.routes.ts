import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './services/auth/auth.guard';
import { authLoggedInGuard } from './services/auth/auth-logged-in.guard';
import { SurveysComponent } from './pages/surveys/surveys.component';
import { AssembliesComponent } from './pages/assemblies/assemblies.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate:[authLoggedInGuard]},
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},
    { path: 'surveys', component: SurveysComponent, canActivate: [authGuard]},
    { path: 'assemblies', component: AssembliesComponent, canActivate: [authGuard]}
];