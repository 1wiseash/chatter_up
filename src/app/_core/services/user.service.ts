import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { initializeApp } from '@firebase/app';
import { getFirestore, collection, setDoc, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { Achievement, DEFAULT_USER, DEFAULT_USER_PROFILE, GUEST_USER, MembershipType, User, UserProfile } from '../models';
import { Observable, BehaviorSubject, lastValueFrom, Subject, combineLatest } from 'rxjs';
import { tap, switchMap, startWith, shareReplay } from 'rxjs/operators';
import { AuthService } from './auth.service';
import _ from 'lodash';

const USERS_COLLECTION_PATH = 'users';
const USER_PROFILES_COLLECTION_PATH = 'user_profiles';
const USER_AVATARS_COLLECTION_PATH = 'profile_avatars';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    readonly app = initializeApp(environment.firebaseConfig);
    readonly db = getFirestore(this.app);
    storage = getStorage(this.app);
    readonly _authService = inject(AuthService);
    private _user: BehaviorSubject<User> = new BehaviorSubject(GUEST_USER);
    private _updateUserTrigger = new Subject<null>();

    getUserPath(userId?: string) {
        if (!userId) userId = this._authService.uid;
        return `${USERS_COLLECTION_PATH}/${userId}`;
    }

    getUserProfilePath(userId?: string) {
        if (!userId) userId = this._authService.uid;
        return `${USER_PROFILES_COLLECTION_PATH}/${userId}`;
    }

    getUserAvatarPath(userId?: string) {
        if (!userId) userId = this._authService.uid;
        return `${USER_AVATARS_COLLECTION_PATH}/${userId}.jpg`;
    }

    user$: Observable<User> = combineLatest([
            this._authService.authUser$.pipe(startWith(null)),
            this._updateUserTrigger.asObservable().pipe(startWith(null)),
        ]).pipe(
        // tap( ([authUser, _]) => console.log('Auth user changed. About to change user data.', authUser) ),
        switchMap( async ([authUser, _]) => {
            if (authUser !== null && authUser.uid !== null && authUser.uid !== '') {
                const docRef = doc(this.db, USERS_COLLECTION_PATH, authUser.uid);
                try {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        // console.log("Document data:", docSnap.data());
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
        shareReplay(1),
        // tap( async (user) => {
        //     // Update user record for missing or bad data
        //     if (this._authService.authUser) {
        //         user.id = this._authService.uid;
        //         await setDoc(doc(this.db, USERS_COLLECTION_PATH, this._authService.authUser.uid), user);
        //     }
        // }),
        tap( async (user) => {
            this._user.next(user);
            // console.log('User data updated to:', this._user.value);
        }),
    );

    get user() {
        return _.cloneDeep(this._user.value);
    }
  
    async createUser(userId: string, username: string) {
        const newUser: User = {
            ...DEFAULT_USER,
            id: userId,
            username: username,
        };
        try {
            const docRef = await setDoc(doc(this.db, USERS_COLLECTION_PATH, userId), newUser);
            this._user.next(newUser);
            this._updateUserTrigger.next(null);

            // Create a user profile record
            const userProfile: UserProfile = {
                ...DEFAULT_USER_PROFILE,
                id: userId,
                username: username,
                rank: {
                    business: 0,
                    dating: 0,
                    social: 0,
                },
            };
            await setDoc(doc(this.db, USER_PROFILES_COLLECTION_PATH, userId), userProfile);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    async updateUser(changes: Partial<User>): Promise<void> {
      if (this._authService.authUser) {
        const userDocRef = doc(this.db, USERS_COLLECTION_PATH, this._authService.authUser.uid);
        await updateDoc(userDocRef, changes);
        this._updateUserTrigger.next(null);

        // Update user profile if necessary
        if (changes.username || changes.chatterUpStats) {
            const profileChanges: Partial<UserProfile> = {};
            if (changes.username) profileChanges['username'] = changes.username;
            if (changes.chatterUpStats) profileChanges['rank'] = {...changes.chatterUpStats.totalScores};
            this.updateUserProfile({username: changes.username})
        }
        return Promise.resolve();
      } else {
        console.error('Tried to update user not currently logged in');
        return Promise.reject();
      }
    }

    // Get user profile with unique id. (Doesn't have to be current user.)
    async getUserProfile(userId: string): Promise<UserProfile> {
        const docRef = doc(this.db, USER_PROFILES_COLLECTION_PATH, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // console.log("Document data:", docSnap.data());
            return docSnap.data() as UserProfile;
        } else {
            console.log("No such document!");
            return Promise.reject(GUEST_USER)
        }
    }

    async updateUserProfile(changes: Partial<UserProfile>): Promise<void> {
      if (this._authService.authUser) {
        const userDocRef = doc(this.db, USER_PROFILES_COLLECTION_PATH, this._authService.authUser.uid);
        await updateDoc(userDocRef, changes);
        return Promise.resolve();
      } else {
        console.error('Tried to update user profile, but not currently logged in');
        return Promise.reject();
      }
    }

    async getAvatarUrl(userId: string): Promise<string | null> {
        // Expected Storage Path: avatars/{userId}
        const avatarRef = ref(this.storage, this.getUserAvatarPath(userId));
        
        try {
            const url = await getDownloadURL(avatarRef);
            return url;
        } catch (error) {
            // Log the warning and return null, letting the (error) binding on the <img> handle the fallback.
            console.warn("Error fetching avatar URL (likely file not found):", (error as any).code);
            return null; 
        }
    }
  
}
