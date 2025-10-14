import { ChangeDetectionStrategy, Component, signal, OnInit, inject, Input } from '@angular/core';
import { DEFAULT_USER_PROFILE } from '@models';
import { CurrentSkillLevelPipe } from '@pipes';
import { UserService } from '@services';

@Component({
  selector: 'cu-user-profile',
  imports: [CurrentSkillLevelPipe],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent implements OnInit {
    private _userService = inject(UserService);

    @Input() userId = this._userService.user.id;
    @Input() showEdit = false;

    // --- State Signals ---
    isLoading = signal(true);
    userProfile = signal(DEFAULT_USER_PROFILE);
  
    readonly defaultAvatar = '/assets/img/logo.png';
    avatarUrl = signal(this.defaultAvatar);
  
    statusMessage = signal('Loading user data...');
    isError = signal(false);

    async ngOnInit() {
        try {
            const profile = await this._userService.getUserProfile(this.userId);
            this.userProfile.set(profile);
            // const avatarUrlResult = await this._userService.getAvatarUrl(this.userId);
            // if (avatarUrlResult) {
                this.avatarUrl.set(profile.avatarURL);
            // }
            this.isLoading.set(false);
            // Set a general success message if no specific status has been set during data fetching
            this.updateStatus(`Welcome back, ${profile.username}!`);
        } catch(error) {
            this.isLoading.set(false);
            this.updateStatus("Failed to fetch user profile. Check console for details.", true);
        }
    }

    // Helper to update status signals
    private updateStatus(message: string, isError: boolean = false): void {
        this.statusMessage.set(message);
        this.isError.set(isError);
    }
  
    // Handles avatar image loading errors by resetting to default placeholder
    handleImageError(): void {
        this.avatarUrl.set(this.defaultAvatar);
        this.updateStatus("Avatar image not found or failed to load. Showing default.", false);
    }

    editProfile() {
        console.log('Edit user profile button clicked');
    }
}
