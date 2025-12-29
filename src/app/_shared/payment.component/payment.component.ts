import { OnInit, Component, inject, signal, Input } from '@angular/core';
import { MembershipInfo } from '@models';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { PaymentService } from 'src/app/_core/services/payment.service';
import { toast } from 'ngx-sonner';
import { AuthService, UserService } from '@services';
import { ZardFormModule } from '@shared/components/form/form.module';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Z_ALERT_MODAL_DATA } from '@shared/components/alert-dialog/alert-dialog.service';
declare var Stripe: any; // Declare Stripe to avoid TypeScript errors

interface PaymentDialogData {
  plan: MembershipInfo;
}

@Component({
  selector: 'cu-payment.component',
  imports: [
    ReactiveFormsModule,
    ZardFormModule,
  ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  private zData: PaymentDialogData = inject<PaymentDialogData>(Z_ALERT_MODAL_DATA);
  plan = this.zData.plan;

  private readonly _paymentService = inject(PaymentService);
  private readonly _userService = inject(UserService);
  private readonly _authService = inject(AuthService);
  stripe!: any;
  personalInfoSubmitted = signal(false);
  paymentSending = signal(false);
  paymentSucceeded = signal(false);
  orderAmount = signal('Loading...');
  isLoading = signal(true);
  orderStatus = signal('');
  errorMessage = signal('');
  customer!: any;
  setupIntent!: any;

  cardElement!: any;

  personalInfoForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl(this._authService.email || '', [Validators.required, Validators.email]),
  });

  paymentForm = new FormGroup({
      cardNumber: new FormControl('', [Validators.required, Validators.minLength(16)]),
  });
  
  ngOnInit() {
    this.getPlanInfo();
  }

  async submitPersonalInfo() {
    if (this.personalInfoForm.value?.email && this.personalInfoForm.value?.name) {
      this.createCustomer().then(result => {
        this.customer = result.customer;
        this.setupIntent = result.setupIntent;
      });
      this.personalInfoSubmitted.set(true);
    } else {
      console.error('Valid form submitted with missing values:', this.personalInfoForm.value);
    }
  }

  async submitPaymentInfo() {
    this.changeLoadingState(true);
  
    // Set up payment method for recurring usage
    this.setupPaymentMethod(this.setupIntent.client_secret, this.cardElement);
  }

  async setupPaymentMethod(setupIntentSecret: string, cardElement: any) {
    const billingName = this.personalInfoForm.value.name;
    const billingEmail = this.personalInfoForm.value.email;

    this.stripe.confirmCardSetup(setupIntentSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: billingName,
          email: billingEmail
        }
      }
    })
    .then((result: any) => {
      if (result.error) {
        this.showCardError(result.error);
      } else {
        // Create the subscription
        this.createSubscription(this.customer.id, result.setupIntent.payment_method);
      }
    });
  }
  
  async createCustomer() {
    const billingName = this.personalInfoForm.value.name as string;
    const billingEmail = this.personalInfoForm.value.email as string;

    return this._paymentService.createStripeCustomer(billingName, billingEmail);
  }

  async createSubscription(customerId: string, paymentMethodId: string) {
    return this._paymentService.createSubscription(customerId, paymentMethodId, this.plan)
      .then( (subscription: any) => {
        this.orderComplete(subscription);
      });
  }

  showCardError(error: {message: string}) {
    this.changeLoadingState(false);

    // The card was declined (i.e. insufficient funds, card has expired, etc)
    this.errorMessage.set(error.message);
    setTimeout(() => {
      this.errorMessage.set('');
    }, 8000);
  }

  async getPlanInfo() {
    return this._paymentService.getPlanDetails(this.plan)
      .then((response) => {
        this.changeLoadingState(false);

        // Set up UI based on plan details
        this.showPriceDetails(response.plan);
        this.initializeStripeElements(response.publishableKey);
      });
  }

  initializeStripeElements(publishableKey: string) {
    this.stripe = Stripe(publishableKey);
    const elements = this.stripe.elements();

    // Card Element styles
    const style = {
      base: {
        fontSize: "16px",
        color: "#32325d",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
        fontSmoothing: "antialiased",
        "::placeholder": {
          color: "rgba(0,0,0,0.4)"
        }
      }
    };

    this.cardElement = elements.create("card", { style: style });
    this.cardElement.mount("#card-element");

    // Element focus ring
    this.cardElement.on("focus", () => {
      const el = document.getElementById(`${this.cardElement._componentName}-element`) as HTMLElement;
      el.classList.add("focused");
    });

    this.cardElement.on("blur", () => {
      const el = document.getElementById(`${this.cardElement._componentName}-element`) as HTMLElement;
      el.classList.remove("focused");
    });

    this.cardElement.on("change", (event: any) => {
      if (event.error) {
        this.errorMessage.set(event.error.message);
      } else {
        this.errorMessage.set("");
      }
    });
    
  }

  showPriceDetails(plan: any) {
    // TODO: show payment methods based on currency

    // Format price details and detect zero decimal currencies
    let amount = plan.amount;
    const numberFormat = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: plan.currency,
      currencyDisplay: "symbol"
    });
    const parts = numberFormat.formatToParts(amount);
    let zeroDecimalCurrency = true;
    for (let part of parts) {
      if (part.type === "decimal") {
        zeroDecimalCurrency = false;
      }
    }
    amount = zeroDecimalCurrency ? amount : amount / 100;
    const formattedAmount = numberFormat.format(amount);

    this.orderAmount.set(`${formattedAmount} per month`);
  }

  orderComplete(subscription: any) {
    this.changeLoadingState(false);
    this.paymentSucceeded.set(true);
    this.orderStatus.set(subscription.status);
  }

  changeLoadingState(isLoading: boolean) {
    this.isLoading.set(isLoading);
  }
  
}
