import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SpatialCostCalculator } from './services/spatial-cost-calculator';
import { Dashboard } from './dashboard/dashboard';
import { Portfolio } from './portfolio/portfolio';
import { PriceEstimation } from './price-estimation/price-estimation';
import { BimSelection } from './bim-selection/bim-selection';
import { Signin } from './signin/signin';
import { EstimationDashboard } from './estimation-dashboard/estimation-dashboard';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    CommonModule,
    Dashboard,
    Portfolio,
    PriceEstimation,
    BimSelection,
    Signin,
    EstimationDashboard,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  calculator = inject(SpatialCostCalculator);

  currentUrl = signal('/');

  constructor() {
    this.currentUrl.set(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.currentUrl.set((e as NavigationEnd).urlAfterRedirects);
    });
  }

  setTab(tab: 'dashboard' | 'portfolio' | 'config') {
    this.calculator.setTab(tab);
  }

  openAddModal() {
    this.calculator.openAddModal();
  }

  signIn() {
    this.router.navigate(['/login']);
  }

  goToEstimations() {
    this.router.navigate(['/estimations']);
  }
}
