import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from '@firebase/app';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { MembershipInfo } from '@models';

const MESSAGES_COLLECTION = 'messages';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private readonly _authService = inject(AuthService);
    private readonly _userService = inject(UserService);

    readonly app = initializeApp(environment.firebaseConfig);
    readonly functions = getFunctions(this.app);

    getMessagesCollectionPath() {
        return MESSAGES_COLLECTION;
    }

    getMessageDocumentPath(id: string) {
        return `${this.getMessagesCollectionPath()}/${id}}`;
    }

    async getClientSecret(): Promise<string> {
        // Get a reference to the callable function
        const getClientSecret = httpsCallable(this.functions, 'getClientSecret');
        return getClientSecret().then( async (result) => {
            const clientSecret = await this.createCheckoutSession();
            return clientSecret;
        });
    }

    async createStripeCustomer(name: string, email: string): Promise<{customer: any, setupIntent: any}> {
        // Get a reference to the callable function
        const createStripeCustomer = httpsCallable(this.functions, 'createStripeCustomer');

        return createStripeCustomer({name, email}).then( async (result) => {
            // Update user with name after successful customer creation
            await this._userService.updateUser({ name });

            // Read result data.
            const data = result.data as {customer: any, setupIntent: any};
            return Promise.resolve(data);
        }).catch((error) => {
            // Handle errors.
            const code = error.code;
            const message = error.message;
            console.error('Error calling createStripeCustomer function call:', code, message);
            return Promise.reject('Error calling createStripeCustomer function call');
        });            
    }

    async createSubscription(customerId: string, paymentMethodId: string, plan: MembershipInfo): Promise<{subscriptionId: string, clientSecret: string}> {
        // Get a reference to the callable function
        const createStripeSubscription = httpsCallable(this.functions, 'createStripeSubscription');
        return createStripeSubscription({
            customerId,
            paymentMethodId,
            planId: plan.stripePlanTestId as string,
        }).then(async (result) => {
            // Update user membership level upon successful subscription creation
            await this._userService.updateUser({ membershipLevel: plan.id });

            // Read result data.
            const data = result.data as {subscriptionId: string, clientSecret: string};
            return Promise.resolve(data);
        }).catch((error) => {
            // Handle errors.
            const code = error.code;
            const message = error.message;
            console.error('Error calling createStripeSubscription function call:', code, message);
            return Promise.reject('Error calling createStripeSubscription function call');
        });            
    }

    async getPlanDetails(planId: string): Promise<any> {
        // Get a reference to the callable function
        const getPlanDetails = httpsCallable(this.functions, 'getPlanDetails');
        return getPlanDetails({planId}).then((result) => {
            // Read result data.
            const data = result.data;
            return Promise.resolve(data);
        }).catch((error) => {
            // Handle errors.
            const code = error.code;
            const message = error.message;
            console.error('Error calling getPlanDetails function call:', code, message);
            return Promise.reject('Error calling getPlanDetails function call');
        });            
    }

    async createCheckoutSession(): Promise<string> {

        // Get a reference to the callable function
        const createStripeCheckoutSession = httpsCallable(this.functions, 'createStripeCheckoutSession');

        return createStripeCheckoutSession({
            customerId: this._authService.uid,
            priceId: this._userService.user.hasBraintreeCustomerId,
        }).then((result) => {
            // Read result data.
            const data = result.data as {clientToken: string};
            return Promise.resolve(data.clientToken);
        }).catch((error) => {
            // Handle errors.
            const code = error.code;
            const message = error.message;
            console.error('Error calling getBraintreeClientToken function call:', code, message);
            return Promise.reject('Error calling getBraintreeClientToken function call');
        });            
    }

    async processPayment(plan: MembershipInfo, nonce: string) {
        // Get a reference to the callable function
        const completeCheckout = httpsCallable(this.functions, 'completeCheckout');

        // Call the function with the game ID
        return completeCheckout({
            planId: plan.name,
            paymentMethodNonce: nonce,
            amount: plan.monthlyPrice.toFixed(2),
            customerId: this._authService.uid,
            hasBraintreeCustomerId: this._userService.user.hasBraintreeCustomerId,
        }).then( async (result) => {
            // Read result data.
            const data = result.data as {success: boolean, transactionResult: any};
            // console.log('result of processPayment:', data);
            if (!this._userService.user.hasBraintreeCustomerId && data.success) {
                // Update the user to indicate they now have a Braintree customer ID
                const update = { hasBraintreeCustomerId: true };
                await this._userService.updateUser(update);
            }
            return Promise.resolve(data);
        }).catch((error) => {
            // Handle errors.
            const code = error.code;
            const message = error.message;
            console.error('Error calling processPayment function call:', code, message);
            return Promise.reject('Error calling processPayment function call');
        });            
    }
}