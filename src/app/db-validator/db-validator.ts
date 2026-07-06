import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppHeader } from '../app-header/app-header';
import { SpatialCostCalculator } from '../services/spatial-cost-calculator';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

interface ProjectInfo {
  id: number;
  user_id: number;
  project_name: string;
  scope: string;
  sft: number;
  cost: number;
  currency: string;
  workflow_status: string;
  created_at: string;
  [key: string]: unknown;
}

interface ValidationData {
  database_path: string;
  users: UserInfo[];
  projects: ProjectInfo[];
  errors: string[];
}

@Component({
  selector: 'app-db-validator',
  imports: [CommonModule, AppHeader],
  templateUrl: './db-validator.html',
  styleUrls: ['./db-validator.css'],
})
export class DbValidator {
  private calculator = inject(SpatialCostCalculator);

  validationData = signal<ValidationData | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  async loadValidationData() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const data = await this.calculator.apiValidateDatabase() as ValidationData;
      this.validationData.set(data);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to load validation data.');
    } finally {
      this.isLoading.set(false);
    }
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'Yet to Award': '#f59e0b',
      'In Progress': '#3b82f6',
      'Under Revision': '#a855f7',
      'Completed': '#22c55e',
    };
    return colorMap[status] || '#94a3b8';
  }

  ngOnInit() {
    this.loadValidationData();
  }
}
