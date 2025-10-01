import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly _footerMessage = new BehaviorSubject('');
  footerMessage$ = this._footerMessage.asObservable();

  get footerMessage() {
    return this._footerMessage.value;
  }

  set footerMessage(message: string) {
    this._footerMessage.next(message);
  }
  
}
