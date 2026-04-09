import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordDialog } from './password-dialog';

describe('PasswordDialog', () => {
  let component: PasswordDialog;
  let fixture: ComponentFixture<PasswordDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
