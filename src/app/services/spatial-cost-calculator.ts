import { Injectable, signal, computed } from '@angular/core';

export interface Project {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'MEP' | 'ARCHITECTURAL' | 'STRUCTURAL';
  typology: string;
  magnitude: string;
  image: string;
  date: string;
}

@Injectable({
  providedIn: 'root',
})
export class SpatialCostCalculator {
  // Navigation active state: 'dashboard' | 'portfolio' | 'config'
  activeTab = signal<'dashboard' | 'portfolio' | 'config'>('dashboard');

  // User Authentication State
  isLoggedIn = signal<boolean>(false);
  isLoginModalOpen = signal<boolean>(false);
  currentUser = signal<{ email: string; name: string; initials: string; role: string } | null>(null);

  loginEmailInput = signal<string>('engineer@axisxd.com');
  loginPasswordInput = signal<string>('••••••••');

  constructor() {
    this.restoreSession();
  }

  private cookieKey = 'bimiq_session';

  private isBrowser = typeof document !== 'undefined';

  private restoreSession() {
    if (!this.isBrowser) return;
    try {
      const match = document.cookie.match(new RegExp(`(?:^|; )${this.cookieKey}=([^;]*)`));
      if (match) {
        const data = JSON.parse(decodeURIComponent(match[1]));
        if (data?.email) {
          const nameStr = data.email.split('@')[0];
          const uppercaseName = nameStr.charAt(0).toUpperCase() + nameStr.slice(1);
          this.currentUser.set({
            email: data.email,
            name: uppercaseName,
            initials: nameStr.substring(0, 2).toUpperCase(),
            role: 'Project Chief Coordinator'
          });
          this.smartEmail.set(data.email);
          this.isLoggedIn.set(true);
        }
      }
    } catch {
      this.clearSessionCookie();
    }
  }

  private setSessionCookie(email: string) {
    if (!this.isBrowser) return;
    const data = JSON.stringify({ email });
    document.cookie = `${this.cookieKey}=${encodeURIComponent(data)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }

  clearSessionCookie() {
    if (!this.isBrowser) return;
    document.cookie = `${this.cookieKey}=; path=/; max-age=0; SameSite=Lax`;
  }

  loginUser(email: string) {
    const trimmed = email.trim() || 'engineer@axisxd.com';
    const nameStr = trimmed.split('@')[0];
    const uppercaseName = nameStr.charAt(0).toUpperCase() + nameStr.slice(1);
    const initials = nameStr.substring(0, 2).toUpperCase();
    this.currentUser.set({
      email: trimmed,
      name: uppercaseName,
      initials: initials,
      role: 'Project Chief Coordinator'
    });
    this.smartEmail.set(trimmed);
    this.isLoggedIn.set(true);
    this.isLoginModalOpen.set(false);
    this.setSessionCookie(trimmed);
    this.showNotification(`Authorized session established under node: ${trimmed}`, 'success');
  }

  logoutUser() {
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.smartEmail.set('');
    this.clearSessionCookie();
    this.showNotification('Authorized session disconnected.', 'info');
  }

  // Currency rates from OpenExchangeRates
  currencyExchange = {
    "disclaimer": "Usage subject to terms: https://openexchangerates.org/terms",
    "license": "https://openexchangerates.org/license",
    "timestamp": 1753686000,
    "base": "USD",
    "rates": {
      "AED": 3.673025,
      "AFN": 68.473415,
      "ALL": 82.830076,
      "AMD": 382.315782,
      "ANG": 1.79,
      "AOA": 911.955,
      "ARS": 1280.7446,
      "AUD": 1.526768,
      "AWG": 1.802,
      "AZN": 1.7,
      "BAM": 1.662381,
      "BBD": 2,
      "BDT": 121.869444,
      "BGN": 1.663571,
      "BHD": 0.376861,
      "BIF": 2971.381195,
      "BMD": 1,
      "BND": 1.277321,
      "BOB": 6.888198,
      "BRL": 5.5648,
      "BSD": 1,
      "BTC": 0.000008369591,
      "BTN": 86.280124,
      "BWP": 13.384559,
      "BYN": 3.262375,
      "BZD": 2.002456,
      "CAD": 1.371195,
      "CDF": 2901.355343,
      "CHF": 0.796061,
      "CLF": 0.024152,
      "CLP": 947.46,
      "EUR": 0.921350,
      "GBP": 0.781240,
      "USD": 1.000000
    }
  };

  // Pricing array grouped by size ranges
  priceInSqFt: {
    Min: number;
    Max: number;
    Exterior: { A: number; F: number; MEPF: number };
    Interior: { A: number; F: number; MEPF: number };
    ComplexMEPF: number;
  }[] = [
      {
        "Min": 0,
        "Max": 249,
        "Exterior": { "A": 58.47, "F": 5.09, "MEPF": 31.48 },
        "Interior": { "A": 64.96, "F": 33.98, "MEPF": 44.97 },
        "ComplexMEPF": 305.74
      },
      {
        "Min": 250,
        "Max": 499,
        "Exterior": { "A": 105.25, "F": 9.18, "MEPF": 56.67 },
        "Interior": { "A": 116.94, "F": 61.17, "MEPF": 80.96 },
        "ComplexMEPF": 550.33
      },
      {
        "Min": 500,
        "Max": 749,
        "Exterior": { "A": 163.72, "F": 14.27, "MEPF": 88.16 },
        "Interior": { "A": 181.91, "F": 95.15, "MEPF": 125.94 },
        "ComplexMEPF": 856.08
      },
      {
        "Min": 750,
        "Max": 999,
        "Exterior": { "A": 198.80, "F": 17.33, "MEPF": 107.05 },
        "Interior": { "A": 220.89, "F": 115.54, "MEPF": 152.92 },
        "ComplexMEPF": 1039.52
      },
      {
        "Min": 1000,
        "Max": 1999,
        "Exterior": { "A": 233.883, "F": 20.39, "MEPF": 125.937 },
        "Interior": { "A": 259.87, "F": 135.932, "MEPF": 179.91 },
        "ComplexMEPF": 1222.965
      },
      {
        "Min": 2000,
        "Max": 2999,
        "Exterior": { "A": 327.44, "F": 28.55, "MEPF": 176.31 },
        "Interior": { "A": 363.82, "F": 190.30, "MEPF": 251.87 },
        "ComplexMEPF": 1712.15
      },
      {
        "Min": 3000,
        "Max": 3999,
        "Exterior": { "A": 420.99, "F": 36.70, "MEPF": 226.69 },
        "Interior": { "A": 467.77, "F": 244.68, "MEPF": 323.84 },
        "ComplexMEPF": 2201.34
      },
      {
        "Min": 4000,
        "Max": 4999,
        "Exterior": { "A": 514.54, "F": 44.86, "MEPF": 277.06 },
        "Interior": { "A": 571.71, "F": 299.05, "MEPF": 395.80 },
        "ComplexMEPF": 2690.52
      },
      {
        "Min": 5000,
        "Max": 9999,
        "Exterior": { "A": 701.65, "F": 61.17, "MEPF": 377.81 },
        "Interior": { "A": 779.61, "F": 407.80, "MEPF": 539.73 },
        "ComplexMEPF": 3668.90
      },
      {
        "Min": 10000,
        "Max": 24999,
        "Exterior": { "A": 1169.42, "F": 101.95, "MEPF": 629.69 },
        "Interior": { "A": 1299.35, "F": 679.66, "MEPF": 899.55 },
        "ComplexMEPF": 6114.83
      },
      {
        "Min": 25000,
        "Max": 49999,
        "Exterior": { "A": 1871.06, "F": 163.12, "MEPF": 1007.50 },
        "Interior": { "A": 2078.96, "F": 1087.46, "MEPF": 1439.28 },
        "ComplexMEPF": 9783.72
      },
      {
        "Min": 50000,
        "Max": 99999,
        "Exterior": { "A": 2806.60, "F": 244.68, "MEPF": 1511.24 },
        "Interior": { "A": 3118.44, "F": 1631.18, "MEPF": 2158.92 },
        "ComplexMEPF": 14675.58
      },
      {
        "Min": 100000,
        "Max": 999999,
        "Exterior": { "A": 4677.66, "F": 407.80, "MEPF": 2518.74 },
        "Interior": { "A": 5197.40, "F": 2718.64, "MEPF": 3598.20 },
        "ComplexMEPF": 24459.30
      }
    ];

  // Site modeling prices customizable by user
  siteModelingPrice = [
    { "min": 1, "max": 249, "price": 27.16 },
    { "min": 250, "max": 499, "price": 33.95 },
    { "min": 500, "max": 749, "price": 40.74 },
    { "min": 750, "max": 999, "price": 47.53 },
    { "min": 1000, "max": 1999, "price": 88.27 },
    { "min": 2000, "max": 2999, "price": 103.81 },
    { "min": 3000, "max": 3999, "price": 119.35 },
    { "min": 4000, "max": 4999, "price": 134.89 },
    { "min": 5000, "max": 5999, "price": 150.43 },
    { "min": 6000, "max": 6999, "price": 165.97 },
    { "min": 7000, "max": 7999, "price": 181.52 },
    { "min": 8000, "max": 8999, "price": 197.06 },
    { "min": 9000, "max": 9999, "price": 212.60 },
    { "min": 10000, "max": 14999, "price": 290.30 },
    { "min": 15000, "max": 19999, "price": 368.01 },
    { "min": 20000, "max": 24999, "price": 445.72 },
    { "min": 25000, "max": 29999, "price": 523.43 },
    { "min": 30000, "max": 34999, "price": 601.13 },
    { "min": 35000, "max": 39999, "price": 678.84 },
    { "min": 40000, "max": 44999, "price": 756.55 },
    { "min": 45000, "max": 49999, "price": 834.25 },
    { "min": 50000, "max": 62499, "price": 938.71 },
    { "min": 62500, "max": 74999, "price": 1038.82 },
    { "min": 75000, "max": 87499, "price": 1138.94 },
    { "min": 87500, "max": 99999, "price": 1239.06 },
    { "min": 100000, "max": 124999, "price": 1503.17 },
    { "min": 125000, "max": 999999, "price": 0.0113 }
  ];

  // User input selection: Scan to BIM, Prebuilt Scan to BIM, or Scan to CAD
  // 'bim': Scan to BIM (formerly BIM Modeling)
  // 'prebuilt': Prebuilt Scan to BIM (formerly Prebuilt / Existing Model / Prebuilt BIM Modeling)
  // 'scan_to_cad': Scan to CAD
  selectedModelingWay = signal<'bim' | 'prebuilt' | 'scan_to_cad'>('bim');
  modelingSelectionLocked = signal<boolean>(false);

  // Scan to CAD fields
  cadSheetCount = signal<number>(4);
  cadSourceFormat = signal<string>('.DWG');
  isCadFormatDropdownOpen = signal<boolean>(false);
  cadFormatOptions = [
    { value: '.DWG', label: '.DWG (AutoCAD Drawing)' },
    { value: '.DXF', label: '.DXF (Drawing Exchange Format)' },
    { value: '.DGN', label: '.DGN (MicroStation Design)' },
    { value: '.PDF', label: '.PDF Layout Draft Sheet' }
  ];

  toggleCadFormatDropdown() {
    this.closeAllDropdowns();
    this.isCadFormatDropdownOpen.set(true);
  }

  getCadFormatLabel(value: string): string {
    const found = this.cadFormatOptions.find(o => o.value === value);
    return found ? found.label : (value || '.DWG (AutoCAD Drawing)');
  }

  // Step 1 fields — shared between Scan to CAD and Scan to BIM
  // projectType = signal<string>('');
  selectedBuildingType = signal<string>('');
  isBuildingTypeDropdownOpen = signal<boolean>(false);
  buildingTypeOptions = [
    'Retail', 'Commercial', 'Warehouse', 'Residential',
    'Multifamily', 'Educational', 'Historical', 'Spiritual'
  ];

  // CAD mode fields
  cadRequirements = signal<string[]>([]);
  cadRequirementsOptions = ['Floor Plan', 'RCP', 'Internal Elevations', 'External Elevations', 'Sections', 'Site Plan', 'MEP', 'Furniture'];
  isCadRequirementsOpen = signal<boolean>(false);
  cadScale = signal<string>('');
  cadScaleOptions = ['1/8" - 1\'0"', '1/4" - 1\'0"', '1/2" - 1\'0"'];
  isCadScaleDropdownOpen = signal<boolean>(false);

  // BIM mode fields
  bimRequirements = signal<string[]>([]);
  bimRequirementsOptions = ['Architectural', 'Structural', 'Mechanical', 'Electrical', 'Plumbing', 'Fire Protection', 'Furniture'];
  isBimRequirementsOpen = signal<boolean>(false);
  bimAddOns = signal<string[]>([]);
  bimAddOnsOptions = ['Floor Plan', 'RCP', 'Internal Elevations', 'External Elevations', 'Sections', 'Site Plan', 'MEP', 'Furniture', 'Sheets'];
  isBimAddOnsOpen = signal<boolean>(false);

  toggleMultiSelection(arr: string[], value: string): string[] {
    if (arr.includes(value)) {
      return arr.filter(v => v !== value);
    }
    return [...arr, value];
  }

  closeAllDropdowns() {
    this.isBuildingTypeDropdownOpen.set(false);
    this.isCadRequirementsOpen.set(false);
    this.isCadScaleDropdownOpen.set(false);
    this.isBimRequirementsOpen.set(false);
    this.isBimAddOnsOpen.set(false);
    this.isSpaceTypeDropdownOpen.set(false);
    this.isCurrencyDropdownOpen.set(false);
    this.isRevitDropdownOpen.set(false);
    this.isAutocadDropdownOpen.set(false);
    this.isPrebuiltFormatDropdownOpen.set(false);
    this.isPrebuiltLodDropdownOpen.set(false);
    this.isCadFormatDropdownOpen.set(false);
  }

  // Prebuilt / Existing Model fields
  prebuiltModelTitle = signal<string>('Legacy Node 3D');
  prebuiltDesignerFirm = signal<string>('Apex Architects Ltd');
  prebuiltFileFormat = signal<string>('.RVT');
  prebuiltLODLevel = signal<'LOD_200' | 'LOD_300' | 'LOD_400' | 'LOD_500'>('LOD_300');

  isPrebuiltFormatDropdownOpen = signal<boolean>(false);
  isPrebuiltLodDropdownOpen = signal<boolean>(false);

  prebuiltFileFormatOptions = [
    { value: '.RVT', label: '.RVT (Autodesk Revit File)' },
    { value: '.IFC', label: '.IFC (Industry Foundation Classes)' },
    { value: '.DWG', label: '.DWG (3D AutoCAD Architectural)' },
    { value: '.PLN', label: '.PLN (Graphisoft ArchiCAD Single)' }
  ];

  prebuiltLODOptions = [
    { value: 'LOD_200', label: 'LOD 200 (Basic Conceptual 3D Model)' },
    { value: 'LOD_300', label: 'LOD 300 (Detailed Design-Level 3D)' },
    { value: 'LOD_400', label: 'LOD 400 (Fabrication & Construction Details)' },
    { value: 'LOD_500', label: 'LOD 500 (As-built & Field-Verified Model)' }
  ];

  togglePrebuiltFormatDropdown() {
    this.closeAllDropdowns();
    this.isPrebuiltFormatDropdownOpen.set(true);
  }

  togglePrebuiltLodDropdown() {
    this.closeAllDropdowns();
    this.isPrebuiltLodDropdownOpen.set(true);
  }

  getPrebuiltFormatLabel(value: string): string {
    const found = this.prebuiltFileFormatOptions.find(o => o.value === value);
    return found ? found.label : (value || '.RVT (Autodesk Revit File)');
  }

  getPrebuiltLodLabel(value: string): string {
    const found = this.prebuiltLODOptions.find(o => o.value === value);
    return found ? found.label : (value || 'LOD 300 (Detailed Building Model)');
  }

  // Toggle for user selecting BIM Modeling but wanting to say "now using prebuilt design i will provide later"
  usePrebuiltDesignLater = signal<boolean>(false);

  // Site modeling sft size input (custom site size)
  siteModelingSft = signal<number>(1000);

  // Smart image-based estimator states
  isAnalyzing = signal<boolean>(false);
  extractedRationale = signal<string>('');
  smartSpaceType = signal<string>('');
  smartScanSize = signal<number>(4000); // realistic starting default
  smartIsMetric = signal<boolean>(false);
  smartInteriorArchitecture = signal<boolean>(true);
  smartInteriorFurniture = signal<boolean>(false);
  smartInteriorMep = signal<boolean>(false);
  smartIsComplexMepf = signal<boolean>(false);
  smartIsExteriorRequired = signal<boolean>(false);
  smartExteriorArchitecture = signal<boolean>(false);
  smartExteriorFurniture = signal<boolean>(false);
  smartExteriorMep = signal<boolean>(false);
  smartIsSiteRequired = signal<boolean>(false);
  smartEmail = signal<string>('');
  uploadedImagePreview = signal<string | null>(null);
  dragActive = signal<boolean>(false);
  smartLODLevel = signal<'LOD_200' | 'LOD_300' | 'LOD_400' | 'LOD_500'>('LOD_300');
  smartLocationId = signal<string>('a99e3def-fcea-4b5f-abc8-ebc91231b461');
  smartVersionId = signal<string>('35441d5b-3402-4b47-964a-9e4caca8bda4');
  isLiveTwinViewerOpen = signal<boolean>(true);

  // Step 2 common fields
  uploadLink = signal<string>('https://drive.google.com/drive/folders/abc123');
  pointCloudLink = signal<string>('https://pointcloud.example.com/project-xyz');
  descriptionLink = signal<string>('https://docs.google.com/document/d/def456');
  description = signal<string>('');
  remark = signal<string>('');
  // manualEstimation = signal<string>('');
  sendProposal = signal<boolean>(false);
  placeOrder = signal<boolean>(false);

  // Step 3 fields
  projectNumber = signal<string>('PRJ-' + Date.now().toString(36).toUpperCase());
  orderPlacedDate = signal<string>(new Date().toISOString().split('T')[0]);
  pointCloudIssueDate = signal<string>('');
  expectedDeliveryDate = signal<string>('');

  // Custom dropdown signals, options and methods matching website theme
  isSpaceTypeDropdownOpen = signal<boolean>(false);
  isCurrencyDropdownOpen = signal<boolean>(false);
  isRevitDropdownOpen = signal<boolean>(false);
  isAutocadDropdownOpen = signal<boolean>(false);
  isHeaderCurrencyOpen = signal<boolean>(false);

  spaceTypeOptions = [
    { value: 'Select a space type', label: 'Select a space type' },
    { value: 'Office', label: 'Office Space' },
    { value: 'Residential', label: 'Residential Building' },
    { value: 'Retail', label: 'Retail Trade Outlet' },
    { value: 'Hospitality', label: 'Hotel / Hospitality Resort' },
    { value: 'Medical', label: 'Medical Center / Ward' },
    { value: 'Educational', label: 'Educational Campus' },
    { value: 'Industrial', label: 'Industrial Hall' },
  ];

  currencyOptions = [
    { value: 'USD', label: 'USD (United States Dollar)' },
    { value: 'EUR', label: 'EUR (Euro)' },
    { value: 'GBP', label: 'GBP (British Pound)' },
    { value: 'AUD', label: 'AUD (Australian Dollar)' },
    { value: 'CAD', label: 'CAD (Canadian Dollar)' },
    { value: 'BRL', label: 'BRL (Brazilian Real)' },
    { value: 'AED', label: 'AED (UAE Dirham)' },
    { value: 'CLP', label: 'CLP (Chilean Peso)' },
  ];

  revitOptions = [
    { value: 'Revit 2021', label: 'Revit 2021' },
    { value: 'Revit 2022', label: 'Revit 2022' },
    { value: 'Revit 2023', label: 'Revit 2023' },
    { value: 'Revit 2024', label: 'Revit 2024' },
    { value: 'Revit 2025', label: 'Revit 2025' },
  ];

  autocadOptions = [
    { value: 'AutoCAD 2021', label: 'AutoCAD 2021' },
    { value: 'AutoCAD 2022', label: 'AutoCAD 2022' },
    { value: 'AutoCAD 2023', label: 'AutoCAD 2023' },
    { value: 'AutoCAD 2024', label: 'AutoCAD 2024' },
    { value: 'AutoCAD 2025', label: 'AutoCAD 2025' },
  ];

  toggleSpaceTypeDropdown() {
    this.closeAllDropdowns();
    this.isSpaceTypeDropdownOpen.set(true);
  }

  toggleCurrencyDropdown() {
    this.closeAllDropdowns();
    this.isCurrencyDropdownOpen.set(true);
  }

  toggleRevitDropdown() {
    if (this.isRevitDropdownOpen()) {
      this.isRevitDropdownOpen.set(false);
    } else {
      this.closeAllDropdowns();
      this.isRevitDropdownOpen.set(true);
    }
  }

  toggleAutocadDropdown() {
    if (this.isAutocadDropdownOpen()) {
      this.isAutocadDropdownOpen.set(false);
    } else {
      this.closeAllDropdowns();
      this.isAutocadDropdownOpen.set(true);
    }
  }

  getSpaceTypeLabel(value: string): string {
    const found = this.spaceTypeOptions.find(o => o.value === value);
    return found ? found.label : (value || 'Select a space type');
  }

  getCurrencyLabel(value: string): string {
    const found = this.currencyOptions.find(o => o.value === value);
    return found ? found.label : (value || 'GBP (British Pound)');
  }

  getRevitLabel(value: string): string {
    const found = this.revitOptions.find(o => o.value === value);
    return found ? found.label : (value || 'Revit 2024 (Active Core)');
  }

  getAutocadLabel(value: string): string {
    const found = this.autocadOptions.find(o => o.value === value);
    return found ? found.label : (value || 'AutoCAD 2024 (Active Core)');
  }

  // Active inputs
  selectedCurrency = signal<string>('USD');
  smartStep = signal<number>(1); // Step 1: Specifications, Step 2: Project Details, Step 3: Summary
  smartProjectName = signal<string>('');
  smartProjectAddress = signal<string>('742 Custom Boulevard, Sector 4');
  smartRevitVersion = signal<string>('');
  smartAutocadVersion = signal<string>('');

  resolvedProjectName = computed(() => {
    return this.selectedModelingWay() === 'bim'
      ? this.smartProjectName()
      : this.prebuiltModelTitle();
  });

  // Quick selections on the dashboard
  activeMepTier = signal<'SMALL' | 'MEDIUM' | 'LARGE'>('MEDIUM');
  activeStructuralTier = signal<'SMALL' | 'MEDIUM' | 'LARGE'>('LARGE');
  activeArchitecturalTier = signal<'SMALL' | 'MEDIUM' | 'LARGE'>('SMALL');

  isEmailValid = computed(() => {
    const email = this.smartEmail().trim();
    return email.length > 3 && email.includes('@') && email.includes('.');
  });

  step1Errors = computed(() => {
    const list: string[] = [];
    const isPrebuilt = this.selectedModelingWay() === 'prebuilt';

    // 1. Space Type
    const spaceType = this.smartSpaceType();
    if (!spaceType || spaceType === 'Select a space type') {
      list.push('Please select a valid Space Type.');
    }

    // 2. Scan Size (Scan size must a value)
    const scanSize = this.smartScanSize();
    if (!scanSize || scanSize <= 0) {
      list.push('Scan Size must have a value greater than 0.');
    }

    // 3. Interior Scope (must select Interior Scope at least 1 of these 3: architecture, furniture, mep)
    const hasInterior = this.smartInteriorArchitecture() || this.smartInteriorFurniture() || this.smartInteriorMep() || this.smartIsComplexMepf();
    if (!hasInterior) {
      list.push('Please select at least one Interior Scope (Architecture, Furniture, or MEP).');
    }

    // 4. If Exterior selected, mandatory to select Exterior Scope details of at least 1 of instructions (architecture, furniture, mep)
    if (!isPrebuilt && this.smartIsExteriorRequired()) {
      const hasExterior = this.smartExteriorArchitecture() || this.smartExteriorFurniture() || this.smartExteriorMep();
      if (!hasExterior) {
        list.push('Exterior Scope is enabled. You must select at least one Exterior option (Architecture, Furniture, or MEP).');
      }
    }

    // 5. If Site Model is selected, must input sft and mail also required (handled by isEmailValid)
    if (!isPrebuilt && this.smartIsSiteRequired()) {
      const siteSft = this.siteModelingSft();
      if (!siteSft || siteSft <= 0) {
        list.push('Site modeling area (sft) is required with a value greater than 0.');
      }
    }

    // 6. Registered Email required
    if (!this.isEmailValid()) {
      list.push('A valid email address is required.');
    }

    return list;
  });

  isStep1Valid = computed(() => this.step1Errors().length === 0);

  step2Errors = computed(() => {
    const list: string[] = [];
    if (this.selectedModelingWay() === 'bim') {
      const name = this.smartProjectName().trim();
      if (!name) {
        list.push('Project Title/Identification is required.');
      }
      const address = this.smartProjectAddress().trim();
      if (!address) {
        list.push('Physical Site/Plot Address is required.');
      }
      const revit = this.smartRevitVersion();
      if (!revit) {
        list.push('Revit Software Platform Version Integration must be specified.');
      }
    } else {
      const name = this.prebuiltModelTitle().trim();
      if (!name) {
        list.push('Existing Model Title is required.');
      }
      const firm = this.prebuiltDesignerFirm().trim();
      if (!firm) {
        list.push('BIM Author/Designer is required.');
      }
      const format = this.prebuiltFileFormat();
      if (!format) {
        list.push('Source BIM Software File Format is required.');
      }
      const locId = this.smartLocationId().trim();
      if (!locId) {
        list.push('Location ID (UUID) is required for Pipeline Sync.');
      }
      const verId = this.smartVersionId().trim();
      if (!verId) {
        list.push('Version ID (UUID) is required for Pipeline Sync.');
      }
    }
    return list;
  });

  isStep2Valid = computed(() => this.isStep1Valid() && this.step2Errors().length === 0);

  getCurrencySymbol(curr: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      AUD: 'A$',
      CAD: 'C$',
      BRL: 'R$',
      AED: 'AED ',
      CLP: 'CLP$'
    };
    return symbols[curr] || curr + ' ';
  }

  // Cost calculator
  calculatedSmartEstimate = computed(() => {
    const size = this.smartScanSize();
    const isMetric = this.smartIsMetric();

    // Normalize metric to imperial units (Sq.Ft)
    const sizeInSqFt = isMetric ? Math.round(size * 10.7639) : size;

    // Find custom size item range
    const rateItem = this.priceInSqFt.find(item => sizeInSqFt >= item.Min && sizeInSqFt <= item.Max)
      || this.priceInSqFt[this.priceInSqFt.length - 1];

    let total = 0;
    let interiorFees = 0;
    let exteriorFees = 0;
    let siteFees = 0;

    // BASE ESTIMATE logic changes depending on Scan to BIM, Prebuilt Scan to BIM vs Scan to CAD!
    const isPrebuiltModel = this.selectedModelingWay() === 'prebuilt';
    const isScanToCad = this.selectedModelingWay() === 'scan_to_cad';

    if (isScanToCad) {
      // Scan to CAD specific pricing
      let cadBase = 0;
      if (this.smartInteriorArchitecture()) cadBase += rateItem.Interior.A;
      if (this.smartInteriorFurniture()) cadBase += rateItem.Interior.F;
      if (this.smartInteriorMep()) cadBase += rateItem.Interior.MEPF;

      const cadSheetFee = this.cadSheetCount() * 45;
      // 22% custom Scan to CAD digital drafting discount
      total = (cadBase * 0.78) + cadSheetFee;
      interiorFees = total;
    } else if (this.smartIsComplexMepf()) {
      total = rateItem.ComplexMEPF;
    } else {
      // Calculate Interior scopes
      if (this.smartInteriorArchitecture()) interiorFees += rateItem.Interior.A;
      if (this.smartInteriorFurniture()) interiorFees += rateItem.Interior.F;
      if (this.smartInteriorMep()) interiorFees += rateItem.Interior.MEPF;

      // Calculate Exterior scopes
      if (this.smartIsExteriorRequired()) {
        if (this.smartExteriorArchitecture()) exteriorFees += rateItem.Exterior.A;
        if (this.smartExteriorFurniture()) exteriorFees += rateItem.Exterior.F;
        if (this.smartExteriorMep()) exteriorFees += rateItem.Exterior.MEPF;
      }

      // Calculate Site modeling scopes based on the exact user-specified siteModelingSft input!
      if (this.smartIsSiteRequired()) {
        const siteSft = this.siteModelingSft();
        const siteRate = this.siteModelingPrice.find(s => siteSft >= s.min && siteSft <= s.max)
          || this.siteModelingPrice[this.siteModelingPrice.length - 1];

        // Per-square-foot calculation if price value is low (under 1.0, e.g. 0.0113)
        if (siteRate.price < 1.0) {
          siteFees = siteRate.price * siteSft;
        } else {
          siteFees = siteRate.price;
        }
      }

      total = interiorFees + exteriorFees + siteFees;
    }

    // Apply LOD level multiplier (LOD 200 = 0.85, LOD 300 = 1.00, LOD 400 = 1.25, LOD 500 = 1.50)
    const lod = this.selectedModelingWay() === 'prebuilt' ? this.prebuiltLODLevel() : this.smartLODLevel();
    let lodMultiplier = 1.0;
    if (lod === 'LOD_200') {
      lodMultiplier = 0.85;
    } else if (lod === 'LOD_300') {
      lodMultiplier = 1.00;
    } else if (lod === 'LOD_400') {
      lodMultiplier = 1.25;
    } else if (lod === 'LOD_500') {
      lodMultiplier = 1.50;
    }

    total *= lodMultiplier;
    interiorFees *= lodMultiplier;
    exteriorFees *= lodMultiplier;
    siteFees *= lodMultiplier;

    // Apply different multipliers for BIM Modeling vs Prebuilt Existing Model
    // (Prebuilt model has a discount since BIM modeling phase is omitted)
    if (isPrebuiltModel) {
      total *= 0.72; // 28% pre-built discount
    }

    // Currency conversions
    const curr = this.selectedCurrency();
    const rate = (this.currencyExchange.rates as Record<string, number>)[curr] || 1.0;
    const convertedTotal = total * rate;

    // Delivery duration computation
    let deliveryDays = 1;
    if (sizeInSqFt > 1200) deliveryDays = 2;
    if (sizeInSqFt > 2500) deliveryDays = 3;
    if (this.smartIsComplexMepf() || this.smartIsExteriorRequired() || this.smartIsSiteRequired()) {
      deliveryDays += 1;
    }

    const baseDate = new Date('2026-06-06');
    const start = new Date(baseDate);
    start.setDate(baseDate.getDate() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + deliveryDays - 1 + 1);

    const formatShortDate = (d: Date) => {
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
      return `${weekdays[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
    };

    return {
      totalPrice: convertedTotal,
      rawTotal: total,
      dayRangeText: `${formatShortDate(start)} - ${formatShortDate(end)}`,
      businessDaysText: `${deliveryDays} Business Day${deliveryDays > 1 ? 's' : ''}`,
      interiorFees: interiorFees * rate * (isPrebuiltModel ? 0.72 : 1),
      exteriorFees: exteriorFees * rate * (isPrebuiltModel ? 0.72 : 1),
      siteFees: siteFees * rate,
      baseSetup: 0,
      sizePrice: 0,
      currencySymbol: this.getCurrencySymbol(curr)
    };
  });

  // Dynamic Spatial breakdown metrics mimicking premium digital twin dashboard allocations
  spatialBreakdown = computed(() => {
    const size = this.smartScanSize();
    let archPct = 0;
    let structPct = 0;
    let mepPct = 0;

    if (this.smartIsComplexMepf()) {
      mepPct = 65;
      structPct = 20;
      archPct = 15;
    } else {
      let archWeight = 1.0;
      if (this.smartInteriorArchitecture()) archWeight += 2.0;
      if (this.smartExteriorArchitecture()) archWeight += 1.5;
      if (this.smartInteriorFurniture()) archWeight += 1.0;

      let structWeight = 1.5;
      if (this.smartIsSiteRequired()) structWeight += 1.0;

      let mepWeight = 0.5;
      if (this.smartInteriorMep()) mepWeight += 2.0;
      if (this.smartExteriorMep()) mepWeight += 1.0;

      const totalWeight = archWeight + structWeight + mepWeight || 1.0;
      archPct = Math.round((archWeight / totalWeight) * 100);
      mepPct = Math.round((mepWeight / totalWeight) * 100);
      structPct = Math.round((structWeight / totalWeight) * 100);

      const sum = archPct + structPct + mepPct;
      if (sum !== 100) {
        structPct += (100 - sum);
      }
    }

    return {
      archPct,
      structPct,
      mepPct,
      archArea: Math.round(size * (archPct / 100)),
      structArea: Math.round(size * (structPct / 100)),
      mepArea: Math.round(size * (mepPct / 100))
    };
  });

  // Structural Tiers
  mepTiers = {
    SMALL: { label: 'SMALL', costValue: 4200, display: '$1.2k' },
    MEDIUM: { label: 'MEDIUM', costValue: 8900, display: '$8.9k' },
    LARGE: { label: 'LARGE', costValue: 15000, display: '$15k+' }
  };

  structuralTiers = {
    SMALL: { label: 'SMALL', costValue: 3500, display: '$3.5k' },
    MEDIUM: { label: 'MEDIUM', costValue: 7200, display: '$7.2k' },
    LARGE: { label: 'LARGE', costValue: 12000, display: '$12k+' }
  };

  architecturalTiers = {
    SMALL: { label: 'SMALL', costValue: 5000, display: '$5.0k' },
    MEDIUM: { label: 'MEDIUM', costValue: 11000, display: '$11k' },
    LARGE: { label: 'LARGE', costValue: 20000, display: '$20k+' }
  };

  // Estimator calculator states
  estimProjectType = signal<'bim' | 'prebuilt'>('bim');
  estimPropertyValue = signal<number>(450000);
  estimLoanAmount = signal<number>(320000);
  estimJurisdiction = signal<'ca' | 'ny' | 'tx' | 'fl'>('ca');
  estimServiceTier = signal<'standard' | 'premium'>('standard');
  estimEnvironmentalAudit = signal<boolean>(true);
  estimStructuralForensics = signal<boolean>(false);

  estimCalculations = computed(() => {
    const val = this.estimPropertyValue();
    const baseRatio = this.estimProjectType() === 'bim' ? 0.015 : 0.011;
    let serviceFees = val * baseRatio + 2450;

    if (this.estimServiceTier() === 'premium') {
      serviceFees *= 1.45;
    }

    if (this.estimEnvironmentalAudit()) {
      serviceFees += 1500;
    }
    if (this.estimStructuralForensics()) {
      serviceFees += 2800;
    }

    const taxRate = {
      ca: 0.082,
      ny: 0.095,
      tx: 0.062,
      fl: 0.071
    }[this.estimJurisdiction()];

    const taxes = serviceFees * taxRate;
    const total = serviceFees + taxes;

    return {
      serviceFees: serviceFees,
      jurisdictionalTaxes: taxes,
      totalPrice: total
    };
  });

  // Country selections
  activeCountry = signal<string>('Global');

  countrie_LatLang: {
    country: string;
    locations: { name: string; lat: number; lon: number }[];
    bounding_box: [number, number, number, number];
    services_data: {
      id: number;
      name: string;
      total_prj: number;
      sub_services: { category: string; value: number }[];
    }[];
  }[] = [
      {
        "country": "United States",
        "locations": [
          { "name": "Empire State Building, NYC", "lat": 40.748817, "lon": -73.985428 },
          { "name": "One World Trade Center, NYC", "lat": 40.712742, "lon": -74.013382 },
          { "name": "Willis Tower, Chicago", "lat": 41.878876, "lon": -87.635915 },
          { "name": "Chrysler Building, NYC", "lat": 40.751652, "lon": -73.975311 },
          { "name": "Bank of America Plaza, Atlanta", "lat": 33.755927, "lon": -84.387995 }
        ],
        "bounding_box": [-125.0, 24.396308, -66.93457, 49.384358],
        "services_data": [
          {
            id: 1,
            name: 'Structural',
            total_prj: 932,
            sub_services: [
              { category: 'Columns', value: 112 },
              { category: 'Beams', value: 157 },
              { category: 'Floors', value: 265 },
              { category: 'Walls', value: 138 },
              { category: 'Reinforcement', value: 725 },
              { category: 'Trusses & Bracing', value: 249 }
            ]
          },
          {
            id: 2,
            name: 'Architectural',
            total_prj: 710,
            sub_services: [
              { category: 'x', value: 134 },
              { category: 'y', value: 698 },
              { category: 'z', value: 242 },
              { category: '0', value: 158 },
              { category: '3', value: 237 }
            ]
          },
          {
            id: 3,
            name: 'MEP',
            total_prj: 401,
            sub_services: [
              { category: '0', value: 140 },
              { category: '1', value: 133 },
              { category: '3', value: 214 },
              { category: 'z', value: 288 }
            ]
          }
        ]
      },
      {
        "country": "China",
        "locations": [
          { "name": "Shanghai Tower, Shanghai", "lat": 31.2355, "lon": 121.5010 },
          { "name": "Shanghai World Financial Center", "lat": 31.2397, "lon": 121.4998 },
          { "name": "Jin Mao Tower, Shanghai", "lat": 31.2356, "lon": 121.5036 },
          { "name": "Ping An Finance Centre, Shenzhen", "lat": 22.5333, "lon": 114.0540 },
          { "name": "Petronas Towers, Kuala Lumpur", "lat": 3.15785, "lon": 101.71165 }
        ],
        "bounding_box": [73.499734, 18.197701, 134.77281, 53.56086],
        "services_data": [
          {
            id: 1,
            name: 'Structural',
            total_prj: 810,
            sub_services: [
              { category: 'a', value: 98 },
              { category: 'b', value: 165 },
              { category: 'c', value: 305 },
              { category: 'x', value: 119 },
              { category: 'y', value: 675 },
              { category: 'z', value: 215 }
            ]
          },
          {
            id: 2,
            name: 'Architectural',
            total_prj: 659,
            sub_services: [
              { category: 'x', value: 110 },
              { category: 'y', value: 725 },
              { category: 'z', value: 260 },
              { category: '0', value: 142 },
              { category: '3', value: 228 }
            ]
          },
          {
            id: 3,
            name: 'MEP',
            total_prj: 373,
            sub_services: [
              { category: '0', value: 128 },
              { category: '1', value: 150 },
              { category: '3', value: 202 },
              { category: 'z', value: 260 }
            ]
          }
        ]
      },
      {
        "country": "United Arab Emirates",
        "locations": [
          { "name": "Burj Khalifa, Dubai", "lat": 25.197525, "lon": 55.274288 },
          { "name": "Emirates Towers, Dubai", "lat": 25.2136, "lon": 55.2734 },
          { "name": "DIFC, Dubai", "lat": 25.2183, "lon": 55.2797 },
          { "name": "Marina 101, Dubai", "lat": 25.0819, "lon": 55.1406 },
          { "name": "Almas Tower, Dubai", "lat": 25.0814, "lon": 55.1461 }
        ],
        "bounding_box": [51.57952, 22.63151, 56.39685, 26.07651],
        "services_data": [
          {
            id: 1,
            name: 'Structural',
            total_prj: 876,
            sub_services: [
              { category: 'a', value: 115 },
              { category: 'b', value: 142 },
              { category: 'c', value: 290 },
              { category: 'x', value: 132 },
              { category: 'y', value: 702 },
              { category: 'z', value: 238 }
            ]
          },
          {
            id: 2,
            name: 'Architectural',
            total_prj: 731,
            sub_services: [
              { category: 'x', value: 127 },
              { category: 'y', value: 705 },
              { category: 'z', value: 225 },
              { category: '0', value: 150 },
              { category: '3', value: 245 }
            ]
          },
          {
            id: 3,
            name: 'MEP',
            total_prj: 389,
            sub_services: [
              { category: '0', value: 135 },
              { category: '1', value: 145 },
              { category: '3', value: 210 },
              { category: 'z', value: 275 }
            ]
          }
        ]
      },
      {
        "country": "United Kingdom",
        "locations": [
          { "name": "The Shard, London", "lat": 51.504501, "lon": -0.086500 },
          { "name": "Canary Wharf, London", "lat": 51.505974, "lon": -0.027176 },
          { "name": "The Gherkin (30 St Mary Axe)", "lat": 51.514500, "lon": -0.080000 },
          { "name": "Leadenhall Building, London", "lat": 51.514400, "lon": -0.083500 },
          { "name": "1 Undershaft (future), London", "lat": 51.515600, "lon": -0.083000 }
        ],
        "bounding_box": [-8.649357, 49.906193, 1.748, 60.860699],
        "services_data": [
          {
            id: 1, name: 'Structural', total_prj: 912,
            sub_services: [
              { category: 'a', value: 110 }, { category: 'b', value: 155 },
              { category: 'c', value: 270 }, { category: 'x', value: 130 },
              { category: 'y', value: 735 }, { category: 'z', value: 245 }
            ]
          },
          {
            id: 2, name: 'Architectural', total_prj: 670,
            sub_services: [
              { category: 'x', value: 115 }, { category: 'y', value: 700 },
              { category: 'z', value: 260 }, { category: '0', value: 145 },
              { category: '3', value: 230 }
            ]
          },
          {
            id: 3, name: 'MEP', total_prj: 380,
            sub_services: [
              { category: '0', value: 132 }, { category: '1', value: 140 },
              { category: '3', value: 215 }, { category: 'z', value: 260 }
            ]
          }
        ]
      },
      {
        "country": "Brazil",
        "locations": [
          { "name": "Centro Empresarial Nações Unidas, São Paulo", "lat": -23.6139, "lon": -46.6997 },
          { "name": "Plaza Centenário, São Paulo", "lat": -23.6035, "lon": -46.6929 },
          { "name": "E‑Tower, São Paulo", "lat": -23.5956, "lon": -46.6833 },
          { "name": "Eldorado Business Tower, São Paulo", "lat": -23.5981, "lon": -46.6994 },
          { "name": "Brookfield Towers, São Paulo", "lat": -23.6080, "lon": -46.6980 }
        ],
        "bounding_box": [-73.982817, -33.768377, -34.729993, 5.271786],
        "services_data": [
          {
            id: 1, name: 'Structural', total_prj: 850,
            sub_services: [
              { category: 'a', value: 105 }, { category: 'b', value: 150 },
              { category: 'c', value: 260 }, { category: 'x', value: 125 },
              { category: 'y', value: 720 }, { category: 'z', value: 240 }
            ]
          },
          {
            id: 2, name: 'Architectural', total_prj: 690,
            sub_services: [
              { category: 'x', value: 120 }, { category: 'y', value: 710 },
              { category: 'z', value: 250 }, { category: '0', value: 150 },
              { category: '3', value: 235 }
            ]
          },
          {
            id: 3, name: 'MEP', total_prj: 360,
            sub_services: [
              { category: '0', value: 128 }, { category: '1', value: 135 },
              { category: '3', value: 205 }, { category: 'z', value: 255 }
            ]
          }
        ]
      },
      {
        "country": "Japan",
        "locations": [
          { "name": "Roppongi Grand Tower, Tokyo", "lat": 35.6639, "lon": 139.7309 },
          { "name": "Tokyo Midtown Tower", "lat": 35.6604, "lon": 139.7292 },
          { "name": "Toraya Building, Tokyo", "lat": 35.6738, "lon": 139.7634 },
          { "name": "Shinjuku Sumitomo Building", "lat": 35.6939, "lon": 139.7036 },
          { "name": "Shin‑Marunouchi Building", "lat": 35.6804, "lon": 139.7648 }
        ],
        "bounding_box": [122.93853, 24.396308, 153.986672, 45.551483],
        "services_data": [
          {
            id: 1, name: 'Structural', total_prj: 980,
            sub_services: [
              { category: 'a', value: 120 }, { category: 'b', value: 165 },
              { category: 'c', value: 290 }, { category: 'x', value: 140 },
              { category: 'y', value: 760 }, { category: 'z', value: 260 }
            ]
          },
          {
            id: 2, name: 'Architectural', total_prj: 720,
            sub_services: [
              { category: 'x', value: 130 }, { category: 'y', value: 730 },
              { category: 'z', value: 270 }, { category: '0', value: 155 },
              { category: '3', value: 245 }
            ]
          },
          {
            id: 3, name: 'MEP', total_prj: 405,
            sub_services: [
              { category: '0', value: 135 }, { category: '1', value: 150 },
              { category: '3', value: 220 }, { category: 'z', value: 275 }
            ]
          }
        ]
      },
      {
        "country": "Australia",
        "locations": [
          { "name": "Sydney Tower, Sydney", "lat": -33.870453, "lon": 151.208755 },
          { "name": "Century Tower, Sydney", "lat": -33.8720, "lon": 151.2045 },
          { "name": "Crown Sydney", "lat": -33.8590, "lon": 151.2130 },
          { "name": "Barangaroo Tower One", "lat": -33.8605, "lon": 151.2000 },
          { "name": "MLC Centre, Sydney", "lat": -33.8675, "lon": 151.2070 }
        ],
        "bounding_box": [112.92111, -43.740482, 153.638673, -10.684055],
        "services_data": [
          {
            id: 1, name: 'Structural', total_prj: 770,
            sub_services: [
              { category: 'a', value: 95 }, { category: 'b', value: 140 },
              { category: 'c', value: 250 }, { category: 'x', value: 120 },
              { category: 'y', value: 700 }, { category: 'z', value: 230 }
            ]
          },
          {
            id: 2, name: 'Architectural', total_prj: 640,
            sub_services: [
              { category: 'x', value: 110 }, { category: 'y', value: 690 },
              { category: 'z', value: 240 }, { category: '0', value: 140 },
              { category: '3', value: 225 }
            ]
          },
          {
            id: 3, name: 'MEP', total_prj: 330,
            sub_services: [
              { category: '0', value: 125 }, { category: '1', value: 130 },
              { category: '3', value: 200 }, { category: 'z', value: 250 }
            ]
          }
        ]
      },
      {
        "country": "India",
        "locations": [
          { "name": "Phiroze Jeejeebhoy Towers, Mumbai", "lat": 18.929863, "lon": 72.833427 },
          { "name": "The Imperial (Tardeo), Mumbai", "lat": 18.9709, "lon": 72.8129 },
          { "name": "Aaradhya Avaan, Tardeo", "lat": 18.965840, "lon": 72.814237 },
          { "name": "Gail Jubilee Tower, New Delhi", "lat": 28.589912, "lon": 77.311707 },
          { "name": "Mumbai (city centre)", "lat": 19.076090, "lon": 72.877426 }
        ],
        "bounding_box": [68.111378, 6.554607, 97.395561, 35.674545],
        "services_data": [
          {
            id: 1, name: 'Structural', total_prj: 980,
            sub_services: [
              { category: 'a', value: 120 }, { category: 'b', value: 165 },
              { category: 'c', value: 290 }, { category: 'x', value: 140 },
              { category: 'y', value: 760 }, { category: 'z', value: 260 }
            ]
          },
          {
            id: 2, name: 'Architectural', total_prj: 720,
            sub_services: [
              { category: 'x', value: 130 }, { category: 'y', value: 730 },
              { category: 'z', value: 270 }, { category: '0', value: 155 },
              { category: '3', value: 245 }
            ]
          },
          {
            id: 3, name: 'MEP', total_prj: 405,
            sub_services: [
              { category: '0', value: 135 }, { category: '1', value: 150 },
              { category: '3', value: 220 }, { category: 'z', value: 275 }
            ]
          }
        ]
      },
      {
        "country": "Germany",
        "locations": [
          { "name": "Commerzbank Tower, Frankfurt", "lat": 50.11056, "lon": 8.6825 },
          { "name": "Messeturm, Frankfurt", "lat": 50.11222, "lon": 8.65278 },
          { "name": "Main Tower, Frankfurt", "lat": 50.1100, "lon": 8.6780 },
          { "name": "IBC Tower, Frankfurt", "lat": 50.1128, "lon": 8.6490 },
          { "name": "Tower 185, Frankfurt", "lat": 50.1095, "lon": 8.6800 }
        ],
        "bounding_box": [5.866342, 47.270111, 15.041896, 55.058347],
        "services_data": [
          {
            id: 1, name: 'Structural', total_prj: 850,
            sub_services: [
              { category: 'a', value: 105 }, { category: 'b', value: 150 },
              { category: 'c', value: 260 }, { category: 'x', value: 125 },
              { category: 'y', value: 720 }, { category: 'z', value: 240 }
            ]
          },
          {
            id: 2, name: 'Architectural', total_prj: 690,
            sub_services: [
              { category: 'x', value: 120 }, { category: 'y', value: 710 },
              { category: 'z', value: 250 }, { category: '0', value: 150 },
              { category: '3', value: 235 }
            ]
          },
          {
            id: 3, name: 'MEP', total_prj: 360,
            sub_services: [
              { category: '0', value: 128 }, { category: '1', value: 135 },
              { category: '3', value: 205 }, { category: 'z', value: 255 }
            ]
          }
        ]
      },
      {
        "country": "Canada",
        "locations": [
          { "name": "Pinnacle One Yonge (SkyTower), Toronto", "lat": 43.64333, "lon": -79.37500 },
          { "name": "Prestige at Pinnacle One Yonge, Toronto", "lat": 43.64361, "lon": -79.37417 },
          { "name": "Scotia Plaza, Toronto", "lat": 43.6503, "lon": -79.3808 },
          { "name": "First Canadian Place, Toronto", "lat": 43.6525, "lon": -79.3808 },
          { "name": "TD Canada Trust Tower, Toronto", "lat": 43.6486, "lon": -79.3763 }
        ],
        "bounding_box": [-141.0, 41.676555, -52.648099, 70.0],
        "services_data": [
          {
            id: 1, name: 'Structural', total_prj: 912,
            sub_services: [
              { category: 'a', value: 110 }, { category: 'b', value: 155 },
              { category: 'c', value: 270 }, { category: 'x', value: 130 },
              { category: 'y', value: 735 }, { category: 'z', value: 245 }
            ]
          },
          {
            id: 2, name: 'Architectural', total_prj: 670,
            sub_services: [
              { category: 'x', value: 115 }, { category: 'y', value: 700 },
              { category: 'z', value: 260 }, { category: '0', value: 145 },
              { category: '3', value: 230 }
            ]
          },
          {
            id: 3, name: 'MEP', total_prj: 380,
            sub_services: [
              { category: '0', value: 132 }, { category: '1', value: 140 },
              { category: '3', value: 215 }, { category: 'z', value: 260 }
            ]
          }
        ]
      }
    ];

  mapTransform = computed(() => {
    const countryStyles: Record<string, { scale: number; translateX: number; translateY: number }> = {
      'Global': { scale: 1, translateX: 0, translateY: 0 },
      'United States': { scale: 1.8, translateX: -60, translateY: 40 },
      'China': { scale: 1.8, translateX: -290, translateY: 10 },
      'United Arab Emirates': { scale: 2.2, translateX: -190, translateY: 10 },
      'United Kingdom': { scale: 2.2, translateX: -100, translateY: 80 },
      'Brazil': { scale: 1.4, translateX: 50, translateY: -20 },
      'Japan': { scale: 2.5, translateX: -350, translateY: 10 },
      'Australia': { scale: 1.6, translateX: -400, translateY: -150 },
      'India': { scale: 2.2, translateX: -250, translateY: -10 },
      'Germany': { scale: 2.5, translateX: -150, translateY: 100 },
      'Canada': { scale: 1.5, translateX: -20, translateY: 50 }
    };
    const style = countryStyles[this.activeCountry()] || countryStyles['Global'];
    return `scale(${style.scale}) translate(${style.translateX}px, ${style.translateY}px)`;
  });

  countryStats = computed(() => {
    const selCountry = this.activeCountry();

    // Fallback/standard stats structure
    if (selCountry === 'Global') {
      let totalStructural = 0;
      let totalArchitectural = 0;
      let totalMEP = 0;
      this.countrie_LatLang.forEach(item => {
        const s = item.services_data.find(sd => sd.name === 'Structural');
        const a = item.services_data.find(sd => sd.name === 'Architectural');
        const m = item.services_data.find(sd => sd.name === 'MEP');
        totalStructural += s ? s.total_prj : 0;
        totalArchitectural += a ? a.total_prj : 0;
        totalMEP += m ? m.total_prj : 0;
      });

      const totalPrj = totalStructural + totalArchitectural + totalMEP;

      return {
        projectStat: `${totalPrj.toLocaleString()} ACTIVE PROJECTS`,
        description: 'Expanding global infrastructure through precision OS deployment. Currently supporting major capitals across 4 continents.',
        nodesActive: (totalPrj * 11).toLocaleString(),
        uptime: '99.9995%',
        structuralVal: totalStructural,
        architecturalVal: totalArchitectural,
        mepVal: totalMEP,
        structuralBreakdown: { columns: 85, beams: 72, floors: 90, walls: 65, reinforcement: 44, trusses: 30 },
        aestheticLoad: { facade: 80, interior: 60, visual: 95, urban: 40 },
        mepBreakdown: { mech: '142 UNIT', elec: '98 UNIT', plumb: '112 UNIT', eff: '94.2%', note: 'System optimization guarantees seamless global operations.' }
      };
    }

    const item = this.countrie_LatLang.find(c => c.country === selCountry);
    if (!item) {
      // Emergency default
      return {
        projectStat: '0 ACTIVE PROJECTS',
        description: 'Operational node online.',
        nodesActive: '0',
        uptime: '100.00%',
        structuralVal: 0,
        architecturalVal: 0,
        mepVal: 0,
        structuralBreakdown: { columns: 0, beams: 0, floors: 0, walls: 0, reinforcement: 0, trusses: 0 },
        aestheticLoad: { facade: 0, interior: 0, visual: 0, urban: 0 },
        mepBreakdown: { mech: '0', elec: '0', plumb: '0', eff: '100%', note: 'N/A' }
      };
    }

    const s = item.services_data.find(sd => sd.name === 'Structural');
    const a = item.services_data.find(sd => sd.name === 'Architectural');
    const m = item.services_data.find(sd => sd.name === 'MEP');

    const sVal = s ? s.total_prj : 120;
    const aVal = a ? a.total_prj : 100;
    const mVal = m ? m.total_prj : 80;
    const totalPrj = sVal + aVal + mVal;

    const descriptions: Record<string, string> = {
      'United States': 'Focusing on high-rise structures in New York and seismic structural reinforcing upgrades in Chicago and Atlanta.',
      'China': 'Massive high-density infrastructure expansion in Shanghai and Shenzhen with smart city system integrations.',
      'United Arab Emirates': 'Super-tall commercial structure engineering and real-time desert climate HVAC thermal network optimization in Dubai.',
      'United Kingdom': 'Historic architectural envelope restoration combined with modular low-carbon high-performance structures in London.',
      'Brazil': 'Innovative commercial and residential building layouts focusing on structural concrete slabs in São Paulo.',
      'Japan': 'High-load seismic-isolated frameworks and advanced ventilation networks in Tokyo and Roppongi.',
      'Australia': 'Sustainable coastal architectural master planning and green building climate technology in Sydney.',
      'India': 'Rapidly growing urban infrastructure hubs, high-capacity commercial spaces, and seismic reinforcement in Mumbai.',
      'Germany': 'Premium energy-efficiency architectural frameworks and advanced HVAC networks in Frankfurt.',
      'Canada': 'High-density cold-climate residential architectural complexes and high-wind structural designs in Toronto.'
    };

    const desc = descriptions[selCountry] || `Engaged in precision drafting and automated spatial coordination across ${selCountry}.`;

    return {
      projectStat: `${selCountry.toUpperCase()} PROJECTS: ${totalPrj}`,
      description: desc,
      nodesActive: (totalPrj * 5 + 104).toString(),
      uptime: '99.9995%',
      structuralVal: sVal,
      architecturalVal: aVal,
      mepVal: mVal,
      structuralBreakdown: { columns: 92, beams: 85, floors: 78, walls: 70, reinforcement: 55, trusses: 40 },
      aestheticLoad: { facade: 90, interior: 75, visual: 85, urban: 50 },
      mepBreakdown: { mech: '28 UNIT', elec: '18 UNIT', plumb: '16 UNIT', eff: '96.4%', note: `Synchronization active with regional ${selCountry} telemetry nodes.` }
    };
  });

  // FAQs active state tracker: tracks which accordion index is open
  openFaqIndex = signal<number | null>(0);

  // Search keyword & filters in project archive catalog
  searchQuery = signal<string>('');
  activeCategory = signal<string>('ALL PROJECTS');

  // Comprehensive projects database for portfolio render
  allProjects = signal<Project[]>([
    {
      id: 'PROJECT_001',
      code: 'PROJECT_001',
      title: 'The Vertex Pavilion',
      description: 'Modernist corporate workspace with integrated climate control systems and diamond glass structure.',
      category: 'MEP',
      typology: 'Office',
      magnitude: '30,230 SQ FT',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRWYGczuRNVoLApBph6t_QACwT__PN5xdqb5KbDa3JsJ0tH3rLbbrgGyi_1V6HJ2xYX4410dXoSWmUSYCpisKcsGbSX88OXypSEANhuBn8BudnwmlIrCYNhTjT7j84ogwNxG1GBVe6ITJ_IglZtLd9uFThp3IpbccQ-XhB-kDfy_W3AbswscbGT-v_-oo0oEBqdWbF7CrIe9t9hOi3Bo71Yio41IDiWOirzTMYhCReQ2dPcZj6NYGHGHWwqrDfMPYOtPYXQcRRgY8',
      date: '01_2024'
    },
    {
      id: 'PROJECT_005',
      code: 'PROJECT_005',
      title: 'Obsidian Terminal',
      description: 'Brutalist concrete transportation terminal with dramatic light shafts and structural heritage.',
      category: 'STRUCTURAL',
      typology: 'Airports',
      magnitude: '33,023 SQ FT',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRFkC6_hFVn7b-agjpn9iKPpfmErl8szxOLnn5K6wfH1mNgngYgHEddNwt2QBFjktDwHrgXoQSCWROAbuZp_bVltApbslk8lXqSU4qGyoRGE9DRluSiwG2lYJ1qoXU6oi1vVfcFWsvvK7WaN_oQs9YFcjpV6nDBUljI3DW_i-NybLNSjlg0cJrR09nSG9fVPo4E5R4TLur-IcV9Q-y-5nYxqN0ytBcqCVOjc2V7WMnKAmp2M71URgmXwB7RY8uxxCmsyKdhfZenYY',
      date: '05_2023'
    },
    {
      id: 'PROJECT_016',
      code: 'PROJECT_016',
      title: 'Flux Residential',
      description: 'High-end structural research facility highlighting geometric precision and metallic frames.',
      category: 'ARCHITECTURAL',
      typology: 'Residential',
      magnitude: '4,563,023 SQ FT',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      date: '10_2024'
    },
    {
      id: 'PROJECT_006',
      code: 'PROJECT_006',
      title: 'Alpha Industrial Site',
      description: 'High-precision industrial processing station with modular layouts and night automation guides.',
      category: 'ARCHITECTURAL',
      typology: 'Industrial',
      magnitude: '3,023 SQ FT',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClK6X81gHf4fKEeWkU4WspK9CnhHm87Bk7bHZMT8vehQqycmCltomPJkvZ1CZSV1dIs_gEB2u39vOu63NEGtw1xbMEAIPLJ7ps2lwA768s6tqd2oPq__zyYwYQCMCxV4YUt3yy25ps3GTjKvHnE80RkZZO4tS4Qg_MtA4GPw08uIB2Pcmv7a96kiVBqVdwF-eMPmraGCzeGT1rgacYZlsXrUw_LojNC_IKmu75egGr2hR5IRDTE3ig3pIytk-AFQ1amP5GxwHxLeM',
      date: '06_2023'
    },
    {
      id: 'PROJECT_011',
      code: 'PROJECT_011',
      title: 'Monolith Residence',
      description: 'Exclusive multi-level concrete residential blocks with panoramic light integration.',
      category: 'STRUCTURAL',
      typology: 'Residential',
      magnitude: '145,023 SQ FT',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYvfiuUSfYKsmX5WpGUW5QpuzzZg-uUqNZBn02hOKfKFxn9mbzN9_hsrgZBIg5cMgoJny0decgBFHUFe7p7WCtOF8F4WTH7-w3k9uD2w0YXPUQ0dXUnxE1UQTQWaCXJszlrv-22T2MFIvfeinYs3aYcM9-DUske5vKDZWkSOtRVUvF5ePOXr9sqLtjz4S9JGG31sLOuuXTPmJmU49zKB0D0aXBOTjamfDIp7Y1JSjNRxhRjcLzVn4MS9rc0kXHtXJilnGKa3kCc9A',
      date: '11_2024'
    },
    {
      id: 'PROJECT_014',
      code: 'PROJECT_014',
      title: 'Aura Limestone Villa',
      description: 'Sophisticated bespoke villa emphasizing volumetric geometry and limestone finishing.',
      category: 'ARCHITECTURAL',
      typology: 'Residential',
      magnitude: '39,023 SQ FT',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXr7ydioWDeIxQVA24rxENH-OrAhhTUfw2kFnW-jMx86sOZGHdxAfF5OVsDECJBVZI1FVByBYE5913QQ0QuBph8fud1jCZsGb2pkOIe_11Kbg4ihZ31H7d1TmjVUuf_F8BFuZoaNz7TQFpOi-T3b9No9BPYvWcThA8mOmTTzsnuD4dIt6QGuxjzGZRzGcCnjsaoLaeA60lV7Gbus45t8Z8YUPiZJBRJw-z0FUfsMFe9kwH2GwW_m7XM16XNOcKKMJGEC0y4xEEEKI',
      date: '14_2023'
    },
    {
      id: 'PROJECT_007',
      code: 'PROJECT_007',
      title: 'Vitas Campus Atrium',
      description: 'Educational master development highlighting high-tech ventilation skeletons.',
      category: 'MEP',
      typology: 'Educational',
      magnitude: '30,423 SQ FT',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiEiH9mgVilqvzCWFFc_H37omBy7ubmxexHym6TptnLIN4cRnPoG2ls2e6fRqmMrupPx-m_yqmiU4ffXbQRXuspuWVDvopddTOjnYdlPqtNSDB_z-5HerYQ42cYtcPMazbu1aYtTGPMgh4ayFwCR3-o-dQklVuMK44BpyLxuTMXtYAQ3FWkmojnTKtJb7WQfIN_h7W6Hvgn-XZug1z5WxhJ5KIwvq7igLe4wqkQXlUjyIgAQlM-7AGMDixBPvsO9QsU3ws8YPb-mU',
      date: '07_2024'
    },
    {
      id: 'PROJECT_009',
      code: 'PROJECT_009',
      title: 'Skylon Office Tower',
      description: 'Reinforced high-load structural skeleton engineered for maximum wind resistance.',
      category: 'STRUCTURAL',
      typology: 'Office',
      magnitude: '17,023 SQ FT',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAh4--94ZHe6PqKP1WucVH70x3NdHpd-vGd9pgfZOcQ8glgCgIOO7yAmRd_oPPBF2OtoPEvLvwO3Lljc5IvUAnR2KMaQNdFL72paOoHXTkY4axN1PJisekd2cOU2kditsJVYH8IliBlT2rsBsWJP5jKYt28Z4Z_c9IMBCj3hz8ftxB1vMKuzfz8tTnXNOpsc-v0-ifu9zjtQK4K1EH6LOtThscYamjNb7WodoDtCYq4a8byszUTHCewwCqpbACC7gI5pgw1fKU_Xg',
      date: '09_2023'
    },
    {
      id: 'PROJECT_012',
      code: 'PROJECT_012',
      title: 'Amber Lodge Suite',
      description: 'Prestige hotel framework incorporating fully concealed climate networks.',
      category: 'MEP',
      typology: 'Hospitality',
      magnitude: '13,023 SQ FT',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7IyvCKmlm6f-h1twWWkl5z7yXCwca7gYTIQWyBBQvn1-sudUuTM13bW8cjplr7O6eoap0-3uJN_eiIo3P0a0SBZapBvwQa34UK5_pD13uYLbIeAm2g0l7ySpoV_w6CY4DSz88vjXxHkLvdJ_GTn351TeSNwblK2_AP_oFSJ3NfHEMXITM_Scz7-GY_MVICblwscBvCotEc6i5DWOH2Ss_nK94A5c0fgWzxSNyOHLIBp0s2Xn9YTBJy5MiURiPyzuHSj-gJXWpJ-4',
      date: '12_2024'
    }
  ]);

  filteredProjects = computed(() => {
    return this.allProjects().filter(project => {
      const matchesCategory =
        this.activeCategory() === 'ALL PROJECTS' ||
        project.category === this.activeCategory();

      const query = this.searchQuery().toLowerCase().trim();
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.typology.toLowerCase().includes(query) ||
        project.code.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  });

  // Notifications Alert System
  notificationMessage = signal<string | null>(null);
  notificationType = signal<'info' | 'success' | 'warn'>('info');

  showNotification(msg: string, type: 'info' | 'success' | 'warn' = 'info') {
    this.notificationMessage.set(msg);
    this.notificationType.set(type);
    setTimeout(() => {
      this.notificationMessage.set(null);
    }, 4500);
  }

  openArchiveProject(searchKey: string, category: string, notificationMsg: string) {
    this.searchQuery.set(searchKey);
    this.activeCategory.set(category);
    this.activeTab.set('portfolio');
    this.showNotification(notificationMsg, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Initiating manual additions modal
  isAddModalOpen = signal<boolean>(false);
  newProjectTitle = signal<string>('');
  newProjectCategory = signal<'MEP' | 'ARCHITECTURAL' | 'STRUCTURAL'>('ARCHITECTURAL');
  newProjectTypology = signal<string>('Commercial');
  newProjectMagnitude = signal<string>('24,500 SQ FT');
  newProjectDescription = signal<string>('');

  openAddModal() {
    this.newProjectTitle.set('');
    this.newProjectDescription.set('');
    this.isAddModalOpen.set(true);
  }

  closeAddModal() {
    this.isAddModalOpen.set(false);
  }

  submitNewProject() {
    const title = this.newProjectTitle().trim();
    if (!title) {
      this.showNotification('Project Title is required.', 'warn');
      return;
    }

    const nextIdNum = this.allProjects().length + 1;
    const code = `PROJECT_${nextIdNum.toString().padStart(3, '0')}`;

    const imgMap = {
      MEP: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-j0Ctd5d5ygIh7Krpzt9Dj5KbgSNe0FqXRPf8nWinLyLbYZIX4MgpGk9x-HIsuMnu8Oh-4tM2tz-JobYfwTE8OJijGZhL3pzGr2TY7vOG1dAq5h3WLS4Vv4UVhMcdU3CB0uy2FGuW5CzI9C1GhSxe9o2sgcxuI5ZFiyzNOTCWN2EcIfcNLWvwKvzYkTpcq3AJIVh3Zv8qahheJcplIOy9D6aRwPAu7HwBoKP1vKOxALtB4q1CrtJMA9JI4oaV7of5rG442tNE4GQ',
      STRUCTURAL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAh4--94ZHe6PqKP1WucVH70x3NdHpd-vGd9pgfZOcQ8glgCgIOO7yAmRd_oPPBF2OtoPEvLvwO3Lljc5IvUAnR2KMaQNdFL72paOoHXTkY4axN1PJisekd2cOU2kditsJVYH8IliBlT2rsBsWJP5jKYt28Z4Z_c9IMBCj3hz8ftxB1vMKuzfz8tTnXNOpsc-v0-ifu9zjtQK4K1EH6LOtThscYamjNb7WodoDtCYq4a8byszUTHCewwCqpbACC7gI5pgw1fKU_Xg',
      ARCHITECTURAL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXr7ydioWDeIxQVA24rxENH-OrAhhTUfw2kFnW-jMx86sOZGHdxAfF5OVsDECJBVZI1FVByBYE5913QQ0QuBph8fud1jCZsGb2pkOIe_11Kbg4ihZ31H7d1TmjVUuf_F8BFuZoaNz7TQFpOi-T3b9No9BPYvWcThA8mOmTTzsnuD4dIt6QGuxjzGZRzGcCnjsaoLaeA60lV7Gbus45t8Z8YUPiZJBRJw-z0FUfsMFe9kwH2GwW_m7XM16XNOcKKMJGEC0y4xEEEKI'
    };

    const newProj: Project = {
      id: code,
      code: code,
      title: title,
      description: this.newProjectDescription().trim() || 'Custom high-end project modeled inside the terminal workspace.',
      category: this.newProjectCategory(),
      typology: this.newProjectTypology().trim() || 'Commercial',
      magnitude: this.newProjectMagnitude().trim() || '24,500 SQ FT',
      image: imgMap[this.newProjectCategory()],
      date: '06_2026'
    };

    this.allProjects.update(prev => [newProj, ...prev]);
    this.closeAddModal();
    this.showNotification(`Project ${code} created successfully inside local database node!`, 'success');
  }

  setTab(tab: 'dashboard' | 'portfolio' | 'config') {
    this.activeTab.set(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Preset operations
  loadPreset(presetType: 'office' | 'residential') {
    this.isAnalyzing.set(true);
    this.extractedRationale.set('');
    this.showNotification(`Synthesizing CAD metadata from Preset ${presetType === 'office' ? 'A (Commercial)' : 'B (Residential)'}...`, 'info');

    const presetsMap = {
      office: {
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY8BPNif6NrYtsgxo2lCBJDMECFQGLAi11zrH4ODOZ9yKce2t0ZDFBNGbmZ9H2DPt8KAAyct9U0blUd4jQRj83J73Dc-kHlXfL_wmkOGrwVjHsKvAEVXZmj9QNBVCetpGJZOGPNfy94CHoZ7QIMlNk8P8EP7xiva1CKsc34SvVAfoO1UYEV1Y8Di8olu8I174ueJlemWIEO5wnCDrUUoHrluUGV-4WsrErpehL2y5HlBDZxlVKptgV2TKGsze07uxVw8vnv6TJvHw',
        spaceType: 'Office',
        scanSize: 1850,
        arch: true,
        furn: false,
        mep: true,
        complex: true,
        ext: true,
        extArch: true,
        extFurn: false,
        extMep: false,
        site: false,
        rationale: 'Extracted 1,850 Sq.ft multi-room commercial layout with dense mechanical equipment, HVAC duct layers and partition columns.'
      },
      residential: {
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA54BO9dtNx4RJ6nmJZVLznvszr5ID0LaGoPQmFT-m_Ov2ha8rwJUlS_G81XlwaocK2vrT3NE66W4EcwbLlC-MFdJ9I_GfpLVYiVAJDPahS4ZAe1saIbVNlEY-xaCxVw5shU9U6WM0iaAUwni9-YZn9MbkqxJ1O9Rhd5EVu6EtyTCI08nxLpOBes10IDo2L-fkQmONCjyfSLzoFVq0CVu-8gA96C0FDhDQTkOm0DQmPVeNQizdur1PU_3a3nSCt_VFoQrtkmAeFvvI',
        spaceType: 'Residential',
        scanSize: 1000,
        arch: true,
        furn: true,
        mep: false,
        complex: false,
        ext: false,
        extArch: false,
        extFurn: false,
        extMep: false,
        site: true,
        rationale: 'Extracted 1,000 Sq.ft modular single-story residence with interior architectural partitions, loose furniture layout, and site terrain boundary.'
      }
    };

    setTimeout(() => {
      const p = presetsMap[presetType];
      this.uploadedImagePreview.set(p.img);
      this.smartSpaceType.set(p.spaceType);
      this.smartScanSize.set(p.scanSize);
      this.smartInteriorArchitecture.set(p.arch);
      this.smartInteriorFurniture.set(p.furn);
      this.smartInteriorMep.set(p.mep);
      this.smartIsComplexMepf.set(p.complex);
      this.smartIsExteriorRequired.set(p.ext);
      this.smartExteriorArchitecture.set(p.extArch);
      this.smartExteriorFurniture.set(p.extFurn);
      this.smartExteriorMep.set(p.extMep);
      this.smartIsSiteRequired.set(p.site);
      if (p.site) {
        this.siteModelingSft.set(Math.round(p.scanSize * 1.5));
      }
      this.extractedRationale.set(p.rationale);
      this.isAnalyzing.set(false);
      this.showNotification('Preset loaded successfully through active simulation channel!', 'success');
    }, 1800);
  }
}
