import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeader } from '../app-header/app-header';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';

type ProjectStatus = | 'all' | 'yet-to-award' | 'in-progress' | 'under-revision' | 'complete';

// interface UserProject {
//   projectName: string;
//   buildingType: string;
//   description: string;
//   requirements: string;
//   cost: number;
//   currency: string;
//   sft: number;
//   status: ProjectStatus;
//   scope: string;
//   lod: string;
//   workflowStatus: string;
//   billing: string;
//   payment: string;
//   endDate: string;
//   startDate: string;
//   category: string;
// }

export interface UserProject {
  // Project Information
  projectNo: string;
  client: string;
  projectName: string;
  buildingType: string;
  description: string;
  requirements: string;
  scope: string;
  lod: string;
  scale: string;
  addOn: string;
  sft: number;
  proposalSent: string;
  purchaseOrderIssued: string;
  e57IssuedDate: string;
  startDate: string;
  endDate: string;
  expectedClientDeliveryDate: string;
  cost: number;
  currency: string;
  billing: string;
  billingStatus: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceDueDate: string;
  payment: string;
  workflowStatus: string;
  comments: string;
}

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
    { key: 'complete', label: 'Complete', color: '#22c55e' },
  ];

  // projects: UserProject[] = [
  //   { projectName: 'Crystal Atrium', buildingType: 'Commercial', description: 'Bespoke faceted steel workspace with parametric light ventilation integration.', requirements: 'Architectural, Structural, ', cost: 12450, currency: '$', sft: 8500,  scope: 'Scan to BIM', lod: 'LOD 300', workflowStatus: 'In Progress', billing: 'Invoiced', payment: 'Yet to Pay', endDate: '2026-09-15', startDate: '2026-03-01', category: 'ARCHITECTURAL' },
  //   { projectName: 'Skyline Tower', buildingType: 'Residential', description: 'High-rise residential tower with mixed-use podium and underground parking.', requirements: 'Structural, Mechanical, Electrical, Plumbing', cost: 24300, currency: '$', sft: 18000,  scope: 'Scan to BIM', lod: 'LOD 400', workflowStatus: 'Under Revision', billing: 'Yet to Invoice', payment: 'Yet to Pay', endDate: '2026-11-30', startDate: '2026-04-10', category: 'STRUCTURAL' },
  //   { projectName: 'Harbor Bridge', buildingType: 'Infrastructure', description: 'Cable-stayed bridge connecting waterfront districts.', requirements: 'Structural, Site Plan, Geotechnical', cost: 18750, currency: '$', sft: 22500,  scope: 'Scan to CAD', lod: 'LOD 200', workflowStatus: 'Yet to Award', billing: 'Yet to Invoice', payment: 'Yet to Pay', endDate: '2026-08-20', startDate: '2026-02-15', category: 'STRUCTURAL' },
  //   { projectName: 'Green Office Park', buildingType: 'Commercial', description: 'Sustainable office campus with net-zero energy design.', requirements: 'Architectural, MEP, Floor Plan, RCP', cost: 6800, currency: '$', sft: 4100,  scope: 'Scan to BIM', lod: 'LOD 300', workflowStatus: 'Complete', billing: 'Invoiced', payment: 'Paid', endDate: '2026-05-01', startDate: '2025-11-10', category: 'ARCHITECTURAL' },
  //   { projectName: 'Riverfront Complex', buildingType: 'Multifamily', description: 'Mixed-use residential complex with retail spaces.', requirements: 'Structural, Architectural, Plumbing, Electrical', cost: 31200, currency: '$', sft: 35000, status: 'on-hold', scope: 'Scan to CAD', lod: 'LOD 200', workflowStatus: 'Yet to Award', billing: 'Yet to Invoice', payment: 'Yet to Pay', endDate: '2027-03-15', startDate: '2026-01-20', category: 'MEP' },
  //   { projectName: 'Solaris Tower', buildingType: 'Commercial', description: Floor Plan'Solar-powered commercial tower with smart building systems.', requirements: 'Architectural, MEP, Electrical, Site Plan', cost: 28400, currency: '$', sft: 22000,  scope: 'Scan to BIM', lod: 'LOD 400', workflowStatus: 'In Progress', billing: 'Invoiced', payment: 'Paid', endDate: '2026-12-01', startDate: '2026-03-15', category: 'MEP' },
  //   { projectName: 'Central Transit Hub', buildingType: 'Infrastructure', description: 'Multi-modal transit hub connecting rail and bus networks.', requirements: 'Structural, MEP, Site Plan, Fire Protection', cost: 42000, currency: '$', sft: 45000,  scope: 'Scan to BIM', lod: 'LOD 300', workflowStatus: 'In Progress', billing: 'Yet to Invoice', payment: 'Yet to Pay', endDate: '2027-06-30', startDate: '2026-05-01', category: 'STRUCTURAL' },
  //   { projectName: 'Pineview Medical', buildingType: 'Healthcare', description: 'Regional medical center with surgical suites.', requirements: 'Architectural, MEP, Mechanical, Electrical', cost: 33200, currency: '$', sft: 28000,  scope: 'Scan to CAD', lod: 'LOD 300', workflowStatus: 'Under Revision', billing: 'Invoiced', payment: 'Paid', endDate: '2026-10-15', startDate: '2026-02-01', category: 'MEP' },
  //   { projectName: 'Azure Hotel', buildingType: 'Hospitality', description: 'Boutique waterfront hotel with rooftop lounge.', requirements: 'Architectural, MEP, Furniture, Interior Elevations', cost: 22100, currency: '$', sft: 19000,  scope: 'Scan to BIM', lod: 'LOD 400', workflowStatus: 'Complete', billing: 'Invoiced', payment: 'Paid', endDate: '2026-04-20', startDate: '2025-08-10', category: 'ARCHITECTURAL' },
  //   { projectName: 'Eagle Ridge', buildingType: 'Multifamily', description: 'Luxury hillside condominium complex with panoramic views.', requirements: 'Structural, Architectural, Plumbing, Electrical', cost: 27600, currency: '$', sft: 24000,  scope: 'Scan to BIM', lod: 'LOD 300', workflowStatus: 'In Progress', billing: 'Yet to Invoice', payment: 'Yet to Pay', endDate: '2027-01-15', startDate: '2026-04-01', category: 'STRUCTURAL' },
  // ];


  projects: UserProject[] = [
    {
      projectNo: 'PRJ-2026-001',
      client: 'Vertex Developments',
      projectName: 'Crystal Atrium',
      buildingType: 'Commercial',
      description: 'Bespoke faceted steel workspace with parametric light ventilation integration.',
      requirements: 'Architectural, Structural, Mechanical, Electrical',
      cost: 12450,
      currency: '$',
      sft: 8500,
      scope: 'Scan to BIM',
      lod: 'LOD 300',
      scale: '',

      addOn: 'Floor Plan, RCP, Sheets',
      proposalSent: '2026-02-10',
      purchaseOrderIssued: '2026-02-20',
      e57IssuedDate: '2026-02-25',
      startDate: '2026-03-01',
      endDate: '2026-09-15',
      expectedClientDeliveryDate: '2026-09-15',

      workflowStatus: 'In Progress',
      billing: 'Invoiced',
      billingStatus: 'Invoiced',
      invoiceNumber: 'INV-2026-001',
      invoiceDate: '2026-06-01',
      invoiceDueDate: '2026-07-01',
      payment: 'Yet to Pay',
      comments: 'Awaiting final approval from client.'
    },
    {
      projectNo: 'PRJ-2026-002',
      client: 'Skyline Properties',
      projectName: 'Skyline Tower',
      buildingType: 'Residential',
      description: 'High-rise residential tower with mixed-use podium and underground parking.',
      requirements: 'Structural, Mechanical, Electrical, Plumbing',
      cost: 24300,
      currency: '$',
      sft: 18000,
      scope: 'Scan to BIM',
      lod: 'LOD 400',
      scale: '',

      addOn: 'RCP, Internal Elevations, MEP',
      proposalSent: '2026-03-01',
      purchaseOrderIssued: '2026-03-10',
      e57IssuedDate: '2026-03-15',
      startDate: '2026-04-10',
      endDate: '2026-11-30',
      expectedClientDeliveryDate: '2026-11-30',

      workflowStatus: 'Under Revision',
      billing: 'Yet to Invoice',
      billingStatus: 'Yet to Invoice',
      invoiceNumber: '',
      invoiceDate: '',
      invoiceDueDate: '',
      payment: 'Yet to Pay',

      comments: 'Client requested parking revisions.'
    },
    {
      projectNo: 'PRJ-2026-003',
      client: 'Harbor Infrastructure',
      projectName: 'Harbor Bridge',
      buildingType: 'Infrastructure',
      description: 'Cable-stayed bridge connecting waterfront districts.',
      requirements: 'Structural, Site Plan, Sections',
      cost: 18750,
      currency: '$',
      sft: 22500,
      scope: 'Scan to CAD',
      lod: '',
      scale: '1/4" - 1\'0"',

      addOn: 'Site Plan, Sections',
      proposalSent: '2026-01-15',
      purchaseOrderIssued: '',
      e57IssuedDate: '',
      startDate: '2026-02-15',
      endDate: '2026-08-20',
      expectedClientDeliveryDate: '2026-08-20',

      workflowStatus: 'Yet to Award',
      billing: 'Yet to Invoice',
      billingStatus: 'Yet to Invoice',
      invoiceNumber: '',
      invoiceDate: '',
      invoiceDueDate: '',
      payment: 'Yet to Pay',

      comments: 'Proposal pending approval.'
    },
    {
      projectNo: 'PRJ-2026-004',
      client: 'EcoBuild Group',
      projectName: 'Green Office Park',
      buildingType: 'Commercial',
      description: 'Sustainable office campus with net-zero energy design.',
      requirements: 'Architectural, MEP, Floor Plan, RCP',
      cost: 6800,
      currency: '$',
      sft: 4100,
      scope: 'Scan to BIM',
      lod: 'LOD 300',
      scale: '',

      addOn: 'RCP, Sheets',
      proposalSent: '2025-10-01',
      purchaseOrderIssued: '2025-10-15',
      e57IssuedDate: '2025-10-20',
      startDate: '2025-11-10',
      endDate: '2026-05-01',
      expectedClientDeliveryDate: '2026-05-01',

      workflowStatus: 'complete',
      billing: 'Invoiced',
      billingStatus: 'Invoiced',
      invoiceNumber: 'INV-2026-004',
      invoiceDate: '2026-05-02',
      invoiceDueDate: '2026-06-01',
      payment: 'Paid',

      comments: 'Successfully completed.'
    },
    {
      projectNo: 'PRJ-2026-005',
      client: 'Riverfront Holdings',
      projectName: 'Riverfront Complex',
      buildingType: 'Multifamily',
      description: 'Mixed-use residential complex with retail spaces.',
      requirements: 'Floor Plan, RCP, Internal Elevations, MEP',
      cost: 31200,
      currency: '$',
      sft: 35000,
      scope: 'Scan to CAD',
      lod: '',
      scale: '1/8" - 1\'0"',
      addOn: 'Floor Plan, Furniture',
      proposalSent: '2026-01-05',
      purchaseOrderIssued: '',
      e57IssuedDate: '',
      startDate: '2026-01-20',
      endDate: '2027-03-15',
      expectedClientDeliveryDate: '2027-03-15',

      workflowStatus: 'yet to award',
      billing: 'yet to invoice',
      billingStatus: 'yet to invoice',
      invoiceNumber: '',
      invoiceDate: '',
      invoiceDueDate: '',
      payment: 'yet to pay',

      comments: 'Project paused by client.'
    },

    {
      projectNo: 'PRJ-2026-006',
      client: 'Solaris Ventures',
      projectName: 'Solaris Tower',
      buildingType: 'Commercial',
      description: 'Solar-powered commercial tower with smart building systems.',
      requirements: 'Architectural, MEP, Electrical, Site Plan',
      cost: 28400,
      currency: '$',
      sft: 22000,
      scope: 'Scan to BIM',
      lod: 'LOD 400',
      scale: '',
      addOn: 'Site Plan',
      proposalSent: '2026-02-15',
      purchaseOrderIssued: '2026-03-01',
      e57IssuedDate: '2026-03-05',
      startDate: '2026-03-15',
      endDate: '2026-12-01',
      expectedClientDeliveryDate: '2026-12-01',

      workflowStatus: 'In Progress',
      billing: 'Invoiced',
      billingStatus: 'Invoiced',
      invoiceNumber: 'INV-2026-006',
      invoiceDate: '2026-05-15',
      invoiceDueDate: '2026-06-15',
      payment: 'Paid',

      comments: 'MEP coordination completed.'
    },

    {
      projectNo: 'PRJ-2026-007',
      client: 'Metro Transit Authority',
      projectName: 'Central Transit Hub',
      buildingType: 'Infrastructure',
      description: 'Multi-modal transit hub connecting rail and bus networks.',
      requirements: 'Structural, MEP, Site Plan, Fire Protection',
      cost: 42000,
      currency: '$',
      sft: 45000,
      scope: 'Scan to BIM',
      lod: 'LOD 300',
      scale: '',

      addOn: 'Sections, Site Plan, Scan to BIM',
      proposalSent: '2026-04-01',
      purchaseOrderIssued: '2026-04-15',
      e57IssuedDate: '2026-04-20',
      startDate: '2026-05-01',
      endDate: '2027-06-30',
      expectedClientDeliveryDate: '2027-06-30',

      workflowStatus: 'In Progress',
      billing: 'Yet to Invoice',
      billingStatus: 'Yet to Invoice',
      invoiceNumber: '',
      invoiceDate: '',
      invoiceDueDate: '',
      payment: 'Yet to Pay',

      comments: 'Major coordination milestone achieved.'
    },

    {
      projectNo: 'PRJ-2026-008',
      client: 'Pineview Healthcare',
      projectName: 'Pineview Medical',
      buildingType: 'Healthcare',
      description: 'Regional medical center with surgical suites.',
      requirements: 'Floor Plan, RCP, MEP, Furniture',
      cost: 33200,
      currency: '$',
      sft: 28000,
      scope: 'Scan to CAD',
      lod: '',
      scale: '1/2" - 1\'0"',
      addOn: 'MEP, Furniture',
      proposalSent: '2026-01-20',
      purchaseOrderIssued: '2026-01-28',
      e57IssuedDate: '2026-02-01',
      startDate: '2026-02-01',
      endDate: '2026-10-15',
      expectedClientDeliveryDate: '2026-10-15',

      workflowStatus: 'Under Revision',
      billing: 'Invoiced',
      billingStatus: 'Invoiced',
      invoiceNumber: 'INV-2026-008',
      invoiceDate: '2026-06-01',
      invoiceDueDate: '2026-07-01',
      payment: 'Paid',

      comments: 'Equipment revisions underway.'
    },

    {
      projectNo: 'PRJ-2026-009',
      client: 'Azure Hospitality',
      projectName: 'Azure Hotel',
      buildingType: 'Hospitality',
      description: 'Boutique waterfront hotel with rooftop lounge.',
      requirements: 'Architectural, MEP, Furniture, Interior Elevations',
      cost: 22100,
      currency: '$',
      sft: 19000,
      scope: 'Scan to BIM',
      lod: 'LOD 400',
      scale: '',

      addOn: 'Furniture, Internal Elevations, External Elevations',
      proposalSent: '2025-07-15',
      purchaseOrderIssued: '2025-07-25',
      e57IssuedDate: '2025-08-01',
      startDate: '2025-08-10',
      endDate: '2026-04-20',
      expectedClientDeliveryDate: '2026-04-20',

      workflowStatus: 'complete',
      billing: 'Invoiced',
      billingStatus: 'Invoiced',
      invoiceNumber: 'INV-2026-009',
      invoiceDate: '2026-04-22',
      invoiceDueDate: '2026-05-22',
      payment: 'Paid',

      comments: 'Client sign-off received.'
    },

    {
      projectNo: 'PRJ-2026-010',
      client: 'Eagle Ridge Estates',
      projectName: 'Eagle Ridge',
      buildingType: 'Multifamily',
      description: 'Luxury hillside condominium complex with panoramic views.',
      requirements: 'Structural, Architectural, Plumbing, Electrical',
      cost: 27600,
      currency: '$',
      sft: 24000,
      scope: 'Scan to BIM',
      lod: 'LOD 300',
      scale: '',

      addOn: 'Floor Plan, RCP, Sheets',
      proposalSent: '2026-03-20',
      purchaseOrderIssued: '2026-03-30',
      e57IssuedDate: '2026-04-01',
      startDate: '2026-04-01',
      endDate: '2027-01-15',
      expectedClientDeliveryDate: '2027-01-15',

      workflowStatus: 'In Progress',
      billing: 'Yet to Invoice',
      billingStatus: 'Yet to Invoice',
      invoiceNumber: '',
      invoiceDate: '',
      invoiceDueDate: '',
      payment: 'Yet to Pay',

      comments: 'Structural modeling phase ongoing.'
    }
  ];

  totalCost = computed(() => this.projects.reduce((s, p) => s + p.cost, 0));
  totalSft = computed(() => this.projects.reduce((s, p) => s + p.sft, 0));
  totalCount = computed(() => this.projects.length);
  scanToBimCount = computed(() => this.projects.filter(p => p.scope === 'Scan to BIM').length);
  scanToCadCount = computed(() => this.projects.filter(p => p.scope === 'Scan to CAD').length);
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
      if (scope !== 'all' && p.scope !== scope) return false;
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

  tickets = signal<Record<string, Ticket[]>>({
    'Crystal Atrium': [
      ...Array.from({ length: 14 }, (_, i) => ({
        id: 1718000001001 + i,
        projectName: 'Crystal Atrium',
        url: i % 3 === 0 ? `https://drive.google.com/file/d/crystal_dwg_${i + 1}` : '',
        comments: [
          'Client requested updated facade drawings for approval.',
          'Structural MEP coordination needed before next review.',
          'Revised floor plan submitted for interior layout changes.',
          'Point cloud alignment check requested by the engineering team.',
          'Updated RCP reflecting new lighting layout under review.',
          'Elevation discrepancies found between scan and existing drawings.',
          'Fire-rated wall details missing from current model set.',
          'Roof drain slope coordination needed with structural beams.',
          'Curtain wall anchorage detail requires engineer sign-off.',
          'Stair pressurization fan schedule needs revision.',
          'BIM model LOD 350 review completed with minor corrections.',
          'Clash detection report — ductwork conflicts with structural grid.',
          'Updated section cuts requested for permit submission.',
          'Final model export in progress for client handover.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.ClientClient requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval.Client requested updated facade drawings for approval. requested updated facade drawings for approval.',
        ][i],
        createdAt: new Date(Date.UTC(2026, 5, 1 + i, 8 + (i % 10), (i * 13) % 60)).toISOString(),
      })),
    ],
    'Skyline Tower': [
      ...Array.from({ length: 10 }, (_, i) => ({
        id: 1718000020001 + i,
        projectName: 'Skyline Tower',
        url: i % 2 === 0 ? `https://drive.google.com/file/d/skyline_doc_${i + 1}` : '',
        comments: [
          'Parking revision layouts uploaded for client feedback.',
          'Structural load analysis report added to project folder.',
          'Core wall reinforcement detailing in progress.',
          'Elevator shaft alignment verified against laser scan.',
          'Ramp slope adjustment per updated zoning requirements.',
          'Glazing shop drawing review comments addressed.',
          'MEP rough-in coordination with ceiling grid complete.',
          'Waterproofing membrane specification updated.',
          'Curtain wall panel layout approved for fabrication.',
          'Final as-built model delivered to facility management.',
        ][i],
        createdAt: new Date(Date.UTC(2026, 4, 20 + i, 9 + (i * 7) % 12, (i * 17) % 60)).toISOString(),
      })),
    ],
    'Harbor Bridge': [
      ...Array.from({ length: 12 }, (_, i) => ({
        id: 1718000040001 + i,
        projectName: 'Harbor Bridge',
        url: i % 4 === 0 ? `https://drive.google.com/file/d/harbor_ref_${i + 1}` : '',
        comments: [
          'Survey control points verified against geodetic network.',
          'Approach slab reinforcing steel shop drawings submitted.',
          'Expansion joint details coordinated with structural model.',
          'Pier cap formwork design reviewed for constructability.',
          'Stay cable anchorage zone clash check completed.',
          'Deck drainage layout revised for superelevation transitions.',
          'Traffic barrier reinforcement updated to current standards.',
          'Utility conduit crossings identified within abutment zones.',
          'Span camber diagram approved by independent checker.',
          'Paint system specification for structural steel issued.',
          'Construction sequence phasing plan submitted for review.',
          'Overturning stability check passed for all service loads.',
        ][i],
        createdAt: new Date(Date.UTC(2026, 4, 10 + i, 10 + (i * 5) % 14, (i * 19) % 60)).toISOString(),
      })),
    ],
    'Green Office Park': [
      ...Array.from({ length: 8 }, (_, i) => ({
        id: 1718000060001 + i,
        projectName: 'Green Office Park',
        url: i % 2 === 0 ? `https://drive.google.com/file/d/green_mep_${i + 1}` : '',
        comments: [
          'HVAC zoning plan received and incorporated into model.',
          'Photovoltaic panel layout optimized for solar exposure.',
          'Rainwater harvesting system schematic approved.',
          'Green roof assembly details submitted for permitting.',
          'Natural ventilation CFD analysis results uploaded.',
          'Energy model compliance report ready for review.',
          'Daylight autonomy study complete — glare analysis pending.',
          'Smart lighting control sequence of operations drafted.',
        ][i],
        createdAt: new Date(Date.UTC(2026, 3, 15 + i, 7 + (i * 9) % 16, (i * 11) % 60)).toISOString(),
      })),
    ],
  });

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
