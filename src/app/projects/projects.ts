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
  endDate: string;
  startDate: string;
  category: string;
}

interface TeamMember { name: string; role: string; initials: string }
interface Milestone { title: string; date: string; status: 'completed' | 'current' | 'upcoming' }
interface Activity { user: string; initials: string; action: string; detail: string; type: 'upload' | 'task' | 'comment' | 'milestone'; timestamp: string }

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
    { key: 'active', label: 'Active', color: '#7aadf0' },
    { key: 'ongoing', label: 'Ongoing', color: '#e8b438' },
    { key: 'review', label: 'Review', color: '#a78bfa' },
    { key: 'completed', label: 'Completed', color: '#50c48e' },
    { key: 'on-hold', label: 'On Hold', color: '#9aa6b4' },
  ];

  projects: UserProject[] = [
    { projectName: 'Crystal Atrium', buildingType: 'Commercial', description: 'Bespoke faceted steel workspace with parametric light ventilation integration.', requirements: 'Architectural, Structural, MEP, RCP, Fire Protection', cost: 12450, currency: '$', sft: 8500, status: 'active', source: 'Scan to BIM', endDate: '2026-09-15', startDate: '2026-03-01', category: 'ARCHITECTURAL' },
    { projectName: 'Skyline Tower', buildingType: 'Residential', description: 'High-rise residential tower with mixed-use podium and underground parking.', requirements: 'Structural, Mechanical, Electrical, Plumbing', cost: 24300, currency: '$', sft: 18000, status: 'ongoing', source: 'Scan to BIM', endDate: '2026-11-30', startDate: '2026-04-10', category: 'STRUCTURAL' },
    { projectName: 'Harbor Bridge', buildingType: 'Infrastructure', description: 'Cable-stayed bridge connecting waterfront districts.', requirements: 'Structural, Site Plan, Geotechnical', cost: 18750, currency: '$', sft: 22500, status: 'review', source: 'Scan to CAD', endDate: '2026-08-20', startDate: '2026-02-15', category: 'STRUCTURAL' },
    { projectName: 'Green Office Park', buildingType: 'Commercial', description: 'Sustainable office campus with net-zero energy design.', requirements: 'Architectural, MEP, Floor Plan, RCP', cost: 6800, currency: '$', sft: 4100, status: 'completed', source: 'Scan to BIM', endDate: '2026-05-01', startDate: '2025-11-10', category: 'ARCHITECTURAL' },
    { projectName: 'Riverfront Complex', buildingType: 'Multifamily', description: 'Mixed-use residential complex with retail spaces.', requirements: 'Structural, Architectural, Plumbing, Electrical', cost: 31200, currency: '$', sft: 35000, status: 'on-hold', source: 'Scan to CAD', endDate: '2027-03-15', startDate: '2026-01-20', category: 'MEP' },
    { projectName: 'Solaris Tower', buildingType: 'Commercial', description: 'Solar-powered commercial tower with smart building systems.', requirements: 'Architectural, MEP, Electrical, Site Plan', cost: 28400, currency: '$', sft: 22000, status: 'ongoing', source: 'Scan to BIM', endDate: '2026-12-01', startDate: '2026-03-15', category: 'MEP' },
    { projectName: 'Central Transit Hub', buildingType: 'Infrastructure', description: 'Multi-modal transit hub connecting rail and bus networks.', requirements: 'Structural, MEP, Site Plan, Fire Protection', cost: 42000, currency: '$', sft: 45000, status: 'active', source: 'Scan to BIM', endDate: '2027-06-30', startDate: '2026-05-01', category: 'STRUCTURAL' },
    { projectName: 'Pineview Medical', buildingType: 'Healthcare', description: 'Regional medical center with surgical suites.', requirements: 'Architectural, MEP, Mechanical, Electrical', cost: 33200, currency: '$', sft: 28000, status: 'review', source: 'Scan to CAD', endDate: '2026-10-15', startDate: '2026-02-01', category: 'MEP' },
    { projectName: 'Azure Hotel', buildingType: 'Hospitality', description: 'Boutique waterfront hotel with rooftop lounge.', requirements: 'Architectural, MEP, Furniture, Interior Elevations', cost: 22100, currency: '$', sft: 19000, status: 'completed', source: 'Scan to BIM', endDate: '2026-04-20', startDate: '2025-08-10', category: 'ARCHITECTURAL' },
    { projectName: 'Eagle Ridge', buildingType: 'Multifamily', description: 'Luxury hillside condominium complex with panoramic views.', requirements: 'Structural, Architectural, Plumbing, Electrical', cost: 27600, currency: '$', sft: 24000, status: 'active', source: 'Scan to BIM', endDate: '2027-01-15', startDate: '2026-04-01', category: 'STRUCTURAL' },
  ];

  totalCost = computed(() => this.projects.reduce((s, p) => s + p.cost, 0));
  totalSft = computed(() => this.projects.reduce((s, p) => s + p.sft, 0));
  totalCount = computed(() => this.projects.length);
  activeCount = computed(() => this.projects.filter(p => p.status === 'active').length);
  ongoingCount = computed(() => this.projects.filter(p => p.status === 'ongoing').length);
  reviewCount = computed(() => this.projects.filter(p => p.status === 'review').length);
  completedCount = computed(() => this.projects.filter(p => p.status === 'completed').length);
  holdCount = computed(() => this.projects.filter(p => p.status === 'on-hold').length);

  filterStatus = signal<ProjectStatus>('all');
  animKey = signal(0);

  filteredProjects = computed(() => {
    const f = this.filterStatus();
    return this.projects.filter(p => f === 'all' || p.status === f);
  });

  setFilter(status: ProjectStatus) {
    this.filterStatus.set(status);
    this.animKey.update(v => v + 1);
  }
  trackCard = (_i: number, p: UserProject) => p.projectName + this.animKey();
  countFor(status: ProjectStatus): number {
    if (status === 'all') return this.totalCount();
    return this.projects.filter(p => p.status === status).length;
  }
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
    { label: 'Start Date', icon: 'calendar_today', color: '#7aadf0' },
    { label: 'Due Date', icon: 'event', color: '#e8b438' },
    { label: 'Team Size', icon: 'group', color: '#50c48e' },
    { label: 'Health', icon: 'monitoring', color: '#a78bfa' },
  ];

  statCards = [
    { value: '142', label: 'Total Tasks', icon: 'assignment', color: '#7aadf0' },
    { value: '36', label: 'Files', icon: 'folder', color: '#50c48e' },
    { value: '12', label: 'Issues', icon: 'bug_report', color: '#e8b438' },
    { value: '2,840', label: 'Hours', icon: 'schedule', color: '#a78bfa' },
  ];

  team: TeamMember[] = [
    { name: 'Alex Chen', role: 'Team Lead', initials: 'AC' },
    { name: 'Sarah Kim', role: 'Architect', initials: 'SK' },
    { name: 'James Park', role: 'Engineer', initials: 'JP' },
    { name: 'Emma Liu', role: 'Designer', initials: 'EL' },
    { name: 'Mike Torres', role: 'PM', initials: 'MT' },
    { name: 'Lisa Wang', role: 'Surveyor', initials: 'LW' },
    { name: 'David R.', role: 'MEP Eng.', initials: 'DR' },
    { name: 'Nina K.', role: 'Coordinator', initials: 'NK' },
  ];

  milestones: Milestone[] = [
    { title: 'Design & Planning', date: 'Mar 15, 2026', status: 'completed' },
    { title: 'Structural Engineering', date: 'Apr 30, 2026', status: 'completed' },
    { title: 'Foundation & Core', date: 'Jun 10, 2026', status: 'completed' },
    { title: 'Facade Installation', date: 'Jul 25, 2026', status: 'current' },
    { title: 'MEP Systems', date: 'Aug 30, 2026', status: 'upcoming' },
    { title: 'Interior Finishing', date: 'Sep 10, 2026', status: 'upcoming' },
  ];

  activities: Activity[] = [
    { user: 'Sarah Kim', initials: 'SK', action: 'Uploaded File', detail: 'Structural load calculations for facade phase', type: 'upload', timestamp: '12 min ago' },
    { user: 'James Park', initials: 'JP', action: 'Completed Task', detail: 'Wind load analysis for north elevation', type: 'task', timestamp: '1 hr ago' },
    { user: 'Emma Liu', initials: 'EL', action: 'Added Comment', detail: 'The facade panel alignment needs adjustment per latest scan', type: 'comment', timestamp: '2 hr ago' },
    { user: 'Alex Chen', initials: 'AC', action: 'Milestone Updated', detail: 'Facade Installation phase is now 60% complete', type: 'milestone', timestamp: '4 hr ago' },
    { user: 'Mike Torres', initials: 'MT', action: 'Uploaded File', detail: 'Updated project schedule v3.2', type: 'upload', timestamp: '6 hr ago' },
    { user: 'Lisa Wang', initials: 'LW', action: 'Completed Task', detail: 'Site survey verification for east wing foundation', type: 'task', timestamp: '1 day ago' },
  ];

  getAvatarColor(i: number): string {
    return ['#7aadf0','#e8b438','#50c48e','#a78bfa','#DF80AC','#f472b6','#17dad0','#8a92e8'][i % 8];
  }
  getActivityIcon(type: string): string {
    switch (type) { case 'upload': return 'upload_file'; case 'task': return 'check_circle'; case 'comment': return 'chat_bubble'; case 'milestone': return 'flag'; default: return 'circle'; }
  }
  getActivityColor(type: string): string {
    switch (type) { case 'upload': return '#7aadf0'; case 'task': return '#50c48e'; case 'comment': return '#a78bfa'; case 'milestone': return '#e8b438'; default: return '#94a3b8'; }
  }
}
