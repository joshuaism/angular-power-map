import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Network } from './network/network';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Network],
  template: `<section><h1>Power-Map</h1></section>
    <section>
      <input type="text" placeholder="Search Person or Organization" />
    </section>
    <section>
      <app-network></app-network>
    </section> `,
  styleUrl: './app.css',
})
export class App {
  protected title = 'power-map';
}
