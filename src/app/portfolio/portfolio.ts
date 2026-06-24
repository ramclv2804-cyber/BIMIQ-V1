import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-portfolio',
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in text-left">
      <!-- Portfolio Header & Category Filters -->
      <header class="mb-8 md:mb-12 text-left">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-2">
            <span class="font-mono text-xs text-secondary-custom uppercase tracking-widest block">Technical Archive</span>
            <h1 class="font-serif text-2xl md:text-5xl text-silver-leaf leading-none">Project Portfolio</h1>
            <p class="text-[11px] md:text-xs text-on-surface-variant-custom max-w-md">Filtered grid catalog database containing precision-engineered CAD references.</p>
          </div>

          <div class="flex flex-col gap-4 w-full md:w-auto">
            <!-- Search field input -->
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant-custom text-[20px]">search</span>
              <input 
                [value]="calculator.searchQuery()"
                (input)="calculator.searchQuery.set($any($event.target).value)"
                class="w-full md:w-80 bg-surface-container-low/50 border border-outline-variant-custom rounded-full py-2.5 pl-12 pr-6 text-xs font-sans tracking-wide text-silver-leaf focus:outline-none focus:border-primary-custom focus:ring-1 focus:ring-primary-custom transition-all backdrop-blur-md" 
                placeholder="Search parameters..." 
                type="text"/>
              @if (calculator.searchQuery()) {
                <button type="button" (click)="calculator.searchQuery.set('')" class="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant-custom hover:text-silver-leaf bg-transparent border-none cursor-pointer">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
              }
            </div>

            <!-- Categories tags -->
            <div class="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              @for (cat of ['ALL PROJECTS', 'MEP', 'ARCHITECTURAL', 'STRUCTURAL']; track cat) {
                <button 
                  type="button"
                  (click)="calculator.activeCategory.set(cat)"
                  [style.animation-delay]="($index * 50) + 'ms'"
                  class="px-3 md:px-4 py-1.5 rounded-full font-mono text-[9px] md:text-[10px] tracking-widest transition-all duration-250 hover:scale-[1.05] active:scale-[0.95] whitespace-nowrap border cursor-pointer animate-fade-slide-up opacity-0 shrink-0"
                  [ngClass]="calculator.activeCategory() === cat ? 'bg-primary-custom text-on-primary-custom border-primary-custom shadow-[0_4px_15px_rgba(218,225,255,0.15)] font-bold' : 'border-silver-leaf/15 text-on-surface-variant-custom hover:border-white/30 hover:bg-white/5'">
                  {{ cat }}
                </button>
              }
            </div>
          </div>
        </div>
      </header>

      <!-- Active Database Results Info -->
      <div class="mb-4 md:mb-6 flex justify-between items-center bg-midnight-charcoal/20 border border-white/5 rounded-xl px-3 md:px-4 py-2 font-mono text-[8px] md:text-[10px] text-on-surface-variant-custom tracking-wider select-none">
        <span>GRID METRICS SYNCHRONIZED</span>
        <span class="text-primary-custom">{{ calculator.filteredProjects().length }} MATCHING PROJECTS</span>
      </div>

      <!-- Portfolio Projects Grid -->
      @if (calculator.filteredProjects().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 text-left">
          @for (proj of calculator.filteredProjects(); track proj.id) {
            <article [style.animation-delay]="($index * 60) + 'ms'" class="glass-panel rounded-xl overflow-hidden group hover:border-primary-custom/30 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(218,225,255,0.08)] transition-all duration-300 animate-fade-slide-up opacity-0">
              <div class="relative h-60 overflow-hidden">
                <img 
                  [alt]="proj.title" 
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" 
                  [src]="proj.image"/>
                <div class="absolute top-4 left-4">
                  <span class="px-2.5 py-1 bg-midnight-charcoal/90 backdrop-blur-md text-primary-custom font-mono text-[9px] tracking-wider rounded border border-primary-custom/20">
                    {{ proj.category }}
                  </span>
                </div>
              </div>
              
              <div class="p-4 md:p-6 space-y-3 md:space-y-4 inner-bevel bg-midnight-charcoal/40">
                <div class="flex justify-between items-start">
                  <h3 class="font-serif text-base md:text-lg text-silver-leaf font-bold">
                    <span class="hover-underline-animate pb-0.5">{{ proj.title }}</span>
                  </h3>
                  <span class="font-mono text-[11px] text-on-surface-variant-custom">{{ proj.date }}</span>
                </div>
                <p class="text-[11px] md:text-xs text-on-surface-variant-custom leading-relaxed font-sans min-h-[28px] md:min-h-[36px]">{{ proj.description }}</p>
                
                <div class="pt-3 md:pt-4 flex justify-between border-t border-silver-leaf/10 font-mono text-[11px] md:text-xs">
                  <div class="flex flex-col">
                    <span class="text-[8px] md:text-[9px] text-on-surface-variant-custom uppercase tracking-wider block">Typology</span>
                    <span class="text-silver-leaf block mt-0.5">{{ proj.typology }}</span>
                  </div>
                  <div class="flex flex-col text-right">
                    <span class="text-[8px] md:text-[9px] text-on-surface-variant-custom uppercase tracking-wider block">Magnitude</span>
                    <span class="text-primary-custom select-all block mt-0.5">{{ proj.magnitude }}</span>
                  </div>
                </div>
              </div>
            </article>
          }
        </div>

       
      } @else {
        <div class="glass-panel p-8 md:p-12 text-center rounded-2xl border border-dashed border-silver-leaf/10">
          <span class="material-symbols-outlined text-3xl md:text-4xl text-primary-custom/50 animate-pulse">database_off</span>
          <p class="font-mono text-[11px] md:text-xs text-silver-leaf mt-3">No matching nodes found for your exact parameters.</p>
          <button type="button" (click)="calculator.searchQuery.set(''); calculator.activeCategory.set('ALL PROJECTS')" class="mt-4 text-xs font-mono text-primary-custom underline bg-transparent border-none cursor-pointer">
            Reset filter criteria
          </button>
        </div>
      }

      
    </div>
  `,
})
export class Portfolio {
  calculator = inject(SpatialCostCalculator);

  triggerArchiveDownload() {
    this.calculator.showNotification('Full Technical Archive compilation requested...', 'info');
    setTimeout(() => {
      this.calculator.showNotification('Security handshake complete. Compiling CAD models...', 'info');
    }, 1500);
    setTimeout(() => {
      this.calculator.showNotification('BIM_IQ_Archive.zip (412.8MB) compiled. Secure AES-256 transmission started.', 'success');
    }, 3200);
  }
}
