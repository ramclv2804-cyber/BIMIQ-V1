import { Routes } from '@angular/router';
import { Signin } from './signin/signin';
import { EstimationDashboard } from './estimation-dashboard/estimation-dashboard';
import { Dashboard } from './dashboard/dashboard';
import { Projects } from './projects/projects';
import { Resources } from './resources/resources';
import { DbValidator } from './db-validator/db-validator';
export const routes: Routes = [
    { path: '', component: Dashboard },
    { path: 'login', component: Signin },
    { path: 'estimations', component: EstimationDashboard },
    { path: 'projects', component: Projects },
    { path: 'resources', component: Resources },
    { path: 'db-validate', component: DbValidator },
    { path: '**', redirectTo: '' },
];
