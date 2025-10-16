import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DEFAULT_MESSAGE, Message } from '@models';
import { MessageService } from '@services';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardFormModule } from '@shared/components/form/form.module';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'cu-contact-us-page',
  imports: [
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardFormModule,
  ],
  templateUrl: './contact-us-page.html',
  styleUrl: './contact-us-page.css'
})
export class ContactUsPage {
    private readonly _messageService = inject(MessageService);

    contactForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.minLength(3)]),
        email: new FormControl('', [Validators.required, Validators.email]),
        message: new FormControl('', [Validators.required, Validators.minLength(10)]),
        botTest: new FormControl('', Validators.required),
        }
    );

    onSubmit() {
        if (this.contactForm.value.botTest !== 'underlined') return;
        console.log(this.contactForm.value);
        const message: Message = {
            ...DEFAULT_MESSAGE,
            fromName: this.contactForm.value.name as string,
            toName: 'chatterup',
            fromEmail: this.contactForm.value.email as string,
            toEmail: 'info@chatterup.net',
            message: this.contactForm.value.message as string,
        }

        // Send message to backend
        toast.promise(this._messageService.sendMessage(message), {
            loading: 'Submitting message...',
            success: (data: any) => {
                this.contactForm.patchValue({name: '', email: '', message: '', botTest: ''});
                this.contactForm.markAsPristine();
                return `Message sent successfully.`;
            },
            error: (error: any) => {
                console.error('Error sending message:', error);
                return 'Error sending message. Please try again.';
            },
        });

    }

}
