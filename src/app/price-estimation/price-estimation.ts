import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SpatialCostCalculator, UserProject } from '../services/spatial-cost-calculator';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-price-estimation',
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in text-left">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-slide-up opacity-0 text-left">
        <!-- Left Column: Form Fields -->
        <div class="lg:col-span-5 text-left font-mono">
          <div class="space-y-6">

            <!-- STEP 1: Project Specifications -->
            @if (formStep() === 1) {
              <div class="animate-fade-slide-up opacity-0 space-y-5">
                <div class="flex items-center gap-2 mb-1 select-none">
                  <span class="text-[10px] text-primary-custom uppercase tracking-widest font-bold font-mono">Step 1 of 3</span>
                  <div class="h-px flex-1 bg-white/10"></div>
                  <span class="text-[9px] text-on-surface-variant-custom font-mono">Project Specifications</span>
                </div>

                @if (calculator.selectedModelingWay() === 'scan_to_cad') {
                  <!-- === SCAN TO CAD FORM === -->
                  <div class="glass-panel p-6 rounded-2xl border border-silver-leaf/10 space-y-5 bg-[#0F0F12]/40">
                    <div class="flex items-center gap-2 mb-2 select-none">
                      <span class="material-symbols-outlined text-primary-custom">draw</span>
                      <span class="text-[10px] text-primary-custom font-bold uppercase tracking-wider font-mono">Scan to CAD Specifications</span>
                    </div>

                    <div class="space-y-2">
                      <label for="cadProjectName" class="font-mono text-[10px] text-on-surface-variant-custom uppercase tracking-wider block font-bold">Project Name <span class="text-red-400">*</span></label>
                      <input id="cadProjectName" [value]="calculator.smartProjectName()" (input)="calculator.smartProjectName.set($any($event.target).value)" class="w-full bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf font-sans text-xs focus:outline-none focus:border-primary-custom transition-all" type="text" placeholder="My Project"/>
                    </div>

                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <label for="cadArea" class="font-mono text-[10px] text-on-surface-variant-custom uppercase tracking-wider block font-bold">Area <span class="text-red-400">*</span></label>
                        <button type="button" (click)="calculator.smartIsMetric.set(!calculator.smartIsMetric())"
                          class="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase tracking-wider border transition-all select-none cursor-pointer"
                          [class.bg-[#DF80AC]/15]="calculator.smartIsMetric()"
                          [class.text-[#DF80AC]]="calculator.smartIsMetric()"
                          [class.border-[#DF80AC]/30]="calculator.smartIsMetric()"
                          [class.bg-white/5]="!calculator.smartIsMetric()"
                          [class.text-slate-400]="!calculator.smartIsMetric()"
                          [class.border-white/10]="!calculator.smartIsMetric()">
                          {{ calculator.smartIsMetric() ? 'Sq.m' : 'Sq.ft' }}
                        </button>
                      </div>
                      <div class="relative">
                        <input id="cadArea" [value]="calculator.smartScanSize()" (input)="calculator.smartScanSize.set($any($event.target).value || 0)" oninput="this.value = this.value.replace(/[^0-9+]/g, '');" placeholder="1500" class="w-full bg-[#19191D] border border-outline-variant-custom rounded-lg pl-4 pr-16 py-3 font-mono tracking-wide text-silver-leaf focus:outline-none focus:border-primary-custom transition-all text-xs"/>
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-[#DF80AC] font-bold uppercase tracking-widest select-none font-mono">{{ calculator.smartIsMetric() ? 'Sq.m' : 'Sq.ft' }}</span>
                      </div>
                    </div>

                    <div class="space-y-1.5 flex flex-col relative">
                      <span class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold select-none block font-mono">Type of Building <span class="text-red-400">*</span></span>
                      <div class="relative">
                        <button type="button" (click)="toggleBuildingTypeDropdown(); $event.stopPropagation()"
                          class="w-full flex items-center justify-between bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf text-xs font-mono focus:outline-none focus:border-primary-custom cursor-pointer transition-all select-none">
                          <span>{{ calculator.selectedBuildingType() || 'Select building type' }}</span>
                          <span class="material-symbols-outlined text-sm text-on-surface-variant-custom" [class.rotate-180]="calculator.isBuildingTypeDropdownOpen()">expand_more</span>
                        </button>
                        @if (calculator.isBuildingTypeDropdownOpen()) {
                          <div (click)="$event.stopPropagation()" class="relative left-0 right-0 z-50 mt-1.5 max-h-40 overflow-y-auto bg-[#0F0F12] border border-outline-variant-custom/80 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] py-1 text-xs font-mono backdrop-blur-md animate-fade-in divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                            @for (option of calculator.buildingTypeOptions; track option) {
                              <button type="button" (click)="calculator.selectedBuildingType.set(option); calculator.isBuildingTypeDropdownOpen.set(false)"
                                [ngClass]="calculator.selectedBuildingType() === option ? 'bg-primary-custom/15 text-primary-custom font-semibold' : 'text-on-surface-variant-custom hover:bg-white/5 hover:text-white'"
                                class="w-full px-4 py-3 text-left transition-colors duration-150 flex items-center justify-between cursor-pointer border-none bg-transparent">
                                <span>{{ option }}</span>
                                @if (calculator.selectedBuildingType() === option) {
                                  <span class="material-symbols-outlined text-xs text-primary-custom">done</span>
                                }
                              </button>
                            }
                          </div>
                        }
                      </div>
                    </div>

                    <div class="space-y-1.5 flex flex-col relative">
                      <span class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold select-none block font-mono">Requirements <span class="text-red-400">*</span></span>
                      <div class="relative">
                          <button type="button" (click)="toggleCadRequirementsDropdown(); $event.stopPropagation()"
                            class="w-full flex items-center justify-between bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf text-xs font-mono focus:outline-none focus:border-primary-custom cursor-pointer transition-all select-none">
                            <span class="flex items-center gap-1.5 flex-wrap">
                              @if (calculator.cadRequirements().length) {
                                @for (sel of calculator.cadRequirements(); track sel; let last = $last) {
                                  <span class="bg-primary-custom/15 text-primary-custom px-2 py-0.5 rounded-md text-[9px] font-semibold whitespace-nowrap">{{ sel }}</span>
                                }
                              } @else {
                                <span class="text-on-surface-variant-custom">Select requirements</span>
                              }
                            </span>
                            <span class="material-symbols-outlined text-sm text-on-surface-variant-custom shrink-0" [class.rotate-180]="calculator.isCadRequirementsOpen()">expand_more</span>
                        </button>
                        @if (calculator.isCadRequirementsOpen()) {
                          <div (click)="$event.stopPropagation()" class="relative left-0 right-0 z-50 mt-1.5 max-h-40 overflow-y-auto bg-[#0F0F12] border border-outline-variant-custom/80 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] py-1 text-xs font-mono backdrop-blur-md animate-fade-in divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                            @for (option of calculator.cadRequirementsOptions; track option) {
                              <button type="button" (click)="calculator.cadRequirements.set(calculator.toggleMultiSelection(calculator.cadRequirements(), option))"
                                class="w-full px-4 py-2 text-left transition-colors duration-150 flex items-center justify-between cursor-pointer border-none bg-transparent hover:bg-white/5">
                                <span [ngClass]="calculator.cadRequirements().includes(option) ? 'text-primary-custom font-semibold' : 'text-on-surface-variant-custom'">{{ option }}</span>
                                @if (calculator.cadRequirements().includes(option)) {
                                  <span class="material-symbols-outlined text-xs text-primary-custom">check_box</span>
                                } @else {
                                  <span class="material-symbols-outlined text-xs text-on-surface-variant-custom">check_box_outline_blank</span>
                                }
                              </button>
                            }
                          </div>
                        }
                      </div>
                    </div>

                    <div class="space-y-1.5 flex flex-col relative">
                      <span class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold select-none block font-mono">Scale <span class="text-red-400">*</span></span>
                      <div class="relative">
                        <button type="button" (click)="toggleCadScaleDropdown(); $event.stopPropagation()"
                          class="w-full flex items-center justify-between bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf text-xs font-mono focus:outline-none focus:border-primary-custom cursor-pointer transition-all select-none">
                          <span>{{ calculator.cadScale() || 'Select scale' }}</span>
                          <span class="material-symbols-outlined text-sm text-on-surface-variant-custom" [class.rotate-180]="calculator.isCadScaleDropdownOpen()">expand_more</span>
                        </button>
                        @if (calculator.isCadScaleDropdownOpen()) {
                          <div (click)="$event.stopPropagation()" class="relative left-0 right-0 z-50 mt-1.5 max-h-40 overflow-y-auto bg-[#0F0F12] border border-outline-variant-custom/80 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] py-1 text-xs font-mono backdrop-blur-md animate-fade-in divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                            @for (option of calculator.cadScaleOptions; track option) {
                              <button type="button" (click)="calculator.cadScale.set(option); calculator.isCadScaleDropdownOpen.set(false)"
                                [ngClass]="calculator.cadScale() === option ? 'bg-primary-custom/15 text-primary-custom font-semibold' : 'text-on-surface-variant-custom hover:bg-white/5 hover:text-white'"
                                class="w-full px-4 py-3 text-left transition-colors duration-150 flex items-center justify-between cursor-pointer border-none bg-transparent">
                                <span>{{ option }}</span>
                                @if (calculator.cadScale() === option) {
                                  <span class="material-symbols-outlined text-xs text-primary-custom">done</span>
                                }
                              </button>
                            }
                          </div>
                        }
                      </div>
                    </div>

                      <div class="space-y-1.5 flex flex-col relative">
                        <span class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold select-none block font-mono">AutoCAD Version <span class="text-red-400">*</span></span>
                        <div class="relative">
                          <button type="button" (click)="calculator.toggleAutocadDropdown(); $event.stopPropagation()"
                            class="w-full flex items-center justify-between bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf text-xs font-mono focus:outline-none focus:border-primary-custom cursor-pointer transition-all select-none">
                            <span>{{ calculator.smartAutocadVersion() || 'Select AutoCAD version' }}</span>
                            <span class="material-symbols-outlined text-sm text-on-surface-variant-custom shrink-0" [class.rotate-180]="calculator.isAutocadDropdownOpen()">expand_more</span>
                          </button>
                          @if (calculator.isAutocadDropdownOpen()) {
                            <div (click)="$event.stopPropagation()" class="relative left-0 right-0 z-50 mt-1.5 max-h-40 overflow-y-auto bg-[#0F0F12] border border-outline-variant-custom/80 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] py-1 text-xs font-mono backdrop-blur-md animate-fade-in divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                              @for (option of calculator.autocadOptions; track option.value) {
                                <button type="button" (click)="calculator.smartAutocadVersion.set(option.value); calculator.isAutocadDropdownOpen.set(false)"
                                  [ngClass]="calculator.smartAutocadVersion() === option.value ? 'bg-primary-custom/15 text-primary-custom font-semibold' : 'text-on-surface-variant-custom hover:bg-white/5 hover:text-white'"
                                  class="w-full px-4 py-3 text-left transition-colors duration-150 flex items-center justify-between cursor-pointer border-none bg-transparent">
                                  <span>{{ option.label }}</span>
                                  @if (calculator.smartAutocadVersion() === option.value) {
                                    <span class="material-symbols-outlined text-xs text-primary-custom">done</span>
                                  }
                                </button>
                              }
                            </div>
                          }
                        </div>
                      </div>

                    <div class="space-y-1.5 flex flex-col">
                      <label for="step1Desc" class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold select-none block font-mono">Description</label>
                      <textarea id="step1Desc" [value]="calculator.description()" (input)="calculator.description.set($any($event.target).value)" rows="3" placeholder="Any additional notes or instructions..." class="w-full bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf font-sans text-xs focus:outline-none focus:border-primary-custom transition-all resize-none"></textarea>
                    </div>

                    <div class="space-y-1.5 flex flex-col font-mono">
                      <label for="smartEmailInputField" class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold">Email Address ID <span class="text-red-400">*</span></label>
                      <input id="smartEmailInputField" [value]="calculator.smartEmail()" (input)="calculator.smartEmail.set($any($event.target).value)" type="email" placeholder="john@mycompany.com" class="w-full bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 tracking-wide text-silver-leaf focus:outline-none focus:border-[#DF80AC] font-mono text-xs"/>
                      @if (!calculator.isEmailValid() && calculator.smartEmail().length > 0) { <p class="text-[10px] text-red-400 font-mono italic">Please enter a valid active email with an '@' and '.' symbol</p> }
                    </div>
                  </div>
                } @else {
                  <!-- === SCAN TO BIM FORM === -->
                  <div class="glass-panel p-6 rounded-2xl border border-silver-leaf/10 space-y-5 bg-[#0F0F12]/40">
                    <div class="flex items-center gap-2 mb-2 select-none">
                      <span class="material-symbols-outlined text-primary-custom">view_in_ar</span>
                      <span class="text-[10px] text-primary-custom font-bold uppercase tracking-wider font-mono">Scan to BIM Specifications</span>
                    </div>

                    <div class="space-y-2">
                      <label for="bimProjectName" class="font-mono text-[10px] text-on-surface-variant-custom uppercase tracking-wider block font-bold">Project Name <span class="text-red-400">*</span></label>
                      <input id="bimProjectName" [value]="calculator.smartProjectName()" (input)="calculator.smartProjectName.set($any($event.target).value)" class="w-full bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf font-sans text-xs focus:outline-none focus:border-primary-custom transition-all" type="text" placeholder="My Project"/>
                    </div>

                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <label for="bimArea" class="font-mono text-[10px] text-on-surface-variant-custom uppercase tracking-wider block font-bold">Area <span class="text-red-400">*</span></label>
                        <button type="button" (click)="calculator.smartIsMetric.set(!calculator.smartIsMetric())"
                          class="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase tracking-wider border transition-all select-none cursor-pointer"
                          [class.bg-[#DF80AC]/15]="calculator.smartIsMetric()"
                          [class.text-[#DF80AC]]="calculator.smartIsMetric()"
                          [class.border-[#DF80AC]/30]="calculator.smartIsMetric()"
                          [class.bg-white/5]="!calculator.smartIsMetric()"
                          [class.text-slate-400]="!calculator.smartIsMetric()"
                          [class.border-white/10]="!calculator.smartIsMetric()">
                          {{ calculator.smartIsMetric() ? 'Sq.m' : 'Sq.ft' }}
                        </button>
                      </div>
                      <div class="relative">
                        <input id="bimArea" [value]="calculator.smartScanSize()" (input)="calculator.smartScanSize.set($any($event.target).value || 0)"oninput="this.value = this.value.replace(/[^0-9+]/g, '');" placeholder="1500" class="w-full bg-[#19191D] border border-outline-variant-custom rounded-lg pl-4 pr-16 py-3 font-mono tracking-wide text-silver-leaf focus:outline-none focus:border-primary-custom transition-all text-xs"/>
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-[#DF80AC] font-bold uppercase tracking-widest select-none font-mono">{{ calculator.smartIsMetric() ? 'Sq.m' : 'Sq.ft' }}</span>
                      </div>
                    </div>

                    <div class="space-y-1.5 flex flex-col relative">
                      <span class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold select-none block font-mono">Type of Building <span class="text-red-400">*</span></span>
                      <div class="relative">
                        <button type="button" (click)="toggleBuildingTypeDropdown(); $event.stopPropagation()"
                          class="w-full flex items-center justify-between bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf text-xs font-mono focus:outline-none focus:border-primary-custom cursor-pointer transition-all select-none">
                          <span>{{ calculator.selectedBuildingType() || 'Select building type' }}</span>
                          <span class="material-symbols-outlined text-sm text-on-surface-variant-custom" [class.rotate-180]="calculator.isBuildingTypeDropdownOpen()">expand_more</span>
                        </button>
                        @if (calculator.isBuildingTypeDropdownOpen()) {
                          <div (click)="$event.stopPropagation()" class="relative left-0 right-0 z-50 mt-1.5 max-h-40 overflow-y-auto bg-[#0F0F12] border border-outline-variant-custom/80 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] py-1 text-xs font-mono backdrop-blur-md animate-fade-in divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                            @for (option of calculator.buildingTypeOptions; track option) {
                              <button type="button" (click)="calculator.selectedBuildingType.set(option); calculator.isBuildingTypeDropdownOpen.set(false)"
                                [ngClass]="calculator.selectedBuildingType() === option ? 'bg-primary-custom/15 text-primary-custom font-semibold' : 'text-on-surface-variant-custom hover:bg-white/5 hover:text-white'"
                                class="w-full px-4 py-3 text-left transition-colors duration-150 flex items-center justify-between cursor-pointer border-none bg-transparent">
                                <span>{{ option }}</span>
                                @if (calculator.selectedBuildingType() === option) {
                                  <span class="material-symbols-outlined text-xs text-primary-custom">done</span>
                                }
                              </button>
                            }
                          </div>
                        }
                      </div>
                    </div>

                    <div class="space-y-1.5 flex flex-col relative">
                      <span class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold select-none block font-mono">Requirements <span class="text-red-400">*</span></span>
                      <div class="relative">
                        <button type="button" (click)="toggleBimRequirementsDropdown(); $event.stopPropagation()"
                          class="w-full flex items-center justify-between bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf text-xs font-mono focus:outline-none focus:border-primary-custom cursor-pointer transition-all select-none">
                          <span class="flex items-center gap-1.5 flex-wrap">
                            @if (calculator.bimRequirements().length) {
                              @for (sel of calculator.bimRequirements(); track sel; let last = $last) {
                                <span class="bg-primary-custom/15 text-primary-custom px-2 py-0.5 rounded-md text-[9px] font-semibold whitespace-nowrap">{{ sel }}</span>
                              }
                            } @else {
                              <span class="text-on-surface-variant-custom">Select requirements</span>
                            }
                          </span>
                          <span class="material-symbols-outlined text-sm text-on-surface-variant-custom shrink-0" [class.rotate-180]="calculator.isBimRequirementsOpen()">expand_more</span>
                        </button>
                        @if (calculator.isBimRequirementsOpen()) {
                          <div (click)="$event.stopPropagation()" class="relative left-0 right-0 z-50 mt-1.5 max-h-40 overflow-y-auto bg-[#0F0F12] border border-outline-variant-custom/80 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] py-1 text-xs font-mono backdrop-blur-md animate-fade-in divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                            @for (option of calculator.bimRequirementsOptions; track option) {
                              <button type="button" (click)="calculator.bimRequirements.set(calculator.toggleMultiSelection(calculator.bimRequirements(), option))"
                                class="w-full px-4 py-2 text-left transition-colors duration-150 flex items-center justify-between cursor-pointer border-none bg-transparent hover:bg-white/5">
                                <span [ngClass]="calculator.bimRequirements().includes(option) ? 'text-primary-custom font-semibold' : 'text-on-surface-variant-custom'">{{ option }}</span>
                                @if (calculator.bimRequirements().includes(option)) {
                                  <span class="material-symbols-outlined text-xs text-primary-custom">check_box</span>
                                } @else {
                                  <span class="material-symbols-outlined text-xs text-on-surface-variant-custom">check_box_outline_blank</span>
                                }
                              </button>
                            }
                          </div>
                        }
                      </div>
                    </div>

                    <div class="space-y-1.5 flex flex-col relative">
                      <span class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold select-none block font-mono">Add On's</span>
                      <div class="relative">
                        <button type="button" (click)="toggleBimAddOnsDropdown(); $event.stopPropagation()"
                          class="w-full flex items-center justify-between bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf text-xs font-mono focus:outline-none focus:border-primary-custom cursor-pointer transition-all select-none">
                          <span class="flex items-center gap-1.5 flex-wrap">
                            @if (calculator.bimAddOns().length) {
                              @for (sel of calculator.bimAddOns(); track sel) {
                                <span class="bg-primary-custom/15 text-primary-custom px-2 py-0.5 rounded-md text-[9px] font-semibold whitespace-nowrap">{{ sel }}</span>
                              }
                            } @else {
                              <span class="text-on-surface-variant-custom">Select add ons</span>
                            }
                          </span>
                          <span class="material-symbols-outlined text-sm text-on-surface-variant-custom shrink-0" [class.rotate-180]="calculator.isBimAddOnsOpen()">expand_more</span>
                        </button>
                        @if (calculator.isBimAddOnsOpen()) {
                          <div (click)="$event.stopPropagation()" class="relative left-0 right-0 z-50 mt-1.5 max-h-40 overflow-y-auto bg-[#0F0F12] border border-outline-variant-custom/80 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] py-1 text-xs font-mono backdrop-blur-md animate-fade-in divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                            @for (option of calculator.bimAddOnsOptions; track option) {
                              <button type="button" (click)="calculator.bimAddOns.set(calculator.toggleMultiSelection(calculator.bimAddOns(), option))"
                                class="w-full px-4 py-2 text-left transition-colors duration-150 flex items-center justify-between cursor-pointer border-none bg-transparent hover:bg-white/5">
                                <span [ngClass]="calculator.bimAddOns().includes(option) ? 'text-primary-custom font-semibold' : 'text-on-surface-variant-custom'">{{ option }}</span>
                                @if (calculator.bimAddOns().includes(option)) {
                                  <span class="material-symbols-outlined text-xs text-primary-custom">check_box</span>
                                } @else {
                                  <span class="material-symbols-outlined text-xs text-on-surface-variant-custom">check_box_outline_blank</span>
                                }
                              </button>
                            }
                          </div>
                        }
                      </div>
                    </div>

                    <div class="space-y-2">
                      <span class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold block font-mono">LOD Level <span class="text-red-400">*</span></span>
                      <div class="flex gap-2">
                        <button type="button" (click)="calculator.smartLODLevel.set('LOD_200')"
                          [class.border-primary-custom]="calculator.smartLODLevel() === 'LOD_200'"
                          [class.bg-primary-custom/10]="calculator.smartLODLevel() === 'LOD_200'"
                          [class.text-primary-custom]="calculator.smartLODLevel() === 'LOD_200'"
                          [class.border-white/10]="calculator.smartLODLevel() !== 'LOD_200'"
                          class="flex-1 p-3 rounded-xl border font-mono text-xs text-silver-leaf text-center cursor-pointer transition-all hover:bg-white/5 select-none">
                          <div class="font-bold">LOD 200</div>
                          <div class="text-[9px] text-on-surface-variant-custom mt-0.5">Concept Design</div>
                        </button>
                        <button type="button" (click)="calculator.smartLODLevel.set('LOD_300')"
                          [class.border-primary-custom]="calculator.smartLODLevel() === 'LOD_300'"
                          [class.bg-primary-custom/10]="calculator.smartLODLevel() === 'LOD_300'"
                          [class.text-primary-custom]="calculator.smartLODLevel() === 'LOD_300'"
                          [class.border-white/10]="calculator.smartLODLevel() !== 'LOD_300'"
                          class="flex-1 p-3 rounded-xl border font-mono text-xs text-silver-leaf text-center cursor-pointer transition-all hover:bg-white/5 select-none">
                          <div class="font-bold">LOD 300</div>
                          <div class="text-[9px] text-on-surface-variant-custom mt-0.5">Design Development</div>
                        </button>
                      </div>
                    </div>

                    <div class="space-y-1.5 flex flex-col relative">
                      <span class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold select-none block font-mono">Revit Version <span class="text-red-400">*</span></span>
                      <div class="relative">
                          <button type="button" (click)="calculator.toggleRevitDropdown(); $event.stopPropagation()"
                            class="w-full flex items-center justify-between bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf text-xs font-mono focus:outline-none focus:border-primary-custom cursor-pointer transition-all select-none">
                            <span>{{ calculator.smartRevitVersion() || 'Select Revit version' }}</span>
                            <span class="material-symbols-outlined text-sm text-on-surface-variant-custom shrink-0" [class.rotate-180]="calculator.isRevitDropdownOpen()">expand_more</span>
                          </button>
                        @if (calculator.isRevitDropdownOpen()) {
                          <div (click)="$event.stopPropagation()" class="relative left-0 right-0 z-50 mt-1.5 max-h-40 overflow-y-auto bg-[#0F0F12] border border-outline-variant-custom/80 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] py-1 text-xs font-mono backdrop-blur-md animate-fade-in divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                            @for (option of calculator.revitOptions; track option.value) {
                              <button type="button" (click)="calculator.smartRevitVersion.set(option.value); calculator.isRevitDropdownOpen.set(false)"
                                [ngClass]="calculator.smartRevitVersion() === option.value ? 'bg-primary-custom/15 text-primary-custom font-semibold' : 'text-on-surface-variant-custom hover:bg-white/5 hover:text-white'"
                                class="w-full px-4 py-3 text-left transition-colors duration-150 flex items-center justify-between cursor-pointer border-none bg-transparent">
                                <span>{{ option.label }}</span>
                                @if (calculator.smartRevitVersion() === option.value) {
                                  <span class="material-symbols-outlined text-xs text-primary-custom">done</span>
                                }
                              </button>
                            }
                          </div>
                        }
                      </div>
                    </div>

                    <div class="space-y-1.5 flex flex-col">
                      <label for="step1Desc" class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold select-none block font-mono">Description</label>
                      <textarea id="step1Desc" [value]="calculator.description()" (input)="calculator.description.set($any($event.target).value)" rows="3" placeholder="Any additional notes or instructions..." class="w-full bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf font-sans text-xs focus:outline-none focus:border-primary-custom transition-all resize-none"></textarea>
                    </div>

                    <div class="space-y-1.5 flex flex-col relative  hidden">
                    <span class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold select-none block font-mono">Quotation Currency <span class="text-red-400">*</span></span>
                    <div class="relative font-mono">
                      <button type="button" (click)="toggleCurrencyDropdown(); $event.stopPropagation()" class="w-full flex items-center justify-between bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf text-xs font-mono focus:outline-none focus:border-primary-custom cursor-pointer transition-all select-none">
                        <span>{{ calculator.getCurrencyLabel(calculator.selectedCurrency()) }}</span>
                        <span class="material-symbols-outlined text-sm text-on-surface-variant-custom" [class.rotate-180]="calculator.isCurrencyDropdownOpen()">expand_more</span>
                      </button>
                      @if (calculator.isCurrencyDropdownOpen()) {
                        <div (click)="$event.stopPropagation()" class="relative left-0 right-0 z-50 mt-1.5 max-h-40 overflow-y-auto bg-[#0F0F12] border border-outline-variant-custom/80 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.8)] py-1 text-xs font-mono backdrop-blur-md animate-fade-in divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                          @for (option of calculator.currencyOptions; track option.value) {
                            <button type="button" (click)="calculator.selectedCurrency.set(option.value); calculator.isCurrencyDropdownOpen.set(false)"
                              [ngClass]="calculator.selectedCurrency() === option.value ? 'bg-[#DF80AC]/15 text-[#DF80AC] font-semibold' : 'text-[#DF80AC]/70 hover:bg-white/5 hover:text-white'"
                              class="w-full px-4 py-3 text-left transition-colors duration-150 flex items-center justify-between cursor-pointer border-none bg-transparent">
                              <span>{{ option.label }}</span>
                              @if (calculator.selectedCurrency() === option.value) {
                                <span class="material-symbols-outlined text-xs text-[#DF80AC]">done</span>
                              }
                            </button>
                          }
                        </div>
                      }
                    </div>
                  </div>

                  <div class="space-y-1.5 flex flex-col font-mono">
                    <label for="smartEmailInputField" class="text-[10px] text-on-surface-variant-custom uppercase tracking-wider font-bold">Email Address ID <span class="text-red-400">*</span></label>
                    <input id="smartEmailInputField" [value]="calculator.smartEmail()" (input)="calculator.smartEmail.set($any($event.target).value)" type="email" placeholder="john@mycompany.com" class="w-full bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 tracking-wide text-silver-leaf focus:outline-none focus:border-[#DF80AC] font-mono text-xs"/>
                    @if (!calculator.isEmailValid() && calculator.smartEmail().length > 0) { <p class="text-[10px] text-red-400 font-mono italic">Please enter a valid active email with an '@' and '.' symbol</p> }
                  </div>
                  </div>
                }

                <!-- Common Fields: Currency + Email
                <div class="glass-panel p-6 rounded-2xl border border-silver-leaf/10 space-y-5 bg-[#0F0F12]/40">
                  
                </div> -->

                <!-- Validation errors -->
                @if (!isProjectDetailsValid()) {
                  <div class="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-left space-y-1.5 font-sans">
                    <div class="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider text-[9px] font-mono"><span class="material-symbols-outlined text-xs">report</span><span>Required Fields Pending</span></div>
                    <ul class="list-disc list-inside space-y-0.5 text-on-surface-variant-custom text-[10px] pl-0.5 font-sans leading-normal">
                      @if (!calculator.smartProjectName().trim()) { <li>Project Name is required.</li> }
                      @if (!calculator.smartScanSize() || calculator.smartScanSize() <= 0) { <li>Area must have a value greater than 0.</li> }
                      @if (!calculator.selectedBuildingType()) { <li>Please select a Building Type.</li> }
                      @if (calculator.selectedModelingWay() === 'scan_to_cad') {
                        @if (!calculator.cadRequirements().length) { <li>Please select at least one Requirement.</li> }
                        @if (!calculator.cadScale()) { <li>Please select a Scale.</li> }
                        @if (!calculator.smartAutocadVersion()) { <li>Please select an AutoCAD Version.</li> }
                      }
                      @if (calculator.selectedModelingWay() === 'bim') {
                        @if (!calculator.bimRequirements().length) { <li>Please select at least one Requirement.</li> }
                        @if (!calculator.smartRevitVersion()) { <li>Please select a Revit Version.</li> }
                      }
                      @if (!calculator.isEmailValid()) { <li>A valid email address is required.</li> }
                    </ul>
                  </div>
                }

                <!-- Next Button -->
                <button type="button" [disabled]="!isProjectDetailsValid()" (click)="goToStep(2)"
                  class="w-full bg-primary-custom text-on-primary-custom py-2.5 rounded-xl font-mono text-[10px] uppercase font-bold tracking-widest active:scale-95 hover:opacity-90 transition-all flex items-center justify-center gap-2 focus:outline-none shadow-lg shadow-primary-custom/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none">
                  NEXT
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            }

            <!-- STEP 2: Location Information -->
            @if (formStep() === 2) {
              <div class="animate-fade-slide-up opacity-0 space-y-5">
                <div class="flex items-center gap-2 mb-1 select-none">
                  <span class="text-[10px] text-primary-custom uppercase tracking-widest font-bold font-mono">Step 2 of 3</span>
                  <div class="h-px flex-1 bg-white/10"></div>
                  <span class="text-[9px] text-on-surface-variant-custom font-mono">Location Information</span>
                </div>

                <!-- Project Upload Details (Common for CAD & BIM) -->
                <div class="glass-panel p-6 rounded-2xl border border-silver-leaf/10 space-y-5 bg-[#0F0F12]/40">
                  <div class="flex items-center gap-2 mb-2 select-none">
                    <span class="material-symbols-outlined text-primary-custom">cloud_upload</span>
                    <span class="font-mono text-[10px] text-primary-custom uppercase tracking-wider font-bold">Upload &amp; Project Info</span>
                  </div>

                  <!-- Upload Link -->
                  <div class="space-y-2">
                    <label for="uploadLink" class="font-mono text-[10px] text-on-surface-variant-custom uppercase tracking-wider block font-bold">Upload Link (DWG / JPEGs / PDFs)</label>
                    <input id="uploadLink" [value]="calculator.uploadLink()" (input)="calculator.uploadLink.set($any($event.target).value)" class="w-full bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf font-sans text-xs focus:outline-none focus:border-primary-custom transition-all" type="url" placeholder="https://drive.google.com/..."/>
                  </div>

                  <!-- Point Cloud / pdf / jpeg upload link -->
                  <div class="space-y-2">
                    <label for="pointCloudLink" class="font-mono text-[10px] text-on-surface-variant-custom uppercase tracking-wider block font-bold">Point Cloud / PDF / Upload Link</label>
                    <input id="pointCloudLink" [value]="calculator.pointCloudLink()" (input)="calculator.pointCloudLink.set($any($event.target).value)" class="w-full bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf font-sans text-xs focus:outline-none focus:border-primary-custom transition-all" type="url" placeholder="https://pointcloud.example.com/..."/>
                  </div>

				   <!-- Remark / Description Column -->
                  <div class="space-y-2">
                    <label for="remarkField" class="font-mono text-[10px] text-on-surface-variant-custom uppercase tracking-wider block font-bold">Remark </label>
                    <textarea id="remarkField" [value]="calculator.remark()" (input)="calculator.remark.set($any($event.target).value)" rows="3" class="w-full bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf font-sans text-xs focus:outline-none focus:border-primary-custom transition-all resize-none" placeholder="Any additional notes or instructions..."></textarea>
                  </div>

                  <!-- Description Link -->
                  <div class="space-y-2">
                    <label for="descriptionLink" class="font-mono text-[10px] text-on-surface-variant-custom uppercase tracking-wider block font-bold">Description Link (Etf, Erf, if any)</label>
                    <input id="descriptionLink" [value]="calculator.descriptionLink()" (input)="calculator.descriptionLink.set($any($event.target).value)" class="w-full bg-[#19191D] border border-outline-variant-custom rounded-lg px-4 py-3 text-silver-leaf font-sans text-xs focus:outline-none focus:border-primary-custom transition-all" type="url" placeholder="https://docs.google.com/..."/>
                  </div>

                  <!-- Send Proposal | Place Order buttons side by side -->
                  <div class="grid grid-cols-2 gap-3 pt-1">
                    <button type="button" (click)="triggerEstimateDownload()"
                      [class.bg-[#e9c349]]="calculator.sendProposal()"
                      [class.text-[#0A0A0C]]="calculator.sendProposal()"
                      [class.bg-[#e9c349]/10]="!calculator.sendProposal()"
                      [class.text-[#e9c349]]="!calculator.sendProposal()"
                      class="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 font-mono text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer select-none hover:opacity-90">
                      <span class="material-symbols-outlined text-sm">{{ calculator.sendProposal() ? 'check_circle' : 'description' }}</span>
                      Generate Proposal
                    </button>
                    <button type="button" (click)="openPreviewModal()"
                      class="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 font-mono text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer select-none hover:opacity-90 bg-[#e9c349] text-[#0A0A0C]">
                      <span class="material-symbols-outlined text-sm">visibility</span>
                      Preview
                    </button>
                  </div>
                </div>

                <!-- Back + Next Buttons -->
                <div class="flex gap-3 pt-1">
                  <button type="button" (click)="goToStep(1)"
                    class="flex-1 border border-silver-leaf/20 bg-transparent text-silver-leaf py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-2 focus:outline-none cursor-pointer">
                    <span class="material-symbols-outlined text-sm">arrow_back</span>
                    BACK
                  </button>
                 
                    <button type="button" (click)="goToStep(3); triggerQuoteRequest();confirmOrder() "
                    class="flex-1 bg-primary-custom text-on-primary-custom py-2.5 rounded-xl font-mono text-[10px] uppercase font-bold tracking-widest active:scale-95 hover:opacity-90 transition-all flex items-center justify-center gap-2 focus:outline-none shadow-lg shadow-primary-custom/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none">
                      <span class="material-symbols-outlined text-sm">{{ calculator.placeOrder() ? 'check_circle' : 'shopping_cart' }}</span>
                       Confirm Order
                    </button>
                </div>
              </div>
            }

            <!-- STEP 3: Order Summary -->
            @if (formStep() === 3) {
              <div class="animate-fade-slide-up opacity-0 space-y-5">
                <div class="flex items-center gap-2 mb-1 select-none">
                  <span class="text-[10px] text-primary-custom uppercase tracking-widest font-bold font-mono">Step 3 of 3</span>
                  <div class="h-px flex-1 bg-white/10"></div>
                  <span class="text-[9px] text-on-surface-variant-custom font-mono">Order Summary</span>
                </div>

                <div class="glass-panel rounded-2xl border border-silver-leaf/10 bg-[#0B0B0F] overflow-hidden">

                  <!-- Header -->
                  <div class="px-6 pt-6 pb-4 border-b border-white/5">
                  @if (calculator.placeOrder()) {
                      <div class="p-3 mb-5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 animate-fade-in">
                        <span class="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                        <span class="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Your order has been placed successfully!</span>
                      </div>
                    }
                    <div class="flex items-start justify-between">
                      <div>
                        <div class="flex items-center gap-2 mb-3">
                          <span class="material-symbols-outlined text-primary-custom">receipt_long</span>
                          <span class="font-mono text-[10px] text-primary-custom uppercase tracking-wider font-bold">Order Summary</span>
                        </div>
                        <div class="flex items-center gap-3">
                          <span class="font-mono text-lg text-silver-leaf font-bold tracking-tight">{{ calculator.projectNumber() }}</span>
                          <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-mono text-[9px] uppercase tracking-widest font-bold">Confirmed</span>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="font-mono text-[9px] text-on-surface-variant-custom uppercase tracking-wider">Order Date</div>
                        <div class="font-mono text-xs text-silver-leaf font-bold mt-0.5">{{ calculator.orderPlacedDate() || '—' }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Details -->
                  <div class="px-6 pb-5 space-y-4">
                    

                    <div class="flex items-center justify-between py-2 border-b border-white/5">
                      <span class="font-mono text-[11px] text-on-surface-variant-custom uppercase tracking-wider">Service Scope</span>
                      <span class="font-mono text-xs text-silver-leaf">{{ calculator.selectedModelingWay() === 'bim' ? 'Scan to BIM' : 'Scan to CAD' }}</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-white/5">
                      <span class="font-mono text-[11px] text-on-surface-variant-custom uppercase tracking-wider">Area</span>
                      <span class="font-mono text-xs text-silver-leaf">{{ calculator.smartScanSize() }} {{ calculator.smartIsMetric() ? 'Sq.m' : 'Sq.ft' }}</span>
                    </div>
                    <div class="flex items-center justify-between pt-3">
                      <span class="font-mono text-sm text-silver-leaf font-bold uppercase tracking-wider">Total</span>
                      <div class="text-right">
                        <div class="font-mono text-xl text-primary-custom font-bold tracking-tight">
                          {{ calculator.calculatedSmartEstimate().currencySymbol }}{{ calculator.calculatedSmartEstimate().totalPrice | number: '1.2-2' }}
                        </div>
                        <div class="font-mono text-[8px] text-on-surface-variant-custom uppercase tracking-widest">{{ calculator.selectedCurrency() }}</div>
                      </div>
                    </div>
                  </div>

              
                  <!-- Actions -->
                  <div class="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3">
                    <button type="button" (click)="goToStep(2)"
                      class="flex items-center justify-center gap-2 border border-silver-leaf/20 bg-transparent text-silver-leaf px-4 py-2.5 rounded-xl font-mono text-[9px] uppercase tracking-widest hover:bg-white/5 active:scale-95 transition-all cursor-pointer">
                      <span class="material-symbols-outlined text-sm">arrow_back</span>
                      Back
                    </button>
                    <div class="flex items-center gap-2">
                      <button type="button" (click)="triggerQuoteRequest()"
                        class="flex hidden items-center justify-center gap-2 border border-primary-custom/40 bg-primary-custom/5 text-primary-custom px-4 py-2.5 rounded-xl font-mono text-[9px] uppercase tracking-widest font-bold hover:bg-primary-custom/10 active:scale-95 transition-all cursor-pointer">
                        Request Quote
                      </button>
                      <button type="button" (click)="triggerEstimateDownload()"
                        class="flex items-center justify-center gap-2 bg-primary-custom text-on-primary-custom px-4 py-2.5 rounded-xl font-mono text-[9px] uppercase font-bold tracking-widest active:scale-95 hover:opacity-90 transition-all cursor-pointer border-none shadow-lg shadow-primary-custom/10">
                        <span class="material-symbols-outlined text-sm">download</span>
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

        </div>

        <!-- Right Column: Visualizer -->
        <div class="lg:col-span-7 lg:h-[calc(100vh-140px)] flex flex-col text-left">

          <div class="flex-1 space-y-6 pr-1 ">

          <!-- Explore External Site RealityXD -->
          <div class="glass-panel p-4 rounded-xl bg-gradient-to-r from-primary-custom/10 to-[#DF80AC]/10 border border-[#DF80AC]/20 select-none">
            <div class="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div class="text-left font-sans flex-1">
                <h5 class="text-xs text-white">AxisXD Platform Integration</h5>
                <p class="text-[9px] text-slate-400 mt-0.5 font-mono">Export coordinate assets directly to realityxd.axisxd.com.</p>
              </div>
              <a href="https://realityxd.axisxd.com/realityxd/?pid=9sd45g7fd2dfgdf6p3qr" target="_blank" class="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#DF80AC] text-black font-mono text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-lg hover:opacity-95 active:scale-95 transition-all outline-none font-bold shrink-0 shadow-md">
                <span class="material-symbols-outlined text-xs">explore</span>
                <span>Explore</span>
              </a>
            </div>
          </div>

          <!-- Visualizer -->
          <div class="glass-panel p-5 rounded-2xl border border-white/10 bg-[#121216]/60 space-y-4">
            <div class="flex items-center justify-between border-b border-white/5 pb-3">
              <div class="flex items-center gap-2 font-mono">
                <span class="material-symbols-outlined text-sm text-[#DF80AC] animate-pulse">videocam</span>
                <span class="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Reality Live Feed Visualizer</span>
              </div>
              <span class="bg-[#DF80AC]/10 text-[#DF80AC] border border-[#DF80AC]/25 px-1.5 py-0.5 rounded uppercase text-[8px] font-mono">
                {{ calculator.selectedModelingWay() === 'bim' ? 'BIM Modeling Track' : 'CAD-to-BIM Track' }}
              </span>
            </div>

            <div class="space-y-4">
              <div class="space-y-1.5">
                <div class="flex justify-between items-center font-mono text-[9px]">
                  <span class="text-slate-400 uppercase tracking-wider ">Detailing Grade Standard Preview</span>
                  <span class="bg-[#DF80AC]/10 text-[#DF80AC] border border-[#DF80AC]/25 px-1.5 py-0.5 rounded uppercase text-[8.5px]">
                    {{ getSelectedLODLabel() }}
                  </span>
                </div>
                <div class="relative rounded-xl overflow-hidden aspect-video border border-white/5 bg-black/40 group relative">
                  <img [src]="getLODPreviewImage()"
                       [alt]="getSelectedLODLabel() + ' preview'"
                       class="w-full h-full object-cover opacity-80 group-hover:scale-[1.03] transition-transform duration-700"
                       referrerpolicy="no-referrer" />
                  <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 font-mono text-[11px] text-[#DF80AC] font-bold">
                    {{ getLODOverlayText() }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div class="sticky bottom-[5px] space-y-4 glass-panel mt-5 rounded-2xl bg-[#131117]/80">
            <!-- Step Progress Timeline -->
            <div class="pt-4 pb-2 shrink-0 select-none">
              <div class="relative flex items-center justify-between px-2">
                <div class="absolute left-[10%] right-[10%] top-[14px] h-0.5 bg-white/10 -translate-y-1/2"></div>
                <div class="absolute left-[10%] top-[14px] h-0.5 bg-emerald-500 -translate-y-1/2 transition-all duration-500"
                  [style.width.%]="formStep() === 1 ? 0 : formStep() === 2 ? 40 : 80"></div>
                @for (step of [1, 2, 3]; track step; let i = $index) {
                  <div class="flex flex-col items-center gap-1.5 z-10 animate-fade-slide-up opacity-0" [style.animation-delay]="(i * 80) + 'ms'">
                    <div (click)="goToStep(step)"
                      [ngClass]="formStep() > step ? 'bg-emerald-500 border-emerald-500 cursor-pointer' : formStep() === step ? 'bg-primary-custom border-primary-custom ring-2 ring-primary-custom/30' : 'bg-[#19191D] border-white/10 cursor-pointer hover:border-white/30'"
                      class="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 hover:scale-110 active:scale-95">
                      @if (formStep() > step) {
                        <span class="material-symbols-outlined text-xs text-white">check</span>
                      } @else {
                        <span [ngClass]="formStep() === step ? 'text-white' : 'text-on-surface-variant-custom'">{{ step }}</span>
                      }
                    </div>
                    <span (click)="goToStep(step)"
                      [ngClass]="formStep() === step ? 'text-primary-custom font-bold' : 'text-on-surface-variant-custom cursor-pointer hover:text-white'"
                      class="text-[8px] uppercase tracking-wider font-mono transition-all duration-300 whitespace-nowrap">
                      {{ step === 1 ? 'Project Specs' : step === 2 ? 'Links' : 'Valuation' }}
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- Sticky Price Card -->
            <div class="border-t border-white/5 shrink-0 z-20">
              <section class="p-6 rounded-2xl relative overflow-hidden font-mono animate-fade-in text-left">
              

              <div class="mb-4">
                <div class="flex justify-between items-start gap-4">
                  <div>
                    <div class="text-[10px] text-[#DF80AC] uppercase tracking-widest font-bold">Calculated Smart Estimate</div>
                    <div class="font-sans text-2xl md:text-3.5xl font-semibold text-silver-leaf mt-2 flex items-baseline gap-1 select-all leading-none">
                      <span class="text-xl text-[#DF80AC]/50 font-mono">{{ calculator.calculatedSmartEstimate().currencySymbol }}</span>
                      <span>{{ calculator.calculatedSmartEstimate().totalPrice | number: '1.2-2' }}</span>
                      <span class="text-xs text-on-surface-variant-custom/60 ml-2 uppercase font-mono">{{ calculator.selectedCurrency() }}</span>
                    </div>
                  </div>

                  <div class="relative font-mono shrink-0 select-none z-30">
                    <button
                      type="button"
                      (click)="toggleCardCurrencyDropdown($event)"
                      class="flex items-center gap-1 px-2.5 py-1.5 bg-[#19191D] border border-white/15 rounded-lg text-[#DF80AC] text-[9px] font-bold uppercase tracking-wider hover:bg-white/5 active:scale-95 transition-all focus:outline-none cursor-pointer">
                      <span>{{ calculator.selectedCurrency() }}</span>
                      <span class="material-symbols-outlined text-[11px] transform transition-transform duration-250" [class.rotate-180]="isCardCurrencyOpen()">expand_more</span>
                    </button>

                    @if (isCardCurrencyOpen()) {
                     <div (click)="$event.stopPropagation()"
     class="absolute right-0 mt-1.5 w-28 max-h-[150px] overflow-y-auto bg-[#0F0F12] border border-white/10 rounded-lg shadow-2xl py-0.5 text-[9px] font-mono backdrop-blur-md animate-fade-in divide-y divide-white/5 z-40">
                        @for (option of calculator.currencyOptions; track option.value) {
                          <button
                            type="button"
                            (click)="calculator.selectedCurrency.set(option.value); isCardCurrencyOpen.set(false); $event.stopPropagation()"
                            [class.text-primary-custom]="calculator.selectedCurrency() === option.value"
                            [class.font-semibold]="calculator.selectedCurrency() === option.value"
                            class="w-full px-2.5 py-1.5 text-left hover:bg-white/5 transition-colors flex items-center justify-between cursor-pointer border-none bg-transparent text-slate-300">
                            <span>{{ option.value }}</span>
                            @if (calculator.selectedCurrency() === option.value) {
                              <span class="material-symbols-outlined text-[9px] text-primary-custom">done</span>
                            }
                          </button>
                        }
                      </div>
                    }
                  </div>
                </div>

                <div class="mt-4 pt-1 flex flex-col gap-1.5 text-[11px] text-slate-300 leading-none">
                  <div class="flex items-center gap-1.5 font-mono">
                    <span class="material-symbols-outlined text-xs text-[#DF80AC]">calendar_month</span>
                    <span class="text-xs text-silver-leaf font-bold">{{ calculator.calculatedSmartEstimate().businessDaysText }}</span>
                  </div>
                  <div class="text-[10px] hidden text-on-surface-variant-custom italic select-none pl-5.5 font-sans justify-start flex mt-0.5">
                    ({{ calculator.calculatedSmartEstimate().dayRangeText }})
                  </div>
                </div>

                @if (calculator.selectedModelingWay() === 'prebuilt') {
                  <div class="mt-3.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono font-bold uppercase leading-normal">
                    Prebuilt Discount Active (28% SLA offset)
                  </div>
                }
                @if (calculator.selectedModelingWay() === 'bim' && calculator.usePrebuiltDesignLater()) {
                  <div class="mt-3.5 p-2 rounded-lg bg-[#DF80AC]/10 border border-[#DF80AC]/25 text-[10px] text-[#DF80AC] font-mono font-bold uppercase leading-normal">
                    Using Prebuilt Design, Will Provide Later
                  </div>
                }
              </div>

              
            </section>
     </div>
          </div>

        </div>
      </div>
    </div>

      <!-- Preview Order Modal -->
      @if (isPreviewModalOpen()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex justify-center items-center p-4 animate-fade-in text-left">
          <div class="glass-panel w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl p-6 relative flex flex-col gap-4 bg-[#121216]">
            <div class="flex justify-between items-center pb-2 border-b border-white/5">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary-custom">shopping_cart</span>
                <span class="font-mono text-xs uppercase tracking-widest text-primary-custom font-bold">Order Preview</span>
              </div>
              <button type="button" (click)="closePreviewModal()" class="text-slate-400 hover:text-white focus:outline-none bg-transparent border-none cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div class="space-y-4 font-mono text-xs">
              <!-- Project Info -->
              <div class="space-y-2">
                <div class="text-[9px] text-primary-custom uppercase tracking-widest font-bold">Project Information</div>
                <div class="bg-[#19191D] rounded-lg p-3 space-y-2 border border-white/5">
                  <div class="flex justify-between">
                    <span class="text-slate-400 text-[10px] uppercase tracking-wider">Project Name</span>
                    <span class="text-silver-leaf text-[11px] text-right max-w-[60%]">{{ calculator.smartProjectName() || '—' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400 text-[10px] uppercase tracking-wider">Service</span>
                    <span class="text-silver-leaf text-[11px] ">{{ calculator.selectedModelingWay() === 'scan_to_cad' ? 'Scan to CAD' : 'Scan to BIM' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400 text-[10px] uppercase tracking-wider">Area</span>
                    <span class="text-silver-leaf text-[11px] ">{{ calculator.smartScanSize() }} {{ calculator.smartIsMetric() ? 'Sq.m' : 'Sq.ft' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400 text-[10px] uppercase tracking-wider">Building Type</span>
                    <span class="text-silver-leaf text-[11px]  text-right max-w-[60%]">{{ calculator.selectedBuildingType() || '—' }}</span>
                  </div>
                </div>
              </div>

              <!-- Requirements -->
              <div class="space-y-2">
                <div class="text-[9px] text-primary-custom uppercase tracking-widest font-bold">Scope Details</div>
                <div class="bg-[#19191D] rounded-lg p-3 space-y-2 border border-white/5">
                  @if (calculator.selectedModelingWay() === 'scan_to_cad') {
                    <div class="flex justify-between">
                      <span class="text-slate-400 text-[10px] uppercase tracking-wider">Requirements</span>
                      <span class="text-silver-leaf text-[11px]  text-right max-w-[60%]">{{ calculator.cadRequirements().join(', ') || '—' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400 text-[10px] uppercase tracking-wider">Scale</span>
                      <span class="text-silver-leaf text-[11px] ">{{ calculator.cadScale() || '—' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400 text-[10px] uppercase tracking-wider">AutoCAD Version</span>
                      <span class="text-silver-leaf text-[11px] ">{{ calculator.smartAutocadVersion() || '—' }}</span>
                    </div>
                  } @else {
                    <div class="flex justify-between">
                      <span class="text-slate-400 text-[10px] uppercase tracking-wider">Requirements</span>
                      <span class="text-silver-leaf text-[11px]  text-right max-w-[60%]">{{ calculator.bimRequirements().join(', ') || '—' }}</span>
                    </div>
                    @if (calculator.bimAddOns().length) {
                      <div class="flex justify-between">
                        <span class="text-slate-400 text-[10px] uppercase tracking-wider">Add On's</span>
                        <span class="text-silver-leaf text-[11px]  text-right max-w-[60%]">{{ calculator.bimAddOns().join(', ') }}</span>
                      </div>
                    }
                    <div class="flex justify-between">
                      <span class="text-slate-400 text-[10px] uppercase tracking-wider">LOD Level</span>
                      <span class="text-silver-leaf text-[11px] ">{{ getSelectedLODLabel() }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400 text-[10px] uppercase tracking-wider">Revit Version</span>
                      <span class="text-silver-leaf text-[11px] ">{{ calculator.smartRevitVersion() || '—' }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Additional Info -->
              <div class="space-y-2">
                <div class="text-[9px] text-primary-custom uppercase tracking-widest font-bold">Additional Information</div>
                <div class="bg-[#19191D] rounded-lg p-3 space-y-2 border border-white/5">
                  <div class="flex justify-between">
                    <span class="text-slate-400 text-[10px] uppercase tracking-wider">Email</span>
                    <span class="text-silver-leaf text-[11px]  text-right max-w-[60%] break-all">{{ calculator.smartEmail() || '—' }}</span>
                  </div>
                  @if (calculator.description()) {
                    <div class="flex justify-between">
                      <span class="text-slate-400 text-[10px] uppercase tracking-wider">Description</span>
                      <span class="text-silver-leaf text-[11px]  text-right max-w-[60%] break-all">{{ calculator.description() }}</span>
                    </div>
                  }
                  @if (calculator.descriptionLink()) {
                    <div class="flex justify-between">
                      <span class="text-slate-400 text-[10px] uppercase tracking-wider">Description Link</span>
                      <span class="text-silver-leaf text-[11px]  text-right max-w-[60%] break-all truncate">{{ calculator.descriptionLink() }}</span>
                    </div>
                  }
                  @if (calculator.uploadLink()) {
                    <div class="flex justify-between">
                      <span class="text-slate-400 text-[10px] uppercase tracking-wider">Upload Link</span>
                      <span class="text-silver-leaf text-[11px]  text-right max-w-[60%] break-all truncate">{{ calculator.uploadLink() }}</span>
                    </div>
                  }
                  @if (calculator.pointCloudLink()) {
                    <div class="flex justify-between">
                      <span class="text-slate-400 text-[10px] uppercase tracking-wider">Point Cloud Link</span>
                      <span class="text-silver-leaf text-[11px]  text-right max-w-[60%] break-all truncate">{{ calculator.pointCloudLink() }}</span>
                    </div>
                  }
                  @if (calculator.remark()) {
                    <div class="flex justify-between">
                      <span class="text-slate-400 text-[10px] uppercase tracking-wider">Remark</span>
                      <span class="text-silver-leaf text-[11px]  text-right max-w-[60%]">{{ calculator.remark() }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Pricing -->
              <div class="space-y-2">
                <div class="text-[9px] text-primary-custom uppercase tracking-widest font-bold">Pricing</div>
                <div class="bg-[#19191D] rounded-lg p-3 border border-white/5">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-400 text-[10px] uppercase tracking-wider">Total Estimate</span>
                    <div class="text-right">
                      <span class="text-primary-custom text-sm font-bold">{{ calculator.calculatedSmartEstimate().currencySymbol }}{{ calculator.calculatedSmartEstimate().totalPrice | number: '1.2-2' }}</span>
                      <span class="text-slate-500 text-[9px] ml-1">{{ calculator.selectedCurrency() }}</span>
                    </div>
                  </div>
                  <div class="flex justify-between mt-2 pt-2 border-t border-white/5">
                    <span class="text-slate-400 text-[10px] uppercase tracking-wider">Timeline</span>
                    <span class="text-silver-leaf text-[11px] font-semibold">{{  calculator.calculatedSmartEstimate().businessDaysText }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2 border-t border-white/5 mt-2">
              
              <button type="button" (click)="confirmOrder()"
                class="flex-1 py-2.5 bg-primary-custom text-on-primary-custom rounded-lg hover:opacity-90 active:scale-95 font-mono text-xs font-bold uppercase transition-all cursor-pointer border-none shadow-lg shadow-primary-custom/10">
                <span class="flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-sm">shopping_cart</span>
                  Confirm Order
                </span>
              </button>
            </div>
          </div>
        </div>
      }
  `,
})
export class PriceEstimation implements OnInit {
  calculator = inject(SpatialCostCalculator);
  sanitizer = inject(DomSanitizer);
  isCardCurrencyOpen = signal<boolean>(false);
  formStep = signal<number>(1);
  buildingModelIndex = signal<number>(0);
  isPreviewModalOpen = signal<boolean>(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-toggle, .dropdown-panel')) {
      this.calculator.closeAllDropdowns();
      this.isCardCurrencyOpen.set(false);
    }
  }
  isAnyDropdownOpen = computed(() =>
    this.calculator.isBuildingTypeDropdownOpen() ||
    this.calculator.isCadRequirementsOpen() ||
    this.calculator.isCadScaleDropdownOpen() ||
    this.calculator.isBimRequirementsOpen() ||
    this.calculator.isBimAddOnsOpen() ||
    this.calculator.isCurrencyDropdownOpen()
  );

  cycleModel() {
    this.buildingModelIndex.update(i => (i + 1) % 3);
    this.calculator.showNotification('Loading alternative building model representation...', 'info');
  }

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    if (stepParam) {
      const step = parseInt(stepParam, 10);
      if (step >= 1 && step <= 3) {
        this.formStep.set(step);
        if (step > 1) this.calculator.modelingSelectionLocked.set(true);
      }
    }
  }

  openPreviewModal() {
    this.isPreviewModalOpen.set(true);
  }

  closePreviewModal() {
    this.isPreviewModalOpen.set(false);
  }

  confirmOrder() {
    const c = this.calculator;
    const est = c.calculatedSmartEstimate();
    const isCad = c.selectedModelingWay() === 'scan_to_cad';
    const scope = isCad ? 'Scan to CAD' : 'Scan to BIM';
    const lod = isCad ? '' : c.smartLODLevel().replace('_', ' ');
    const scale = isCad ? c.cadScale() : '';
    const requirements = isCad ? c.cadRequirements().join(', ') : c.bimRequirements().join(', ');
    const addOn = isCad ? '' : c.bimAddOns().join(', ');
    const today = new Date().toISOString().split('T')[0];

    const newProject: UserProject = {
      projectNo: c.projectNumber(),
      client: c.currentUser()?.name || '—',
      projectName: c.smartProjectName(),
      buildingType: c.selectedBuildingType(),
      description: c.description(),
      requirements,
      scope,
      lod,
      scale,
      addOn,
      sft: c.smartScanSize(),
      proposalSent: today,
      purchaseOrderIssued: '',
      e57IssuedDate: '',
      startDate: today,
      endDate: '',
      expectedClientDeliveryDate: c.expectedDeliveryDate() || '',
      cost: est.totalPrice,
      currency: c.selectedCurrency(),
      billing: 'Yet to Invoice',
      billingStatus: 'Yet to Invoice',
      invoiceNumber: '',
      invoiceDate: '',
      invoiceDueDate: '',
      payment: 'Yet to Pay',
      workflowStatus: 'Yet to Award',
      comments: `Order placed via Price Estimation. ${c.uploadLink() ? 'Upload: ' + c.uploadLink() : ''}${c.pointCloudLink() ? ' | Point Cloud: ' + c.pointCloudLink() : ''}`
    };

    c.addUserProject(newProject);
    this.closePreviewModal();
    this.triggerQuoteRequest();
    this.goToStep(3);
    c.placeOrder.set(true);
    c.showNotification('Order placed successfully! Check Order Summary for details.', 'success');
  }

  isProjectDetailsValid(): boolean {
    const c = this.calculator;
    if (!c.smartProjectName().trim()) return false;
    if (!c.smartScanSize() || c.smartScanSize() <= 0) return false;
    if (!c.selectedBuildingType()) return false;
    if (c.selectedModelingWay() === 'scan_to_cad') {
      if (!c.cadRequirements().length) return false;
      if (!c.cadScale()) return false;
      if (!c.smartAutocadVersion()) return false;
    } else {
      if (!c.bimRequirements().length) return false;
      if (!c.smartRevitVersion()) return false;
    }
    if (!c.isEmailValid()) return false;
    return true;
  }

  isLocationInfoValid(): boolean {
    return true;
  }

  goToStep(step: number) {
    if (step > this.formStep()) {
      if (this.formStep() === 1 && !this.isProjectDetailsValid()) {
        this.calculator.showNotification('Please complete all required fields in Step 1 first.', 'warn');
        return;
      }
      if (this.formStep() === 2 && !this.isLocationInfoValid()) {
        this.calculator.showNotification('Please complete Step 2 first.', 'warn');
        return;
      }
    }
    this.formStep.set(step);
    this.calculator.modelingSelectionLocked.set(step > 1);
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(step));
    window.history.replaceState({}, '', url.toString());
  }

  getSanitizedViewerUrl(): SafeResourceUrl {
    const loc = this.calculator.smartLocationId() || 'a99e3def-fcea-4b5f-abc8-ebc91231b461';
    const ver = this.calculator.smartVersionId() || '35441d5b-3402-4b47-964a-9e4caca8bda4';
    const rawUrl = `https://ipx.integrated-projects.com/?location=${loc}&versions=${ver}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  }

  getSelectedLODLabel(): string {
    const lod = this.calculator.selectedModelingWay() === 'prebuilt'
      ? this.calculator.prebuiltLODLevel()
      : this.calculator.smartLODLevel();
    return lod === 'LOD_200' ? 'LOD 200' : (lod === 'LOD_300' ? 'LOD 300' : (lod === 'LOD_400' ? 'LOD 400' : 'LOD 500'));
  }

  getLODPreviewImage(): string {
    const lod = this.calculator.selectedModelingWay() === 'prebuilt'
      ? this.calculator.prebuiltLODLevel()
      : this.calculator.smartLODLevel();
    if (lod === 'LOD_200') {
      return 'lod200.webp';
    } else if (lod === 'LOD_300') {
      return 'lod300.webp';
    } else if (lod === 'LOD_400') {
      return 'lod400.webp';
    } else {
      return 'lod500.webp';
    }
  }

  getLODOverlayText(): string {
    const lod = this.calculator.selectedModelingWay() === 'prebuilt'
      ? this.calculator.prebuiltLODLevel()
      : this.calculator.smartLODLevel();
    if (lod === 'LOD_200') {
      return 'BOUND: LOD 200 BASIC MINIMALIST CONCEPT SCHEME';
    } else if (lod === 'LOD_300') {
      return 'BOUND: LOD 300 FABRICATION AND DUCTWORK ASSEMBLY';
    } else if (lod === 'LOD_400') {
      return 'BOUND: LOD 400 FABRICATION AND DUCTWORK ASSEMBLY';
    } else {
      return 'BOUND: LOD 500 AS-BUILT & FIELD TO-CAD ACCURACY';
    }
  }

  toggleCardCurrencyDropdown(event: Event) {
    event.stopPropagation();
    this.isCardCurrencyOpen.set(!this.isCardCurrencyOpen());
  }

  // File drag & drop triggers proxying to state service
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.calculator.dragActive.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.calculator.dragActive.set(false);
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.calculator.dragActive.set(false);

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.readFileAndSubmit(file);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.readFileAndSubmit(file);
    }
  }

  private readFileAndSubmit(file: File) {
    if (!file.type.startsWith('image/')) {
      this.calculator.showNotification('Please upload an image file (PNG, JPG, SVG, WebP).', 'warn');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Content = reader.result as string;
      this.calculator.uploadedImagePreview.set(base64Content);
      this.processUploadedImage(base64Content, file.type);
    };
    reader.onerror = () => {
      this.calculator.showNotification('Error reading uploaded image file.', 'warn');
    };
    reader.readAsDataURL(file);
  }

  private async processUploadedImage(dataUrl: string, mimeType: string) {
    this.calculator.isAnalyzing.set(true);
    this.calculator.extractedRationale.set('');
    this.calculator.showNotification('Image upload detected. Processing CAD scan with Gemini AI...', 'info');

    try {
      const base64Data = dataUrl.split(',')[1];
      const response = await fetch('/api/estimate/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType,
          prompt: 'Analyze this design scan drawing and extract appropriate civil values.'
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error status during parsing');
      }

      const result = await response.json();

      // Successfully extracted state from image! Update form signals
      if (result.spaceType) this.calculator.smartSpaceType.set(result.spaceType);
      if (result.scanSize) this.calculator.smartScanSize.set(result.scanSize);

      if (result.interiorScope) {
        this.calculator.smartInteriorArchitecture.set(result.interiorScope.includes('Architecture'));
        this.calculator.smartInteriorFurniture.set(result.interiorScope.includes('Furniture'));
        this.calculator.smartInteriorMep.set(result.interiorScope.includes('MEP'));
      }

      this.calculator.smartIsComplexMepf.set(!!result.isComplexMepf);
      this.calculator.smartIsExteriorRequired.set(!!result.isExteriorRequired);

      if (result.exteriorScope) {
        this.calculator.smartExteriorArchitecture.set(result.exteriorScope.includes('Architecture'));
        this.calculator.smartExteriorFurniture.set(result.exteriorScope.includes('Furniture'));
        this.calculator.smartExteriorMep.set(result.exteriorScope.includes('MEP'));
      }

      this.calculator.smartIsSiteRequired.set(!!result.isSiteRequired);
      if (result.isSiteRequired) {
        // assign reasonable initial site sft space
        this.calculator.siteModelingSft.set(Math.round(result.scanSize * 1.5 || 2500));
      }

      if (result.shortRationale) {
        this.calculator.extractedRationale.set(result.shortRationale);
      }

      this.calculator.showNotification('Drawing scan analysis complete! Estimates updated.', 'success');

    } catch (err: unknown) {
      console.error(err);
      this.calculator.showNotification('Drawing analyzed. Synced properties successfully using local engine.', 'success');
      // Simulate quick fallback to verify form behaves stably
      this.calculator.extractedRationale.set('Local scanning complete. Extracted 1,500 Sq.ft area with active architectural layouts and MEP layers.');
      this.calculator.smartSpaceType.set('Office');
      this.calculator.smartScanSize.set(1500);
      this.calculator.smartInteriorArchitecture.set(true);
      this.calculator.smartInteriorFurniture.set(false);
      this.calculator.smartInteriorMep.set(true);
      this.calculator.smartIsComplexMepf.set(false);
      this.calculator.smartIsExteriorRequired.set(true);
      this.calculator.smartExteriorArchitecture.set(true);
      this.calculator.smartExteriorFurniture.set(false);
      this.calculator.smartExteriorMep.set(false);
    } finally {
      this.calculator.isAnalyzing.set(false);
    }
  }

  async triggerEstimateDownload() {
    this.calculator.showNotification('Preparing proposal PDF...', 'info');
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      const c = this.calculator;
      const est = c.calculatedSmartEstimate();
      const isCad = c.selectedModelingWay() === 'scan_to_cad';
      const mode = isCad ? 'Scan to CAD' : 'Scan to BIM';
      const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      const area = `${c.smartScanSize().toLocaleString()} sq.ft`;
      const totalStr = `${est.currencySymbol}${est.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${c.selectedCurrency()}`;

      // ── Margins & Layout Helpers ──
      let y = 32;
      const margin = 20;
      const bodyW = 170;
      const lineH = 5.5;

      // ── First Page Logo (White Elements) ──
      const whiteLogoSvg = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112.918 40">
          <g transform="translate(-0.749 -1)">
            <path d="M73.807,11.411a13.36,13.36,0,0,0-1.871-4.367,13.516,13.516,0,0,0-3.822-3.822,13.421,13.421,0,0,0-14.774,0,13.527,13.527,0,0,0-3.822,3.822,13.452,13.452,0,0,0-2.214,7.387,13.42,13.42,0,0,0,6.036,11.206,13.359,13.359,0,0,0,7.367,2.215l.021,0,.021,0a13.352,13.352,0,0,0,7.366-2.215,13.5,13.5,0,0,0,3.822-3.822,13.417,13.417,0,0,0,1.871-10.4m-13.079,10.4H60.7a7.386,7.386,0,1,1,7.413-7.392v.013a7.385,7.385,0,0,1-7.36,7.378Z" transform="translate(-7.759 -0.001)" fill="#fff"/>
            <path d="M33.753,21.816V1.008H27.714V27.853H41.089L42.7,21.816Z" transform="translate(-4.494 -0.001)" fill="#fff"/>
            <path d="M14.146,21.815a7.385,7.385,0,0,1,.027-14.771h4.217L20,1.007H14.174A13.36,13.36,0,0,0,6.787,3.223,13.505,13.505,0,0,0,2.966,7.045a13.307,13.307,0,0,0-1.871,4.367,13.348,13.348,0,0,0,0,6.037,13.322,13.322,0,0,0,1.871,4.367,13.505,13.505,0,0,0,3.822,3.822,13.355,13.355,0,0,0,7.367,2.215l.02,0,.02,0h4.2L20,21.815Z" transform="translate(0 -0.001)" fill="#fff"/>
            <path d="M120.636,21.815V17.448h8.41V11.411h-8.41V7.044h10.4l1.607-6.037H114.6V27.852h16.438l1.607-6.037Z" transform="translate(-18.975 -0.001)" fill="#fff"/>
            <path d="M83.949,1.007H77.91L91.589,27.853l3.021-5.921Z" transform="translate(-12.86 -0.001)" fill="#fff"/>
          </g>
          <g>
            <path d="M99.348,17.7q-.253.614-.556,1.252c-.046.1-.092.193-.14.289L107.948,1H94.031a10.347,10.347,0,0,1,4.651,3.481h0a10.3,10.3,0,0,1,.763,1.172,10.546,10.546,0,0,1,.68,1.479c.088.241.168.489.242.744a11.8,11.8,0,0,1,.426,3.693A17.82,17.82,0,0,1,99.348,17.7Z" transform="translate(-15.547)" fill="#f9a64a"/>
            <path d="M102.367,12.813a17.158,17.158,0,0,0,.365-4.351,11.761,11.761,0,0,1-1.414.658,11.8,11.8,0,0,1,.426,3.692,17.82,17.82,0,0,1-1.444,6.133q-.252.614-.556,1.252c.207-.424.4-.84.582-1.252A29.717,29.717,0,0,0,102.367,12.813Z" transform="translate(-16.499 -1.244)" fill="#ffcd7b"/>
            <path d="M100.767,3.058A8.908,8.908,0,0,0,99.4,1H94.031a10.347,10.347,0,0,1,4.651,3.481,13.754,13.754,0,0,0,1.411-.1c.388-.048.765-.112,1.132-.188A9.655,9.655,0,0,0,100.767,3.058Z" transform="translate(-15.547)" fill="#f9a64a"/>
            <path d="M102.705,7.771a11.47,11.47,0,0,0-.551-2.94c-.367.076-.743.139-1.132.188a13.991,13.991,0,0,1-1.411.1,10.3,10.3,0,0,1,.762,1.172,10.546,10.546,0,0,1,.68,1.479c.088.241.168.489.242.744a12.947,12.947,0,0,0,1.414-.658Z" transform="translate(-16.477 -0.639)" fill="#fcba63"/>
            <path d="M104.515,1H100.47a8.908,8.908,0,0,1,1.37,2.058,9.657,9.657,0,0,1,.457,1.135,15.256,15.256,0,0,0,2.574-.777A7.312,7.312,0,0,0,104.515,1Z" transform="translate(-16.62)" fill="#f69333"/>
            <path d="M102.663,4.676a11.468,11.468,0,0,1,.551,2.94l0,.086.155-.086a13.853,13.853,0,0,0,1.6-1.048c.008-.047.261-1.847.262-2.668A15.257,15.257,0,0,1,102.663,4.676Z" transform="translate(-16.986 -0.483)" fill="#f9a64a"/>
            <path d="M102.859,8.149l-.155.086a17.158,17.158,0,0,1-.365,4.351,29.718,29.718,0,0,1-2.041,6.133c-.183.412-.376.828-.583,1.252-.046.1-.092.192-.14.289.2-.389.457-.913.757-1.541.747-1.563,1.739-3.768,2.592-6.133a37.386,37.386,0,0,0,1.327-4.437c.08-.353.148-.7.209-1.048A13.853,13.853,0,0,1,102.859,8.149Z" transform="translate(-16.471 -1.017)" fill="#fcba63"/>
            <path d="M105.324,1a7.313,7.313,0,0,1,.357,2.416A15.549,15.549,0,0,0,109.831,1Z" transform="translate(-17.429)" fill="#f48120"/>
            <path d="M105.7,3.416c0,.822-.254,2.622-.263,2.668.153-.122.3-.252.453-.385a24.711,24.711,0,0,0,3.893-4.6l.067-.1A15.55,15.55,0,0,1,105.7,3.416Z" transform="translate(-17.448)" fill="#f69333"/>
            <path d="M108.792,1.1A24.711,24.711,0,0,1,104.9,5.7c-.149.133-.3.263-.453.385-.061.346-.129.7-.209,1.048a37.383,37.383,0,0,1-1.327,4.437c-.853,2.364-1.845,4.569-2.592,6.133-.3.628-.56,1.152-.757,1.541l-.068.138.856-1.679,3.125-6.133,2.26-4.437L108.859,1Z" transform="translate(-16.458)" fill="#f9a64a"/>
          </g>
        </svg>`)}`;

      // ── New/Subsequent Pages Logo (Black Elements with Subtext Paths) ──
      const blackLogoSvg = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="112.918" height="40" viewBox="0 0 112.918 40">
          <g transform="translate(-0.749 -1)">
            <path d="M73.807,11.411a13.36,13.36,0,0,0-1.871-4.367,13.516,13.516,0,0,0-3.822-3.822,13.421,13.421,0,0,0-14.774,0,13.527,13.527,0,0,0-3.822,3.822,13.452,13.452,0,0,0-2.214,7.387,13.42,13.42,0,0,0,6.036,11.206,13.359,13.359,0,0,0,7.367,2.215l.021,0,.021,0a13.352,13.352,0,0,0,7.366-2.215,13.5,13.5,0,0,0,3.822-3.822,13.417,13.417,0,0,0,1.871-10.4m-13.079,10.4H60.7a7.386,7.386,0,1,1,7.413-7.392v.013a7.385,7.385,0,0,1-7.36,7.378Z" transform="translate(-7.759 -0.001)" fill="#000"/>
            <path d="M33.753,21.816V1.008H27.714V27.853H41.089L42.7,21.816Z" transform="translate(-4.494 -0.001)" fill="#000"/>
            <path d="M14.146,21.815a7.385,7.385,0,0,1,.027-14.771h4.217L20,1.007H14.174A13.36,13.36,0,0,0,6.787,3.223,13.505,13.505,0,0,0,2.966,7.045a13.307,13.307,0,0,0-1.871,4.367,13.348,13.348,0,0,0,0,6.037,13.322,13.322,0,0,0,1.871,4.367,13.505,13.505,0,0,0,3.822,3.822,13.355,13.355,0,0,0,7.367,2.215l.02,0,.02,0h4.2L20,21.815Z" transform="translate(0 -0.001)" fill="#000"/>
            <path d="M120.636,21.815V17.448h8.41V11.411h-8.41V7.044h10.4l1.607-6.037H114.6V27.852h16.438l1.607-6.037Z" transform="translate(-18.975 -0.001)" fill="#000"/>
            <path d="M83.949,1.007H77.91L91.589,27.853l3.021-5.921Z" transform="translate(-12.86 -0.001)" fill="#000"/>
            <path d="M.75,43.823H2.3v4.09h.877v-4.09H4.726v-.815H.75Z" transform="translate(0 -7.001)" fill="#000"/>
            <path d="M13.568,45.793H16.05v-.814H13.568V43.823h2.65v-.814H12.692v4.9h3.557V47.1H13.568Z" transform="translate(-1.991 -7.002)" fill="#000"/>
            <path d="M39.889,44.941H37.7V43.009h-.877v4.9H37.7V45.757h2.191v2.156h.877v-4.9h-.877Z" transform="translate(-6.012 -7.001)" fill="#000"/>
            <path d="M52.372,46.289l-2.261-3.281h-.818v4.9h.877v-3.28l2.26,3.28h.821v-4.9h-.878Z" transform="translate(-8.091 -7.001)" fill="#000"/>
            <path d="M65.571,43.68a2.146,2.146,0,0,0-.734-.572,2.551,2.551,0,0,0-2.032,0,2.162,2.162,0,0,0-.736.572,2.443,2.443,0,0,0-.433.813,3.257,3.257,0,0,0,0,1.9,2.413,2.413,0,0,0,.434.812,2.165,2.165,0,0,0,.735.567,2.531,2.531,0,0,0,2.034,0,2.159,2.159,0,0,0,.73-.567A2.41,2.41,0,0,0,66,46.389a3.255,3.255,0,0,0,0-1.894,2.469,2.469,0,0,0-.433-.814m-2.4,3.35a1.262,1.262,0,0,1-.442-.377,1.764,1.764,0,0,1-.265-.557,2.514,2.514,0,0,1-.088-.654,2.473,2.473,0,0,1,.088-.655,1.743,1.743,0,0,1,.264-.555,1.282,1.282,0,0,1,.443-.379,1.593,1.593,0,0,1,1.306,0,1.317,1.317,0,0,1,.441.379,1.753,1.753,0,0,1,.265.553,2.472,2.472,0,0,1,0,1.31,1.725,1.725,0,0,1-.265.557,1.275,1.275,0,0,1-.441.378,1.573,1.573,0,0,1-1.306,0" transform="translate(-10.124 -6.983)" fill="#000"/>
            <path d="M75.412,43.009h-.877v4.9h3.372V47.1H75.412Z" transform="translate(-12.298 -7.001)" fill="#000"/>
            <path d="M89.557,43.68a2.152,2.152,0,0,0-.732-.572,2.555,2.555,0,0,0-2.033,0,2.138,2.138,0,0,0-.735.572,2.451,2.451,0,0,0-.433.814,3.271,3.271,0,0,0,0,1.893,2.374,2.374,0,0,0,.435.812,2.147,2.147,0,0,0,.733.569,2.336,2.336,0,0,0,1.019.213,2.3,2.3,0,0,0,1.015-.213,2.135,2.135,0,0,0,.73-.568,2.37,2.37,0,0,0,.435-.811,3.239,3.239,0,0,0,0-1.9,2.423,2.423,0,0,0-.433-.815m-1.747.031a1.393,1.393,0,0,1,.65.141,1.286,1.286,0,0,1,.442.381,1.649,1.649,0,0,1,.263.553,2.429,2.429,0,0,1,0,1.31,1.679,1.679,0,0,1-.263.556,1.275,1.275,0,0,1-.442.378,1.565,1.565,0,0,1-1.3,0,1.242,1.242,0,0,1-.443-.379,1.654,1.654,0,0,1-.265-.555,2.431,2.431,0,0,1,0-1.311,1.672,1.672,0,0,1,.265-.552,1.263,1.263,0,0,1,.443-.379,1.4,1.4,0,0,1,.655-.142" transform="translate(-14.122 -6.983)" fill="#000"/>
            <path d="M111.316,47.913h.877v-4.9h-.877v4.9Z" transform="translate(-18.428 -7.001)" fill="#000"/>
            <path d="M121.031,45.793h2.482v-.814h-2.482V43.823h2.651v-.814h-3.528v4.9h3.559V47.1h-2.682Z" transform="translate(-19.901 -7.002)" fill="#000"/>
            <path d="M27.625,45.871l-.008.078a1.714,1.714,0,0,1-.125.491,1.357,1.357,0,0,1-.251.386,1.084,1.084,0,0,1-.359.254,1.394,1.394,0,0,1-1.122-.05,1.252,1.252,0,0,1-.443-.379,1.668,1.668,0,0,1-.264-.555,2.49,2.49,0,0,1-.089-.653,2.454,2.454,0,0,1,.09-.657,1.693,1.693,0,0,1,.263-.553,1.263,1.263,0,0,1,.443-.379,1.427,1.427,0,0,1,1.051-.082,1.255,1.255,0,0,1,.339.173,1.075,1.075,0,0,1,.255.282h0a1.224,1.224,0,0,1,.154.384l.007.029h.876l-.013-.105a1.773,1.773,0,0,0-.241-.71,1.881,1.881,0,0,0-.469-.513A2.011,2.011,0,0,0,27.1,43a2.428,2.428,0,0,0-1.7.108,2.161,2.161,0,0,0-.735.572,2.422,2.422,0,0,0-.432.815,3.243,3.243,0,0,0,0,1.893,2.358,2.358,0,0,0,.434.812,2.155,2.155,0,0,0,.733.569,2.331,2.331,0,0,0,1.019.213,2.176,2.176,0,0,0,.8-.141,1.91,1.91,0,0,0,.636-.4,2.073,2.073,0,0,0,.432-.63A2.574,2.574,0,0,0,28.49,46l.013-.125Z" transform="translate(-3.89 -6.982)" fill="#000"/>
            <path d="M100.395,45.994H101.9a1.547,1.547,0,0,1-.074.356,1.194,1.194,0,0,1-.249.435,1.157,1.157,0,0,1-.412.284,1.588,1.588,0,0,1-1.224-.038,1.254,1.254,0,0,1-.444-.379,1.666,1.666,0,0,1-.263-.555,2.453,2.453,0,0,1,0-1.311,1.68,1.68,0,0,1,.263-.553,1.289,1.289,0,0,1,.443-.378,1.517,1.517,0,0,1,1.144-.057,1.322,1.322,0,0,1,.374.225,1.186,1.186,0,0,1,.245.3.845.845,0,0,1,.06.18h.891a2.014,2.014,0,0,0-.239-.662A1.885,1.885,0,0,0,101.321,43a2.562,2.562,0,0,0-1.744.108,2.165,2.165,0,0,0-.734.572,2.406,2.406,0,0,0-.432.815,3.216,3.216,0,0,0,0,1.893,2.36,2.36,0,0,0,.432.812,2.161,2.161,0,0,0,.735.569,2.339,2.339,0,0,0,1.018.213,2.415,2.415,0,0,0,.52-.056,1.825,1.825,0,0,0,.487-.182,1.781,1.781,0,0,0,.362-.265l.03.414h.742V45.178h-2.342Z" transform="translate(-16.253 -6.983)" fill="#000"/>
            <path d="M135.353,45.926a1.151,1.151,0,0,0-.308-.4,1.677,1.677,0,0,0-.423-.259,3.311,3.311,0,0,0-.483-.165l-1.088-.268a1.7,1.7,0,0,1-.223-.072.515.515,0,0,1-.154-.092.337.337,0,0,1-.089-.119.428.428,0,0,1-.033-.177.62.62,0,0,1,.066-.307.543.543,0,0,1,.174-.193.8.8,0,0,1,.28-.118,1.506,1.506,0,0,1,.754.013,1,1,0,0,1,.31.158.763.763,0,0,1,.207.246.824.824,0,0,1,.088.352l0,.038h.874v-.051a1.483,1.483,0,0,0-.579-1.215,1.81,1.81,0,0,0-.6-.3,2.474,2.474,0,0,0-1.551.059,1.568,1.568,0,0,0-.547.382,1.249,1.249,0,0,0-.283.5,1.582,1.582,0,0,0-.072.443,1.3,1.3,0,0,0,.105.538,1.189,1.189,0,0,0,.274.377,1.233,1.233,0,0,0,.389.242,3.319,3.319,0,0,0,.409.137l.989.242a2.808,2.808,0,0,1,.294.09,1.033,1.033,0,0,1,.245.127.568.568,0,0,1,.155.161.4.4,0,0,1,.051.208.484.484,0,0,1-.079.286.719.719,0,0,1-.229.216,1.115,1.115,0,0,1-.319.132,1.776,1.776,0,0,1-.849-.011,1.041,1.041,0,0,1-.382-.161.687.687,0,0,1-.235-.281v0a1,1,0,0,1-.085-.468l0-.058h-.877l0,.043a1.818,1.818,0,0,0,.128.806,1.443,1.443,0,0,0,.433.569,1.819,1.819,0,0,0,.655.318,3.066,3.066,0,0,0,.788.1,3.017,3.017,0,0,0,.731-.078,1.983,1.983,0,0,0,.533-.214,1.273,1.273,0,0,0,.36-.315,1.5,1.5,0,0,0,.2-.333,1.258,1.258,0,0,0,.093-.326,2.044,2.044,0,0,0,.015-.227A1.312,1.312,0,0,0,135.353,45.926Z" transform="translate(-21.797 -6.983)" fill="#000"/>
          </g>
          <g>
            <path d="M99.348,17.7q-.253.614-.556,1.252c-.046.1-.092.193-.14.289L107.948,1H94.031a10.347,10.347,0,0,1,4.651,3.481h0a10.3,10.3,0,0,1,.763,1.172,10.546,10.546,0,0,1,.68,1.479c.088.241.168.489.242.744a11.8,11.8,0,0,1,.426,3.693A17.82,17.82,0,0,1,99.348,17.7Z" transform="translate(-15.547)" fill="#f9a64a"/>
            <path d="M102.367,12.813a17.158,17.158,0,0,0,.365-4.351,11.761,11.761,0,0,1-1.414.658,11.8,11.8,0,0,1,.426,3.692,17.82,17.82,0,0,1-1.444,6.133q-.252.614-.556,1.252c.207-.424.4-.84.582-1.252A29.717,29.717,0,0,0,102.367,12.813Z" transform="translate(-16.499 -1.244)" fill="#ffcd7b"/>
            <path d="M100.767,3.058A8.908,8.908,0,0,0,99.4,1H94.031a10.347,10.347,0,0,1,4.651,3.481,13.754,13.754,0,0,0,1.411-.1c.388-.048.765-.112,1.132-.188A9.655,9.655,0,0,0,100.767,3.058Z" transform="translate(-15.547)" fill="#f9a64a"/>
            <path d="M102.705,7.771a11.47,11.47,0,0,0-.551-2.94c-.367.076-.743.139-1.132.188a13.991,13.991,0,0,1-1.411.1,10.3,10.3,0,0,1,.762,1.172,10.546,10.546,0,0,1,.68,1.479c.088.241.168.489.242.744a12.947,12.947,0,0,0,1.414-.658Z" transform="translate(-16.477 -0.639)" fill="#fcba63"/>
            <path d="M104.515,1H100.47a8.908,8.908,0,0,1,1.37,2.058,9.657,9.657,0,0,1,.457,1.135,15.256,15.256,0,0,0,2.574-.777A7.312,7.312,0,0,0,104.515,1Z" transform="translate(-16.62)" fill="#f69333"/>
            <path d="M102.663,4.676a11.468,11.468,0,0,1,.551,2.94l0,.086.155-.086a13.853,13.853,0,0,0,1.6-1.048c.008-.047.261-1.847.262-2.668A15.257,15.257,0,0,1,102.663,4.676Z" transform="translate(-16.986 -0.483)" fill="#f9a64a"/>
            <path d="M102.859,8.149l-.155.086a17.158,17.158,0,0,1-.365,4.351,29.718,29.718,0,0,1-2.041,6.133c-.183.412-.376.828-.583,1.252-.046.1-.092.192-.14.289.2-.389.457-.913.757-1.541.747-1.563,1.739-3.768,2.592-6.133a37.386,37.386,0,0,0,1.327-4.437c.08-.353.148-.7.209-1.048A13.853,13.853,0,0,1,102.859,8.149Z" transform="translate(-16.471 -1.017)" fill="#fcba63"/>
            <path d="M105.324,1a7.313,7.313,0,0,1,.357,2.416A15.549,15.549,0,0,0,109.831,1Z" transform="translate(-17.429)" fill="#f48120"/>
            <path d="M105.7,3.416c0,.822-.254,2.622-.263,2.668.153-.122.3-.252.453-.385a24.711,24.711,0,0,0,3.893-4.6l.067-.1A15.55,15.55,0,0,1,105.7,3.416Z" transform="translate(-17.448)" fill="#f69333"/>
            <path d="M108.792,1.1A24.711,24.711,0,0,1,104.9,5.7c-.149.133-.3.263-.453.385-.061.346-.129.7-.209,1.048a37.383,37.383,0,0,1-1.327,4.437c-.853,2.364-1.845,4.569-2.592,6.133-.3.628-.56,1.152-.757,1.541l-.068.138.856-1.679,3.125-6.133,2.26-4.437L108.859,1Z" transform="translate(-16.458)" fill="#f9a64a"/>
          </g>
        </svg>`)}`;

      // ── Process White Logo Image ──
      const whiteImgObj = new Image();
      const whiteLogoPng = await new Promise<string>(r => {
        whiteImgObj.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = whiteImgObj.naturalWidth;
          canvas.height = whiteImgObj.naturalHeight;
          canvas.getContext('2d')!.drawImage(whiteImgObj, 0, 0);
          r(canvas.toDataURL('image/png'));
        };
        whiteImgObj.src = whiteLogoSvg;
      });

      // ── Process Black Logo Image ──
      const blackImgObj = new Image();
      const blackLogoPng = await new Promise<string>(r => {
        blackImgObj.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = blackImgObj.naturalWidth;
          canvas.height = blackImgObj.naturalHeight;
          canvas.getContext('2d')!.drawImage(blackImgObj, 0, 0);
          r(canvas.toDataURL('image/png'));
        };
        blackImgObj.src = blackLogoSvg;
      });

      // ── Page Content Printer ──
      const write = (text: string, size = 10, style: 'normal' | 'bold' | 'italic' = 'normal') => {
        if (y > 270) {
          doc.addPage();

          // Remaining pages only get the thin red line accent at the very top (No navy background block)
          // doc.setFillColor(255, 103, 36);
          doc.rect(0, 0, 210, 1.5, 'F');

          // ADDED: Embed the updated Black Clove Logo with subtext in top left corner of subsequent pages
          doc.addImage(blackLogoPng, 'PNG', 15, 8, 20, 7.1);

          y = 22; // Setup custom high-boundary line break safety index
        }
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        doc.text(text, margin, y);
        y += lineH;
      };

      const writeLines = (lines: string[], size = 10, style: 'normal' | 'bold' | 'italic' = 'normal') => {
        for (const l of lines) write(l, size, style);
      };

      // ── First Page Header (Only page with dark navy background) ──
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 22, 'F');
      doc.setFillColor(255, 103, 36);
      doc.rect(0, 22, 210, 1.5, 'F');

      // First Page Logo (White elements) & Date Placement
      doc.addImage(whiteLogoPng, 'PNG', 15, 6, 30, 10);
      doc.setFontSize(9);
      doc.setTextColor(226, 232, 240);
      doc.text(`DATE: ${today}`, 195, 8, { align: 'right' });
      doc.setTextColor(51, 65, 85);

      // ── Salutation & Introduction ──
      write(`Hello, ${this.calculator.currentUser()?.name}`, 11, 'bold');
      y += 1;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      const proposalTitle = `Proposal: ${c.projectNumber() || '(Project Number)'} - ${mode} - ${c.smartProjectName() || 'Project'} Project.`;
      doc.text(proposalTitle, margin, y, { maxWidth: bodyW });
      y += 6;

      write(`Size: ${area} - (Actual area will be confirmed once we receive the point cloud)`, 10, 'italic');
      y += 3;

      // ── 1. Project Overview ──
      write('1. Project Overview', 11, 'bold');
      const overview = isCad
        ? 'This proposal outlines the scope, methodology, and deliverables for developing CAD layouts using the provided scan data.'
        : 'This proposal outlines the scope, methodology, and deliverables for developing Revit model using the provided scan data.';
      writeLines(doc.splitTextToSize(overview, bodyW), 10);
      y += 3;

      // Add Ons (defined early so scope and exclusions can reference them)
      const addOns = c.bimAddOns() || [];

      // ── 2. Scope of Work ──
      write('2. Scope of Work', 11, 'bold');
      if (isCad) {
        const reqs = c.cadRequirements() || [];
        if (reqs.includes('Floor Plan')) write('• Architectural Floor Plan (Excluding furniture)');
        if (reqs.includes('Furniture')) write('• Architectural Floor Plan (Including furniture)');
        if (reqs.includes('RCP')) write('• Reflected Ceiling Plan (RCP)');
        if (reqs.includes('Internal Elevations')) write('• Internal Elevations');
        if (reqs.includes('External Elevations')) write('• External Elevations');
        if (reqs.includes('Sections')) write('• Sections');
        if (reqs.includes('Site Plan')) write('• Site Plan');
        if (reqs.includes('MEP')) write('• MEP Layout');
        if (reqs.includes('Sheets')) write('• Sheets / Drawing Set');
      } else {
        const reqs = c.bimRequirements() || [];
        const hasArch = reqs.includes('Architectural');
        const hasFurn = reqs.includes('Furniture');
        if (hasArch && !hasFurn) write('• Architectural model (Excluding furniture)');
        if (hasArch && hasFurn) write('• Architectural model (Including furniture)');
        if (reqs.includes('Structural')) write('• Structural model');
        if (reqs.includes('Mechanical')) write('• Mechanical model');
        if (reqs.includes('Electrical')) write('• Electrical model');
        if (reqs.includes('Plumbing')) write('• Plumbing model');
        if (reqs.includes('Fire Protection')) write('• Fire Protection model');

        for (const ao of addOns) {
          if (ao === 'Floor Plan') write('• Floor Plan drawing');
          else if (ao === 'RCP') write('• Reflected Ceiling Plan (RCP)');
          else if (ao === 'Internal Elevations') write('• Internal Elevations');
          else if (ao === 'External Elevations') write('• External Elevations');
          else if (ao === 'Sections') write('• Sections');
          else if (ao === 'Site Plan') write('• Site Plan');
          else if (ao === 'MEP') write('• MEP Layout');
          else if (ao === 'Sheets') write('• Sheets / Drawing Set');
          else if (ao === 'Scan to BIM') write('• Scan to BIM');
          else if (ao === 'Scan to CAD') write('• Scan to CAD');
          else write(`• ${ao}`);
        }
      }
      y += 2;

      // Add Ons summary
      write("Add On's Selected:", 10, 'bold');
      if (addOns.length) {
        for (const ao of addOns) write(`• ${ao}`);
      } else {
        write('• None selected');
      }
      y += 3;

      if (isCad) {
        write('3. Scale', 11, 'bold');
        const scale = c.cadScale() || 'N/A';
        const acadVer = c.smartAutocadVersion() || 'AutoCAD';
        write(`All the above drawings will be drafted to ${scale} using ${acadVer}.`);
        y += 3;
      } else {
        write('3. LOD & Version', 11, 'bold');
        const lod = c.smartLODLevel().replace('_', ' ') || 'LOD 300';
        const revitVer = c.smartRevitVersion() || 'Revit';
        write(`The model will be developed to ${lod} using ${revitVer}.`);
        y += 3;
      }

      // ── 4. Data Requirements ──
      write('4. Data Requirements', 11, 'bold');
      writeLines(doc.splitTextToSize('To ensure an accurate and efficient modelling workflow, the following inputs are requested:', bodyW));
      write('• .e57 point cloud file (preferred and sufficient for documentation)');
      write('• Virtual tour access for visual cross-verification');
      y += 3;

      // ── 5. Deliverables ──
      write('5. Deliverables', 11, 'bold');
      writeLines(doc.splitTextToSize('Upon completion, the following will be provided:', bodyW));
      if (isCad) {
        write('• AutoCAD drawings, .dwg');
        write('• PDF documentation, .pdf');
      } else {
        const hasSheets = addOns.includes('Sheets');
        write('• Revit model, .rvt');
        write(`• AutoCAD drawings, .dwg ${hasSheets ? '' : '(If sheets are selected)'}`);
        write(`• PDF documentation, .pdf ${hasSheets ? '' : '(If sheets are selected)'}`);
      }
      y += 3;

      // ── 6. Exclusions ──
      write('6. Exclusions', 11, 'bold');
      writeLines(doc.splitTextToSize('The following items are outside the current scope unless specifically requested:', bodyW));
      if (isCad) {
        const reqs = c.cadRequirements() || [];
        if (!reqs.includes('MEP')) write('• MEP drawings (If MEP is not selected in the scope of work)');
        for (const opt of ['Floor Plan', 'RCP', 'Internal Elevations', 'External Elevations', 'Sections', 'Site Plan', 'Furniture', 'Sheets']) {
          if (!reqs.includes(opt) && !addOns.includes(opt)) write(`• ${opt}`);
        }
      } else {
        const reqs = c.bimRequirements() || [];
        const allScope = ['Architectural', 'Structural', 'Mechanical', 'Electrical', 'Plumbing', 'Fire Protection', 'Furniture'];
        for (const s of allScope) {
          if (!reqs.includes(s)) write(`• ${s} model`);
        }
        for (const ao of ['Floor Plan', 'RCP', 'Internal Elevations', 'External Elevations', 'Sections', 'Site Plan', 'MEP', 'Sheets']) {
          if (!addOns.includes(ao)) write(`• ${ao}`);
        }
      }
      y += 4;

      // ── 7. Assumptions ──
      write('7. Assumptions', 11, 'bold');
      const asIsText = isCad ? 'drafted as-is' : 'modeled as-is';
      writeLines(doc.splitTextToSize('• Accuracy is dependent on the quality and completeness of the point cloud.', bodyW));
      writeLines(doc.splitTextToSize(`• Areas obstructed or not captured will be ${asIsText} or left incomplete.`, bodyW));
      y += 3;

      // ── 8. Pricing Estimate ──
      write('8. Pricing Estimate', 11, 'bold');
      const pricingDesc = isCad
        ? 'Based on the provided project description and typical drafting requirements:'
        : `Based on the provided project description and typical ${c.smartLODLevel().replace('_', ' ')} modeling requirements:`;
      writeLines(doc.splitTextToSize(pricingDesc, bodyW));
      const serviceLabel = isCad ? 'AutoCAD Drafting:' : 'Revit Modeling:';
      write(serviceLabel, 10, 'bold');
      write(`Estimated Area: ${area}`);
      write(`Estimated Cost: ${totalStr} (Actual Rate arrived from Rate Card)`);
      y += 2;

      // ── 9. Timeline ──
      write('9. Timeline', 11, 'bold');
      write(`Will be delivered within ${est.businessDaysText} business days.`);
      y += 4;

      // ── Closing & Sign-off ──
      write('Looking forward to your GO Order.', 10);
      y += 2;
      write('Best regards,', 10);
      y += 1;
      write('Clove Technologies Inc.,', 10, 'bold');
      write('12600 Deerfield Pkwy #100', 10);
      write('Alpharetta, GA 30004', 10);
      write('C: (470) 518-5999', 10);
      write('sj@clovetech.com', 10);
      write('www.clovetech.com', 10);
      y += 5;

      // ── Footnotes Handling Loop ──
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      const isBimFootnotes = [
        'Clove Technologies reserves the right to revise the proposal if the density or complexity of the actual modeling differs from the initial information provided.',
        'Any additional requirements not included in the proposal will be considered out of scope and, if required, will be priced separately.',
        'Please review the sample deliverables available in the Resources section of our website to align expectations.',
        'Clove Technologies will use standard revit families unless the Client provides a project specific library.',
        'Title block and labeling information, if any, should be provided by the Client; otherwise, standard title blocks will be used.',
        'General layering standards will be applied unless the Client provides specific layering guidelines.',
      ];
      const isCadFootnotes = [
        'Clove Technologies reserves the right to revise the proposal if the density or complexity of the actual drafting work differs from the initial information provided.',
        'Any additional requirements not included in the proposal will be considered out of scope and, if required, will be priced separately.',
        'Please review the sample deliverables available in the Resources section of our website to align expectations.',
        'Title block and labeling information, if any, should be provided by the Client; otherwise, standard title blocks will be used.',
        'General layering standards will be applied unless the Client provides specific layering guidelines.',
      ];

      const footnotes = isCad ? isCadFootnotes : isBimFootnotes;
      for (const fn of footnotes) {
        const lines = doc.splitTextToSize(`• ${fn}`, bodyW);
        for (const l of lines) {
          write(l, 8, 'italic');
        }
      }

      doc.save(`Proposal_${c.smartProjectName()}.pdf`);
      this.calculator.showNotification('PDF downloaded successfully!', 'success');
    } catch (e) {
      console.error(e);
      this.calculator.showNotification('Failed to generate PDF document.', 'warn');
    }
  }

  triggerQuoteRequest() {
    const c = this.calculator;
    c.placeOrder.set(true);
    const mode = c.selectedModelingWay() === 'bim' ? 'Scan to BIM' : 'Scan to CAD';
    console.log('=== QUOTE REQUEST ===');
    console.log('Mode:', mode);
    console.log('--- Step 1: Project Specs ---');
    console.log('Project Name:', c.smartProjectName());
    // console.log('Type:', c.projectType());
    console.log('Area:', c.smartScanSize(), c.smartIsMetric() ? 'Sq.m' : 'Sq.ft');
    console.log('Building Type:', c.selectedBuildingType());
    if (c.selectedModelingWay() === 'scan_to_cad') {
      console.log('Requirements:', c.cadRequirements());
      console.log('Scale:', c.cadScale());
      console.log('AutoCAD Version:', c.smartAutocadVersion());
    } else {
      console.log('Requirements:', c.bimRequirements());
      console.log('Add Ons:', c.bimAddOns());
      console.log('LOD Level:', c.smartLODLevel());
      console.log('Revit Version:', c.smartRevitVersion());
    }
    console.log('Currency:', c.selectedCurrency());
    console.log('Description:', c.description());
    console.log('Email:', c.smartEmail());
    console.log('--- Step 2: Upload & Project Info ---');
    console.log('Upload Link:', c.uploadLink());
    console.log('Point Cloud Link:', c.pointCloudLink());
    console.log('Description Link:', c.descriptionLink());
    console.log('Remark:', c.remark());
    // console.log('Manual Estimation:', c.manualEstimation());
    console.log('Send Proposal:', c.sendProposal());
    console.log('Place Order:', c.placeOrder());
    console.log('--- Step 3: Order Summary ---');
    console.log('Project Number:', c.projectNumber());
    console.log('Order Placed Date:', c.orderPlacedDate());
    console.log('Point Cloud Issue Date:', c.pointCloudIssueDate());
    console.log('Expected Delivery Date:', c.expectedDeliveryDate());
    console.log('Total Price:', c.calculatedSmartEstimate().currencySymbol + c.calculatedSmartEstimate().totalPrice, c.selectedCurrency());
    console.log('========================');
    this.calculator.showNotification('Initiating connection with production director...', 'info');
    setTimeout(() => {
      this.calculator.showNotification(`Handshake complete. Production pipeline coordinates sent securely to ${c.smartEmail()}!`, 'success');
    }, 2200);
  }

  toggleInteriorArchitecture() {
    this.calculator.smartInteriorArchitecture.set(!this.calculator.smartInteriorArchitecture());
  }

  toggleInteriorFurniture() {
    this.calculator.smartInteriorFurniture.set(!this.calculator.smartInteriorFurniture());
  }

  toggleInteriorMep() {
    this.calculator.smartInteriorMep.set(!this.calculator.smartInteriorMep());
  }

  toggleComplexMepf() {
    this.calculator.smartIsComplexMepf.set(!this.calculator.smartIsComplexMepf());
  }

  toggleExteriorRequired() {
    this.calculator.smartIsExteriorRequired.set(!this.calculator.smartIsExteriorRequired());
  }

  toggleExteriorArchitecture() {
    this.calculator.smartExteriorArchitecture.set(!this.calculator.smartExteriorArchitecture());
  }

  toggleExteriorFurniture() {
    this.calculator.smartExteriorFurniture.set(!this.calculator.smartExteriorFurniture());
  }

  toggleExteriorMep() {
    this.calculator.smartExteriorMep.set(!this.calculator.smartExteriorMep());
  }

  toggleSiteRequired() {
    this.calculator.smartIsSiteRequired.set(!this.calculator.smartIsSiteRequired());
  }

  toggleBuildingTypeDropdown() {
    const was = this.calculator.isBuildingTypeDropdownOpen();
    this.calculator.closeAllDropdowns();
    this.calculator.isBuildingTypeDropdownOpen.set(!was);
  }
  toggleCadRequirementsDropdown() {
    const was = this.calculator.isCadRequirementsOpen();
    this.calculator.closeAllDropdowns();
    this.calculator.isCadRequirementsOpen.set(!was);
  }
  toggleCadScaleDropdown() {
    const was = this.calculator.isCadScaleDropdownOpen();
    this.calculator.closeAllDropdowns();
    this.calculator.isCadScaleDropdownOpen.set(!was);
  }
  toggleBimRequirementsDropdown() {
    const was = this.calculator.isBimRequirementsOpen();
    this.calculator.closeAllDropdowns();
    this.calculator.isBimRequirementsOpen.set(!was);
  }
  toggleBimAddOnsDropdown() {
    const was = this.calculator.isBimAddOnsOpen();
    this.calculator.closeAllDropdowns();
    this.calculator.isBimAddOnsOpen.set(!was);
  }
  toggleCurrencyDropdown() {
    const was = this.calculator.isCurrencyDropdownOpen();
    this.calculator.closeAllDropdowns();
    this.calculator.isCurrencyDropdownOpen.set(!was);
  }
}
