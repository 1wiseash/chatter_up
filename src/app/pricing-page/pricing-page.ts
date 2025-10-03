import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MembershipService, UserService } from '@services';
import { MembershipInfo, MembershipPlans, MembershipType, User } from '@models';
import { toast } from 'ngx-sonner';
import { toSignal } from '@angular/core/rxjs-interop';

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

  // Convert the Observable to a Signal
  readonly user = toSignal(this._userService.user$);

  async upgrade(plan: MembershipInfo) {
    const updated = await this._membershipService.purchaseMembership(plan)
    toast('Changed to ' + plan.name);
  }

  getCallToAction(plan: MembershipInfo): string {
      return (this._userService.user.membershipLevel < plan.id ? 'Upgrade' : 'Downgrade') + ' to ' + plan.name
  }
}
