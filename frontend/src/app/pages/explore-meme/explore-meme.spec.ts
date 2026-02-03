import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreMeme } from './explore-meme';

describe('ExploreMeme', () => {
  let component: ExploreMeme;
  let fixture: ComponentFixture<ExploreMeme>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreMeme]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreMeme);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
