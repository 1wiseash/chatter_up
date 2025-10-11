import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Lobby } from './lobby/lobby';
import { LeaderBoard } from './leader-board/leader-board';
import { Watch } from './watch/watch';

const routes: Routes = [
    { path: 'lobby', component: Lobby },
    { path: 'leader-board', component: LeaderBoard },
    { path: 'watch', component: Watch },
    { path: '**', redirectTo: '/lobby' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArenaRoutingModule { }
