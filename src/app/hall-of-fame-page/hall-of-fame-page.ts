import { Component, inject, signal } from '@angular/core';
import { GameType, UserProfile } from '@models';
import { GameService } from '@services';
import { ZardTabComponent, ZardTabGroupComponent } from '@shared/components/tabs/tabs.component';
import { UserProfileComponent } from '@shared/user-profile/user-profile.component';

@Component({
  selector: 'cu-hall-of-fame-page',
  imports: [ZardTabComponent, ZardTabGroupComponent, UserProfileComponent],
  templateUrl: './hall-of-fame-page.html',
  styleUrl: './hall-of-fame-page.css'
})
export class HallOfFamePage {
    private readonly _gameService = inject(GameService);
    businessUserProfiles = signal<UserProfile[]>([]);
    datingUserProfiles = signal<UserProfile[]>([]);
    socialUserProfiles = signal<UserProfile[]>([]);

    constructor() {
        this._gameService.getHallOfFame(GameType.business).then( (userProfiles) => {
            this.businessUserProfiles.set(userProfiles);
        }).catch( (error) => {
            console.error('Failed to retrieve business greatest hits:', error);
        });

        this._gameService.getHallOfFame(GameType.dating).then( (userProfiles) => {
            this.datingUserProfiles.set(userProfiles);
        }).catch( (error) => {
            console.error('Failed to retrieve dating greatest hits:', error);
        });
        
        this._gameService.getHallOfFame(GameType.social).then( (userProfiles) => {
            this.socialUserProfiles.set(userProfiles);
        }).catch( (error) => {
            console.error('Failed to retrieve social greatest hits:', error);
        });
        
    }
}
