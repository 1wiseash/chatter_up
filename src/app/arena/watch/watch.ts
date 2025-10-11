import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, OnInit, QueryList, Signal, signal, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatMessage, CHATTER_UP_GAME_DURATION, ChatterUpGame, DEFAULT_CHATTER_UP_GAME, environments } from '@models';
import { GameService, UserService } from '@services';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardFormModule } from '@shared/components/form/form.module';
import { ZardPopoverComponent, ZardPopoverDirective } from '@shared/components/popover/popover.component';
import _ from 'lodash';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'cu-watch',
  imports: [
    ZardBadgeComponent,
    ZardPopoverComponent,
    ZardPopoverDirective,
    ZardButtonComponent,
    ZardFormModule,
    DatePipe,
  ],
  templateUrl: './watch.html',
  styleUrl: './watch.css'
})
export class Watch implements OnInit {
    PLAY_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    currentPlaySpeedIndex = signal<number>(2);
    playing = signal<boolean>(false);

    @ViewChild('scrollAnchor') scrollAnchorRef!: ElementRef;

    private readonly _gameService = inject(GameService);
    private readonly _userService = inject(UserService);
    private readonly _activatedRoute = inject(ActivatedRoute);

    timeRemaining!: Signal<number>;
    gameScore!: Signal<number>;
    currentMove = signal<number>(-1);
    chatMessages!: Signal<ChatMessage[]>;
    chatEnvironmentTitle!: Signal<string | undefined>;
    timers: NodeJS.Timeout[] = [];
    game!: ChatterUpGame;

    ngOnInit() {
        console.log(history.state['game']);
        this.game = history.state['game'];

        this.chatEnvironmentTitle = computed( () => _.find(environments, e => e.id === this.game.type)?.title);
        this.chatMessages = computed( () => {
            if (this.currentMove() < 0) {
                return [];
            }
            
            const messages = [];
            for (let message of this.game.messages.slice(0, this.currentMove() + 1)) {
                messages.push(message);
            }
            return messages;
        } );
        this.gameScore = computed( () => {
            if (this.currentMove() < 0) {
                return 0;
            }
            
            let score = 0;
            for (let message of this.game.messages.slice(0, this.currentMove() + 1)) {
                score += message.scored ? message.score : 0;
            }
            return score;
        });
        this.timeRemaining = computed( () => {
            if (this.currentMove() < 0) {
                return CHATTER_UP_GAME_DURATION;
            }
            
            let timeLeft = CHATTER_UP_GAME_DURATION;
            for (let message of this.game.messages.slice(0, this.currentMove() + 1)) {
                timeLeft = CHATTER_UP_GAME_DURATION - (message.timeSent.valueOf() - this.game.startTime.valueOf());
            }
            return timeLeft;
        } );
    }
        
    play() {
        if (this.currentMove() >= (this.game.messages.length - 1)) {
            this.playing.set(false);
            return;
        }
        this.playing.set(true);

        const lastMove = this.currentMove() < 0 ? undefined : this.game.messages.at(this.currentMove());
        const nextMove = this.currentMove() + 1;

        // Create a callback for each subsequent move to advance the game when the move was played
        for (let move of this.game.messages.slice(nextMove)) {
            let deltaT = move.timeSent.valueOf() - (lastMove === undefined ? 
                    this.game.startTime.valueOf() :
                    lastMove.timeSent.valueOf() );

            // Scale deltaT by speed
            deltaT /= this.PLAY_SPEEDS[this.currentPlaySpeedIndex()]
            this.timers.push(setTimeout( () => this.advance(1), deltaT))
        }
    }

    pause() {
        this.playing.set(false);
        for (let timer of this.timers) {
            clearInterval(timer);
        }
    }

    advance(steps: number) {
        this.currentMove.update( move => Math.max(-1, Math.min(move + steps, this.game.messages.length)) );

        // Scroll last message into view once they have had a chance to be updated
        setTimeout( () => {
            if (this.scrollAnchorRef) {
                this.scrollAnchorRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 1)
    }

    toggleSpeed() {
        this.currentPlaySpeedIndex.update( i => (i + 1) % this.PLAY_SPEEDS.length);
    }

    formatTime(miliseconds: number) {
        const negative = miliseconds < 0;
        miliseconds = Math.abs(miliseconds);
        const mins = Math.floor(miliseconds / 60000);
        const secs = Math.round((miliseconds / 1000) % 60);
        return `${negative ? '-' : ''}${mins}:${secs.toString().padStart(2, '0')}`;
    }

}
