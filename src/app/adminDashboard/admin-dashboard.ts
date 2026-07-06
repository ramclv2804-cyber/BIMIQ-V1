import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';
import { AppHeader } from '../app-header/app-header';

interface NewUser {
  id: number;
  username: string;
  email: string;
  company_name: string | null;
  company_website: string | null;
  contact_number: string | null;
  role: string;
  markasread: number;
  created_at: string;
}

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

  // New users notification
  newUsers = signal<NewUser[]>([]);
  isNewUsersPopupOpen = signal(false);
  isMarkingRead = signal(false);

  // Avatars: deterministic color per user based on id
  avatarColors = [
    ['#788cff', '#60a5fa'],
    ['#a855f7', '#c084fc'],
    ['#f472b6', '#fb7185'],
    ['#22c55e', '#4ade80'],
    ['#f59e0b', '#fbbf24'],
    ['#3b82f6', '#60a5fa'],
    ['#ec4899', '#f472b6'],
    ['#14b8a6', '#2dd4bf'],
  ];

  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.calculator.loadAdminDashboard().finally(() => this.loading = false);
      this.loadNewUsers();
    }
  }

  async loadNewUsers() {
    try {
      const result = await this.calculator.apiGetNewUsers();
      this.newUsers.set(result.users);
    } catch {
      this.newUsers.set([]);
    }
  }

  toggleNewUsersPopup() {
    this.isNewUsersPopupOpen.update(v => !v);
  }

  closeNewUsersPopup() {
    this.isNewUsersPopupOpen.set(false);
  }

  async markUserAsRead(userId: number) {
    this.isMarkingRead.set(true);
    try {
      await this.calculator.apiMarkUserAsRead(userId);
      this.newUsers.update(list => list.filter(u => u.id !== userId));
    } catch {
      // Silently fail
    } finally {
      this.isMarkingRead.set(false);
    }
  }

  getAvatarGradient(userId: number): string {
    const colors = this.avatarColors[userId % this.avatarColors.length];
    return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
  }

  getRelativeTime(dateStr: string): string {
    const now = Date.now();
    const d = new Date(dateStr).getTime();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  getTimeBadgeClass(dateStr: string): string {
    const now = Date.now();
    const d = new Date(dateStr).getTime();
    const diff = now - d;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'badge-just-now';
    if (hrs < 24) return 'badge-today';
    if (hrs < 48) return 'badge-yesterday';
    return 'badge-older';
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
