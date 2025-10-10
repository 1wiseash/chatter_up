import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChatterUpGame, User } from '@app/_core/models';
import { Z_ALERT_MODAL_DATA } from '@app/_shared/components/alert-dialog/alert-dialog.service';
import { GameService, UserService } from '@services';

interface iDialogData {
  game: ChatterUpGame;
  user: User;
}

@Component({
  selector: 'cu-game-over',
  imports: [DecimalPipe],
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.css'
})
export class GameOverComponent {
    zData = inject(Z_ALERT_MODAL_DATA) as iDialogData;

    user = this.zData.user;
    game = this.zData.game;
    avgScore = this.user.chatterUpStats.gameCounts[this.game.type] ? this.user.chatterUpStats.totalScores[this.game.type] / this.user.chatterUpStats.gameCounts[this.game.type] : 0;
    bestScore = this.user.chatterUpStats.bestScores[this.game.type];

}
