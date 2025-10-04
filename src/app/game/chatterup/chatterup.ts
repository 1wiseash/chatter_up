import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ZardBadgeComponent } from '@app/_shared/components/badge/badge.component';
import { ZardButtonComponent } from '@app/_shared/components/button/button.component';
import { ZardFormModule } from '@app/_shared/components/form/form.module';
import { ZardInputDirective } from '@app/_shared/components/input/input.directive';
import { ZardPopoverComponent, ZardPopoverDirective } from '@app/_shared/components/popover/popover.component';
import { ChatMessage, GameInfo, GameType } from '@models';
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
          { id: '0', sender: 'coach', text: 'Hi! I\'m at this networking event and I noticed you work in tech. What brings you here tonight?', score: null, timeInSeconds: 0},
          { id: '1', sender: 'user', text: 'Oh, just trying to meet some new people in the industry. How about you?', score: 1, explanation: 'Responsive answer shows you were listening and followed up with an open-ended question.', timeInSeconds: 10 },
          { id: '2', sender: 'coach', text: 'Same here! I\'m actually launching a new startup. What kind of tech work do you do?', score: null, timeInSeconds: 25 },
        ]);

  constructor() {
    // Subscribe to queryParams to react to changes
    this._route.queryParams.subscribe(params => {
      this.chatEnvironmentId.set(params['id']);
      this.chatEnvironmentTitle.set(params['title']);
      console.log('Chat environment:', this.chatEnvironmentTitle);
    });
  }

  async onSubmit() {
    if (this.messageForm.value?.message) {
      // Send message to backend
      // const success = this._gameService.sendMessage(this.inputForm.value.message, this.timeLeft());
 
      // toast.promise(success, {
      //   loading: 'Submitting message...',
      //   success: (data: any) => {
      //     this.messageForm.patchValue({message: ''});
      //     this.messageForm.markAsUntouched();
      //     return `Conversation tips will come to your inbox soon.`;
      //   },
      //   error: (error: any) => {
      //     return 'Something went wrong. Please try signing up again.';
      //   },
      // });
    } else {
      console.warn('Valid form submitted with missing values:', this.messageForm.value);
    }
  }

  sendMessage() {
    // if (!currentInput.trim()) return;

    // const score = calculateScore(currentInput);
    // const newUserMessage = { sender: 'user', text: currentInput, score };
    
    // setMessages(prev => [...prev, newUserMessage]);
    // setTotalScore(prev => prev + score);
    
    // setTimeout(() => {
    //   const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
    //   setMessages(prev => [...prev, { sender: 'bot', text: randomResponse, score: null }]);
    // }, 1500);
    
    // setCurrentInput('');
  }

  formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }


}
