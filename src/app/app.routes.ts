import { Routes } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';
import { SignupForm } from './signup-form/signup-form';
import { SigninForm } from './signin-form/signin-form';

export const routes: Routes = [
    {
        path: '',
        component: LandingPage,
        title: 'Chatter Up!',
    },
    {
        path: 'signup',
        component: SignupForm,
        title: 'Signup',
    },
    {
        path: 'signin',
        component: SigninForm,
        title: 'Signin',
    },
];
