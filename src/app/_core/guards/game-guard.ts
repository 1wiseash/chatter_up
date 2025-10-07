import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameService } from '@services';

export const gameGuard: CanActivateFn = (route, state) => {
  const _gameService = inject(GameService);
  return _gameService.gameActive ? true : inject(Router).parseUrl('/game/lobby');
};
