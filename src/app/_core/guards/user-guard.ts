import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services';

export const userGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  
  return authService.loggedIn() ? true : inject(Router).parseUrl('/members-only');
};
