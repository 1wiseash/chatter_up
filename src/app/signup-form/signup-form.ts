import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ZardButtonComponent } from "@app/_shared/components/button/button.component";
import { ZardInputDirective } from '@app/_shared/components/input/input.directive';
import { ZardFormModule } from '@app/_shared/components/form/form.module';
import { confirmPasswordValidator } from '@app/_core/util/confirm-password.validator';
import { ZardPopoverComponent, ZardPopoverDirective } from '@app/_shared/components/popover/popover.component';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'cu-signup-form',
  imports: [
    ZardButtonComponent,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardFormModule,
    ZardPopoverComponent,
    ZardPopoverDirective,
    RouterLink,
  ],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.css'
})
export class SignupForm {

  signupForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/) // Example for strong password
          ]),
      confirmPassword: new FormControl('', [Validators.required])
    },
    { validators: confirmPasswordValidator }
  );

  onSubmit() {
    if (this.signupForm.valid) {
      console.log('Form submitted:', this.signupForm.value);
    }
    // const auth = getAuth();
    
    // createUserWithEmailAndPassword(auth, email, password)
    //   .then((userCredential) => {
    //     // Signed up 
    //     const user = userCredential.user;
    //     // ...
    //   })
    //   .catch((error) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     // ..
    //   });
  }

  test() {
    console.log(this.signupForm);
  }
  
}
