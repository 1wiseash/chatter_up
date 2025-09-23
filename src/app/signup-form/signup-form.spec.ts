import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSignupPassword } from './auth-signup-password';

describe('AuthSignupPassword', () => {
  let component: AuthSignupPassword;
  let fixture: ComponentFixture<AuthSignupPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSignupPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthSignupPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
