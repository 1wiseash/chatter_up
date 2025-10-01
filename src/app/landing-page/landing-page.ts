import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService, SubscriptionService } from '@services';
import { ZardButtonComponent } from "@app/_shared/components/button/button.component";
import { ZardFormModule } from '@app/_shared/components/form/form.module';
import { ZardInputDirective } from '@app/_shared/components/input/input.directive';
import { toast } from 'ngx-sonner';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'cu-landing-page',
  imports: [ ZardButtonComponent, ZardFormModule, ZardInputDirective, ReactiveFormsModule ],
  templateUrl: 'landing-page.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPage implements OnInit {
  authDialogOpen = false;
  readonly _subscriberService = inject(SubscriptionService);
  readonly _notificationService = inject(NotificationService);

  ngOnInit() {
    this.signupForm.valueChanges.pipe(
      tap( (changes) => {
        console.log('status changes:', changes);
        this._notificationService.footerMessage = `Signup form valid? ${this.signupForm.valid}`;
      })
    ).subscribe();
  }

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

  showToast() {
    toast('Event has been created', {
      description: 'Sunday, December 03, 2023 at 9:00 AM',
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo'),
      },
    });
  }

}
