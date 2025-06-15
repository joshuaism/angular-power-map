import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityAutocomplete } from './entity-autocomplete';

describe('EntityAutocomplete', () => {
  let component: EntityAutocomplete;
  let fixture: ComponentFixture<EntityAutocomplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityAutocomplete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityAutocomplete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
