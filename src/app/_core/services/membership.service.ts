import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { initializeApp } from '@firebase/app';
import { getFirestore, collection, setDoc, addDoc, doc, getDoc } from "firebase/firestore";
import { DEFAULT_USER, GUEST_USER, MembershipInfo, MembershipType, User } from '../models';
import { Observable, BehaviorSubject, lastValueFrom, Subject, combineLatest } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import _ from 'lodash';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
    readonly app = initializeApp(environment.firebaseConfig);
    readonly db = getFirestore(this.app);
    readonly _userService = inject(UserService);

    // @todo Check for issues with payments
    async purchaseMembership(plan: MembershipInfo): Promise<boolean> {
      if (this._userService.user.membershipLevel === plan.id) {
        console.warn('Already at level', plan.name);
        return Promise.resolve(false);
      }

      try {
        // @todo Add payment data collection
        await this._userService.updateUser({membershipLevel: plan.id});
        return Promise.resolve(true);
      } catch (error) {
        return Promise.resolve(false);
      }
    }
}
