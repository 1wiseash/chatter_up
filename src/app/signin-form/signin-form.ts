import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ZardButtonComponent } from "@app/_shared/components/button/button.component";
import { ZardInputDirective } from '@app/_shared/components/input/input.directive';
import { ZardFormModule } from '@app/_shared/components/form/form.module';
import { RouterLink } from '@angular/router';


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
  templateUrl: './signin-form.html',
  styleUrl: './signin-form.css'
})
export class SigninForm {

  signinForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  onSubmit() {
    if (this.signinForm.valid) {
      console.log('Form submitted:', this.signinForm.value);
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
    console.log(this.signinForm);
  }
  
}
