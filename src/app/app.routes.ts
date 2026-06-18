import { Routes } from '@angular/router';
import { Signin } from './signin/signin';
import { EstimationDashboard } from './estimation-dashboard/estimation-dashboard';
import { Dashboard } from './dashboard/dashboard';
import { Projects } from './projects/projects';
import { Resources } from './resources/resources';
export const routes: Routes = [
    { path: '', component: Dashboard },
    { path: 'login', component: Signin },
    { path: 'estimations', component: EstimationDashboard },
    { path: 'projects', component: Projects },
    { path: 'resources', component: Resources }, // Assuming you have a resourcesComponent for the resources tab
    { path: '**', redirectTo: '' },

];
