import { Routes } from '@angular/router';
import { Signin } from './signin/signin';
import { EstimationDashboard } from './estimation-dashboard/estimation-dashboard';
import { Dashboard } from './dashboard/dashboard';
import { UserDashboard } from './user-dashboard/user-dashboard';

export const routes: Routes = [
    { path: '', component: Dashboard },
    { path: 'login', component: Signin },
    { path: 'estimations', component: EstimationDashboard },
    { path: 'userDashboard', component: UserDashboard },
    { path: '**', redirectTo: '' },

];
