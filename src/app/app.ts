import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Network } from './network/network';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Network],
  template: `
    <section><h1>Power-Map</h1></section>
    <app-network></app-network>
  `,
  styleUrl: './app.css',
})
export class App {
  protected title = 'power-map';
}
