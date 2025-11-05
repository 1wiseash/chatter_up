import { Component, inject } from '@angular/core';
import { UserService } from '@services';
import { Z_ALERT_MODAL_DATA } from '@shared/components/alert-dialog/alert-dialog.service';

interface FeedbackComponentDialogData {
    feedback: string;
    message: string;
    score: number;
    autohideFeedback: boolean;
}

@Component({
    selector: 'cu-feedback.component',
    imports: [],
    templateUrl: './feedback.component.html',
    styleUrl: './feedback.component.css'
})
export class FeedbackComponent {
    zData = inject(Z_ALERT_MODAL_DATA) as FeedbackComponentDialogData;
    feedback = this.zData.feedback;
    message = this.zData.message;
    score = this.zData.score;
    autohideFeedback = this.zData.autohideFeedback;
    private readonly _userService = inject(UserService);

    toggleAutohide() {
        this.autohideFeedback = !this.autohideFeedback;
        this._userService.updateUser({options: {autohideFeedback: this.autohideFeedback}});
    }
}
