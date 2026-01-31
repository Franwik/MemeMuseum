import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemePreview } from './meme-preview';

describe('MemePreview', () => {
  let component: MemePreview;
  let fixture: ComponentFixture<MemePreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemePreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemePreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
