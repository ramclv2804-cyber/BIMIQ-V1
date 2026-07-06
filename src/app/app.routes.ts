import { Routes } from '@angular/router';
import { Signin } from './signin/signin';
import { AdminDashboard } from './adminDashboard/admin-dashboard';
import { Home } from './home/home';
import { Projects } from './projects/projects';
import { Resources } from './resources/resources';
import { DbValidator } from './db-validator/db-validator';
export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Signin },
    { path: 'dashboard', component: AdminDashboard },
    { path: 'projects', component: Projects },
    { path: 'resources', component: Resources },
    { path: 'db-validate', component: DbValidator },
    { path: '**', redirectTo: '' },
];
