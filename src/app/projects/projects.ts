import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeader } from '../app-header/app-header';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';

type ProjectStatus = 'all' | 'active' | 'ongoing' | 'review' | 'completed' | 'on-hold';

interface UserProject {
  projectName: string;
  buildingType: string;
  description: string;
  requirements: string;
  cost: number;
  currency: string;
  sft: number;
  status: ProjectStatus;
  source: string;
  lod: string;
  workflowStatus: string;
  billing: string;
  payment: string;
  endDate: string;
  startDate: string;
  category: string;
}

interface Milestone { title: string; date: string; status: 'completed' | 'current' | 'upcoming' }

@Component({
  selector: 'app-projects',
  imports: [CommonModule, AppHeader],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css', './projects-detail.css'],
})
export class Projects {
  calculator = inject(SpatialCostCalculator);

  statusFilters: { key: ProjectStatus; label: string; color: string }[] = [
    { key: 'all', label: 'All Projects', color: '#8a92e8' },
    { key: 'active', label: 'Active', color: '#668dc1' },
    { key: 'ongoing', label: 'Ongoing', color: '#b59954' },
    { key: 'review', label: 'Review', color: '#a78bfa' },
    { key: 'completed', label: 'Completed', color: '#50c48e' },
    { key: 'on-hold', label: 'On Hold', color: '#9aa6b4' },
  ];

  projects: UserProject[] = [
    { projectName: 'Crystal Atrium', buildingType: 'Commercial', description: 'Bespoke faceted steel workspace with parametric light ventilation integration.', requirements: 'Architectural, Structural, MEP, RCP, Fire Protection', cost: 12450, currency: '$', sft: 8500, status: 'active', source: 'Scan to BIM', lod: 'LOD 300', workflowStatus: 'In Progress', billing: 'Invoiced', payment: 'Yet to Pay', endDate: '2026-09-15', startDate: '2026-03-01', category: 'ARCHITECTURAL' },
    { projectName: 'Skyline Tower', buildingType: 'Residential', description: 'High-rise residential tower with mixed-use podium and underground parking.', requirements: 'Structural, Mechanical, Electrical, Plumbing', cost: 24300, currency: '$', sft: 18000, status: 'ongoing', source: 'Scan to BIM', lod: 'LOD 400', workflowStatus: 'Under Revision', billing: 'Yet to Invoice', payment: 'Yet to Pay', endDate: '2026-11-30', startDate: '2026-04-10', category: 'STRUCTURAL' },
    { projectName: 'Harbor Bridge', buildingType: 'Infrastructure', description: 'Cable-stayed bridge connecting waterfront districts.', requirements: 'Structural, Site Plan, Geotechnical', cost: 18750, currency: '$', sft: 22500, status: 'review', source: 'Scan to CAD', lod: 'LOD 200', workflowStatus: 'Yet to Award', billing: 'Yet to Invoice', payment: 'Yet to Pay', endDate: '2026-08-20', startDate: '2026-02-15', category: 'STRUCTURAL' },
    { projectName: 'Green Office Park', buildingType: 'Commercial', description: 'Sustainable office campus with net-zero energy design.', requirements: 'Architectural, MEP, Floor Plan, RCP', cost: 6800, currency: '$', sft: 4100, status: 'completed', source: 'Scan to BIM', lod: 'LOD 300', workflowStatus: 'Complete', billing: 'Invoiced', payment: 'Paid', endDate: '2026-05-01', startDate: '2025-11-10', category: 'ARCHITECTURAL' },
    { projectName: 'Riverfront Complex', buildingType: 'Multifamily', description: 'Mixed-use residential complex with retail spaces.', requirements: 'Structural, Architectural, Plumbing, Electrical', cost: 31200, currency: '$', sft: 35000, status: 'on-hold', source: 'Scan to CAD', lod: 'LOD 200', workflowStatus: 'Yet to Award', billing: 'Yet to Invoice', payment: 'Yet to Pay', endDate: '2027-03-15', startDate: '2026-01-20', category: 'MEP' },
    { projectName: 'Solaris Tower', buildingType: 'Commercial', description: 'Solar-powered commercial tower with smart building systems.', requirements: 'Architectural, MEP, Electrical, Site Plan', cost: 28400, currency: '$', sft: 22000, status: 'ongoing', source: 'Scan to BIM', lod: 'LOD 400', workflowStatus: 'In Progress', billing: 'Invoiced', payment: 'Paid', endDate: '2026-12-01', startDate: '2026-03-15', category: 'MEP' },
    { projectName: 'Central Transit Hub', buildingType: 'Infrastructure', description: 'Multi-modal transit hub connecting rail and bus networks.', requirements: 'Structural, MEP, Site Plan, Fire Protection', cost: 42000, currency: '$', sft: 45000, status: 'active', source: 'Scan to BIM', lod: 'LOD 300', workflowStatus: 'In Progress', billing: 'Yet to Invoice', payment: 'Yet to Pay', endDate: '2027-06-30', startDate: '2026-05-01', category: 'STRUCTURAL' },
    { projectName: 'Pineview Medical', buildingType: 'Healthcare', description: 'Regional medical center with surgical suites.', requirements: 'Architectural, MEP, Mechanical, Electrical', cost: 33200, currency: '$', sft: 28000, status: 'review', source: 'Scan to CAD', lod: 'LOD 300', workflowStatus: 'Under Revision', billing: 'Invoiced', payment: 'Paid', endDate: '2026-10-15', startDate: '2026-02-01', category: 'MEP' },
    { projectName: 'Azure Hotel', buildingType: 'Hospitality', description: 'Boutique waterfront hotel with rooftop lounge.', requirements: 'Architectural, MEP, Furniture, Interior Elevations', cost: 22100, currency: '$', sft: 19000, status: 'completed', source: 'Scan to BIM', lod: 'LOD 400', workflowStatus: 'Complete', billing: 'Invoiced', payment: 'Paid', endDate: '2026-04-20', startDate: '2025-08-10', category: 'ARCHITECTURAL' },
    { projectName: 'Eagle Ridge', buildingType: 'Multifamily', description: 'Luxury hillside condominium complex with panoramic views.', requirements: 'Structural, Architectural, Plumbing, Electrical', cost: 27600, currency: '$', sft: 24000, status: 'active', source: 'Scan to BIM', lod: 'LOD 300', workflowStatus: 'In Progress', billing: 'Yet to Invoice', payment: 'Yet to Pay', endDate: '2027-01-15', startDate: '2026-04-01', category: 'STRUCTURAL' },
  ];

  totalCost = computed(() => this.projects.reduce((s, p) => s + p.cost, 0));
  totalSft = computed(() => this.projects.reduce((s, p) => s + p.sft, 0));
  totalCount = computed(() => this.projects.length);
  scanToBimCount = computed(() => this.projects.filter(p => p.source === 'Scan to BIM').length);
  scanToCadCount = computed(() => this.projects.filter(p => p.source === 'Scan to CAD').length);
  lod200Count = computed(() => this.projects.filter(p => p.lod === 'LOD 200').length);
  lod300Count = computed(() => this.projects.filter(p => p.lod === 'LOD 300').length);
  lod400Count = computed(() => this.projects.filter(p => p.lod === 'LOD 400').length);
  yetToAwardCount = computed(() => this.projects.filter(p => p.workflowStatus === 'Yet to Award').length);
  inProgressCount = computed(() => this.projects.filter(p => p.workflowStatus === 'In Progress').length);
  underRevisionCount = computed(() => this.projects.filter(p => p.workflowStatus === 'Under Revision').length);
  completeCount = computed(() => this.projects.filter(p => p.workflowStatus === 'Complete').length);
  yetToInvoiceCount = computed(() => this.projects.filter(p => p.billing === 'Yet to Invoice').length);
  invoicedCount = computed(() => this.projects.filter(p => p.billing === 'Invoiced').length);
  yetToPayCount = computed(() => this.projects.filter(p => p.payment === 'Yet to Pay').length);
  paidCount = computed(() => this.projects.filter(p => p.payment === 'Paid').length);

  filterScope = signal<string>('all');
  filterLod = signal<string>('all');
  filterProjStatus = signal<string>('all');
  filterBilling = signal<string>('all');
  filterPayment = signal<string>('all');
  animKey = signal(0);

  filteredProjects = computed(() => {
    const scope = this.filterScope();
    const lod = this.filterLod();
    const pStatus = this.filterProjStatus();
    const billing = this.filterBilling();
    const payment = this.filterPayment();
    return this.projects.filter(p => {
      if (scope !== 'all' && p.source !== scope) return false;
      if (lod !== 'all' && p.lod !== lod) return false;
      if (pStatus !== 'all' && p.workflowStatus !== pStatus) return false;
      if (billing !== 'all' && p.billing !== billing) return false;
      if (payment !== 'all' && p.payment !== payment) return false;
      return true;
    });
  });

  resetAllFilters() {
    this.filterScope.set('all');
    this.filterLod.set('all');
    this.filterProjStatus.set('all');
    this.filterBilling.set('all');
    this.filterPayment.set('all');
  }

  trackCard = (_i: number, p: UserProject) => p.projectName + this.animKey();
  getStatusColor(status: string): string {
    const m = this.statusFilters.find(s => s.key === status);
    return m ? m.color : '#94a3b8';
  }
  getStatusLabel(status: string): string {
    const m = this.statusFilters.find(s => s.key === status);
    return m ? m.label : status;
  }

  detailProject = signal<UserProject | null>(null);
  isDescExpanded = signal(false);

  openDetail(project: UserProject) {
    this.detailProject.set(project);
    this.isDescExpanded.set(false);
  }
  closeDetail() {
    this.detailProject.set(null);
  }
  toggleDesc() { this.isDescExpanded.update(v => !v); }

  overviewCards = [
    { label: 'Start Date', icon: 'calendar_today', color: '#668dc1' },
    { label: 'Due Date', icon: 'event', color: '#b59954' },
    { label: 'Team Size', icon: 'group', color: '#50c48e' },
    { label: 'Health', icon: 'monitoring', color: '#a78bfa' },
  ];

  statCards = [
    { value: '142', label: 'Total Tasks', icon: 'assignment', color: '#668dc1' },
    { value: '36', label: 'Files', icon: 'folder', color: '#50c48e' },
    { value: '12', label: 'Issues', icon: 'bug_report', color: '#b59954' },
    { value: '2,840', label: 'Hours', icon: 'schedule', color: '#a78bfa' },
  ];

  milestones: Milestone[] = [
    { title: 'Design & Planning', date: 'Mar 15, 2026', status: 'completed' },
    { title: 'Structural Engineering', date: 'Apr 30, 2026', status: 'completed' },
    { title: 'Foundation & Core', date: 'Jun 10, 2026', status: 'completed' },
    { title: 'Facade Installation', date: 'Jul 25, 2026', status: 'current' },
    { title: 'MEP Systems', date: 'Aug 30, 2026', status: 'upcoming' },
    { title: 'Interior Finishing', date: 'Sep 10, 2026', status: 'upcoming' },
  ];
}
