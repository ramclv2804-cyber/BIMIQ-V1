import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Signin } from './signin/signin';
import { EstimationDashboard } from './estimation-dashboard/estimation-dashboard'; 

export const routes: Routes = [
    { path: 'login', component: Signin },
    { path: 'estimations', component: EstimationDashboard },
];