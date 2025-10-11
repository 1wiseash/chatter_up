import { Component, Input } from '@angular/core';
import { ZardBadgeComponent } from '../components/badge/badge.component';
import { GameTypePipe } from '@pipes';
import { GameType } from '@models';

@Component({
  selector: 'cu-game-type',
  imports: [ZardBadgeComponent, GameTypePipe],
  templateUrl: './game-type.html',
  styleUrl: './game-type.css'
})
export class GameTypeComponent {
    @Input() gameType!: GameType | 'business' | 'dating' | 'social';
}
