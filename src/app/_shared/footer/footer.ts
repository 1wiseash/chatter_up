import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService, NotificationService } from '@services';

@Component({
  selector: 'cu-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
    readonly _userService = inject(UserService);
    readonly _notificationService = inject(NotificationService)

    // Convert the Observable to a Signal
    readonly user = toSignal(this._userService.user$);
    readonly footerNotification = toSignal(this._notificationService.footerMessage$);
    
}
