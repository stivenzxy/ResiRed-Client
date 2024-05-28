import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './services/auth/auth.guard';
import { authLoggedInGuard } from './services/auth/auth-logged-in.guard';
import { SurveysComponent } from './pages/surveys/surveys.component';
import { AssembliesComponent } from './pages/assemblies/assemblies.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { HelpSectionComponent } from './pages/help-section/help-section.component';
import { PreAssemblyComponent } from './pages/pre-assembly/pre-assembly.component';
import { protectedAssemblyGuard } from './services/assembly/protected-assembly.guard';
import { AssemblyInProgressComponent } from './pages/assembly-in-progress/assembly-in-progress.component';
import { VoteResultsComponent } from './pages/vote-results/vote-results.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate:[authLoggedInGuard]},
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},
    { path: 'surveys', component: SurveysComponent, canActivate: [authGuard]},
    { path: 'assemblies', component: AssembliesComponent, canActivate: [authGuard],
        children: [
            {
                path: 'assembly-in-progress',
                component: AssemblyInProgressComponent
            },
        ]
    },
    { path: 'vote-results', component: VoteResultsComponent},
    { path: 'pre-assembly', component: PreAssemblyComponent, canActivate: [authGuard, protectedAssemblyGuard]},
    { path: 'resetPassword', component: ChangePasswordComponent},
    { path: 'FAQ', component: HelpSectionComponent},
];