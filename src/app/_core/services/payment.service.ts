import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from '@firebase/app';
import { UserService } from './user.service';
import { MembershipInfo } from '@models';

const MESSAGES_COLLECTION = 'messages';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private readonly _userService = inject(UserService);

    readonly app = initializeApp(environment.firebaseConfig);
    readonly functions = getFunctions(this.app);

    async createStripeCustomer(name: string, email: string): Promise<{customer: any, setupIntent: any}> {
        // Get a reference to the callable function
        const createStripeCustomer = httpsCallable<{name: string, email: string}, {customer: any, setupIntent: any}>(this.functions, 'createStripeCustomer');

        return createStripeCustomer({name, email}).then( async (result) => {
            // Update user with name after successful customer creation
            await this._userService.updateUser({ name });

            // Read result data.
            const data = result.data;
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
        const createStripeSubscription = httpsCallable<{customerId: string, paymentMethodId: string, planId: string},
                {subscriptionId: string, clientSecret: string}>(this.functions, 'createStripeSubscription');
        return createStripeSubscription({
            customerId,
            paymentMethodId,
            planId: plan.stripePlanTestId as string,
        }).then(async (result) => {
            // Update user membership level upon successful subscription creation
            await this._userService.updateUser({ membershipLevel: plan.id });

            // Read result data.
            const data = result.data;
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
        const getPlanDetails = httpsCallable<{planId: string}, any>(this.functions, 'getPlanDetails');
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

}