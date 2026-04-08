import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyPage } from './verify-page';

describe('VerifyPage', () => {
  let component: VerifyPage;
  let fixture: ComponentFixture<VerifyPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
