import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
// import * as admin from 'firebase-admin';
// import { Timestamp } from 'firebase/firestore';
import { initializeApp } from '@firebase/app';
import { getFirestore, collection, setDoc, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { ChatMessage, ChatterUpGame, DEFAULT_CHAT_MESSAGE, DEFAULT_CHATTER_UP_GAME, DEFAULT_USER, environments, GameType, GUEST_USER, MembershipInfo, MembershipType, User } from '@models';
import { Observable, BehaviorSubject, lastValueFrom, Subject, combineLatest } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import _ from 'lodash';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

// // Initialize the Firebase Admin SDK once if not already initialized
// // In a typical Firebase Functions environment, this should be done globally.
// if (!admin.apps.length) {
//     admin.initializeApp(environment.firebaseConfig);
// }

// const db = admin.firestore();
const GAMES_COLLECTION = 'chatter_up_games';

@Injectable({
  providedIn: 'root'
})
export class GameService {
    readonly app = initializeApp(environment.firebaseConfig);
    readonly db = getFirestore(this.app);
    readonly _userService = inject(UserService);
    readonly _authService = inject(AuthService);

    currentChatterUpGame: ChatterUpGame = DEFAULT_CHATTER_UP_GAME;

    getGamesCollectionPath() {
        return GAMES_COLLECTION;
    }

    getGamePath(): string {
        const root = this.getGamesCollectionPath();
        if (this.currentChatterUpGame.id === '') {
            console.error('No current game');
            return `/${root}/0`;
        }
        return `/${root}/${this.currentChatterUpGame.id}`
    }

    async startChatterUp(environment: GameType): Promise<boolean> {
        // 1. Prepare the data to save to server
        this.currentChatterUpGame.startTime = new Date();
        this.currentChatterUpGame.lastMessageTime = this.currentChatterUpGame.startTime;
        this.currentChatterUpGame.type = environment;
        this.currentChatterUpGame.userId = this._authService.uid as string;
        this.currentChatterUpGame.username = this._userService.user.username;
        this.currentChatterUpGame.userMembershipLevel = this._userService.user.membershipLevel;
        const scenarios = environments[environment].scenarios;
        this.currentChatterUpGame.scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

        try {
            // 2. Add the document. This returns a DocumentReference instantly.
            const docRef = await addDoc(collection(this.db, this.getGamesCollectionPath()), this.currentChatterUpGame);
            console.log(`Game successfully added with temporary ID: ${docRef.id}`);

            // 3. Retrieve the full snapshot to get the data as saved by Firestore
            const docSnapshot = await getDoc(docRef);

            if (!docSnapshot.exists || docSnapshot.id !== docRef.id) {
                console.error("IDs don't match:", docRef, docSnapshot);
                throw new Error(`Failed to retrieve document with ID ${docRef.id} after creation.`);
            }

            // // 4. Combine the ID with the data and return
            // const retrievedData = docSnapshot.data() as ChatterUpGame;
            
            // // Convert Firestore Timestamp object back to a JS Date object for external use
            // const createdDate = retrievedData.createdAt instanceof admin.firestore.Timestamp 
            //     ? retrievedData.createdAt.toDate() 
            //     : retrievedData.createdAt;

            this.currentChatterUpGame.id = docSnapshot.id;
            return Promise.resolve(true);
        } catch (error) {
            console.error("Error creating game record:", error);
            return Promise.reject();
        }
    }

    async sendMessage(message: string): Promise<boolean> {
        if (this.currentChatterUpGame.id === '') return Promise.resolve(false);

        const elapsedTimeInSeconds = (new Date().valueOf() - this.currentChatterUpGame.lastMessageTime.valueOf())/1000;
        this.currentChatterUpGame.lastMessageTime = new Date();

        let score: -2 | -1 | 0 | 1 | 2 | -999 = 0;
        let explanation: string | undefined = undefined;
        let response: ChatMessage | null = null;
        try {
            ({score, explanation, response} = await this.calculateScore(message));
        } catch (error) {
            console.error('Error scoring message:', error);
            return Promise.reject();
        }
        const newUserMessage: ChatMessage = {
            ...DEFAULT_CHAT_MESSAGE,
            id: this.currentChatterUpGame.id + this.currentChatterUpGame.lastMessageTime.valueOf(),
            sender: 'user',
            timeSent: this.currentChatterUpGame.lastMessageTime,
            text: message,
            scored: true,
            score,
            flagged: score === -999,
        };
        if (explanation) newUserMessage.explanation = explanation;
        this.currentChatterUpGame.messages.push(newUserMessage);
        response && this.currentChatterUpGame.messages.push(response as ChatMessage);

        this.currentChatterUpGame.flagged ||= newUserMessage.flagged;
        this.currentChatterUpGame.score += score;
        this.currentChatterUpGame.timeLeftInSeconds -= elapsedTimeInSeconds;

        try {
            const result = await setDoc(doc(this.db, this.getGamePath()), this.currentChatterUpGame);
        } catch (error) {
            console.error('Error saving message:', error);
            return Promise.reject();
        }
        return Promise.resolve(true);
    }

    // FAKER FUNCTIONS
    async calculateScore(message: string): Promise<{score: -2 | -1 | 0 | 1 | 2 | -999, explanation: string | undefined, response: ChatMessage | null}> {
        const words = message.toLowerCase();
        let score = 0;
        let explanation: string | undefined = '';
        
        if (words.includes('screw')) return {score: -999, explanation: 'Flagged for language', response: null};
        if (words.includes('?')) {score += 2; explanation += 'Included a question. ';}
        if (words.includes('interesting') || words.includes('fascinating')) {score += 1; explanation += 'Included a keyword. ';}
        if (words.includes('tell me') || words.includes('how') || words.includes('what') || words.includes('why')) {
            score += 1;
            explanation += 'Included a open-ended question. ';
        }
        if (words.length >= 50 && words.length < 200) {score += 1; explanation += 'Good length. ';}
        if (words.length >= 200 && words.length < 400) {score -= 1; explanation += 'Response too long. ';}
        if (words.length >= 400) {score -= 2; explanation += 'Response was an essay. ';}
        if (words.includes('you') || words.includes('your')) {score += 1; explanation += 'Showed interest in other person. ';}
        if (words.includes('ok') || words.includes('sure') || words.includes('yeah')) {score -= 1; explanation += 'Included meh words. ';}
        if (words.length < 20) {score -= 1; explanation += 'Response was too short. ';}

        // Clamp response
        score = Math.max(-2, Math.min(2, score));
        if (this.currentChatterUpGame.userMembershipLevel === MembershipType.Free) explanation = undefined;
        const response = this.getFakeCoachMessage();

        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                // Resolve the promise, returning the data
                resolve({score: score as -2 | -1 | 0 | 1 | 2 | -999, explanation, response});
            }, Math.random() * 2000);
        });
    };

    getFakeCoachMessage() {
        const responses = [
            "That sounds really interesting! I'd love to hear more about what you're working on.",
            "Wow, that's impressive! How did you get started in that field?",
            "I've been curious about that area myself. What's the most exciting part of your work?",
            "That's a great perspective! I hadn't thought about it that way before.",
            "Fascinating! Are you working on any exciting projects right now?"
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const newBotMessage: ChatMessage = {
            ...DEFAULT_CHAT_MESSAGE,
            timeSent: new Date(),
            sender: 'coach',
            text: randomResponse,
            scored: false,
            score: 0,
        };
        newBotMessage.id = this.currentChatterUpGame.id + newBotMessage.timeSent.valueOf();
        return newBotMessage;
    }

}
