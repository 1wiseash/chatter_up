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
export class GameService {
    readonly app = initializeApp(environment.firebaseConfig);
    readonly db = getFirestore(this.app);
    readonly _userService = inject(UserService);

}
