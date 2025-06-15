import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsTab } from './details-tab';

describe('Details', () => {
  let component: DetailsTab;
  let fixture: ComponentFixture<DetailsTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsTab],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
