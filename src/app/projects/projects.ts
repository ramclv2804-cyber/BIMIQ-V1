import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeader } from '../app-header/app-header';
import { SpatialCostCalculator, UserProject } from '../services/spatial-cost-calculator';

type ProjectStatus = | 'all' | 'yet-to-award' | 'in-progress' | 'under-revision' | 'completed';

interface Milestone { title: string; date: string; status: 'completed' | 'current' | 'upcoming' }

interface Ticket {
  id: number;
  projectName: string;
  url: string;
  comments: string;
  createdAt: string;
}

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
    { key: 'yet-to-award', label: 'Yet to Award', color: '#f59e0b' },
    { key: 'in-progress', label: 'In Progress', color: '#3b82f6' },
    { key: 'under-revision', label: 'Under Revision', color: '#a855f7' },
    { key: 'completed', label: 'Completed', color: '#22c55e' },
  ];

  lodScaleOptions = [
    { value: 'LOD 200', label: 'LOD 200' },
    { value: 'LOD 300', label: 'LOD 300' },
    { value: 'LOD 400', label: 'LOD 400' },
    { value: '1/4" - 1\'0"', label: 'Scale 1/4' },
    { value: '1/8" - 1\'0"', label: 'Scale 1/8' },
    { value: '1/2" - 1\'0"', label: 'Scale 1/2' },
  ];


  projects = computed(() => this.calculator.userProjects());

  totalCost = computed(() => this.projects().reduce((s, p) => s + p.cost, 0));
  totalSft = computed(() => this.projects().reduce((s, p) => s + p.sft, 0));
  totalCount = computed(() => this.projects().length);
  scanToBimCount = computed(() => this.projects().filter(p => p.scope === 'Scan to BIM').length);
  scanToCadCount = computed(() => this.projects().filter(p => p.scope === 'Scan to CAD').length);
  lod200Count = computed(() => this.projects().filter(p => p.lod === 'LOD 200').length);
  lod300Count = computed(() => this.projects().filter(p => p.lod === 'LOD 300').length);
  lod400Count = computed(() => this.projects().filter(p => p.lod === 'LOD 400').length);
  scaleQuarterCount = computed(() => this.projects().filter(p => p.scale === '1/4" - 1\'0"').length);
  scaleEighthCount = computed(() => this.projects().filter(p => p.scale === '1/8" - 1\'0"').length);
  scaleHalfCount = computed(() => this.projects().filter(p => p.scale === '1/2" - 1\'0"').length);
  yetToAwardCount = computed(() => this.projects().filter(p => p.workflowStatus?.toLowerCase() === 'yet to award').length);
  inProgressCount = computed(() => this.projects().filter(p => p.workflowStatus?.toLowerCase() === 'in progress').length);
  underRevisionCount = computed(() => this.projects().filter(p => p.workflowStatus?.toLowerCase() === 'under revision').length);
  completeCount = computed(() => this.projects().filter(p => p.workflowStatus?.toLowerCase() === 'completed').length);
  yetToInvoiceCount = computed(() => this.projects().filter(p => p.billing?.toLowerCase() === 'yet to invoice').length);
  invoicedCount = computed(() => this.projects().filter(p => p.billing?.toLowerCase() === 'invoiced').length);
  yetToPayCount = computed(() => this.projects().filter(p => p.payment?.toLowerCase() === 'yet to pay').length);
  paidCount = computed(() => this.projects().filter(p => p.payment?.toLowerCase() === 'paid').length);

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
    return this.projects().filter(p => {
      if (scope !== 'all' && p.scope !== scope) return false;
      if (lod !== 'all' && p.lod !== lod && p.scale !== lod) return false;
      if (pStatus !== 'all' && p.workflowStatus.toLowerCase() !== pStatus.toLowerCase()) return false;
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
    const colorMap: Record<string, string> = {
      'Yet to Award': '#f59e0b',
      'In Progress': '#3b82f6',
      'Under Revision': '#a855f7',
      'Completed': '#22c55e',
    };
    return colorMap[status] || '#94a3b8';
  }
  // getStatusLabel(status: string): string {
  //   const m = this.statusFilters.find(s => s.key === status);
  //   return m ? m.label : status;
  // }

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

  ticketProject = signal<UserProject | null>(null);
  ticketComments = signal('');
  ticketUrl = signal('');

  tickets = signal<Record<string, Ticket[]>>({});

  projectTickets = computed(() => {
    const p = this.detailProject();
    if (!p) return [];
    return [...(this.tickets()[p.projectName] || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  openTicket(project: UserProject) {
    this.ticketProject.set(project);
    this.ticketComments.set('');
    this.ticketUrl.set('');
  }

  closeTicket() {
    this.ticketProject.set(null);
  }

  onTicketUrlChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.ticketUrl.set(input.value);
  }

  submitTicket() {
    const p = this.ticketProject();
    if (!p) return;
    const url = this.ticketUrl();
    const ticket: Ticket = {
      id: Date.now(),
      projectName: p.projectName,
      url,
      comments: this.ticketComments(),
      createdAt: new Date().toISOString(),
    };
    this.tickets.update(map => ({
      ...map,
      [p.projectName]: [...(map[p.projectName] || []), ticket],
    }));
    this.closeTicket();
  }

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
