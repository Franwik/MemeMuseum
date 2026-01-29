import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemeCard } from './meme-card';

describe('MemeCard', () => {
  let component: MemeCard;
  let fixture: ComponentFixture<MemeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemeCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemeCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
