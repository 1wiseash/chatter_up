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
  game: Signal<ChatterUpGame> = toSignal(this._gameService.currentChatterUpGame$) as Signal<ChatterUpGame>;

  chatEnvironmentTitle = computed( () => _.find(environments, e => e.id === this.game().type)?.title);
  timeRemaining = computed( () => this.game().timeLeftInSeconds );

  messageForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
  });

  async onSubmit() {
    if (this.messageForm.value?.message) {
      // Send message to backend
      toast.promise(this._gameService.sendMessage(this.messageForm.value.message), {
        loading: 'Submitting message...',
        success: (data: any) => {
          this.messageForm.patchValue({message: ''});
          this.messageForm.markAsUntouched();
          return `Game updated.`;
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

  formatTime(seconds: number) {
    const negative = seconds < 0;
    seconds = Math.abs(seconds);
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${negative ? '-' : ''}${mins}:${secs.toString().padStart(2, '0')}`;
  }


}
