import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService, SubscriptionService } from '@services';
import { ZardButtonComponent } from "@app/_shared/components/button/button.component";
import { ZardFormModule } from '@app/_shared/components/form/form.module';
import { ZardInputDirective } from '@app/_shared/components/input/input.directive';
import { toast } from 'ngx-sonner';
import { ZardCardComponent } from '@app/_shared/components/card/card.component';

@Component({
  selector: 'cu-landing-page',
  imports: [
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

  readonly steps = [
    {
      icon: 'bx--message-rounded-detail',
      title: "Choose Your Scenario",
      description: "Select from real-world conversation scenarios tailored to your needs and goals."
    },
    {
      icon: 'Target',
      title: "Practice with AI",
      description: "Engage in realistic conversations with our advanced AI that adapts to your responses."
    },
    {
      icon: 'TrendingUp',
      title: "Get Instant Feedback",
      description: "Receive detailed analysis and personalized tips to improve your communication skills."
    },
    {
      icon: 'Award',
      title: "Track Your Progress",
      description: "Monitor your improvement over time with detailed analytics and achievement badges."
    }
  ];

}
