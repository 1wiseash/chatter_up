import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, NotificationService, SubscriptionService, UserService } from '@services';
import { ZardButtonComponent } from "@shared/components/button/button.component";
import { ZardFormModule } from '@shared/components/form/form.module';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { toast } from 'ngx-sonner';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'cu-landing-page',
  imports: [
    RouterLink,
    ZardCardComponent,
    ZardButtonComponent,
    ZardFormModule,
    ZardInputDirective,
    ReactiveFormsModule
  ],
  templateUrl: 'landing-page.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPage {
  readonly _subscriberService = inject(SubscriptionService);
  readonly _notificationService = inject(NotificationService);
  readonly _authService = inject(AuthService);
  readonly loggedIn = this._authService.loggedIn;

  signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  async onSubmit() {
    if (this.signupForm.value?.email) {
      // Send email to backend
      const success = this._subscriberService.signUp(this.signupForm.value.email);
 
      toast.promise(success, {
        loading: 'Submitting email...',
        success: (data: any) => {
          this.signupForm.patchValue({email: ''});
          this.signupForm.markAsUntouched();
          return `Conversation tips will come to your inbox soon.`;
        },
        error: (error: any) => {
          return 'Something went wrong. Please try signing up again.';
        },
      });
    } else {
      console.warn('Valid form submitted with missing values:', this.signupForm.value);
    }
  }

  testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Marketing Manager',
      content: 'ChatterUp helped me nail networking events. I went from awkward small talk to confident conversations in just two weeks!',
      score: '+18 avg',
      avatar: '👩‍💼'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Software Developer',
      content: 'The dating practice sessions were a game-changer. I finally feel comfortable starting conversations on apps.',
      score: '+22 best',
      avatar: '👨‍💻'
    },
    {
      name: 'Emma Little',
      role: 'College Student',
      content: 'As someone with social anxiety, this platform gave me a safe space to practice. Now parties don\'t scare me!',
      score: '+16 avg',
      avatar: '👩‍🎓'
    }
  ];


}
