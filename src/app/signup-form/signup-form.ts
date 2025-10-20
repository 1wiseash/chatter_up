import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ZardButtonComponent } from "@shared/components/button/button.component";
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardFormModule } from '@shared/components/form/form.module';
import { confirmPasswordValidator } from '@util';
import { ZardPopoverComponent, ZardPopoverDirective } from '@shared/components/popover/popover.component';
import { RouterLink } from '@angular/router';
import { AuthService, SubscriptionService, UserService } from '@services';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';


@Component({
  selector: 'cu-signup-form',
  imports: [
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardFormModule,
    ZardPopoverComponent,
    ZardPopoverDirective,
    ZardCheckboxComponent,
    RouterLink,
  ],
  providers: [AuthService],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.css'
})
export class SignupForm {
  readonly _authService = inject(AuthService);
  readonly _userService = inject(UserService);
  readonly _router = inject(Router);
  readonly _subscriptionService = inject(SubscriptionService);

  signupForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password: new FormControl('', [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/) // Example for strong password
          ]),
      confirmPassword: new FormControl('', [Validators.required]),
      privacyPolicy: new FormControl('', {validators: [Validators.requiredTrue]}),
      termsOfService: new FormControl('', {validators: [Validators.requiredTrue]}),
      signUpForMarketing: new FormControl(''),
    },
    { validators: confirmPasswordValidator }
  );

  async onSubmit() {
    if (this.signupForm.value?.email && this.signupForm.value?.password && this.signupForm.value?.username) {
      const newUser = await this._authService.registerUser({email: this.signupForm.value.email, password: this.signupForm.value.password});
      // console.log('New user created:', newUser);
      
      // Add a user data record (which updates UI user)
      await this._userService.createUser(newUser.uid, this.signupForm.value.username as string);
      this._router.navigate(['/', 'home']);

      // Sign up for marketing if requested
      if (this.signupForm.value.signUpForMarketing) {
        await this._subscriptionService.signUp(this.signupForm.value.email);
      }
      
    } else {
      console.error('Valid form submitted with missing values:', this.signupForm.value);
    }
  }

}
