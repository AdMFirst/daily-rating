import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendlinePlot } from './trendline-plot';

describe('TrendlinePlot', () => {
  let component: TrendlinePlot;
  let fixture: ComponentFixture<TrendlinePlot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendlinePlot],
    }).compileComponents();

    fixture = TestBed.createComponent(TrendlinePlot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
