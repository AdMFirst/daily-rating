import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryStatistic } from './summary-statistic';

describe('SummaryStatistic', () => {
  let component: SummaryStatistic;
  let fixture: ComponentFixture<SummaryStatistic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryStatistic],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryStatistic);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
