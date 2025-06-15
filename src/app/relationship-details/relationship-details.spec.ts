import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipDetails } from './relationship-details';

describe('RelationshipDetails', () => {
  let component: RelationshipDetails;
  let fixture: ComponentFixture<RelationshipDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationshipDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelationshipDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
