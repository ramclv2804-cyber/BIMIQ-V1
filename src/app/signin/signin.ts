import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';

@Component({
  selector: 'app-signin',
  imports: [CommonModule],
  templateUrl: './signin.html',
  styleUrls: ['./signin.css'],
})
export class Signin {
  private router = inject(Router);
  calculator = inject(SpatialCostCalculator);

  constructor() {
    if (typeof document !== 'undefined') {
      this.calculator.clearSessionCookie();
    }
  }

  isLoginMode = true;

  loginEmail = '';
  loginPassword = '';

  signupUsername = '';
  signupEmail = '';
  signupPassword = '';
  signupConfirm = '';

  errorMessage = '';
  isLoading = false;

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  onLogin() {
    this.errorMessage = '';
    if (!this.loginEmail.trim() || !this.loginPassword.trim()) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }
    this.isLoading = true;
    setTimeout(() => {
      if (this.loginEmail === 'test' && this.loginPassword === '123') {
        this.calculator.loginUser(this.loginEmail.trim());
        this.router.navigate(['/estimations']);
      } else {
        this.errorMessage = 'Invalid email or password.';
        this.isLoading = false;
      }
    }, 800);
  }

  onSignup() {
    this.errorMessage = '';
    if (!this.signupUsername.trim() || !this.signupEmail.trim() || !this.signupPassword.trim()) {
      this.errorMessage = 'All fields are required.';
      return;
    }
    if (this.signupPassword !== this.signupConfirm) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.isLoading = true;
    setTimeout(() => {
      this.calculator.loginUser(this.signupEmail.trim());
      this.router.navigate(['/estimations']);
    }, 800);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  setTab(tab: 'dashboard' | 'portfolio' | 'config') {
    this.calculator.setTab(tab);
    this.router.navigate(['/']);
  }

  openAddModal() {
    this.calculator.openAddModal();
  }

  signIn() {
    this.router.navigate(['/login']);
  }
}
