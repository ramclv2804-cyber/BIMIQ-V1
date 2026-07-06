import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './app-header.html',
  styleUrls: ['./app-header.css'],
})
export class AppHeader {
  calculator = inject(SpatialCostCalculator);
  private router = inject(Router);

  user = computed(() => this.calculator.currentUser());
  isLoggedIn = computed(() => this.calculator.isLoggedIn());
  isUserMenuOpen = signal(false);
  isMobileMenuOpen = signal(false);
  isResourcesDropdownOpen = signal(false);
  private resourcesCloseTimeout: ReturnType<typeof setTimeout> | null = null;
  currentUrl = computed(() => this.router.url);

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.isUserMenuOpen.set(false);
    }
    if (!target.closest('.mobile-menu-container') && !target.closest('.hamburger-btn')) {
      this.isMobileMenuOpen.set(false);
    }
    if (!target.closest('.resources-dropdown-container')) {
      this.isResourcesDropdownOpen.set(false);
      this.clearResourcesTimeout();
    }
  }

  toggleResourcesDropdown() {
    this.isResourcesDropdownOpen.update(v => !v);
    this.clearResourcesTimeout();
  }

  private clearResourcesTimeout() {
    if (this.resourcesCloseTimeout) {
      clearTimeout(this.resourcesCloseTimeout);
      this.resourcesCloseTimeout = null;
    }
  }

  onResourcesMouseEnter() {
    this.clearResourcesTimeout();
    this.isResourcesDropdownOpen.set(true);
  }

  onResourcesMouseLeave() {
    this.clearResourcesTimeout();
    this.resourcesCloseTimeout = setTimeout(() => {
      this.isResourcesDropdownOpen.set(false);
      this.resourcesCloseTimeout = null;
    }, 200);
  }

  private openSelectionPopup(data: {
    icon: string;
    modeLabel: string;
    modeDescription: string;
    selectedLabel: string;
    selectedDetail: string;
    preselected: () => void;
    pdfUrls?: string[];
    realityUrl?: string;
  }) {
    this.isResourcesDropdownOpen.set(false);
    // Apply the preselection
    data.preselected();
    // Store proceed action separately so the popup can reuse it
    this.calculator.selectionPopupData.set({
      icon: data.icon,
      modeLabel: data.modeLabel,
      modeDescription: data.modeDescription,
      selectedLabel: data.selectedLabel,
      selectedDetail: data.selectedDetail,
      onProceed: () => {
        if (!this.calculator.isLoggedIn()) {
          this.router.navigate(['/login']);
          return;
        }
        this.calculator.setTab('config');
        this.router.navigate(['/']);
      },
      pdfUrls: data.pdfUrls,
      realityUrl: data.realityUrl,
    });
    this.calculator.isSelectionPopupOpen.set(true);
  }

  navigateToBimConfig(lod: string) {
    const labels: Record<string, string> = {
      'LOD_200': 'LOD 200',
      'LOD_300': 'LOD 300',
      'LOD_400': 'LOD 400',
      'LOD_500': 'LOD 500',
    };
    const details: Record<string, string> = {
      'LOD_200': 'Schematic massing, basic volumes & spatial relationships.',
      'LOD_300': 'Precise building geometry with quantifiable elements & systems.',
      'LOD_400': 'Fabrication-grade assemblies, shop drawings & installation specs.',
      'LOD_500': 'Field-verified as-built model reflecting real-world conditions.',
    };
    const realityUrls: Record<string, string> = {
      'LOD_200': 'https://viewer.autodesk.com/id/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YTM2MHZpZXdlci1wcm90ZWN0ZWQvdDE3ODIzMTU3NzRfMmIzNTUwNGQtMzdkZS00M2FhLWI3MmUtMmIwNjFkMjhkYmQ5LnJ2dA?sheetId=MjE2MDkwMzMtYjJiMC0wMjIxLTliODItOGFmZmY1NTA2YjU3',
      'LOD_300': 'https://viewer.autodesk.com/id/dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YTM2MHZpZXdlci1wcm90ZWN0ZWQvdDE3ODIzOTcwNzVfY2YzZjY3NTYtNzQ1NS00YmRlLWI1NjUtNDNlMzE2MWEyZjBlLnJ2dA?sheetId=MjE2MDkwMzMtYjJiMC0wMjIxLTliODItOGFmZmY1NTA2YjU3',
    };
    this.openSelectionPopup({
      icon: 'view_in_ar',
      modeLabel: 'Scan to BIM',
      modeDescription: 'Raw LiDAR scan conversion to 3D Revit BIM models.',
      selectedLabel: labels[lod] || lod,
      selectedDetail: details[lod] || '',
      realityUrl: realityUrls[lod],
      preselected: () => {
        this.calculator.selectedModelingWay.set('bim');
        this.calculator.smartLODLevel.set(lod as 'LOD_200' | 'LOD_300' | 'LOD_400' | 'LOD_500');
      },
    });
  }

  navigateToCadScale(index: number) {
    const scale = this.calculator.cadScaleOptions[index];
    const detailLines: Record<string, string> = {
      '1/8" - 1\'0"': 'Large-scale floor plans & broad spatial layouts.',
      '1/4" - 1\'0"': 'Standard architectural design & construction documents.',
      '1/2" - 1\'0"': 'Detailed sections, elevations & millwork specifics.',
    };
    const scaleFolderMap: Record<string, string> = {
      '1/8" - 1\'0"': '1-8 Inch Scale 1',
      '1/4" - 1\'0"': '1-4 Inch Scale 1',
      '1/2" - 1\'0"': '1-2 Inch Scale 1',
    };
    const folder = scaleFolderMap[scale];
    const pdfUrls = folder
      ? [`scles_resources/${folder}/Typical Floor Plan.pdf`, `scles_resources/${folder}/Typical Elevation.pdf`, `scles_resources/${folder}/Typical Section.pdf`]
      : undefined;
    this.openSelectionPopup({
      icon: 'draw',
      modeLabel: 'Scan to CAD',
      modeDescription: '2D CAD drawing conversion to 3D Revit models.',
      selectedLabel: scale,
      selectedDetail: detailLines[scale] || 'Standard CAD to Revit conversion scale.',
      pdfUrls,
      preselected: () => {
        this.calculator.selectedModelingWay.set('scan_to_cad');
        this.calculator.cadScale.set(scale);
      },
    });
  }

  toggleUserMenu() {
    this.isUserMenuOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  navigateAndClose(url: string, tab?: string) {
    this.isMobileMenuOpen.set(false);
    if (tab) {
      if (tab === 'config' && !this.calculator.isLoggedIn()) {
        this.router.navigate(['/login']);
        return;
      }
      this.calculator.setTab(tab as 'home' | 'portfolio' | 'config');
    }
    this.router.navigate([url]);
  }

  goHome() {
    this.calculator.setTab('home');
    this.router.navigate(['/']);
  }

  setTab(tab: string) {
    if (tab === 'config' && !this.calculator.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.calculator.setTab(tab as 'home' | 'portfolio' | 'config');
    this.router.navigate(['/']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToProjects() {
    this.router.navigate(['/projects']);
  }

  goToResources() {
    this.router.navigate(['/resources']);
  }

  openAddModal() {
    this.calculator.openAddModal();
  }

  signIn() {
    this.router.navigate(['/login']);
  }

  goToEstimator() {
    if (!this.calculator.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.calculator.setTab('config');
    this.router.navigate(['/']);
  }

  logout() {
    this.calculator.logoutUser(true);
    this.router.navigate(['/login']);
  }
}
