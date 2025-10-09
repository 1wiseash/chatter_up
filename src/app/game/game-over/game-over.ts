import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameService, UserService } from '@services';

@Component({
  selector: 'cu-game-over',
  imports: [],
  templateUrl: './game-over.html',
  styleUrl: './game-over.css'
})
export class GameOver {
    private readonly _gameService = inject(GameService);
    private readonly _userService = inject(UserService);

    user = toSignal(this._userService.user$);
    game = toSignal(this._gameService.currentChatterUpGame$);

    // bestGame = computed(() => {
    //     // const this.user()?.chatScores
    // });
}
