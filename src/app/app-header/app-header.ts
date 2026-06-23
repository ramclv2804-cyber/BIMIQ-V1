import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './app-header.html',
  styleUrls: ['./app-header.css'],
})
export class AppHeader {
  calculator = inject(SpatialCostCalculator);
  private router = inject(Router);

  user = computed(() => this.calculator.currentUser());
  isLoggedIn = computed(() => this.calculator.isLoggedIn());
  isUserMenuOpen = signal(false);
  isMobileMenuOpen = signal(false);
  currentUrl = computed(() => this.router.url);

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.isUserMenuOpen.set(false);
    }
    if (!target.closest('.mobile-menu-container') && !target.closest('.hamburger-btn')) {
      this.isMobileMenuOpen.set(false);
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  navigateAndClose(url: string, tab?: string) {
    this.isMobileMenuOpen.set(false);
    if (tab) {
      this.calculator.setTab(tab as 'home' | 'portfolio' | 'config');
    }
    this.router.navigate([url]);
  }

  goHome() {
    this.calculator.setTab('home');
    this.router.navigate(['/']);
  }

  setTab(tab: string) {
    this.calculator.setTab(tab as 'home' | 'portfolio' | 'config');
    this.router.navigate(['/']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToProjects() {
    this.router.navigate(['/projects']);
  }

 goToResources() {
    this.router.navigate(['/resources']);
  }

  openAddModal() {
    this.calculator.openAddModal();
  }

  signIn() {
    this.router.navigate(['/login']);
  }

  goToEstimator() {
    this.calculator.setTab('config');
    this.router.navigate(['/']);
  }

  logout() {
    this.calculator.logoutUser(true);
    this.router.navigate(['/']);
  }
}
