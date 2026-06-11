import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimationDashboard } from './estimation-dashboard';

describe('EstimationDashboard', () => {
  let component: EstimationDashboard;
  let fixture: ComponentFixture<EstimationDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstimationDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstimationDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
