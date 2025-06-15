import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Entity } from '../entity';
import { LittlesisService } from '../littlesis.service';

@Component({
  selector: 'app-entity-autocomplete',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  template: `
    <form class="example-form">
      <mat-form-field class="example-full-width">
        <mat-label>Person or Organization</mat-label>
        <input
          type="text"
          placeholder="Search Person or Organization"
          aria-label="Person or Organization"
          matInput
          [formControl]="myControl"
          [matAutocomplete]="auto"
        />
        <mat-autocomplete #auto="matAutocomplete">
          @for (option of filteredOptions | async; track option) {
          <mat-option
            [value]="option"
            (onSelectionChange)="emitEntity(option)"
            >{{ option }}</mat-option
          >
          }
        </mat-autocomplete>
      </mat-form-field>
    </form>
  `,
  styleUrl: './entity-autocomplete.css',
})
export class EntityAutocomplete {
  @Output() notify: EventEmitter<Entity> = new EventEmitter<Entity>();
  service: LittlesisService = inject(LittlesisService);
  myControl = new FormControl('');
  options: Map<string, Entity> = new Map<string, Entity>();
  filteredOptions: Observable<string[]>;

  constructor() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: string): string[] {
    if (this.options.has(value)) {
      return [value];
    }
    let arr = value.toLowerCase().split(' ');
    const filters = arr.filter((e) => e.length > 0);

    if (
      Array.from(this.options.keys()).filter((key) =>
        filters.every((e) => key.toLowerCase().includes(e))
      ).length <= 5
    ) {
      this.service.getEntitiesByName(value).then((entities) => {
        entities.map((entity) => {
          this.options.set(entity.name, entity);
        });
      });
    }

    return Array.from(this.options.keys()).filter((key) =>
      filters.every((e) => key.toLowerCase().includes(e))
    );
  }

  emitEntity(value: string) {
    this.notify.emit(this.options.get(value));
  }
}
