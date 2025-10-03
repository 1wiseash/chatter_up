import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chatterup } from './chatterup';

describe('Chatterup', () => {
  let component: Chatterup;
  let fixture: ComponentFixture<Chatterup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chatterup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chatterup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
