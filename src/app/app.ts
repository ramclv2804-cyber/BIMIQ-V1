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
import { Projects } from './projects/projects';
import { AppHeader } from './app-header/app-header';
import { Resources } from './resources/resources';
import { DbValidator } from './db-validator/db-validator';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    CommonModule,
    AppHeader,
    Dashboard,
    Portfolio,
    PriceEstimation,
    BimSelection,
    Signin,
    EstimationDashboard,
    Projects,
    Resources,
    DbValidator
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

  setTab(tab: string) {
    this.calculator.setTab(tab as 'dashboard' | 'portfolio' | 'config');
  }

  goToEstimator() {
    this.calculator.setTab('config');
    this.router.navigate(['/']);
  }

  goToDbValidator() {
    this.router.navigate(['/db-validate']);
  }

  /** Login from the sign-in modal using credentials against the database API. */
  onLoginViaModal() {
    const email = this.calculator.loginEmailInput().trim();
    const password = this.calculator.loginPasswordInput().trim();
    if (!email || !email.includes('@')) {
      this.calculator.showNotification('Please enter a valid email address.', 'warn');
      return;
    }
    // Try API login with email as username
    this.calculator.apiLogin(email, password)
      .then(user => {
        this.calculator.loginUser(user.email, user.id, user.token);
      })
      .catch(() => {
        // Fallback: allow email-only login for backward compatibility
        this.calculator.loginUser(email);
        this.calculator.showNotification('Database auth unavailable — signed in with local session.', 'info');
      });
  }
}
