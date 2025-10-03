import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameInfo, GameType } from '@app/_core/models';

@Component({
  selector: 'cu-chatterup',
  imports: [],
  templateUrl: './chatterup.html',
  styleUrl: './chatterup.css'
})
export class Chatterup {
  private readonly _route = inject(ActivatedRoute); 

  chatEnvironmentId = signal(GameType.business);
  chatEnvironmentTitle = signal('');

  constructor() {
    // Subscribe to queryParams to react to changes
    this._route.queryParams.subscribe(params => {
      this.chatEnvironmentId.set(params['id']);
      this.chatEnvironmentTitle.set(params['title']);
      console.log('Chat environment:', this.chatEnvironmentTitle);
    });
  }
}
