import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpatialCostCalculator } from './services/spatial-cost-calculator';
import { Dashboard } from './dashboard/dashboard';
import { Portfolio } from './portfolio/portfolio';
import { PriceEstimation } from './price-estimation/price-estimation';
import { BimSelection } from './bim-selection/bim-selection';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    CommonModule,
    Dashboard,
    Portfolio,
    PriceEstimation,
    BimSelection
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  calculator = inject(SpatialCostCalculator);

  setTab(tab: 'dashboard' | 'portfolio' | 'config') {
    this.calculator.setTab(tab);
  }

  openAddModal() {
    this.calculator.openAddModal();
  }
}
