import { Component, inject, computed, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeader } from '../app-header/app-header';
import { SpatialCostCalculator, UserProject } from '../services/spatial-cost-calculator';

type ProjectStatus = | 'all' | 'yet-to-award' | 'in-progress' | 'under-revision' | 'completed';

interface Milestone { title: string; date: string; status: 'completed' | 'current' | 'upcoming' }

interface Ticket {
  id: number;
  projectName: string;
  projectId?: number;
  userId?: number;
  raisedByUsername?: string;
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


  filterUser = signal<number | null>(null);
  allUsers = computed(() => this.calculator.allUsers());
  isAdmin = computed(() => this.calculator.currentUser()?.role === 'admin');
  selectedUserName = computed(() => {
    const id = this.filterUser();
    if (!id) return null;
    return this.allUsers().find(u => u.id === id)?.username ?? null;
  });

  projects = computed(() => this.calculator.userProjects());

  constructor() {
    afterNextRender(() => {
      if (this.isAdmin()) {
        this.calculator.userProjects.set([]);
        this.calculator.loadAllUsers();
      }
    });
  }

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

  onUserSelect(value: string) {
    const id = value ? Number(value) : null;
    this.filterUser.set(id);
    if (id) {
      this.calculator.loadProjectsForUser(id);
    } else {
      this.calculator.userProjects.set([]);
    }
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

  detailProject = signal<UserProject | null>(null);
  isDescExpanded = signal(false);

  openDetail(project: UserProject) {
    this.detailProject.set(project);
    this.isDescExpanded.set(false);
    // Load tickets from database for this project
    this.loadTicketsForProject(project);
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

  /** Load tickets from the database for the given project */
  private async loadTicketsForProject(project: UserProject) {
    try {
      let result: { tickets: unknown[]; count: number };

      // Prefer fetching by project_id (works for all authenticated users)
      if (project.id) {
        result = await this.calculator.apiGetProjectTickets(project.id);
      } else {
        // Fallback: fetch current user's own tickets and filter by project name
        result = await this.calculator.apiGetMyTickets();
      }

      if (result.tickets && result.tickets.length > 0) {
        const mapped = (result.tickets as any[])
          .filter((t: any) =>
            project.id
              ? Number(t.project_id) === project.id
              : t.project_name === project.projectName
          )
          .map((t: any) => ({
            id: t.id as number,
            projectName: t.project_name as string,
            projectId: t.project_id as number,
            userId: t.user_id as number,
            raisedByUsername: t.raised_by_username as string || undefined,
            url: t.ticket_urls as string || '',
            comments: t.ticket_comments as string || '',
            createdAt: t.created_at as string,
          })) as Ticket[];
        this.tickets.update(map => ({
          ...map,
          [project.projectName]: mapped,
        }));
      }
    } catch {
      // Silently fall back to local tickets
    }
  }

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

  async submitTicket() {
    const p = this.ticketProject();
    if (!p) return;
    const url = this.ticketUrl();
    const comments = this.ticketComments();
    const userId = this.calculator.dbUserId();

    const ticket: Ticket = {
      id: Date.now(),
      projectName: p.projectName,
      userId: userId || undefined,
      url,
      comments,
      createdAt: new Date().toISOString(),
    };

    // Save to local state immediately
    this.tickets.update(map => ({
      ...map,
      [p.projectName]: [...(map[p.projectName] || []), ticket],
    }));

    // Persist to database via API
    if (userId) {
      try {
        const currentUser = this.calculator.currentUser();
        await this.calculator.apiCreateTicket({
          project_id: p.id || null,
          project_name: p.projectName,
          ticket_urls: url || null,
          ticket_comments: comments || null,
          raised_by_username: currentUser?.name || currentUser?.email?.split('@')[0] || 'Unknown',
        });
      } catch (err) {
        console.warn('[Tickets] Failed to persist ticket to database:', err);
      }
    }

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
    { value: '2,840', label: 'Schedule', icon: 'schedule', color: '#a78bfa' },
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
