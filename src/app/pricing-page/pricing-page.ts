import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MembershipPlans, MembershipType } from '@models';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'cu-pricing-page',
  imports: [CurrencyPipe],
  templateUrl: './pricing-page.html',
  styleUrl: './pricing-page.css'
})
export class PricingPage {
  readonly plans = MembershipPlans;

  upgrade(membershipType: MembershipType) {
    toast('Upgraded to ' + membershipType);
  }
}
