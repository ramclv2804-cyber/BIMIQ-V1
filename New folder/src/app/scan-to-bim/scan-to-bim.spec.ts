import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanToBim } from './scan-to-bim';

describe('ScanToBim', () => {
  let component: ScanToBim;
  let fixture: ComponentFixture<ScanToBim>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanToBim]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScanToBim);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
