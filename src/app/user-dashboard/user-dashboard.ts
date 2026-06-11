import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';
import { AppHeader } from '../app-header/app-header';

type ProjectStatus = 'recent' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';

interface UserProject {
  projectName: string;
  buildingType: string;
  email: string;
  requirements: string;
  addons?: string;
  price: number;
  currency: string;
  sft: number;
  status: ProjectStatus;
  source: string;
  orderDate: string;
  expectedEndDate: string;
}

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule, AppHeader],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class UserDashboard {
  calculator = inject(SpatialCostCalculator);
  router = inject(Router);

  constructor() {
    if (!this.calculator.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  projects: UserProject[] = [
    { projectName: 'Bristol Library', buildingType: 'Educational', email: 'engineer@axisxd.com', requirements: 'Architectural, Structural, MEP, RCP, Fire Protection, Plumbing, Furniture, Interior Elevations', addons: 'Acoustic Study, Lighting Design', price: 13500, currency: '$', sft: 10500, status: 'completed', source: 'Scan to BIM', orderDate: '2026-06-10', expectedEndDate: '2026-08-15' },
    { projectName: 'Metro Hospital', buildingType: 'Healthcare', email: 'engineer@axisxd.com', requirements: 'Architectural, Structural, MEP, Fire Protection, Medical Gas', addons: 'BIM Coordination, Clash Detection', price: 28500, currency: '$', sft: 24000, status: 'in-progress', source: 'Scan to BIM', orderDate: '2026-06-08', expectedEndDate: '2026-09-20' },
    { projectName: 'TechHub Office', buildingType: 'Commercial', email: 'engineer@axisxd.com', requirements: 'Architectural, Structural, MEP, Interior Elevations', addons: 'Energy Analysis, VR Walkthrough', price: 22400, currency: '$', sft: 18500, status: 'in-progress', source: 'Scan to BIM', orderDate: '2026-06-05', expectedEndDate: '2026-08-30' },
    { projectName: 'Hillside Manor', buildingType: 'Residential', email: 'engineer@axisxd.com', requirements: 'Architectural, Structural, Plumbing, Furniture', price: 19800, currency: '$', sft: 16000, status: 'on-hold', source: 'Scan to CAD', orderDate: '2026-05-28', expectedEndDate: '2026-07-15' },
    { projectName: 'Oakwood School', buildingType: 'Educational', email: 'engineer@axisxd.com', requirements: 'Architectural, Structural, MEP, Furniture', addons: 'Lighting Design, Sustainability Review', price: 17500, currency: '$', sft: 14500, status: 'recent', source: 'Scan to BIM', orderDate: '2026-06-12', expectedEndDate: '2026-09-01' },
    { projectName: 'Vertex Pavilion', buildingType: 'Commercial', email: 'engineer@axisxd.com', requirements: 'Architectural, Structural, MEP, Fire Protection', addons: 'Structural Steel Detailing', price: 12450, currency: '$', sft: 8500, status: 'completed', source: 'Scan to BIM', orderDate: '2026-05-15', expectedEndDate: '2026-07-20' },
    { projectName: 'Skyline Tower', buildingType: 'Residential', email: 'engineer@axisxd.com', requirements: 'Structural, Mechanical, Electrical', addons: 'Quantity Takeoff, Clash Detection', price: 24300, currency: '$', sft: 18000, status: 'on-hold', source: 'Scan to BIM', orderDate: '2026-05-10', expectedEndDate: '2026-08-05' },
    { projectName: 'Solaris Tower', buildingType: 'Commercial', email: 'engineer@axisxd.com', requirements: 'Architectural, MEP, Electrical, Site Plan', addons: 'LEED Analysis, Solar Study', price: 28400, currency: '$', sft: 22000, status: 'in-progress', source: 'Scan to BIM', orderDate: '2026-06-01', expectedEndDate: '2026-10-10' },
    { projectName: 'Central Transit Hub', buildingType: 'Infrastructure', email: 'engineer@axisxd.com', requirements: 'Structural, MEP, Site Plan, Fire Protection', addons: 'Traffic Simulation, Structural Analysis', price: 42000, currency: '$', sft: 45000, status: 'cancelled', source: 'Scan to BIM', orderDate: '2026-04-20', expectedEndDate: '2026-07-30' },
    { projectName: 'Green Office Park', buildingType: 'Commercial', email: 'engineer@axisxd.com', requirements: 'Architectural, MEP, Floor Plan, RCP', addons: 'Renderings, VR Walkthrough', price: 6800, currency: '$', sft: 4100, status: 'completed', source: 'Scan to BIM', orderDate: '2026-05-05', expectedEndDate: '2026-06-25' },
    { projectName: 'Riverfront Villas', buildingType: 'Residential', email: 'engineer@axisxd.com', requirements: 'Architectural, Structural', price: 9800, currency: '$', sft: 7800, status: 'recent', source: 'Scan to CAD', orderDate: '2026-06-11', expectedEndDate: '2026-08-01' },
    { projectName: 'Pineview Medical', buildingType: 'Healthcare', email: 'engineer@axisxd.com', requirements: 'Architectural, MEP, Mechanical, Electrical', price: 33200, currency: '$', sft: 28000, status: 'recent', source: 'Scan to CAD', orderDate: '2026-06-14', expectedEndDate: '2026-10-05' },
    { projectName: 'Azure Hotel', buildingType: 'Hospitality', email: 'engineer@axisxd.com', requirements: 'Architectural, MEP, Furniture, Interior Elevations', addons: 'Interior Design, Lighting', price: 22100, currency: '$', sft: 19000, status: 'completed', source: 'Scan to BIM', orderDate: '2026-04-28', expectedEndDate: '2026-07-10' },
    { projectName: 'Eagle Ridge', buildingType: 'Multifamily', email: 'engineer@axisxd.com', requirements: 'Structural, Architectural, Plumbing, Electrical', addons: 'Landscape Design, Lighting', price: 27600, currency: '$', sft: 24000, status: 'in-progress', source: 'Scan to BIM', orderDate: '2026-06-03', expectedEndDate: '2026-09-15' },
    { projectName: 'Greenfield Warehouse', buildingType: 'Industrial', email: 'engineer@axisxd.com', requirements: 'Architectural, Structural', price: 14300, currency: '$', sft: 30000, status: 'on-hold', source: 'Scan to CAD', orderDate: '2026-05-20', expectedEndDate: '2026-08-10' },
  ];

  currentUserEmail = computed(() => this.calculator.currentUser()?.email || '');

  userProjects = computed(() => {
    const email = this.currentUserEmail();
    return email ? this.projects.filter(p => p.email === email) : [];
  });

  totalProjects = computed(() => this.filteredProjects().length);
  activeProjects = computed(() => this.filteredProjects().filter(p => p.status === 'in-progress' || p.status === 'recent').length);
  completedProjects = computed(() => this.filteredProjects().filter(p => p.status === 'completed').length);
  onHoldProjects = computed(() => this.filteredProjects().filter(p => p.status === 'on-hold').length);
  totalSft = computed(() => this.filteredProjects().reduce((sum, p) => sum + p.sft, 0));
  totalValue = computed(() => this.filteredProjects().reduce((sum, p) => sum + p.price, 0));

  searchQuery = signal('');
  statusFilter = signal<ProjectStatus | 'all'>('all');
  buildingTypeFilter = signal<string>('all');

  currentPage = signal(1);
  pageSize = 5;

  selectedProject = signal<UserProject | null>(null);

  buildingTypes = computed(() => {
    const types = new Set(this.userProjects().map(p => p.buildingType));
    return ['all', ...Array.from(types)];
  });

  statuses: { key: ProjectStatus | 'all'; label: string; color: string }[] = [
    { key: 'all', label: 'All', color: '#818cf8' },
    { key: 'recent', label: 'Recent', color: '#60a5fa' },
    { key: 'in-progress', label: 'In Progress', color: '#fbbf24' },
    { key: 'on-hold', label: 'On Hold', color: '#94a3b8' },
    { key: 'completed', label: 'Completed', color: '#34d399' },
    { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
  ];

  filteredProjects = computed(() => {
    let list = [...this.userProjects()];

    if (this.statusFilter() !== 'all') {
      list = list.filter(p => p.status === this.statusFilter());
    }

    if (this.buildingTypeFilter() !== 'all') {
      list = list.filter(p => p.buildingType === this.buildingTypeFilter());
    }

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(p => p.projectName.toLowerCase().includes(q));
    }

    list.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    return list;
  });

  paginatedProjects = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredProjects().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.filteredProjects().length / this.pageSize));

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  setStatusFilter(status: ProjectStatus | 'all') {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  setBuildingTypeFilter(type: string) {
    this.buildingTypeFilter.set(type);
    this.currentPage.set(1);
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  selectProject(project: UserProject) {
    this.selectedProject.set(project);
  }

  closeDetail() {
    this.selectedProject.set(null);
  }

  orderNewProject() {
    this.router.navigate(['/']);
    this.calculator.setTab('config');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'recent': return '#60a5fa';
      case 'in-progress': return '#fbbf24';
      case 'on-hold': return '#94a3b8';
      case 'completed': return '#34d399';
      case 'cancelled': return '#ef4444';
      default: return '#94a3b8';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'recent': return 'Recent';
      case 'in-progress': return 'In Progress';
      case 'on-hold': return 'On Hold';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }
}
