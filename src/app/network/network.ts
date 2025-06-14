import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { LittleSisNetwork } from '../network';
import { Details } from '../details/details';
import { Entity } from '../entity';

@Component({
  selector: 'app-network',
  imports: [Details],
  template: `<div id="mynetwork" #myNetwork></div>
    <app-details [entity]="entity"></app-details>`,
  styleUrls: ['./network.css'],
})
export class Network implements AfterViewInit {
  @ViewChild('myNetwork') networkContainer!: ElementRef;

  network?: LittleSisNetwork;
  entity: Entity = { id: 'details works kinda!' };

  constructor() {}

  ngAfterViewInit() {
    this.network = new LittleSisNetwork(this.networkContainer.nativeElement);
  }
}
