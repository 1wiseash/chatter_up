import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MembershipService, UserService } from '@services';
import { MembershipInfo, MembershipPlans, MembershipType, User } from '@models';
import { toast } from 'ngx-sonner';
import { toSignal } from '@angular/core/rxjs-interop';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { PaymentComponent } from '@shared/payment.component/payment.component';

@Component({
  selector: 'cu-pricing-page',
  imports: [CurrencyPipe],
  templateUrl: './pricing-page.html',
  styleUrl: './pricing-page.css'
})
export class PricingPage {
  readonly plans = MembershipPlans;
  private readonly _userService = inject(UserService);
  private readonly _membershipService = inject(MembershipService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);

  // Convert the Observable to a Signal
  readonly user = toSignal(this._userService.user$);

  async upgrade(plan: MembershipInfo) {
    this._alertDialogService.info({
      zContent: PaymentComponent,
      zData: {plan},
      zOkText: 'Close',
    });
    // toast('Changed to ' + plan.name);
  }

  getCallToAction(plan: MembershipInfo): string {
      return (this._userService.user.membershipLevel < plan.id ? 'Upgrade' : 'Downgrade') + ' to ' + plan.name
  }
}
