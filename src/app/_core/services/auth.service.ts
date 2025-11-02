import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { BehaviorSubject, Observable, lastValueFrom } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import _ from 'lodash';

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    User,
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    updatePassword,
    signOut,
} from "firebase/auth";

import { AuthData, SafeText } from '@models';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private _authUser: BehaviorSubject<User | null>;
    authUser$: Observable<User | null>;
    readonly app = initializeApp(environment.firebaseConfig);
    private _auth = getAuth(this.app);

    constructor(@Inject(PLATFORM_ID) private _platformId: Object) {

        this._authUser = new BehaviorSubject(this._auth.currentUser);
        this.authUser$ = this._authUser.asObservable().pipe(
            // tap( user => console.log(`Auth user changed:`, user) ),
            shareReplay(1),
        );

        //Check to see if user was logged in recently
        // const storedUser = isPlatformBrowser(this._platformId) ? localStorage.getItem('authUser') : null;
        // if (storedUser) {
        //     this._setAuthUser(JSON.parse(storedUser));
        // }

        //Set up a listener to authState just in case you get logged out without hitting logout
        this._auth.onAuthStateChanged( ( authUser => {
            console.log('onAuthStateChanged. authUser:', authUser);
            
            this._setAuthUser(authUser);
            console.log('_authUser after onAuthStateChanged:', this._authUser.value);

            this.loggedIn.set(authUser !== null);
            console.log('loggedIn signal set to ', this.loggedIn());
        }) );
    }

    loggedIn = signal<boolean>(false);

    get authUser() {
        return _.cloneDeep(this._authUser.value);
    }

    get uid() {
        return this.loggedIn() ? this._authUser.value?.uid : '';
    }

    get email() {
        return this.loggedIn() ? this._authUser.value?.email?.toLowerCase().trim() : '';
    }

    async registerUser(authData: AuthData): Promise<User> {
        if (this.loggedIn()) {
            console.error('Possible illegal state: tried to register new user, but already logged in!');
            await this._auth.signOut();
        }

        try {
            const credential = await createUserWithEmailAndPassword(this._auth, authData.email.toLowerCase().trim(), authData.password)
            if (!credential || !credential.user) {
                console.error('Failed to create user without error. Credential:', credential);
            }
            this._setAuthUser(credential.user);
            return credential.user;
        } catch(error: any) {
            console.error('Error in auth.service.registerUser:', error);
            return Promise.reject(error);
        }
    }

    async logIn(authData: AuthData): Promise<User | null> {
        if (this.loggedIn()) {
            console.error('Possible illegal state: tried to log in, but already logged in!');
            if (authData.email === this._auth.currentUser?.email) return lastValueFrom(this._authUser.asObservable());
        }

        try {
            const result = await signInWithEmailAndPassword(this._auth, authData.email.toLowerCase().trim(), authData.password);
            // console.log('Success in auth.service.logIn:', result);
            this._setAuthUser(result.user);
            this.loggedIn.set(true);
            return result.user;
        } catch (error) {
            console.error('Error in auth.service.logIn:', error);
            return Promise.reject(error);
        }
    }

    async logOut() {
        // if (!this.loggedIn()) {
        //     throw new Error('Possible illegal state: tried to log out, but not logged in!');
        // }
        console.log('Logging out user ', this._authUser.value?.uid);
        // this.loggedIn.set(false);
        // this._setAuthUser(null);
        try {
            await signOut(this._auth);
            console.log('Success in auth.service.logOut');
            return Promise.resolve();
        } catch (error) {
            console.error('Error in auth.service.logOut:', error);
            return Promise.reject(error);
        }
    }

    private _setAuthUser(authUser: User | null) {
        //Only change auth user if there is actually a change.
        if (!this.loggedIn() && authUser && authUser.uid !== this._authUser.value?.uid) {
            // console.log('Logging in user ' + authUser.uid);
            this._authUser.next(authUser);
            // if(isPlatformBrowser(this._platformId)) {
            //     localStorage.setItem('authUser', JSON.stringify(authUser));
            // }
            return;
        }

        if (this.loggedIn() && !authUser) {
            // console.log('Logging out user ' + this._authUser.value?.uid);
            this._authUser.next(null);
            // if(isPlatformBrowser(this._platformId)) {
            //     localStorage.removeItem('authUser');
            // }
            return;
        }

        if (this.loggedIn() && authUser) {
            if (authUser.uid !== this._authUser.value?.uid) {
                console.error('Possible error! User was logged in but authUser changed.');
                this._authUser.next(authUser);
                // if(isPlatformBrowser(this._platformId)) {
                //     localStorage.setItem('authUser', JSON.stringify(authUser));
                // }
            }
        }
    }

    async deleteUser() {
        return this._auth.currentUser?.delete();
    }

    async confirmPassword(password: string): Promise<boolean> {
        if (this._authUser.value === null || this._authUser.value.email === null) {
            return Promise.resolve(false);
        } else {
            const credential = EmailAuthProvider.credential(this._authUser.value.email, password);
            try {
                await reauthenticateWithCredential(this._authUser.value, credential);
                console.log(`Confirmed user credentials`);
                return true;
            } catch (error) {
                console.error('Could not confirm user credentials:', error);
                return false;
            }
        }
    }

    async resetPassword(email: string) {
        email = SafeText.parse(email).stripUrls().stripPhoneNumbers().sanitize().toString();
        return sendPasswordResetEmail(this._auth, email);
    }

    async changePassword(oldPassword: string, newPassword: string) {
        try {
            const confirmed = await this.confirmPassword(oldPassword);
            if (!confirmed) {
                throw new Error('Current password is not valid.');
            }
        } catch(error) {
            console.log(`Error trying to confirm old password:`, error);
            throw error;
        }
        if (this._authUser.value) return updatePassword(this._authUser.value, newPassword);
    }

}
