import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterPlot } from './scatter-plot';

describe('ScatterPlot', () => {
  let component: ScatterPlot;
  let fixture: ComponentFixture<ScatterPlot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScatterPlot],
    }).compileComponents();

    fixture = TestBed.createComponent(ScatterPlot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
