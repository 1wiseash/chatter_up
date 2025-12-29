import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from '@firebase/app';
import { UserService } from './user.service';
import { MembershipInfo, MembershipType } from '@models'; 
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs'; 
import { tap, switchMap, shareReplay, startWith } from 'rxjs/operators'; 

const MESSAGES_COLLECTION = 'messages';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private readonly _userService = inject(UserService);
    private _updateEntitlementsTrigger = new Subject<null>(); 
    private _entitlements = new BehaviorSubject<any>({}); 
 
    entitlements$: Observable<any> = combineLatest([ 
            this._userService.user$.pipe(startWith(null)), 
            this._updateEntitlementsTrigger.asObservable().pipe(startWith(null)), 
        ]).pipe( 
        tap( ([user, _]) => console.log('User changed. About to change entitlements.', user) ), 
        switchMap( async ([user, _]) => { 
            if (user !== null && user.stripeCustomerId !== null && user.stripeCustomerId !== '') { 
                try { 
                    const entitlements = await this.getCustomerEntitlements(); 
                    return of(entitlements); 
                } catch (error) { 
                    console.error("Error getting entitlements:", error); 
                    return of({}); 
                } 
            } else { 
                return of({}); 
            } 
        }), 
        shareReplay(1), 
        tap( async (entitlements) => { 
            this._entitlements.next(entitlements); 
            console.log('entitlements:', entitlements); 
        }), 
    ); 
 
    get entitlements() { 
        return this._entitlements.value; 
    } 
 
    async getCustomerEntitlements(): Promise<any> { 
        // Get a reference to the callable function 
        const getStripeCustomerEntitlements = httpsCallable<{customerId: string}, any>(this.functions, 'getStripeCustomerEntitlements'); 
        return getStripeCustomerEntitlements({customerId: this._userService.user.stripeCustomerId}).then( async (result) => { 
            // Read result data. 
            const data = result.data; 
            console.log('Customer entitlements data:', data); 
            return Promise.resolve(data); 
        }).catch((error) => { 
            console.error('Error calling getStripeCustomerEntitlements function call:', error); 
            return Promise.reject('Error calling getStripeCustomerEntitlements function call'); 
        }); 
    } 

    readonly app = initializeApp(environment.firebaseConfig);
    readonly functions = getFunctions(this.app);

    async createStripeCustomer(name: string, email: string): Promise<{customer: any, setupIntent: any}> {
        // Get a reference to the callable function
        const createStripeCustomer = httpsCallable<{name: string, email: string}, {customer: any, setupIntent: any}>(this.functions, 'createStripeCustomer');

        return createStripeCustomer({name, email}).then( async (result) => {
            // Update user with name after successful customer creation
            await this._userService.updateUser({ stripeCustomerId: result.data.customer.id });

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
        const planId = environment.stripe.planIds[MembershipType[plan.id] as 'Free' | 'Basic' | 'Premium']; 
 
        // Get a reference to the callable function
        const createStripeSubscription = httpsCallable<{customerId: string, paymentMethodId: string, planId: string},
                {subscriptionId: string, clientSecret: string}>(this.functions, 'createStripeSubscription');
        return createStripeSubscription({
            customerId,
            paymentMethodId,
            planId,
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

    async getBillingPortalSession(returnUrl: string): Promise<{url: string}> { 
        // Get a reference to the callable function
        const createBillingPortalSession = httpsCallable<{customerId: string, returnUrl: string}, {url: string}>(this.functions, 'createBillingPortalSession');
        return createBillingPortalSession({
            customerId: this._userService.user.stripeCustomerId,
            returnUrl,
        }).then((result) => {
            // Read result data.
            const data = result.data;
            return Promise.resolve(data);
        }).catch((error) => {
            // Handle errors.
            const code = error.code;
            const message = error.message;
            console.error('Error calling createBillingPortalSession function call:', code, message);
            return Promise.reject('Error calling createBillingPortalSession function call');
        });            
    }

    async getPlanDetails(plan: MembershipInfo): Promise<any> { 
        const planId = environment.stripe.planIds[MembershipType[plan.id] as 'Free' | 'Basic' | 'Premium']; 
 
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