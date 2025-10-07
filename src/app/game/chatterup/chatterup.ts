import { DatePipe } from '@angular/common';
import { Component, computed, inject, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ZardBadgeComponent } from '@app/_shared/components/badge/badge.component';
import { ZardButtonComponent } from '@app/_shared/components/button/button.component';
import { ZardFormModule } from '@app/_shared/components/form/form.module';
import { ZardInputDirective } from '@app/_shared/components/input/input.directive';
import { ZardPopoverComponent, ZardPopoverDirective } from '@app/_shared/components/popover/popover.component';
import { ChatMessage, GameTypeInfo, GameType, environments, ChatterUpGame } from '@models';
import { GameService } from '@services';
import { toast } from 'ngx-sonner';
import _ from 'lodash';
import { ZardAlertDialogService } from '@app/_shared/components/alert-dialog/alert-dialog.service';

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
  ],
  templateUrl: './chatterup.html',
  styleUrl: './chatterup.css'
})
export class Chatterup {
  private readonly _gameService = inject(GameService);
  private alertDialogService = inject(ZardAlertDialogService);

  game: Signal<ChatterUpGame> = toSignal(this._gameService.currentChatterUpGame$) as Signal<ChatterUpGame>;
  gameRunning = toSignal(this._gameService.gameRunning$) as Signal<boolean>;

  chatEnvironmentTitle = computed( () => _.find(environments, e => e.id === this.game().type)?.title);

  elapsedTime = signal(0);
  timer: NodeJS.Timeout | undefined = undefined;
  timeRemaining = computed( () => {
    const t = this.game().timeRemaining - this.elapsedTime();
    if (t <= 0) {
      clearInterval(this.timer);
      this._gameService.endChatterUp();
      this.alertDialogService.confirm({
        zTitle: 'Game Over',
        zDescription: `You scored ${this.game().score} points!`,
        zOkText: 'Continue',
        zCancelText: undefined,
      });
    }
    return t;
  });

  lastMessageCount = 0;
  chatMessages: Signal<ChatMessage[]> = computed( () => {
    const messages = this.game().messages;
    if (messages.length === 0 || messages.length !== this.lastMessageCount) {
      this.timer = setInterval( () => this.elapsedTime.set(this.elapsedTime() + 1000), 1000);
      this.lastMessageCount = messages.length;
    }
    return messages;
  });

  messageForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
  });

  async onSubmit() {
    if (this.messageForm.value?.message) {
      // Stop the countdown so user doesn't feel cheated by slow network access
      clearInterval(this.timer);

      // Send message to backend
      toast.promise(this._gameService.sendMessage(this.messageForm.value.message, this.elapsedTime()), {
        loading: 'Submitting message...',
        success: (data: any) => {
          this.messageForm.patchValue({message: ''});
          this.messageForm.markAsUntouched();
          this.elapsedTime.set(0);
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
