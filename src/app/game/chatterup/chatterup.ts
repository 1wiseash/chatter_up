import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { Component, computed, ElementRef, inject, OnDestroy, QueryList, Signal, signal, ViewChild, ViewChildren } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardFormModule } from '@shared/components/form/form.module';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardPopoverComponent, ZardPopoverDirective } from '@shared/components/popover/popover.component';
import { ChatMessage, GameTypeInfo, GameType, environments, ChatterUpGame } from '@models';
import { GameService, UserService } from '@services';
import { toast } from 'ngx-sonner';
import _ from 'lodash';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { GameOverComponent } from '../game-over.component/game-over.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'cu-chatterup',
  imports: [
    ZardBadgeComponent,
    ZardPopoverComponent,
    ZardPopoverDirective,
    ZardButtonComponent,
    ZardFormModule,
    ZardInputDirective,
    ReactiveFormsModule,
    DatePipe,
    AsyncPipe,
    NgIf,
  ],
  templateUrl: './chatterup.html',
  styleUrl: './chatterup.css'
})
export class Chatterup implements OnDestroy {
  @ViewChild('scrollAnchor') scrollAnchorRef!: ElementRef;
  
  private readonly _gameService = inject(GameService);
  private readonly _userService = inject(UserService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);

  game: Signal<ChatterUpGame> = toSignal(this._gameService.currentChatterUpGame$) as Signal<ChatterUpGame>;
  gameRunning = toSignal(this._gameService.gameRunning$) as Signal<boolean>;

  chatEnvironmentTitle = computed( () => _.find(environments, e => e.id === this.game().type)?.title);

  private _elapsedTime = new BehaviorSubject(0);
  elapsedTime$ = this._elapsedTime.asObservable();

  timer: NodeJS.Timeout | undefined = undefined;
  timeRemaining$!: Observable<number>;
  
  constructor() {
    this.timeRemaining$ = this.elapsedTime$.pipe(
      map( (elapsedTime: number): number =>  this.game().timeRemaining - elapsedTime ),
      tap( (t) => {
        if (t <= 0) this.endGame();
      }),
    );
    this._gameService.gameRunning = true;
  }

  ngOnDestroy(): void {
      this.endGame();
  }

  lastMessageCount = 0;
  chatMessages: Signal<ChatMessage[]> = computed( () => {
    const messages = this.game().messages;
    if (messages.length === 0 || messages.length !== this.lastMessageCount) {
      this.timer = setInterval( () => this._elapsedTime.next(this._elapsedTime.value + 1000), 1000);
      this.lastMessageCount = messages.length;
    }

    // Scroll last message into view once they have had a chance to be updated
    setTimeout( () => {
      if (this.scrollAnchorRef) {
        this.scrollAnchorRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 1)
    return messages;
  });

  messageForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
  });

  endGame() {
    clearInterval(this.timer);
    this._alertDialogService.info({
      zContent: GameOverComponent,
      zData: {user: this._userService.user, game: this.game()},
      zOkText: 'Close',
    });
    this._gameService.endChatterUp();
  }

  async onSubmit() {
    if (this.messageForm.value?.message) {
      // Stop the countdown so user doesn't feel cheated by slow network access
      clearInterval(this.timer);

      // Send message to backend
      toast.promise(this._gameService.sendMessage(this.messageForm.value.message, this._elapsedTime.value), {
        loading: 'Submitting message...',
        success: (data: any) => {
          this.messageForm.patchValue({message: ''});
          this.messageForm.markAsUntouched();
          this._elapsedTime.next(0);
          return `New response.`;
        },
        error: (error: any) => {
          console.error('Error sending message to backend:', error);
          return 'Error sending message. Please try again.';
        },
      });
    } else {
      console.warn('Valid form submitted with missing values:', this.messageForm.value);
    }
  }

  formatTime(miliseconds: number) {
    const negative = miliseconds < 0;
    miliseconds = Math.abs(miliseconds);
    const mins = Math.floor(miliseconds / 60000);
    const secs = Math.round((miliseconds / 1000) % 60);
    return `${negative ? '-' : ''}${mins}:${secs.toString().padStart(2, '0')}`;
  }

}
