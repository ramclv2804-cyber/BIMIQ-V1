import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';
import { AppHeader } from '../app-header/app-header';

type OrderStatus = 'all' | 'recent' | 'ongoing' | 'rejected' | 'hold' | 'completed';

interface OrderEstimation {
  projectName: string;
  buildingType: string;
  email: string;
  requirements: string;
  price: number;
  currency: string;
  sft: number;
  status: OrderStatus;
  source: string;
  addons?: string;
  date: string;
}

@Component({
  selector: 'app-estimation-dashboard',
  imports: [CommonModule, AppHeader],
  templateUrl: './estimation-dashboard.html',
  styleUrls: ['./estimation-dashboard.css'],
})
export class EstimationDashboard {
  calculator = inject(SpatialCostCalculator);
  protected router = inject(Router);

  statusMeta: { key: OrderStatus; label: string; icon: string; color: string }[] = [
    { key: 'recent', label: 'Recent Order', icon: 'fiber_new', color: '#7aadf0' },
    { key: 'all', label: 'All Orders', icon: 'list_alt', color: '#8a92e8' },
    { key: 'ongoing', label: 'Order Ongoing', icon: 'sync', color: '#e8b438' },
    { key: 'hold', label: 'Project Hold', icon: 'pause_circle', color: '#9aa6b4' },
    { key: 'completed', label: 'Completed', icon: 'check_circle', color: '#50c48e' },
    { key: 'rejected', label: 'Order Rejected', icon: 'cancel', color: '#d65454' },
  ];

  orders: OrderEstimation[] = [
    { projectName: 'Bristol Library', buildingType: 'Educational', email: 'sara@civicbuilds.org', requirements: 'Architectural, Structural, MEP, RCP, Fire Protection, Plumbing, Furniture, Interior Elevations', price: 13500, currency: '$', sft: 10500, status: 'recent', source: 'Scan to BIM', addons: 'Acoustic Study, Lighting Design', date: '2026-04-22' },
    { projectName: 'Hillside Manor', buildingType: 'Residential', email: 'tom@estatearch.io', requirements: 'Architectural, Structural, Plumbing, Furniture', price: 19800, currency: '$', sft: 16000, status: 'hold', source: 'Scan to CAD', date: '2026-04-20' },
    { projectName: 'Metro Hospital', buildingType: 'Healthcare', email: 'admin@healthdesign.com', requirements: 'Architectural, Structural, MEP, Fire Protection, Medical Gas', price: 28500, currency: '$', sft: 24000, status: 'recent', source: 'Scan to BIM', addons: 'BIM Coordination, Clash Detection', date: '2026-04-18' },
    { projectName: 'Sunrise Apartments', buildingType: 'Residential', email: 'contact@urbanliving.io', requirements: 'Architectural, Structural, Plumbing', price: 11200, currency: '$', sft: 9200, status: 'recent', source: 'Scan to CAD', date: '2026-04-16' },
    { projectName: 'Oakwood School', buildingType: 'Educational', email: 'projects@learnspace.org', requirements: 'Architectural, Structural, MEP, Furniture', price: 17500, currency: '$', sft: 14500, status: 'hold', source: 'Scan to BIM', addons: 'Lighting Design, Sustainability Review', date: '2026-04-14' },
    { projectName: 'Riverfront Villas', buildingType: 'Residential', email: 'sales@riverhomes.com', requirements: 'Architectural, Structural', price: 9800, currency: '$', sft: 7800, status: 'recent', source: 'Scan to CAD', date: '2026-04-12' },
    { projectName: 'TechHub Office', buildingType: 'Commercial', email: 'pm@techhub.co', requirements: 'Architectural, Structural, MEP, Interior Elevations', price: 22400, currency: '$', sft: 18500, status: 'recent', source: 'Scan to BIM', addons: 'Energy Analysis, VR Walkthrough', date: '2026-04-10' },
    { projectName: 'Greenfield Warehouse', buildingType: 'Industrial', email: 'ops@greenlogistics.net', requirements: 'Architectural, Structural', price: 14300, currency: '$', sft: 30000, status: 'hold', source: 'Scan to CAD', date: '2026-04-08' },
    { projectName: 'Vertex Pavilion', buildingType: 'Commercial', email: 'alice@construct.com', requirements: 'Architectural, Structural, MEP, Fire Protection', price: 12450, currency: '$', sft: 8500, status: 'completed', source: 'Scan to BIM', addons: 'Structural Steel Detailing', date: '2026-06-08' },
    { projectName: 'Crystal Atrium', buildingType: 'Retail', email: 'bob@buildcorp.io', requirements: 'Architectural, MEP, Furniture', price: 8920, currency: '$', sft: 5200, status: 'ongoing', source: 'Scan to CAD', date: '2026-06-07' },
    { projectName: 'Skyline Tower', buildingType: 'Residential', email: 'carol@archxl.com', requirements: 'Structural, Mechanical, Electrical', price: 24300, currency: '$', sft: 18000, status: 'hold', source: 'Scan to BIM', addons: 'Quantity Takeoff, Clash Detection', date: '2026-06-05' },
    { projectName: 'Harbor Bridge', buildingType: 'Infrastructure', email: 'dan@civiceng.net', requirements: 'Structural, Site Plan, Plumbing', price: 18750, currency: '$', sft: 22500, status: 'completed', source: 'Scan to CAD', date: '2026-06-03' },
    { projectName: 'Green Office Park', buildingType: 'Commercial', email: 'eve@ecospace.org', requirements: 'Architectural, MEP, Floor Plan, RCP', price: 6800, currency: '$', sft: 4100, status: 'ongoing', source: 'Scan to BIM', addons: 'Renderings, VR Walkthrough', date: '2026-06-01' },
    { projectName: 'Riverfront Complex', buildingType: 'Multifamily', email: 'frank@habitat.dev', requirements: 'Structural, Architectural, Plumbing', price: 31200, currency: '$', sft: 35000, status: 'rejected', source: 'Scan to CAD', date: '2026-05-28' },
    { projectName: 'Solaris Tower', buildingType: 'Commercial', email: 'iris@solenergy.io', requirements: 'Architectural, MEP, Electrical, Site Plan', price: 28400, currency: '$', sft: 22000, status: 'ongoing', source: 'Scan to BIM', addons: 'LEED Analysis, Solar Study', date: '2026-05-20' },
    { projectName: 'Central Transit Hub', buildingType: 'Infrastructure', email: 'kate@transitworks.org', requirements: 'Structural, MEP, Site Plan, Fire Protection', price: 42000, currency: '$', sft: 45000, status: 'ongoing', source: 'Scan to BIM', addons: 'Traffic Simulation, Structural Analysis', date: '2026-05-15' },
    { projectName: 'Pineview Medical', buildingType: 'Healthcare', email: 'leo@medfacility.com', requirements: 'Architectural, MEP, Mechanical, Electrical', price: 33200, currency: '$', sft: 28000, status: 'recent', source: 'Scan to CAD', date: '2026-05-12' },
    { projectName: 'Azure Hotel', buildingType: 'Hospitality', email: 'mia@hospitality.group', requirements: 'Architectural, MEP, Furniture, Interior Elevations', price: 22100, currency: '$', sft: 19000, status: 'completed', source: 'Scan to BIM', addons: 'Interior Design, Lighting', date: '2026-05-10' },
    { projectName: 'Maple Elementary', buildingType: 'Educational', email: 'noah@schooldesign.edu', requirements: 'Architectural, Structural, MEP, Floor Plan', price: 11800, currency: '$', sft: 9500, status: 'rejected', source: 'Scan to CAD', date: '2026-05-08' },
    { projectName: 'Eagle Ridge', buildingType: 'Multifamily', email: 'peter@ridge.dev', requirements: 'Structural, Architectural, Plumbing, Electrical', price: 27600, currency: '$', sft: 24000, status: 'recent', source: 'Scan to BIM', addons: 'Landscape Design, Lighting', date: '2026-05-02' },
  ];

  totalCount = computed(() => this.orders.length);
  recentCount = computed(() => this.orders.filter(o => o.status === 'recent').length);
  ongoingCount = computed(() => this.orders.filter(o => o.status === 'ongoing').length);
  rejectedCount = computed(() => this.orders.filter(o => o.status === 'rejected').length);
  holdCount = computed(() => this.orders.filter(o => o.status === 'hold').length);
  completedCount = computed(() => this.orders.filter(o => o.status === 'completed').length);

  filterStatus = signal<OrderStatus>('recent');

  filteredOrders = computed(() => {
    const f = this.filterStatus();
    if (f === 'all') return this.orders;
    return this.orders.filter(o => o.status === f);
  });

  pct(val: number) {
    const total = this.totalCount() || 1;
    return (val / total) * 100;
  }

  setFilter(status: OrderStatus) {
    this.filterStatus.set(status);
  }

  countFor(status: OrderStatus): number {
    if (status === 'all') return this.totalCount();
    return this.orders.filter(o => o.status === status).length;
  }

  getStatusColor(status: string): string {
    const m = this.statusMeta.find(s => s.key === status);
    return m ? m.color : '#94a3b8';
  }

  getStatusLabel(status: string): string {
    const m = this.statusMeta.find(s => s.key === status);
    return m ? m.label : status;
  }

  getSourceLabel(source: string): string {
    return source;
  }

  goToTab(tab: string) {
    this.calculator.setTab(tab as 'dashboard' | 'portfolio' | 'config');
    this.router.navigate(['/']);
  }
}
