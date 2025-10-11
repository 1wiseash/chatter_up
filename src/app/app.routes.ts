import { Routes } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';
import { SignupForm } from './signup-form/signup-form';
import { SigninForm } from './signin-form/signin-form';
import { HomePage } from './home-page/home-page';
import { guestGuard } from './_core/guards/guest-guard';
import { userGuard } from './_core/guards/user-guard';
import { PricingPage } from './pricing-page/pricing-page';

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
        canActivate: [guestGuard],
    },
    {
        path: 'signin',
        component: SigninForm,
        title: 'Signin',
        canActivate: [guestGuard],
    },
    {
        path: 'home',
        component: HomePage,
        title: 'Home',
        canActivate: [userGuard],
    },
    {
        path: 'pricing',
        component: PricingPage,
        title: 'Pricing',
    },
    {
        path: 'game',
        loadChildren: () => import('./game/game-module').then(m => m.GameModule),
    },
    {
        path: 'arena',
        loadChildren: () => import('./arena/arena-module').then(m => m.ArenaModule),
    },
];
