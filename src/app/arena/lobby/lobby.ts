import { Component, inject, signal, Signal } from '@angular/core';
import { GameService } from '@services';
import { ChatterUpGame, DEFAULT_CHATTER_UP_GAME, GameType } from '@models';
import { GameTypeComponent } from '@shared/game-type/game-type';
import { RouterLink } from '@angular/router';
import { ZardTabComponent, ZardTabGroupComponent } from '@shared/components/tabs/tabs.component';

@Component({
  selector: 'cu-lobby',
  imports: [GameTypeComponent, RouterLink, ZardTabComponent, ZardTabGroupComponent],
  templateUrl: './lobby.html',
  styleUrl: './lobby.css'
})
export class Lobby {
    private readonly _gameService = inject(GameService);
    businessGames = signal<ChatterUpGame[]>([]);
    datingGames = signal<ChatterUpGame[]>([]);
    socialGames = signal<ChatterUpGame[]>([]);

    constructor() {
        this._gameService.getGreatistHits(GameType.business).then( (games) => {
            // console.log('greatest hits:', games.map( g => g.score ));
            this.businessGames.set(games);
        }).catch( (error) => {
            console.error('Failed to retrieve business greatest hits:', error);
        });

        this._gameService.getGreatistHits(GameType.dating).then( (games) => {
            // console.log('greatest hits:', games.map( g => g.score ));
            this.datingGames.set(games);
        }).catch( (error) => {
            console.error('Failed to retrieve dating greatest hits:', error);
        });

        this._gameService.getGreatistHits(GameType.social).then( (games) => {
            // console.log('greatest hits:', games.map( g => g.score ));
            this.socialGames.set(games);
        }).catch( (error) => {
            console.error('Failed to retrieve social greatest hits:', error);
        });
    }
}
