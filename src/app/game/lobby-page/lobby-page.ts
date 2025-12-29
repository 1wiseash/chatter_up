import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@services';
import { environments, GameType } from '@models';
import { ZardButtonComponent } from "@shared/components/button/button.component";
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { LoadingGame } from '../loading-game/loading-game';

@Component({
  selector: 'cu-lobby-page',
  imports: [ZardButtonComponent],
  standalone: true,
  templateUrl: './lobby-page.html',
  styleUrl: './lobby-page.css'
})
export class LobbyPage {
  gameEnvironments = environments;
  private readonly _router = inject(Router);
  private readonly _gameService = inject(GameService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  
  async startChatterUp(gameType: GameType) {
    const infoDialog = this._alertDialogService.create({
      zContent: LoadingGame,
      zClosable: false,
      zOkText: null,
      zCancelText: null,
    });
    const gameStarted = await this._gameService.startChatterUp(gameType);
    if (gameStarted) {
      infoDialog.close();
      this._router.navigate(['/', 'game', 'chatterup'])
    }
  }

}
