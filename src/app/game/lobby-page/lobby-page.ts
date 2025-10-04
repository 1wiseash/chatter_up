import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environments, GameTypeInfo } from '@app/_core/models';
import { ZardButtonComponent } from "@app/_shared/components/button/button.component";

@Component({
  selector: 'cu-lobby-page',
  imports: [ZardButtonComponent, RouterLink],
  templateUrl: './lobby-page.html',
  styleUrl: './lobby-page.css'
})
export class LobbyPage {
  gameEnvironments = environments;
  private readonly _router = inject(Router); 
  
}
