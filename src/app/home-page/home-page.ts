import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChatterUpGame, GameType, User } from '@models';
import { GameService, UserService } from '@services';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ProgressBar } from '@shared/progress-bar/progress-bar';

@Component({
  selector: 'cu-home-page',
  imports: [ZardCardComponent, ZardBadgeComponent, ZardButtonComponent, ProgressBar, DatePipe ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
    private readonly _gameService = inject(GameService);
    private readonly _userService = inject(UserService);

    user = toSignal(this._userService.user$) as Signal<User>;
    recentGames = signal<ChatterUpGame[]>([]);
    userStats = {
        level: 'Intermediate',
        nextLevel: 'Advanced'
    };

    constructor() {
        const games: ChatterUpGame[] = [];
        this.user().chatterUpGames.forEach( async (gameId: string) => {
            try {
                const game: ChatterUpGame = await this._gameService.getGame(gameId);
                games.push(game);
            } catch (error) {
                console.error(error);
            }
        });
        this.recentGames.set(games);
    }

    achievements = [
        { name: 'First Steps', description: 'Complete your first conversation', earned: true },
        { name: 'Social Butterfly', description: 'Score 20+ in Social environment', earned: true },
        { name: 'Networking Pro', description: 'Complete 10 business conversations', earned: false },
        { name: 'Streak Master', description: 'Practice 7 days in a row', earned: false }
    ];

    getGameTypeDescription(gameType: GameType) {
        return GameType[gameType];
    }

}
