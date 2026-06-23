import { ChangeDetectionStrategy, Component, inject, signal, computed, PLATFORM_ID, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  imports: [CommonModule],
  template: `
    <div class="animate-fade-slide-up opacity-0 space-y-24">

      <!-- ================= SECTION 1: YOUR BUILDING ONLINE PORTAL ================= -->
      <section class="relative py-32 px-6 md:px-12 text-center overflow-hidden" id="hero-portal-section">
        <!-- Professional BIM High-Resolution Background Render with luxury tint and dark vignette overlay -->
        <div class="absolute inset-0 z-0 pointer-events-none select-none">
          <img src="/bim_modern_render.png" alt="BIM Digital Twin Background" class="w-full h-full object-cover opacity-85 filter contrast-[1.12] saturate-[1.05]" referrerpolicy="no-referrer" />
          <!-- Sophisticated ambient color vignette supporting the glowing brand identity -->
          <div class="absolute inset-0 bg-gradient-to-t from-[#0A0A0D] via-[#0A0A0D]/50 to-[#0A0A0D]/20"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-[#0A0A0D]/70 via-transparent to-[#0A0A0D]/70"></div>
        </div>
        
        <!-- Grid blueprints overlay pattern for professional tactile engineering style -->
        <div class="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:30px_30px] opacity-80 pointer-events-none select-none"></div>
        
        <div class="max-w-3xl mx-auto space-y-6 relative z-10">
        
          
          <h1 class="font-serif text-4xl md:text-6xl leading-tight tracking-tight text-white font-semibold select-none text-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Your building, online.
            <span class="block font-serif italic md:text-5xl text-primary-custom font-normal mt-1">With unprecedented detail.</span>
          </h1>
          
          <p class="max-w-xl mx-auto font-sans text-xs md:text-sm leading-relaxed text-slate-200 text-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Transform physical assets into high-fidelity digital twins. Access Revit models, CAD documentation, and 360° panoramas instantly in your browser.
          </p>
          
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4 select-none">
            <button type="button" (click)="calculator.setTab('config')" class="bg-primary-custom text-on-primary-custom font-mono text-xs uppercase tracking-widest px-8 py-3.5 rounded-lg border-none hover:opacity-95 active:scale-95 transition-all font-bold cursor-pointer shadow-lg shadow-primary-custom/15">
             Try Price Estimation
            </button>
            <button type="button" (click)="watchDemo()" class="border border-white/20 hover:border-white/50 bg-[#0A0A0D]/80 text-silver-leaf font-mono text-xs uppercase tracking-widest px-8 py-3.5 rounded-lg active:scale-95 transition-all font-bold cursor-pointer hover:bg-white/10 backdrop-blur-md">
              Watch Live Demo
            </button>
          </div>
        </div>

        <!-- STRATEGIC PARTNERS SECTION - BRAND PARTNERS ROW -->
        <div class="mt-20 pt-10 border-t border-white/5 overflow-hidden w-full" id="brand-partners-section">
          <div class="max-w-5xl mx-auto space-y-6">
            <p class="font-mono text-[10px] uppercase tracking-widest text-[#C86B98] font-bold text-center select-none">TRUSTED BY STRATEGIC PARTNERS</p>
            
            <div class="relative w-full overflow-hidden py-2">
              <div class="flex w-max" [style.animation]="'marquee ' + marqueeDuration() + 's linear infinite'">
                <div class="flex items-center gap-x-16 px-8 shrink-0">
                  @for (p of partners; track p.name) {
                    <button type="button" 
                         (click)="calculator.showNotification('Strategic alignment verified with: ' + p.name, 'success')"
                         [style.animation-delay]="($index * 40) + 'ms'"
                         class="bg-transparent border-none text-left p-0 flex items-center gap-3.5 hover:text-white transition-all duration-300 cursor-pointer group shrink-0 select-none focus:outline-none animate-fade-slide-up opacity-0">
                      <span class="material-symbols-outlined text-2xl transition-transform group-hover:scale-110 duration-300" [style.color]="p.color">{{ p.icon }}</span>
                      <span class="font-bold tracking-widest text-sm text-on-surface-variant-custom group-hover:text-[#E2E8F0] font-mono hover-underline-animate-pink pb-0.5">{{ p.name }}</span>
                    </button>
                  }
                </div>
                <div class="flex items-center gap-x-16 px-8 shrink-0">
                  @for (p of partners; track p.name) {
                    <button type="button"
                         (click)="calculator.showNotification('Strategic alignment verified with: ' + p.name, 'success')"
                         [style.animation-delay]="(($index + partners.length) * 40) + 'ms'"
                         class="bg-transparent border-none text-left p-0 flex items-center gap-3.5 hover:text-white transition-all duration-300 cursor-pointer group shrink-0 select-none focus:outline-none animate-fade-slide-up opacity-0">
                      <span class="material-symbols-outlined text-2xl transition-transform group-hover:scale-110 duration-300" [style.color]="p.color">{{ p.icon }}</span>
                      <span class="font-bold tracking-widest text-sm text-on-surface-variant-custom group-hover:text-[#E2E8F0] font-mono hover-underline-animate-pink pb-0.5">{{ p.name }}</span>
                    </button>
                  }
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <!-- ================= SECTION 2: GLOBAL COVERAGE MAP ================= -->
      <section class="space-y-6 text-left" id="global-coverage-map-section">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p class="font-mono text-xs text-[#DF80AC] mb-1 uppercase tracking-widest font-bold">Ecosystem Status</p>
            <h2 class="font-serif text-3xl md:text-4xl text-silver-leaf select-none">Global Coverage</h2>
          </div>
          
          <!-- Country Dropdown that automatically zooms map, supporting all 10 countries dynamically -->
          <div class="relative select-none z-[1000] min-w-[240px] shrink-0 font-mono">
            <button type="button"
                    (click)="toggleCountryDropdown()"
                    class="w-full flex items-center justify-between bg-midnight-charcoal border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 text-silver-leaf text-xs font-mono focus:outline-none focus:border-[#DF80AC] cursor-pointer transition-all">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm text-[#DF80AC]">public</span>
                <span>{{ calculator.activeCountry() === 'Global' ? 'Global View' : calculator.activeCountry() }}</span>
              </div>
              <span class="material-symbols-outlined text-sm text-on-surface-variant-custom transform transition-transform duration-200" [class.rotate-180]="isCountryDropdownOpen()">expand_more</span>
            </button>

            @if (isCountryDropdownOpen()) {
              <div class="absolute right-0 left-0 mt-1.5 max-h-60 overflow-y-auto bg-[#0F0F12]/95 border border-white/10 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.85)] py-1.5 text-xs font-mono backdrop-blur-md animate-fade-in divide-y divide-white/5 z-[9999] scrollbar-thin scrollbar-thumb-white/10">
                <button type="button"
                        (click)="selectCountry('Global')"
                        [ngClass]="calculator.activeCountry() === 'Global' ? 'bg-[#DF80AC]/10 text-[#DF80AC] font-bold' : 'text-on-surface-variant-custom hover:bg-white/5 hover:text-white'"
                        class="w-full px-4 py-2.5 text-left transition-colors duration-150 flex items-center justify-between cursor-pointer border-none bg-transparent">
                  <span>Global View</span>
                  @if (calculator.activeCountry() === 'Global') {
                    <span class="material-symbols-outlined text-xs text-[#DF80AC]">done</span>
                  }
                </button>
                @for (c of calculator.countrie_LatLang; track c.country) {
                  <button type="button"
                          (click)="selectCountry(c.country)"
                          [ngClass]="calculator.activeCountry() === c.country ? 'bg-[#DF80AC]/10 text-[#DF80AC] font-bold' : 'text-on-surface-variant-custom hover:bg-white/5 hover:text-white'"
                          class="w-full px-4 py-2.5 text-left transition-colors duration-150 flex items-center justify-between cursor-pointer border-none bg-transparent font-mono">
                    <span>{{ c.country }}</span>
                    @if (calculator.activeCountry() === c.country) {
                      <span class="material-symbols-outlined text-xs text-[#DF80AC]">done</span>
                    }
                  </button>
                }
              </div>
            }
          </div>
        </div>

        <!-- GIS World Map container utilizing live Leaflet.js matching exact styles requested -->
        <div class="relative h-[480px] bg-[#A9D0E2] rounded-2xl glass-panel overflow-hidden shadow-2xl group">
          
          <!-- Leaflet Interactive Div -->
          <div id="map_div" class="w-full h-full z-0"></div>

          <!-- Vertical Zoom +/- navigation controls floating exactly top-left as screenshot style over live map -->
          <div class="absolute top-4 left-4 z-[1000] flex flex-col bg-white text-slate-800 rounded-lg shadow-md overflow-hidden border border-slate-200">
            <button type="button" 
                    (click)="zoomIn()" 
                    title="Zoom In GIS Telemetry"
                    class="w-8 h-8 flex items-center justify-center font-sans font-semibold hover:bg-slate-50 border-b border-slate-100 text-[#475569] text-base focus:outline-none cursor-pointer border-none bg-white">
              +
            </button>
            <button type="button" 
                    (click)="zoomOut()" 
                    title="Zoom Out GIS Telemetry"
                    class="w-8 h-8 flex items-center justify-center font-sans font-semibold hover:bg-slate-50 text-[#475569] text-base focus:outline-none cursor-pointer border-none bg-white">
              -
            </button>
          </div>

          <!-- Floating Map filter FAB at top-right exactly as screenshot style removed -->

          <!-- Separate statistics display replacing the All Projects count overlay at bottom-left exactly as screenshot -->
          <div class="absolute bottom-4 left-4 z-[1001] bg-slate-950/85 backdrop-blur-md px-4.5 py-3 rounded-2xl border border-white/10 shadow-2xl text-left select-none font-mono min-w-[170px]">
            <span class="text-[9px] text-[#DF80AC] uppercase tracking-wider block mb-1.5 font-mono">Active Projects</span>
            <div class="space-y-1.5 font-mono text-[10px]">
              <button type="button" 
                      (click)="calculator.activeCategory.set('STRUCTURAL'); calculator.setTab('portfolio')"
                      class="w-full text-left bg-transparent p-0 border-none flex items-center justify-between gap-6 cursor-pointer hover:text-primary-custom transition-all duration-200 font-mono text-slate-300 hover:scale-[1.02] focus:outline-none">
                <span class="font-mono text-[9px] text-slate-400 font-medium">Structural</span>
                <span class="text-white  font-mono">{{ calculator.countryStats().structuralVal }}</span>
              </button>
              <button type="button" 
                      (click)="calculator.activeCategory.set('ARCHITECTURAL'); calculator.setTab('portfolio')"
                      class="w-full text-left bg-transparent p-0 border-none flex items-center justify-between gap-6 cursor-pointer hover:text-primary-custom transition-all duration-200 font-mono text-slate-300 hover:scale-[1.02] focus:outline-none">
                <span class="font-mono text-[9px] text-slate-400 font-medium">Architectural</span>
                <span class="text-white  font-mono">{{ calculator.countryStats().architecturalVal }}</span>
              </button>
              <button type="button" 
                      (click)="calculator.activeCategory.set('MEP'); calculator.setTab('portfolio')"
                      class="w-full text-left bg-transparent p-0 border-none flex items-center justify-between gap-6 cursor-pointer hover:text-primary-custom transition-all duration-200 font-mono text-slate-300 hover:scale-[1.02] focus:outline-none">
                <span class="font-mono text-[9px] text-slate-400 font-medium">MEP</span>
                <span class="text-white  font-mono">{{ calculator.countryStats().mepVal }}</span>
              </button>
            </div>
          </div>

          <!-- Country stats summary overlay at bottom-right -->
          <div class="hidden sm:block absolute right-4 bottom-4 z-[1000] max-w-xs glass-panel p-4 rounded-xl border border-white/5 bg-midnight-charcoal/90 text-left select-none shadow-2xl">
            <span class="font-mono text-[9px] text-primary-custom uppercase tracking-widest  block">Regional Scope</span>
            <p class="text-[11px] text-on-surface-variant-custom mt-2 leading-relaxed font-sans">
              {{ calculator.countryStats().description }}
            </p>
          </div>

        </div>
      </section>


        <!-- ================= SECTION 6: SERVICE SPECIFICATION TIERS ================= -->
      <section class="space-y-6 text-left pt-12 border-t border-white/5" id="service-sectors-tiers">
        <div>
          <p class="font-mono text-xs text-[#C86B98] mb-1 uppercase tracking-widest ">BIM SERVICE SECTORS</p>
          <h2 class="font-serif text-3xl md:text-4xl text-silver-leaf select-none font-bold">Our Services</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Card 1: MEP Pipeline Design -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 bg-midnight-charcoal/80 flex flex-col justify-between h-auto gap-6 transition-all hover:border-white/10 select-none">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[20px] text-[#DF80AC]">hub</span>
                </div>
                <span class="font-mono text-[9px] uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded font-mono">MEP</span>
              </div>
              
              <div>
                <h4 class="font-serif text-xl text-silver-leaf">MEP Pipeline Design</h4>
                <p class="text-xs text-on-surface-variant-custom leading-relaxed font-sans mt-2">
                  Mechanical mechanical flow grids, electrical cables, HVAC ducts.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 font-mono text-[10px]">
              <button type="button" 
                      (click)="calculator.activeMepTier.set('SMALL'); calculator.showNotification('MEP Tier calibrated to Small', 'success')"
                      [ngClass]="calculator.activeMepTier() === 'SMALL' ? 'bg-primary-custom text-on-primary-custom font-bold border-none' : 'bg-transparent border border-white/15 text-on-surface-variant-custom hover:border-white/25'"
                      class="py-3.5 rounded-xl text-center active:scale-95 transition-all outline-none cursor-pointer">
                <span class="block ">SMALL</span>
                <span class="block text-[9px] opacity-80 mt-0.5">$4.2K</span>
              </button>
              <button type="button" 
                      (click)="calculator.activeMepTier.set('MEDIUM'); calculator.showNotification('MEP Tier calibrated to Medium', 'success')"
                      [ngClass]="calculator.activeMepTier() === 'MEDIUM' ? 'bg-primary-custom text-on-primary-custom font-bold border-none' : 'bg-transparent border border-white/15 text-on-surface-variant-custom hover:border-white/25'"
                      class="py-3.5 rounded-xl text-center active:scale-95 transition-all outline-none cursor-pointer">
                <span class="block ">MEDIUM</span>
                <span class="block text-[9px] opacity-80 mt-0.5">$8.9K</span>
              </button>
              <button type="button" 
                      (click)="calculator.activeMepTier.set('LARGE'); calculator.showNotification('MEP Tier calibrated to Large', 'success')"
                      [ngClass]="calculator.activeMepTier() === 'LARGE' ? 'bg-primary-custom text-on-primary-custom font-bold border-none' : 'bg-transparent border border-white/15 text-on-surface-variant-custom hover:border-white/25'"
                      class="py-3.5 rounded-xl text-center active:scale-95 transition-all outline-none cursor-pointer">
                <span class="block ">LARGE</span>
                <span class="block text-[9px] opacity-80 mt-0.5">$15K+</span>
              </button>
            </div>
          </div>

          <!-- Card 2: Structural Frameworks -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 bg-midnight-charcoal/80 flex flex-col justify-between h-auto gap-6 transition-all hover:border-white/10 select-none">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[20px] text-[#e9c349]">foundation</span>
                </div>
                <span class="font-mono text-[9px] uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded font-mono">CIVIL</span>
              </div>
              
              <div>
                <h4 class="font-serif text-xl text-silver-leaf">Structural Frameworks</h4>
                <p class="text-xs text-on-surface-variant-custom leading-relaxed font-sans mt-2">
                  Seismic trusses, structural foundation beams, loading calculations.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 font-mono text-[10px]">
              <button type="button" 
                      (click)="calculator.activeStructuralTier.set('SMALL'); calculator.showNotification('Structural Tier calibrated to Small', 'success')"
                      [ngClass]="calculator.activeStructuralTier() === 'SMALL' ? 'bg-secondary-custom text-on-secondary-custom font-bold border-none' : 'bg-transparent border border-white/15 text-on-surface-variant-custom hover:border-white/25'"
                      class="py-3.5 rounded-xl text-center active:scale-95 transition-all outline-none cursor-pointer">
                <span class="block ">SMALL</span>
                <span class="block text-[9px] opacity-80 mt-0.5">$3.5K</span>
              </button>
              <button type="button" 
                      (click)="calculator.activeStructuralTier.set('MEDIUM'); calculator.showNotification('Structural Tier calibrated to Medium', 'success')"
                      [ngClass]="calculator.activeStructuralTier() === 'MEDIUM' ? 'bg-secondary-custom text-on-secondary-custom font-bold border-none' : 'bg-transparent border border-white/15 text-on-surface-variant-custom hover:border-white/25'"
                      class="py-3.5 rounded-xl text-center active:scale-95 transition-all outline-none cursor-pointer">
                <span class="block ">MEDIUM</span>
                <span class="block text-[9px] opacity-80 mt-0.5">$7.2K</span>
              </button>
              <button type="button" 
                      (click)="calculator.activeStructuralTier.set('LARGE'); calculator.showNotification('Structural Tier calibrated to Large', 'success')"
                      [ngClass]="calculator.activeStructuralTier() === 'LARGE' ? 'bg-secondary-custom text-on-secondary-custom font-bold border-none' : 'bg-transparent border border-white/15 text-on-surface-variant-custom hover:border-white/25'"
                      class="py-3.5 rounded-xl text-center active:scale-95 transition-all outline-none cursor-pointer">
                <span class="block ">LARGE</span>
                <span class="block text-[9px] opacity-80 mt-0.5">$12K+</span>
              </button>
            </div>
          </div>

          <!-- Card 3: Envelope & Elevation -->
          <div class="glass-panel p-6 rounded-2xl border border-white/5 bg-midnight-charcoal/80 flex flex-col justify-between h-auto gap-6 transition-all hover:border-white/10 select-none">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[20px] text-primary-custom">architecture</span>
                </div>
                <span class="font-mono text-[9px] uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded font-mono">AESTHETIC</span>
              </div>
              
              <div>
                <h4 class="font-serif text-xl text-silver-leaf">Envelope & Elevation</h4>
                <p class="text-xs text-on-surface-variant-custom leading-relaxed font-sans mt-2">
                  Facade geometries, modular furniture layouts, landscaping contours.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 font-mono text-[10px]">
              <button type="button" 
                      (click)="calculator.activeArchitecturalTier.set('SMALL'); calculator.showNotification('Architectural Tier calibrated to Small', 'success')"
                      [ngClass]="calculator.activeArchitecturalTier() === 'SMALL' ? 'bg-[#cd79a3] text-midnight-charcoal font-bold border-none' : 'bg-transparent border border-white/15 text-on-surface-variant-custom hover:border-white/25'"
                      class="py-3.5 rounded-xl text-center active:scale-95 transition-all outline-none cursor-pointer">
                <span class="block ">SMALL</span>
                <span class="block text-[9px] opacity-80 mt-0.5">$5.0K</span>
              </button>
              <button type="button" 
                      (click)="calculator.activeArchitecturalTier.set('MEDIUM'); calculator.showNotification('Architectural Tier calibrated to Medium', 'success')"
                      [ngClass]="calculator.activeArchitecturalTier() === 'MEDIUM' ? 'bg-[#cd79a3] text-midnight-charcoal font-bold border-none' : 'bg-transparent border border-white/15 text-[#c5c6d0] hover:border-white/25'"
                      class="py-3.5 rounded-xl text-center active:scale-95 transition-all outline-none cursor-pointer">
                <span class="block ">MEDIUM</span>
                <span class="block text-[9px] opacity-80 mt-0.5">$11K</span>
              </button>
              <button type="button" 
                      (click)="calculator.activeArchitecturalTier.set('LARGE'); calculator.showNotification('Architectural Tier calibrated to Large', 'success')"
                      [ngClass]="calculator.activeArchitecturalTier() === 'LARGE' ? 'bg-[#cd79a3] text-midnight-charcoal font-bold border-none' : 'bg-transparent border border-white/15 text-on-surface-variant-custom hover:border-white/25'"
                      class="py-3.5 rounded-xl text-center active:scale-95 transition-all outline-none cursor-pointer">
                <span class="block ">LARGE</span>
                <span class="block text-[9px] opacity-80 mt-0.5">$20K+</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      <!-- Pricing Quick Link summary segment preserved for seamless calculations flow -->
      <section class="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 bg-midnight-charcoal/30 border border-primary-custom/10 select-none text-left" id="pricing-summary-cta">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-primary-custom text-[28px] animate-pulse">analytics</span>
          <div>
            <p class="font-mono text-[9px] text-primary-custom uppercase tracking-widest">Live Synthesis State</p>
            <h4 class="font-serif text-base text-silver-leaf mt-1 animate-pulse">Accumulated Quick Tier Target Estimate System</h4>
          </div>
        </div>
        <div class="flex items-center gap-4 text-right">
          <span class="font-mono text-3.5xl text-primary-custom font-normal select-all">\${{ getTotal() | number }}</span>
          <button type="button" 
                  (click)="calculator.setTab('config'); calculator.showNotification('Linked securely to comprehensive estimators.', 'info')"
                  class="bg-white/5 hover:bg-primary-custom hover:text-on-primary-custom p-3.5 rounded-xl transition-all duration-300 border border-white/10 flex items-center justify-center focus:outline-none cursor-pointer">
            <span class="material-symbols-outlined text-xs">tune</span>
          </button>
        </div>
      </section>

       <!-- ================= SECTION 4: STREAMLINED OS VIEWPORTS ================= -->
      <section class="space-y-6 pt-12 border-t border-white/5 text-left select-none" id="operating-system-viewports-section">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div>
            <p class="font-mono text-xs text-primary-custom mb-1 uppercase tracking-widest">Streamlined Operating System</p>
            <h3 class="font-serif text-2xl md:text-3xl text-silver-leaf">View, Order, Share, Export.</h3>
          </div>
          <p class="max-w-md text-xs text-on-surface-variant-custom leading-relaxed font-sans">
            A frictionless cloud journey from laser point-cloud site capture to enterprise-level architecture asset management.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <!-- Item 01 -->
          <div class="glass-panel p-5 rounded-xl border border-white/5 relative flex flex-col gap-6 hover:border-primary-custom/25 transition-all">
            <span class="font-mono text-xs text-primary-custom/40 text-right block">01 / ACCESS</span>
            <div>
              <h5 class="font-serif text-[18px] text-silver-leaf font-bold">View</h5>
              <p class="text-[11px] text-on-surface-variant-custom mt-2 leading-relaxed">
                Inspect every corner of your modeled facility layout in high-definition interactive 3D structures and layered 2D floorplans.
              </p>
            </div>
          </div>

          <!-- Item 02 -->
          <div class="glass-panel p-5 rounded-xl border border-white/5 relative flex flex-col gap-6 hover:border-primary-custom/25 transition-all">
            <span class="font-mono text-xs text-primary-custom/40 text-right block">02 / DEMAND</span>
            <div>
              <h5 class="font-serif text-[18px] text-silver-leaf font-bold">Order</h5>
              <p class="text-[11px] text-on-surface-variant-custom mt-2 leading-relaxed">
                Request new surveys or 3D coordinate model updates with an instant calculator. No traditional tedious RFPs required.
              </p>
            </div>
          </div>

          <!-- Item 03 -->
          <div class="glass-panel p-5 rounded-xl border border-white/5 relative flex flex-col gap-6 hover:border-[#DF80AC]/25 transition-all">
            <span class="font-mono text-xs  text-[#DF80AC]/40 text-right block">03 / COLLABORATION</span>
            <div>
              <h5 class="font-serif text-[18px] text-silver-leaf font-bold">Share</h5>
              <p class="text-[11px] text-on-surface-variant-custom mt-2 leading-relaxed">
                Collaborate securely with external engineers and sub-consultants using expiring tokens and revocable access links.
              </p>
            </div>
          </div>

          <!-- Item 04 -->
          <div class="glass-panel p-5 rounded-xl border border-white/5 relative flex flex-col gap-6 hover:border-[#e9c349]/25 transition-all">
            <span class="font-mono text-xs text-[#e9c349]/40 text-right block">04 / INTEGRATION</span>
            <div>
              <h5 class="font-serif text-[18px] text-silver-leaf font-bold">Export</h5>
              <p class="text-[11px] text-on-surface-variant-custom mt-2 leading-relaxed">
                Direct native API integration with Autodesk Construction Cloud (ACC), Procore, and Bentley ProjectWise repositories.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= SECTION 3: INTEGRATED BROWSER SECTION ================= -->
      <section class="space-y-8 text-left" id="integrated-browser-section">
        <div>
          <p class="font-mono text-xs text-[#DF80AC] bg-[#DF80AC]/10 border border-[#DF80AC]/15 px-2.5 py-1 rounded inline-block uppercase tracking-widest text-left scale-95 origin-left">File Delivery Engine</p>
          <h2 class="font-serif text-3xl md:text-4xl text-silver-leaf mt-2 select-none">Integrated browser-based viewer</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left side column: LOD 350 Revit View Mockup precisely designed after visual cues -->
          <div class="lg:col-span-7 bg-[#111215] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[400px] relative select-none">
            
            <!-- Heading bars -->
            <div class="px-5 py-3.5 bg-background-custom border-b border-white/5 flex items-center justify-between font-mono text-xs shrink-0">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary-custom text-sm">architecture</span>
                <span class="font-bold text-silver-leaf uppercase tracking-wider text-[11px]">{{ activeModel().title }} Viewer</span>
              </div>
            </div>

            <!-- Interactivity Area containing isometric structural renders -->
            <div class="flex-1 relative overflow-hidden bg-gradient-to-br from-[#0c0d10] to-[#1a1c22]">
              
              <!-- Realistic technical design mockup thumbnail background -->
              <img alt="LOD 350 high-fidelity structural building visualizer mockup render" 
                   class="w-full h-full object-cover grayscale opacity-75 transform hover:scale-105 transition-transform duration-1000 ease-out pointer-events-none" 
                   [src]="activeModel().image"/>

              <div class="absolute inset-0 bg-gradient-to-t from-[#0e0f11]/95 via-transparent to-transparent z-10 pointer-events-none"></div>

              

              <!-- Bottom coordinates alignment HUD display -->
              <div class="absolute bottom-4 left-4 z-20 flex flex-col font-mono text-[9px] text-on-surface-variant-custom">
                <p class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[12px] text-[#DF80AC]" style="font-variation-settings: 'FILL' 1;">verified</span>
                  <span>{{ activeModel().alignment }}</span>
                </p>
              </div>

              <!-- Interactive anchor cycle trigger button layout -->
              <div class="absolute bottom-4 right-4 z-20">
                <button type="button" 
                        (click)="cycleModel()" 
                        class="bg-[#191D24] text-silver-leaf border border-white/20 hover:border-white/40 hover:bg-[#20252F] font-mono text-[9px] font-bold uppercase tracking-widest py-2 px-3.5 rounded-lg flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all focus:outline-none select-none">
                  <span>Load different building</span>
                  <span class="material-symbols-outlined text-[12px] font-bold">arrow_forward</span>
                </button>
                
              </div>

            </div>

          </div>

          <!-- Right side column: Stacked precision metadata cards exactly as reference listing -->
          <div class="lg:col-span-5 space-y-4">
            
            <!-- Card 1 -->
            <div class="glass-panel p-5 rounded-xl border border-white/5 hover:border-primary-custom/25 transition-all group hover:bg-[#151619]/40 animate-fade-slide-up opacity-0" style="animation-delay: 60ms;">
              <div class="flex items-center gap-3 mb-2 font-mono">
                <span class="material-symbols-outlined text-primary-custom" style="font-variation-settings: 'FILL' 1;">architecture</span>
                <h4 class="font-serif text-lg text-silver-leaf font-bold">Native CAD Precision</h4>
              </div>
              <p class="text-xs text-on-surface-variant-custom leading-relaxed font-sans">
                Instant access to layered DWG files directly within the platform. Inspect structural vectors quickly without high-overhead software installations.
              </p>
            </div>

            <!-- Card 2 -->
            <div class="glass-panel p-5 rounded-xl border border-white/5 hover:border-[#DF80AC]/25 transition-all group hover:bg-[#151619]/40 animate-fade-slide-up opacity-0" style="animation-delay: 140ms;">
              <div class="flex items-center gap-3 mb-2 font-mono">
                <span class="material-symbols-outlined text-[#DF80AC]" style="font-variation-settings: 'FILL' 1;">photo_camera_back</span>
                <h4 class="font-serif text-lg text-silver-leaf font-bold">360° Continuity</h4>
              </div>
              <p class="text-xs text-on-surface-variant-custom leading-relaxed font-sans">
                Navigate immersive high-resolution 360° survey photography linked directly to multi-level CAD floorplans for verified remote field site coordination.
              </p>
            </div>

            <!-- Card 3 -->
            <div class="glass-panel p-5 rounded-xl border border-white/5 hover:border-[#e9c349]/25 transition-all group hover:bg-[#151619]/40 animate-fade-slide-up opacity-0" style="animation-delay: 220ms;">
              <div class="flex items-center gap-3 mb-2 font-mono">
                <span class="material-symbols-outlined text-[#e9c349]">sync</span>
                <h4 class="font-serif text-lg text-silver-leaf font-bold">BIM Coordination</h4>
              </div>
              <p class="text-xs text-on-surface-variant-custom leading-relaxed font-sans">
                Automated synchronization between scanning stakeholders and remote modeling engineers ensuring everyone works with zero-delay data accuracy.
              </p>
            </div>

          </div>

        </div>
      </section>

     
      <!-- ================= SECTION 5: TECHNICAL ARCHIVE RECENT DEPLOYMENTS ================= -->
      <section class="space-y-6 text-left pt-12 border-t border-white/5" id="technical-archive-section">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-mono text-xs text-[#C86B98] mb-1 uppercase tracking-widest">RECENT DEPLOYMENTS</p>
            <h2 class="font-serif text-3xl md:text-chart-font-custom text-silver-leaf select-none font-bold">Technical Archive</h2>
          </div>
          <button type="button" 
                  (click)="calculator.setTab('portfolio')"
                  class="font-mono text-[10px] uppercase text-on-surface-variant-custom hover:text-white flex items-center gap-1.5 bg-transparent border-none cursor-pointer focus:outline-none transition-colors tracking-widest">
            <span>VIEW_ALL</span>
            <span class="material-symbols-outlined text-xs font-bold">arrow_forward</span>
          </button>
        </div>

        <div class="grid grid-cols-1 gap-3 font-mono">
          <!-- Project 1 -->
          <button type="button" (click)="calculator.openArchiveProject('Vertex', 'MEP', 'Opening archive node: PROJECT_001 The Vertex Pavilion')"
               style="animation-delay: 50ms;"
               class="w-full text-left bg-transparent p-0 flex items-center justify-between p-4 bg-midnight-charcoal/40 border border-white/5 hover:border-white/15 hover:bg-midnight-charcoal/60 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(218,225,255,0.04)] rounded-xl cursor-pointer transition-all duration-300 group select-none focus:outline-none animate-fade-slide-up opacity-0">
            <div class="flex items-center gap-4">
              <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=120&q=80" 
                   alt="The Vertex Pavilion" 
                   class="w-14 h-14 object-cover rounded-lg grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-300" 
                   referrerpolicy="no-referrer" />
              <div class="text-left">
                <span class="text-[9px] text-[#DF80AC] uppercase font-mono tracking-wider block">PROJECT_001</span>
                <h4 class="text-sm font-serif text-silver-leaf font-bold group-hover:text-primary-custom transition-colors mt-0.5">
                  <span class="hover-underline-animate pb-0.5">The Vertex Pavilion</span>
                </h4>
                <p class="text-[11px] text-on-surface-variant-custom/70 font-sans mt-0.5 leading-normal">Modernist corporate workspace with integrated climate systems.</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant-custom group-hover:text-white transition-colors transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-300 shrink-0">north_east</span>
          </button>

          <!-- Project 2 -->
          <button type="button" (click)="calculator.openArchiveProject('Obsidian', 'STRUCTURAL', 'Opening archive node: PROJECT_005 Obsidian Terminal')"
               style="animation-delay: 110ms;"
               class="w-full text-left bg-transparent p-0 flex items-center justify-between p-4 bg-midnight-charcoal/40 border border-white/5 hover:border-white/15 hover:bg-midnight-charcoal/60 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(218,225,255,0.04)] rounded-xl cursor-pointer transition-all duration-300 group select-none focus:outline-none animate-fade-slide-up opacity-0">
            <div class="flex items-center gap-4">
              <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=120&q=80" 
                   alt="Obsidian Terminal" 
                   class="w-14 h-14 object-cover rounded-lg grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-300" 
                   referrerpolicy="no-referrer" />
              <div class="text-left">
                <span class="text-[9px] text-[#DF80AC] uppercase font-mono tracking-wider block">PROJECT_005</span>
                <h4 class="text-sm font-serif text-silver-leaf font-bold group-hover:text-primary-custom transition-colors mt-0.5">
                  <span class="hover-underline-animate pb-0.5">Obsidian Terminal</span>
                </h4>
                <p class="text-[11px] text-on-surface-variant-custom/70 font-sans mt-0.5 leading-normal">Brutalist concrete architecture combined with daylight shafts.</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant-custom group-hover:text-white transition-colors transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-300 shrink-0">north_east</span>
          </button>

          <!-- Project 3 -->
          <button type="button" (click)="calculator.openArchiveProject('Flux', 'ARCHITECTURAL', 'Opening archive node: PROJECT_016 Flux Residential')"
               style="animation-delay: 170ms;"
               class="w-full text-left bg-transparent p-0 flex items-center justify-between p-4 bg-midnight-charcoal/40 border border-white/5 hover:border-white/15 hover:bg-midnight-charcoal/60 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(218,225,255,0.04)] rounded-xl cursor-pointer transition-all duration-300 group select-none focus:outline-none animate-fade-slide-up opacity-0">
            <div class="flex items-center gap-4">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" 
                   alt="Flux Residential" 
                   class="w-14 h-14 object-cover rounded-lg grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-300" 
                   referrerpolicy="no-referrer" />
              <div class="text-left">
                <span class="text-[9px] text-[#DF80AC] uppercase font-mono tracking-wider block">PROJECT_016</span>
                <h4 class="text-sm font-serif text-silver-leaf font-bold group-hover:text-primary-custom transition-colors mt-0.5">
                  <span class="hover-underline-animate pb-0.5 font-bold">Flux Residential</span>
                </h4>
                <p class="text-[11px] text-on-surface-variant-custom/70 font-sans mt-0.5 leading-normal">High-end architecture showcasing high strength structural frames.</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant-custom group-hover:text-white transition-colors transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-300 shrink-0">north_east</span>
          </button>
        </div>
      </section>

    

    </div>
  `,
})
export class Home {
  calculator = inject(SpatialCostCalculator);
  platformId = inject(PLATFORM_ID);

  // Map instance and markers
  map: unknown = null;
  leafletInstance: unknown = null;
  markers: unknown[] = [];

  // Active Revit 3D wireframe mockup models tracking index
  selectedModelIndex = signal<number>(0);
  isCountryDropdownOpen = signal<boolean>(false);

  // Strategic partnership nodes
  partners = [
    { name: 'Digital Twin', icon: 'layers', color: '#DF80AC' },
    { name: 'AxisXD', icon: 'grid_view', color: '#C86B98' },
    { name: 'Autodesk 360', icon: 'architecture', color: '#e9c349' },
    { name: 'Bentley Systems', icon: 'deployed_code', color: '#2dd4bf' },
    { name: 'Trimble Vico', icon: 'construction', color: '#3b82f6' },
  ];

  // Constant speed marquee: ~80px/s regardless of item count
  marqueeDuration = computed(() => {
    const itemWidth = 180;
    const gap = 64;
    const setWidth = this.partners.length * (itemWidth + gap);
    return Math.max(setWidth / 80, 3);
  });

  toggleCountryDropdown() {
    this.isCountryDropdownOpen.update(v => !v);
  }

  // Geographic coordinates projection points mapped relatively by % position over image landmasses
  get pins() {
    const list: { id: string; name: string; country: string; lat: number; lon: number; type: string }[] = [];
    this.calculator.countrie_LatLang.forEach(c => {
      if (c && c.locations) {
        c.locations.forEach((loc, idx) => {
          if (!loc) return;
          let pinType = 'STRUCTURAL';
          if (idx % 3 === 1) pinType = 'ARCHITECTURAL';
          if (idx % 3 === 2) pinType = 'MEP';

          const latNum = Number(loc.lat);
          const lonNum = Number(loc.lon);

          if (!isNaN(latNum) && !isNaN(lonNum)) {
            list.push({
              id: `${c.country.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${idx}`,
              name: loc.name || 'Unknown Location',
              country: c.country,
              lat: latNum,
              lon: lonNum,
              type: pinType
            });
          }
        });
      }
    });
    return list;
  }

  // High quality digital architecture assets mapped to cycle through upon load different building triggers
  models = [
    {
      title: 'Crystal Atrium',
      format: '.RVT / .DWG',
      precision: '+/- 1.5mm',
      type: 'ARCHITECTURAL',
      activeLayer: 'Daylight Analysis Axis Active',
      size: '12,000 SQ FT',
      alignment: 'Coordinate alignment verified (WGS84 GPS grid)',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRWYGczuRNVoLApBph6t_QACwT__PN5xdqb5KbDa3JsJ0tH3rLbbrgGyi_1V6HJ2xYX4410dXoSWmUSYCpisKcsGbSX88OXypSEANhuBn8BudnwmlIrCYNhTjT7j84ogwNxG1GBVe6ITJ_IglZtLd9uFThp3IpbccQ-XhB-kDfy_W3AbswscbGT-v_-oo0oEBqdWbF7CrIe9t9hOi3Bo71Yio41IDiWOirzTMYhCReQ2dPcZj6NYGHGHWwqrDfMPYOtPYXQcRRgY8'
    },
    {
      title: 'Monolith Terminal',
      format: '.RVT / .IFC',
      precision: '+/- 2.0mm',
      type: 'STRUCTURAL',
      activeLayer: 'Structural Concrete Skeletons Active',
      size: '33,023 SQ FT',
      alignment: 'Structural load telemetry verified securely',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRFkC6_hFVn7b-agjpn9iKPpfmErl8szxOLnn5K6wfH1mNgngYgHEddNwt2QBFjktDwHrgXoQSCWROAbuZp_bVltApbslk8lXqSU4qGyoRGE9DRluSiwG2lYJ1qoXU6oi1vVfcFWsvvK7WaN_oQs9YFcjpV6nDBUljI3DW_i-NybLNSjlg0cJrR09nSG9fVPo4E5R4TLur-IcV9Q-y-5nYxqN0ytBcqCVOjc2V7WMnKAmp2M71URgmXwB7RY8uxxCmsyKdhfZenYY'
    },
    {
      title: 'Vertex HQ Pipeline',
      format: '.RVT / .NWD',
      precision: '+/- 1.0mm',
      type: 'MEP',
      activeLayer: 'HVAC Duct Network Thermal Map Active',
      size: '30,423 SQ FT',
      alignment: 'MEP pressure parameters balanced via local OS',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiEiH9mgVilqvzCWFFc_H37omBy7ubmxexHym6TptnLIN4cRnPoG2ls2e6fRqmMrupPx-m_yqmiU4ffXbQRXuspuWVDvopddTOjnYdlPqtNSDB_z-5HerYQ42cYtcPMazbu1aYtTGPMgh4ayFwCR3-o-dQklVuMK44BpyLxuTMXtYAQ3FWkmojnTKtJb7WQfIN_h7W6Hvgn-XZug1z5WxhJ5KIwvq7igLe4wqkQXlUjyIgAQlM-7AGMDixBPvsO9QsU3ws8YPb-mU'
    }
  ];

  activeModel = computed(() => this.models[this.selectedModelIndex()]);

  constructor() {
    afterNextRender(() => {
      this.initMap();
    });
  }

  async initMap() {
    if (isPlatformBrowser(this.platformId)) {
      const LObj = await import('leaflet');
      const L = LObj.default || LObj;
      this.leafletInstance = L;

      const el = document.getElementById('map_div');
      if (!el || (el as any)._leaflet_id) return;

      let mapInstance: any;
      try {
        mapInstance = L.map('map_div', {
          center: [25, 10],
          zoom: 2,
          minZoom: 1.5,
          maxZoom: 14,
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          touchZoom: false
        });
      } catch {
        return;
      }
      this.map = mapInstance;

      // L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      //   attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      // }).addTo(mapInstance);

      L.tileLayer('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      this.createMarkers(L);
      this.updateMapViewForSelectedCountry();
    }
  }

  createMarkers(LObj: unknown) {
    const L = LObj as typeof import('leaflet');

    // Typecast markers to clear them
    const currentMarkers = this.markers as import('leaflet').Marker[];
    currentMarkers.forEach(m => {
      try {
        m.remove();
      } catch {
        console.info('Marker removal ignored or marker already detached');
      }
    });
    this.markers = [];

    const customIcon = L.divIcon({
      html: `
        <div class="relative w-7 h-7 flex items-center justify-center group">
          <svg class="w-7 h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transform transition-transform duration-300 group-hover:scale-[1.15]" viewBox="0 0 24 24" fill="none" style="display: block;">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#DF80AC"/>
            <circle cx="12" cy="9" r="2.8" fill="#FFFFFF"/>
          </svg>
        </div>
      `,
      className: 'custom-leaflet-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28]
    });

    this.pins.forEach(pin => {
      const latVal = Number(pin.lat);
      const lonVal = Number(pin.lon);
      if (isNaN(latVal) || isNaN(lonVal)) {
        return;
      }

      try {
        const marker = L.marker([latVal, lonVal], { icon: customIcon });

        const markerObj = marker as unknown as Record<string, unknown>;
        markerObj['customPinData'] = pin;

        marker.bindPopup(`
          <div class="font-sans text-xs p-1 text-slate-100 select-none">
            <strong class="text-white block border-b border-white/10 pb-1 mb-1 text-[13px]">${pin.name}</strong>
            <div class="text-[9px] text-[#DF80AC] uppercase font-mono tracking-wider font-bold mt-1">${pin.type}</div>
            <div class="text-[10px] text-slate-400 mt-1 font-mono">COUNTRY: ${pin.country}</div>
          </div>
        `, {
          closeButton: false,
          offset: [0, -10]
        });

        marker.on('click', () => {
          this.onPinClick(pin);
        });

        this.markers.push(marker);
      } catch (e) {
        console.warn('Marker instantiation skipped for safety:', pin, e);
      }
    });

    this.filterMarkers();
  }

  filterMarkers() {
    if (!this.map) return;
    const activeCountry = this.calculator.activeCountry();
    const mapIns = this.map as import('leaflet').Map;

    const currentMarkers = this.markers as (import('leaflet').Marker & { customPinData?: { id: string; name: string; country: string; lat: number; lon: number; type: string } })[];

    currentMarkers.forEach(marker => {
      const pin = marker.customPinData;
      if (pin) {
        if (activeCountry === 'Global' || pin.country === activeCountry) {
          marker.addTo(mapIns);
        } else {
          marker.remove();
        }
      }
    });
  }

  updateMapViewForSelectedCountry() {
    if (!this.map || !this.leafletInstance) return;

    try {
      const country = this.calculator.activeCountry();
      const mapIns = this.map as import('leaflet').Map;
      const L = this.leafletInstance as typeof import('leaflet');

      if (country === 'Global') {
        mapIns.flyTo([25, 10], 2, { duration: 1.5 });
      } else {
        const countryItem = this.calculator.countrie_LatLang.find(item => item.country === country);
        if (countryItem && countryItem.bounding_box) {
          const bbox = countryItem.bounding_box;
          const lat1 = Number(bbox[1]);
          const lon1 = Number(bbox[0]);
          const lat2 = Number(bbox[3]);
          const lon2 = Number(bbox[2]);

          if (!isNaN(lat1) && !isNaN(lon1) && !isNaN(lat2) && !isNaN(lon2)) {
            const bounds = L.latLngBounds(L.latLng(lat1, lon1), L.latLng(lat2, lon2));
            mapIns.flyToBounds(bounds, {
              padding: [50, 50],
              duration: 1.5,
              maxZoom: 6
            });
          } else {
            // Safe fallback center in case bbox elements are NaN
            mapIns.flyTo([25, 10], 3, { duration: 1.5 });
          }
        } else {
          const activeCoordinates: [number, number][] = [];
          this.pins.forEach(pin => {
            if (pin.country === country) {
              const latNum = Number(pin.lat);
              const lonNum = Number(pin.lon);
              if (!isNaN(latNum) && !isNaN(lonNum)) {
                activeCoordinates.push([latNum, lonNum]);
              }
            }
          });

          if (activeCoordinates.length > 0) {
            const bounds = L.latLngBounds(activeCoordinates.map(coords => L.latLng(coords[0], coords[1])));
            mapIns.flyToBounds(bounds, {
              padding: [50, 50],
              duration: 1.5,
              maxZoom: 6
            });
          } else {
            // No valid pin coordinates fallback
            mapIns.flyTo([25, 10], 2, { duration: 1.5 });
          }
        }
      }
    } catch (e) {
      console.warn('Map zoom/pan failed safely:', e);
    }
  }

  getMepSelectedCost() {
    return this.calculator.mepTiers[this.calculator.activeMepTier()].costValue;
  }

  getStructuralSelectedCost() {
    return this.calculator.structuralTiers[this.calculator.activeStructuralTier()].costValue;
  }

  getArchitecturalSelectedCost() {
    return this.calculator.architecturalTiers[this.calculator.activeArchitecturalTier()].costValue;
  }

  getTotal() {
    return this.getMepSelectedCost() + this.getStructuralSelectedCost() + this.getArchitecturalSelectedCost();
  }

  watchDemo() {
    this.calculator.showNotification('Launching HD BIM Platform VR Multi-player Simulator...', 'success');
  }

  cycleModel() {
    this.selectedModelIndex.update(idx => (idx + 1) % this.models.length);
    this.calculator.showNotification(`Loaded high-definition model node: ${this.activeModel().title}`, 'success');
  }

  selectCountry(country: string) {
    this.calculator.activeCountry.set(country);
    this.isCountryDropdownOpen.set(false);
    this.calculator.showNotification(`GIS Telemetry: Coordinate viewport shifted to ${country}`, 'info');
    this.filterMarkers();
    this.updateMapViewForSelectedCountry();
  }

  zoomIn() {
    if (this.map) {
      (this.map as import('leaflet').Map).zoomIn();
    }
  }

  zoomOut() {
    if (this.map) {
      (this.map as import('leaflet').Map).zoomOut();
    }
  }

  toggleOverlayFilter() {
    this.calculator.showNotification('Map visual filters customized successfully across regions.', 'success');
  }

  onPinClick(pin: { id: string; name: string; country: string; lat: number; lon: number; type: string }) {
    this.calculator.showNotification(`Map synchronized with node: ${pin.name} (${pin.type} - ${pin.country})`, 'success');
    if (this.map && this.leafletInstance) {
      const mapIns = this.map as import('leaflet').Map;
      const L = this.leafletInstance as typeof import('leaflet');
      const latVal = Number(pin.lat);
      const lonVal = Number(pin.lon);
      if (!isNaN(latVal) && !isNaN(lonVal)) {
        try {
          mapIns.setView(L.latLng(latVal, lonVal), 5, { animate: true, duration: 1 });
        } catch (e) {
          console.warn('setView failed safely:', e);
        }
      }
    }
  }
}
