import { Component, inject, signal, Signal } from '@angular/core';
import { GameService } from '@services';
import { ChatterUpGame, DEFAULT_CHATTER_UP_GAME, GameType } from '@models';
import { GameTypeComponent } from '@shared/game-type/game-type';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'cu-lobby',
  imports: [GameTypeComponent, RouterLink],
  templateUrl: './lobby.html',
  styleUrl: './lobby.css'
})
export class Lobby {
    private readonly _gameService = inject(GameService);
    games = signal<ChatterUpGame[]>([]);

    constructor() {
        this._gameService.getGreatistHits().then( (games => {
            // console.log('greatest hits:', games.map( g => g.score ));
            this.games.set(games);
        })).catch( (error) => {
            console.error('Failed to retrieve greatest hits:', error);
        });
    }
}
