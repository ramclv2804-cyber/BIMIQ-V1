import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';

interface EstimationItem {
  id: string;
  project: string;
  type: string;
  amount: string;
  status: 'Pending' | 'Approved' | 'Draft';
  date: string;
  step: number;
}

@Component({
  selector: 'app-estimation-dashboard',
  imports: [CommonModule],
  templateUrl: './estimation-dashboard.html',
  styleUrls: ['./estimation-dashboard.css'],
})
export class EstimationDashboard {
  calculator = inject(SpatialCostCalculator);
  private router = inject(Router);

  user = computed(() => this.calculator.currentUser());

  metrics = [
    { label: 'Current Estimate', value: computed(() => this.calculator.calculatedSmartEstimate().currencySymbol + this.calculator.calculatedSmartEstimate().totalPrice.toFixed(0)), icon: 'payments', change: computed(() => this.calculator.selectedCurrency()) },
    { label: 'Building Type', value: computed(() => this.calculator.selectedBuildingType() || '—'), icon: 'domain', change: computed(() => this.calculator.selectedModelingWay() === 'bim' ? 'Scan to BIM' : 'CAD to BIM') },
    { label: 'Area (SFT)', value: computed(() => this.calculator.smartScanSize() || '—'), icon: 'square_foot', change: computed(() => this.calculator.smartIsMetric() ? 'Sq.m' : 'Sq.ft') },
    { label: 'Email', value: computed(() => this.calculator.smartEmail() || '—'), icon: 'alternate_email', change: computed(() => this.calculator.isEmailValid() ? 'Valid' : 'Not set') },
  ];

  stageData = [
    { key: 'total', label: 'Total Estimations', icon: 'calculator', color: '#DF80AC' },
    { key: 'step3', label: 'Fully Completed', icon: 'check_circle', color: '#34d399' },
    { key: 'step2', label: 'Review Pending', icon: 'pending', color: '#fbbf24' },
    { key: 'step1', label: 'Initial Draft', icon: 'edit_note', color: '#94a3b8' },
  ];

  recentEstimations: EstimationItem[] = [
    { id: 'EST-001', project: 'Vertex Pavilion', type: 'MEP', amount: '$12,450', status: 'Approved', date: '2026-06-08', step: 3 },
    { id: 'EST-002', project: 'Crystal Atrium', type: 'Architectural', amount: '$8,920', status: 'Pending', date: '2026-06-07', step: 2 },
    { id: 'EST-003', project: 'Skyline Tower', type: 'Structural', amount: '$24,300', status: 'Draft', date: '2026-06-05', step: 1 },
    { id: 'EST-004', project: 'Harbor Bridge', type: 'Structural', amount: '$18,750', status: 'Approved', date: '2026-06-03', step: 3 },
    { id: 'EST-005', project: 'Green Office Park', type: 'MEP', amount: '$6,800', status: 'Pending', date: '2026-06-01', step: 2 },
  ];

  totalProjects = computed(() => this.recentEstimations.length);
  step3Count = computed(() => this.recentEstimations.filter(e => e.step === 3).length);
  step2Count = computed(() => this.recentEstimations.filter(e => e.step === 2).length);
  step1Count = computed(() => this.recentEstimations.filter(e => e.step === 1).length);

  stageCount(key: string) {
    switch (key) {
      case 'total': return this.totalProjects();
      case 'step3': return this.step3Count();
      case 'step2': return this.step2Count();
      case 'step1': return this.step1Count();
      default: return 0;
    }
  }

  stagePct(key: string) {
    const total = this.totalProjects() || 1;
    switch (key) {
      case 'step3': return (this.step3Count() / total) * 100;
      case 'step2': return (this.step2Count() / total) * 100;
      case 'step1': return (this.step1Count() / total) * 100;
      default: return 100;
    }
  }

  setTab(tab: 'dashboard' | 'portfolio' | 'config') {
    this.calculator.setTab(tab);
    this.router.navigate(['/']);
  }
}
