import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ZardBadgeComponent } from '@app/_shared/components/badge/badge.component';
import { ZardButtonComponent } from '@app/_shared/components/button/button.component';
import { ZardFormModule } from '@app/_shared/components/form/form.module';
import { ZardInputDirective } from '@app/_shared/components/input/input.directive';
import { ZardPopoverComponent, ZardPopoverDirective } from '@app/_shared/components/popover/popover.component';
import { ChatMessage, GameTypeInfo, GameType } from '@models';
import { GameService } from '@services';
import { toast } from 'ngx-sonner';

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
  private readonly _route = inject(ActivatedRoute);
  private readonly _gameService = inject(GameService);

  messageForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
  });

  chatEnvironmentId = signal(GameType.business);
  chatEnvironmentTitle = signal('');
  score = signal(0);
  timeLeft = signal(59);
  messages = signal<ChatMessage[]>([
    { id: '0', sender: 'coach', text: 'Hi! I\'m at this networking event and I noticed you work in tech. What brings you here tonight?', scored: false, score: 0, timeSent: new Date(Date.now() - 20000), flagged: false},
    { id: '1', sender: 'user', text: 'Oh, just trying to meet some new people in the industry. How about you?', scored: true, score: 1, explanation: 'Responsive answer shows you were listening and followed up with an open-ended question.', timeSent: new Date(Date.now() - 10000), flagged: false },
    { id: '2', sender: 'coach', text: 'Same here! I\'m actually launching a new startup. What kind of tech work do you do?', scored: false, score: 0, timeSent: new Date(Date.now() - 5000), flagged: false },
  ]);

  constructor() {
    // Subscribe to queryParams to react to changes
    const subscription = this._route.queryParams.subscribe(params => {
      this.chatEnvironmentId.set(params['id']);
      this.chatEnvironmentTitle.set(params['title']);
      console.log('Chat environment:', this.chatEnvironmentTitle);
      this._gameService.startChatterUp(params['id']);
      subscription.unsubscribe();
    });
  }

  async onSubmit() {
    if (this.messageForm.value?.message) {
      // Send message to backend
      toast.promise(this._gameService.sendMessage(this.messageForm.value.message), {
        loading: 'Submitting message...',
        success: (data: any) => {
          this.messageForm.patchValue({message: ''});
          this.messageForm.markAsUntouched();
          return `Conversation tips will come to your inbox soon.`;
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }


}
