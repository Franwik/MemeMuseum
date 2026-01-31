import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Memedetails } from './memedetails';

describe('Memedetails', () => {
  let component: Memedetails;
  let fixture: ComponentFixture<Memedetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Memedetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Memedetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
