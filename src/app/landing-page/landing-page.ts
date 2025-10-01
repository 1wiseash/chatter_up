import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService, SubscriptionService, UserService } from '@services';
import { ZardButtonComponent } from "@app/_shared/components/button/button.component";
import { ZardFormModule } from '@app/_shared/components/form/form.module';
import { ZardInputDirective } from '@app/_shared/components/input/input.directive';
import { toast } from 'ngx-sonner';
import { ZardCardComponent } from '@app/_shared/components/card/card.component';
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
  authDialogOpen = false;
  readonly _subscriberService = inject(SubscriptionService);
  readonly _notificationService = inject(NotificationService);
  readonly _userService = inject(UserService);

  // Convert the Observable to a Signal
  readonly user = toSignal(this._userService.user$);

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

}
