import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-bim-selection',
  imports: [CommonModule],
  template: `
    <div class="glass-panel p-4 md:p-8 rounded-2xl md:rounded-3xl border border-silver-leaf/15 bg-midnight-charcoal/35 w-full space-y-5 md:space-y-6 antialiased">
      <div class="text-center md:text-left space-y-1 select-none">
        <h2 class="font-serif text-xl md:text-3xl text-silver-leaf">Let's get you an estimate</h2>
        <p class="text-[11px] md:text-xs text-on-surface-variant-custom/80 font-sans leading-relaxed">
          How would you like us to bring your space online?
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <!-- OPTION 1: Scan to BIM -->
        <button 
          type="button" 
          (click)="selectMode('bim')"
          [class.border-primary-custom]="calculator.selectedModelingWay() === 'bim'"
          [class.bg-primary-custom/5]="calculator.selectedModelingWay() === 'bim'"
          [class.border-white/10]="calculator.selectedModelingWay() !== 'bim'"
          class="w-full flex items-start gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl border text-left transition-all hover:bg-white/5 focus:outline-none relative group select-none cursor-pointer">
          <div class="mt-1 flex items-center justify-center">
            @if (calculator.selectedModelingWay() === 'bim') {
              <span class="material-symbols-outlined text-primary-custom text-2xl fill-1">radio_button_checked</span>
            } @else {
              <span class="material-symbols-outlined text-on-surface-variant-custom text-2xl">radio_button_unchecked</span>
            }
          </div>
          <div class="space-y-1 pr-6 flex-1">
            <h4 class="font-sans font-bold text-sm text-silver-leaf group-hover:text-primary-custom transition-colors">Scan to BIM</h4>
            <p class="text-[11px] text-on-surface-variant-custom leading-normal font-sans">
              I already have a raw site scan of my space, and need to convert it to a 3D BIM model.
            </p>
          </div>
        </button>

        <!-- OPTION 2: Scan to CAD -->
        <button 
          type="button" 
          (click)="selectMode('scan_to_cad')"
          [class.border-primary-custom]="calculator.selectedModelingWay() === 'scan_to_cad'"
          [class.bg-primary-custom/5]="calculator.selectedModelingWay() === 'scan_to_cad'"
          [class.border-white/10]="calculator.selectedModelingWay() !== 'scan_to_cad'"
          class="w-full flex items-start gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl border text-left transition-all hover:bg-white/5 focus:outline-none relative group select-none cursor-pointer">
          <div class="mt-1 flex items-center justify-center">
            @if (calculator.selectedModelingWay() === 'scan_to_cad') {
              <span class="material-symbols-outlined text-primary-custom text-2xl fill-1">radio_button_checked</span>
            } @else {
              <span class="material-symbols-outlined text-on-surface-variant-custom text-2xl">radio_button_unchecked</span>
            }
          </div>
          <div class="space-y-1 pr-6 flex-1">
            <h4 class="font-sans font-bold text-sm text-silver-leaf group-hover:text-primary-custom transition-colors">Scan to CAD</h4>
            <p class="text-[11px] text-on-surface-variant-custom leading-normal font-sans">
              I have 2D architectural CAD drawings / engineering drawings and need transformation to 3D Revit models.
            </p>
          </div>
        </button>
      </div>

    </div>
  `,
})
export class BimSelection {
  calculator = inject(SpatialCostCalculator);

  selectMode(mode: 'bim' | 'scan_to_cad') {
    const prev = this.calculator.selectedModelingWay();
    this.calculator.selectedModelingWay.set(mode);
    this.calculator.modelingSelectionLocked.set(false);
    // Signal price-estimation to reset to step 1 when toggling
    if (prev !== mode) {
      this.calculator.formStepTrigger.set(1);
    }
  }
}
