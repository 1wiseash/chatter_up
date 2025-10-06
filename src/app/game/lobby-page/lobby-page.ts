import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@services';
import { environments, GameType, GameTypeInfo } from '@models';
import { ZardButtonComponent } from "@shared/components/button/button.component";

@Component({
  selector: 'cu-lobby-page',
  imports: [ZardButtonComponent],
  templateUrl: './lobby-page.html',
  styleUrl: './lobby-page.css'
})
export class LobbyPage {
  gameEnvironments = environments;
  private readonly _router = inject(Router);
  private readonly _gameService = inject(GameService);
  
  async startChatterUp(gameType: GameType) {
    const gameStarted = await this._gameService.startChatterUp(gameType);
    if (gameStarted) {
      this._router.navigate(['/', 'game', 'chatterup'])
    }
  }

}
