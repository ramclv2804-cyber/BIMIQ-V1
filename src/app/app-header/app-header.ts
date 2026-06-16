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
  currentUrl = computed(() => this.router.url);

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.isUserMenuOpen.set(false);
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen.update(v => !v);
  }

  goHome() {
    this.calculator.setTab('dashboard');
    this.router.navigate(['/']);
  }

  setTab(tab: string) {
    this.calculator.setTab(tab as 'dashboard' | 'portfolio' | 'config');
    this.router.navigate(['/']);
  }

  goToEstimations() {
    this.router.navigate(['/estimations']);
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

  logout() {
    this.calculator.logoutUser();
    this.router.navigate(['/']);
  }
}
