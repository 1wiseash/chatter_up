import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { initializeApp } from '@firebase/app';
import { getFirestore, collection, setDoc, addDoc, doc, getDoc } from "firebase/firestore";
import { DEFAULT_USER, GUEST_USER, MembershipType, User } from '../models';
import { Observable, BehaviorSubject, lastValueFrom, Subject, combineLatest } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { AuthService } from './auth.service';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    readonly app = initializeApp(environment.firebaseConfig);
    readonly db = getFirestore(this.app);
    readonly _authService = inject(AuthService);
    private _user: BehaviorSubject<User> = new BehaviorSubject(GUEST_USER);
    private _updateUserTrigger = new Subject<null>();

    user$: Observable<User> = combineLatest([
            this._authService.authUser$.pipe(startWith(null)),
            this._updateUserTrigger.asObservable().pipe(startWith(null)),
        ]).pipe(
        tap( ([authUser, _]) => console.log('Auth user changed. About to change user data.', authUser) ),
        switchMap( async ([authUser, _]) => {
            if (authUser !== null && authUser.uid !== null && authUser.uid !== '') {
                const docRef = doc(this.db, "users", authUser.uid);
                try {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        console.log("Document data:", docSnap.data());
                        return docSnap.data() as User;
                    } else {
                        console.log("No such document!");
                        return GUEST_USER;
                    }
                } catch (error) {
                    return GUEST_USER;
                }
            } else {
                return GUEST_USER;
            }
        }),
        // tap( async (user) => {
        //     // Update user record for missing or bad data
        //     if (this._authService.authUser && (user.membershipLevel === null || user.membershipLevel === undefined)) {
        //         user.membershipLevel = MembershipType.Free;
        //         await setDoc(doc(this.db, 'users', this._authService.authUser.uid), user);
        //     }
        // }),
        tap( async (user) => {
            this._user.next(user);
            console.log('User data updated to:', this._user.value);
        }),
    );

    get user() {
        return _.cloneDeep(this._user.value);
    }
  
    async createUser(userId: string, username: string) {
        const data: User = {
            ...DEFAULT_USER,
            username: username,
        };
        try {
            const docRef = await setDoc(doc(this.db, 'users', userId), data);
            this._user.next(data);
            this._updateUserTrigger.next(null);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    // Get a user with unique id. Doesn't have to be current user.
    async getUser(userId: string): Promise<User> {
        const docRef = doc(this.db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            return docSnap.data() as User;
        } else {
            console.log("No such document!");
            return Promise.reject(GUEST_USER)
        }
    }

}
