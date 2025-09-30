import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { initializeApp } from '@firebase/app';
import { getFirestore, collection, setDoc, addDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { DEFAULT_SUBSCRIBER, Subscriber } from '../models/subscription.models';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {
    readonly app = initializeApp(environment.firebaseConfig);
    readonly db = getFirestore(this.app);

    async signUp(email: string) {
        const data: Subscriber = {
            ...DEFAULT_SUBSCRIBER,
            email: email,
            startDate: Timestamp.now(),
        };

        try {
            const docRef = await setDoc(doc(this.db, 'subscribers', email), data);
            return Promise.resolve(true);
        } catch (e) {
            console.error("Error adding subscriber: ", e);
            return Promise.resolve(false);
        }
    }

}
