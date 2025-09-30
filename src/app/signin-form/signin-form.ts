import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ZardButtonComponent } from "@app/_shared/components/button/button.component";
import { ZardInputDirective } from '@app/_shared/components/input/input.directive';
import { ZardFormModule } from '@app/_shared/components/form/form.module';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/_core/services/auth.service';


@Component({
  selector: 'cu-signin-form',
  imports: [
    ZardButtonComponent,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardFormModule,
    RouterLink,
  ],
  providers: [AuthService],
  templateUrl: './signin-form.html',
  styleUrl: './signin-form.css'
})
export class SigninForm {
  readonly _authService = inject(AuthService);
  readonly _router = inject(Router);

  signinForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  async onSubmit() {
    if (this.signinForm.valid) {
      console.log('Form submitted:', this.signinForm.value);
    }
    if (this.signinForm.value?.email && this.signinForm.value?.password) {
      const newUser = await this._authService.logIn({email: this.signinForm.value.email, password: this.signinForm.value.password});
      console.log('New user created:', newUser);
      this._router.navigate(['/', 'home']);
    } else {
      console.log('Form submitted:', this.signinForm.value);
    }
  }
  
}
