import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';
import { AppHeader } from '../app-header/app-header';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, AppHeader],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard {
  calculator = inject(SpatialCostCalculator);
  protected router = inject(Router);

  data = this.calculator.dashboardData;
  loading = false;

  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.calculator.loadAdminDashboard().finally(() => this.loading = false);
    }
  }

  goToTab(tab: string) {
    this.calculator.setTab(tab as 'home' | 'portfolio' | 'config');
    this.router.navigate(['/']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'Yet to Award': '#f59e0b',
      'In Progress': '#3b82f6',
      'Under Revision': '#a855f7',
      'Completed': '#22c55e',
    };
    return map[status] || '#94a3b8';
  }

  getScopeColor(scope: string): string {
    return scope === 'Scan to BIM' ? '#668dc1' : scope === 'Scan to CAD' ? '#b59954' : '#94a3b8';
  }

  getBillingColor(billing: string): string {
    return billing === 'Invoiced' ? '#668dc1' : billing === 'Yet to Invoice' ? '#d65454' : billing === 'Paid' ? '#22c55e' : billing === 'Unpaid' ? '#d65454' : '#94a3b8';
  }

  getPaymentColor(payment: string): string {
    return payment === 'Paid' ? '#22c55e' : payment === 'Yet to Pay' ? '#d65454' : '#94a3b8';
  }

  getStr(obj: Record<string, unknown>, key: string, fallback = ''): string {
    const v = obj[key];
    return typeof v === 'string' ? v : fallback;
  }

  getNum(obj: Record<string, unknown>, key: string, fallback = 0): number {
    const v = obj[key];
    return typeof v === 'number' ? v : fallback;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
