import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuadrantPlot } from './quadrant-plot';

describe('QuadrantPlot', () => {
  let component: QuadrantPlot;
  let fixture: ComponentFixture<QuadrantPlot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuadrantPlot],
    }).compileComponents();

    fixture = TestBed.createComponent(QuadrantPlot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
