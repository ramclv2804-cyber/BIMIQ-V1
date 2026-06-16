import { Component, inject } from '@angular/core';
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
    if (!this.loginEmail.trim() || !this.loginPassword.trim()) {
      this.errorMessage = 'Please enter both email and password.';
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
