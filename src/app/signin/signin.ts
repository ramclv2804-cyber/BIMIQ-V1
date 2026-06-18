import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';
import { AppHeader } from '../app-header/app-header';

@Component({
  selector: 'app-signin',
  imports: [CommonModule,AppHeader],
  templateUrl: './signin.html',
  styleUrls: ['./signin.css'],
})
export class Signin {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  calculator = inject(SpatialCostCalculator);

  constructor() {
    if (typeof document !== 'undefined') {
      this.calculator.clearSessionCookie();
    }
  }

  isLoginMode = true;

  loginEmail = '';
  loginPassword = '';
  showLoginPassword = false;

  signupUsername = '';
  signupEmail = '';
  signupPassword = '';
  signupConfirm = '';
  showSignupPassword = false;
  showSignupConfirm = false;

  errorMessage = '';
  isLoading = false;
  fieldErrors: Record<string, boolean> = {};

  clearFieldErrors() {
    this.fieldErrors = {};
    this.errorMessage = '';
  }

  setFieldErrors(fields: string[]) {
    this.fieldErrors = fields.reduce((acc, f) => ({ ...acc, [f]: true }), {});
  }

  hasError(field: string): boolean {
    return !!this.fieldErrors[field];
  }
  users = [
    {
      'username': 'clove',
      'password': '123',
      'email': 'clove@example.com',
      'role': 'admin',
    },
    {
      'username': 'user',
      'password': '123',
      'email': 'user@example.com',
      'role': 'user',
    },
  ];

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  onLogin() {
    this.errorMessage = '';
    this.clearFieldErrors();
    const errFields: string[] = [];
    if (!this.loginEmail.trim()) errFields.push('loginEmail');
    if (!this.loginPassword.trim()) errFields.push('loginPassword');
    if (errFields.length) {
      this.setFieldErrors(errFields);
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    this.isLoading = true;
    setTimeout(() => {
      const user = this.users.find(u => u.username === this.loginEmail && u.password === this.loginPassword);
      if (user) {
        this.calculator.loginUser(user.email);
        if (user.username === 'clove') {
          this.router.navigate(['/estimations']);
        } else {
          this.router.navigate(['/projects']);
        }

      } else {
        this.errorMessage = 'Invalid email or password.';
        this.setFieldErrors(['loginEmail', 'loginPassword']);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 500);
  }

  isSignupEmailValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  onSignup() {
    this.errorMessage = '';
    this.clearFieldErrors();
    const errFields: string[] = [];
    if (!this.signupUsername.trim()) errFields.push('signupUsername');
    if (!this.signupEmail.trim()) errFields.push('signupEmail');
    if (!this.signupPassword.trim()) errFields.push('signupPassword');
    if (!this.signupConfirm.trim()) errFields.push('signupConfirm');
    if (errFields.length) {
      this.setFieldErrors(errFields);
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    if (!this.isSignupEmailValid(this.signupEmail)) {
      this.setFieldErrors(['signupEmail']);
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }
    if (this.signupPassword !== this.signupConfirm) {
      this.setFieldErrors(['signupPassword', 'signupConfirm']);
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.isLoading = true;
    setTimeout(() => {
      this.calculator.loginUser(this.signupEmail.trim());
      this.router.navigate(['/projects']);
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
