import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Achievement, ChatterUpGame, GameType, SkillLevel, User } from '@models';
import { GameService, UserService } from '@services';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ProgressBar } from '@shared/progress-bar/progress-bar';
import {
    MembershipLevelPipe,
    GameTypePipe,
    PointsToNextSkillLevelPipe,
    PercentageToNextSkillLevel,
    CurrentSkillLevelPipe,
    NextSkillLevelPipe,
} from '@pipes';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'cu-home-page',
  imports: [
    ZardCardComponent,
    ZardBadgeComponent,
    ZardButtonComponent,
    ProgressBar,
    DatePipe,
    GameTypePipe,
    MembershipLevelPipe,
    PointsToNextSkillLevelPipe,
    PercentageToNextSkillLevel,
    CurrentSkillLevelPipe,
    NextSkillLevelPipe,
    RouterLink,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage implements OnInit {
    private readonly _gameService = inject(GameService);
    private readonly _userService = inject(UserService);

    user = toSignal(this._userService.user$) as Signal<User>;
    recentGames = signal<ChatterUpGame[]>([]);
    achievements = signal<Achievement[]>([]);

    async ngOnInit() {
        const games: ChatterUpGame[] = [];
        for (let gameId of this.user().chatterUpGames) {
            try {
                const game: ChatterUpGame = await this._gameService.getGame(gameId);
                games.push(game);
            } catch (error) {
                console.error(error);
            }
        };
        this.recentGames.set(games);

        this.achievements.set(await this._gameService.getAchievements(this._userService.user));
    }

}
