import { ChangeDetectionStrategy, Component, signal, OnInit, inject, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DEFAULT_AVATAR, DEFAULT_USER_PROFILE } from '@models';
import { CurrentSkillLevelPipe } from '@pipes';
import { UserService } from '@services';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardFormModule } from '@shared/components/form/form.module';
import { ZardInputDirective } from '@shared/components/input/input.directive';

@Component({
  selector: 'cu-user-profile',
  imports: [
    CurrentSkillLevelPipe,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardFormModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent implements OnInit {
    private _userService = inject(UserService);

    @Input() userId = this._userService.user.id;
    @Input() showRank = true;
    @Input() showEdit = false;

    // --- State Signals ---
    isLoading = signal(true);
    userProfile = signal(DEFAULT_USER_PROFILE);
  
    avatarUrl = signal(DEFAULT_AVATAR);
  
    statusMessage = signal('Loading user data...');
    isError = signal(false);

    // Editing State
    isEditing = signal(false);
    selectedFile = signal<File | null>(null);
    isSaving = signal(false);

    profileForm!: FormGroup;

    async ngOnInit() {
        await this.fetchData();
        this.profileForm = new FormGroup({
            username: new FormControl(this.userProfile().username, [Validators.required, Validators.minLength(3)]),
            story: new FormControl(this.userProfile().story, [Validators.required, Validators.minLength(10)]),
            avatar: new FormControl('')
        });
    }

    async fetchData() {
        try {
            const profile = await this._userService.getUserProfile(this.userId);
            this.userProfile.set(profile);
            this.avatarUrl.set(await this._userService.getAvatarUrl());
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
        this.avatarUrl.set(DEFAULT_AVATAR);
        this.updateStatus("Avatar image not found or failed to load. Showing default.", false);
    }

    toggleEditMode() {
        const isNowEditing = !this.isEditing();
        this.isEditing.set(isNowEditing);
        this.selectedFile.set(null);
        this.isError.set(false);
        
        if (!isNowEditing) {
            // Reset status message if user cancels editing
            this.updateStatus(`Welcome back, ${this.userProfile().username}!`);
        }
    }

    // New: Captures the file selected by the user
    handleFileInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile.set(input.files[0]);
        } else {
            this.selectedFile.set(null);
        }
    }
    
    async saveProfile(): Promise<void> {
        const newUsernameValue = this.profileForm.value.username.trim();
        const usernameChanged = newUsernameValue && newUsernameValue !== this.userProfile().username;

        const newStoryValue = this.profileForm.value.story.trim();
        const storyChanged = newStoryValue && newStoryValue !== this.userProfile().story;

        const fileSelected = this.selectedFile();
        
        // Check if anything actually needs saving
        if (!usernameChanged && !storyChanged && !fileSelected) {
            this.updateStatus("No changes detected to save.", false);
            this.toggleEditMode();
            return;
        }

        // Prevent double click
        if (this.isSaving()) return;
        this.isSaving.set(true);
        this.updateStatus("Saving profile changes...", false);

        try {
            // 1. Update Username
            if (usernameChanged) {
                // NOTE: This will update user profile record as well
                await this._userService.updateUser({ username: newUsernameValue });
            }

            // 2. Update Story
            if (storyChanged) {
                await this._userService.updateUserProfile({ story: newStoryValue });
            }

            // 3. Upload Avatar
            if (fileSelected) {
                this._userService.saveAvatar(fileSelected);
            }

            // 4. Re-fetch and Render
            setTimeout( async () => {
                await this.fetchData();
            }, 1);
            
            // 5. Exit edit mode and notify success
            this.toggleEditMode(); // Exit edit mode
            this.updateStatus("Profile saved successfully!", false);

        } catch (error) {
            console.error("Error saving profile:", error);
            this.updateStatus("Failed to save profile. Check console for details.", true);
        } finally {
            this.isSaving.set(false);
        }
    }

}
