import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipsTab } from './relationships-tab';

describe('RelationshipsTab', () => {
  let component: RelationshipsTab;
  let fixture: ComponentFixture<RelationshipsTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationshipsTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelationshipsTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
