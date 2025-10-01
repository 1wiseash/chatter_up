import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header, Footer } from "@shared/index";
import { ZardToastComponent } from './_shared/components/toast/toast.component';
// import { toast } from 'ngx-sonner';
// import { ZardAlertDialogService } from './_shared/components/alert-dialog/alert-dialog.service';

@Component({
  selector: 'cu-root',
  imports: [RouterOutlet, Header, Footer, ZardToastComponent ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('chatter-up');
  // private alertDialogService = inject(ZardAlertDialogService);
 
  // showDialog() {
  //   this.alertDialogService.confirm({
  //     zTitle: 'Are you absolutely sure?',
  //     zDescription: 'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
  //     zOkText: 'Continue',
  //     zCancelText: 'Cancel',
  //   });
  // }

  // showToast() {
  //   toast('Event has been created', {
  //     description: 'Sunday, December 03, 2023 at 9:00 AM',
  //     action: {
  //       label: 'Undo',
  //       onClick: () => console.log('Undo'),
  //     },
  //   });
  // }
}
