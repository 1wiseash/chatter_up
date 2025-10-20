import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ZardButtonComponent } from "@shared/components/button/button.component";
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardFormModule } from '@shared/components/form/form.module';
import { RouterLink } from '@angular/router';
import { AuthService } from '@services';


@Component({
  selector: 'cu-signin-form',
  imports: [
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
    if (this.signinForm.value?.email && this.signinForm.value?.password) {
      await this._authService.logIn({email: this.signinForm.value.email, password: this.signinForm.value.password});
      this._router.navigate(['/', 'home']);
    } else {
      console.warn('Form submitted:', this.signinForm.value);
    }
  }
  
}
