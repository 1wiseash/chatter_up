import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return !authService.authUser ? true : inject(Router).parseUrl('/home');
};
