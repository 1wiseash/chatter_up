import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LobbyPage } from './lobby-page/lobby-page';
import { GameComponent } from './game.component';
import { Chatterup } from './chatterup/chatterup';

const routes: Routes = [{ path: '', component: GameComponent, children: [
        { path: 'lobby', component: LobbyPage },
        { path: 'chatterup', component: Chatterup },
        { path: '**', redirectTo: '/lobby' },
    ]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
