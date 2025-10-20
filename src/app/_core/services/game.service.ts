import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { initializeApp } from '@firebase/app';
import { getFirestore, collection, query, orderBy, setDoc, addDoc, doc, getDoc, Timestamp, QuerySnapshot, getDocs } from 'firebase/firestore';
import { Achievement, ChatMessage, ChatterUpGame, DEFAULT_CHAT_MESSAGE, DEFAULT_CHATTER_UP_GAME, DEFAULT_USER, environments, FirestoreChatterUpGame, GameType, GameTypeInfo, GUEST_USER, MembershipInfo, MembershipType, OpenAiPrompt, OpenAiResponse, User } from '@models';
import { Observable, BehaviorSubject, lastValueFrom, Subject, combineLatest } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import _ from 'lodash';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { UserProfile } from '@models';
import { OpenAI } from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

// // Initialize the Firebase Admin SDK once if not already initialized
// // In a typical Firebase Functions environment, this should be done globally.
// if (!admin.apps.length) {
//     admin.initializeApp(environment.firebaseConfig);
// }

// const db = admin.firestore();
const GAMES_COLLECTION = 'chatter_up_games';
const GREATEST_HITS_COLLECTION = 'greatest_hits';
const HALL_OF_FAME_COLLECTION = 'hall_of_fame';

@Injectable({
  providedIn: 'root'
})
export class GameService {
    readonly app = initializeApp(environment.firebaseConfig);
    readonly db = getFirestore(this.app);
    readonly functions = getFunctions(this.app);
    readonly _userService = inject(UserService);
    readonly _authService = inject(AuthService);
    openai!: OpenAI;
    
    private _currentChatterUpGame: BehaviorSubject<ChatterUpGame> = new BehaviorSubject(DEFAULT_CHATTER_UP_GAME);
    currentChatterUpGame$: Observable<ChatterUpGame> = this._currentChatterUpGame.asObservable();
    get currentChatterUpGame() {
        return _.cloneDeep(this._currentChatterUpGame.value);
    }

    private _gameRunning: BehaviorSubject<boolean> = new BehaviorSubject(false);
    gameRunning$ = this._gameRunning.asObservable();
    get gameRunning() { return this._gameRunning.value; }
    set gameRunning(running: boolean) { this._gameRunning.next(running); }

    get gameActive(): boolean {
        return this._currentChatterUpGame.value.id !== '';
    }

    getGamesCollectionPath() {
        return GAMES_COLLECTION;
    }

    getGamePath(gameId?: string): string {
        const root = this.getGamesCollectionPath();
        if (!gameId) gameId = this._currentChatterUpGame.value.id;
        return `${root}/${gameId}`
    }

    getGreatHitCollectionPath(gameType: GameType) {
        return `${GREATEST_HITS_COLLECTION}/${GameType[gameType]}/games`;
    }

    getHallOfFameCollectionPath(gameType: GameType) {
        return `${HALL_OF_FAME_COLLECTION}/${GameType[gameType]}/users`;
    }

    async makeUpdates() {
        this.updateHallOfFame(this._userService.user.id);
    }

    async getGame(gameId: string): Promise<ChatterUpGame> {
        const docRef = doc(this.db, this.getGamePath(gameId));

        try {
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                const firestoreGame = docSnapshot.data() as FirestoreChatterUpGame;
                const game = this.getGameFromFirestoreGame(firestoreGame);
                return Promise.resolve(game);
            } else {
                console.error(`Could not find game with id ${gameId}:`, docSnapshot);
                return Promise.reject();
            }
        } catch (error) {
            console.error(`Error trying to find game with id ${gameId}:`, error);
            return Promise.reject();
        }
    }

    async getGreatistHits(gameType: GameType): Promise<ChatterUpGame[]> {
        const gameCollectionRef = collection(this.db, this.getGreatHitCollectionPath(gameType));

        // Create a query to order the documents by the 'score' field in descending order
        const q = query(gameCollectionRef, orderBy('score', 'desc'));

        try {
            const querySnapshot: QuerySnapshot<FirestoreChatterUpGame> = await getDocs(q) as QuerySnapshot<FirestoreChatterUpGame>;
            const sortedGames: ChatterUpGame[] = [];
            querySnapshot.forEach((game) => {
                sortedGames.push( this.getGameFromFirestoreGame(game.data()) );
            });
            return sortedGames;
        } catch (error) {
            console.error('Error getting sorted games:', error);
            throw error;
        }
    }

    async getHallOfFame(gameType: GameType): Promise<UserProfile[]> {
        const hallOfFameCollectionRef = collection(this.db, this.getHallOfFameCollectionPath(gameType));

        // Create a query to order the documents by the 'score' field in descending order
        const q = query(hallOfFameCollectionRef, orderBy(`rank.${GameType[gameType]}`, 'desc'));

        try {
            const querySnapshot: QuerySnapshot<UserProfile> = await getDocs(q) as QuerySnapshot<UserProfile>;
            const sortedUsers: UserProfile[] = [];
            querySnapshot.forEach((userProfile) => {
                sortedUsers.push(userProfile.data());
            });
            return sortedUsers;
        } catch (error) {
            console.error('Error getting sorted users:', error);
            throw error;
        }
    }

    updateGreatestHits(gameId: string) {
        // Get a reference to the callable function
        const updateTopTenGames = httpsCallable(this.functions, 'updateTopTenGames');

        // Call the function with the game ID
        updateTopTenGames({ gameId })
        .then((result) => {
            // Read result data.
            const data = result.data;
        }).catch((error) => {
            // Handle errors.
            const code = error.code;
            const message = error.message;
            console.error('Error calling updateTopTenGames function call:', code, message);
        });            
    }

    updateHallOfFame(userId: string) {
        // Get a reference to the callable function
        const updateHallOfFame = httpsCallable(this.functions, 'updateHallOfFame');

        // Call the function with the game ID
        updateHallOfFame({ userId })
        .then((result) => {
            // Read result data.
            const data = result.data;
            // console.log('Result of updateHallOfFame:', data);
        }).catch((error) => {
            // Handle errors.
            const code = error.code;
            const message = error.message;
            console.error('Error calling updateHallOfFame function call:', code, message);
        });            
    }

    async startChatterUp(environment: GameType): Promise<boolean> {
        const currentChatterUpGame = DEFAULT_CHATTER_UP_GAME;
        
        try {
            const key = await this.getOpenaiApiKey();
            // console.log('key', key);
            this.openai = new OpenAI({
                apiKey: key,
                dangerouslyAllowBrowser: true,
            });
        } catch(error) {
            console.error("Error getting OpenAI API key");
            return Promise.reject();
        }

        try {
            currentChatterUpGame.conversation = await this.openai.conversations.create();
        } catch (error) {
            console.error('Error creating OpenAI conversation:', error);
            return Promise.reject();
        }

        // 1. Prepare the data to save to server
        currentChatterUpGame.startTime = new Date();
        currentChatterUpGame.lastMessageTime = currentChatterUpGame.startTime;
        currentChatterUpGame.type = environment;
        currentChatterUpGame.userId = this._authService.uid as string;
        currentChatterUpGame.username = this._userService.user.username;
        currentChatterUpGame.userMembershipLevel = this._userService.user.membershipLevel;
        const scenarios = (_.find(environments, (e) => e.id === environment) as GameTypeInfo).scenarios;
        currentChatterUpGame.scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

        try {
            // 2. Add the document. This returns a DocumentReference instantly.
            const docRef = await addDoc(collection(this.db, this.getGamesCollectionPath()), currentChatterUpGame);
            // console.log(`Game successfully added with temporary ID: ${docRef.id}`);

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

            currentChatterUpGame.id = docSnapshot.id;
            this._currentChatterUpGame.next(currentChatterUpGame);

            // 5. Save game id to user's record and increment game count
            const games = this._userService.user.chatterUpGames;
            games.push(currentChatterUpGame.id);
            const stats = this._userService.user.chatterUpStats;
            stats.gameCounts[currentChatterUpGame.type]++;
            this._userService.updateUser({chatterUpGames: games, chatterUpStats: stats});
            return Promise.resolve(true);
        } catch (error) {
            console.error("Error creating game record:", error);
            return Promise.reject();
        }
    }

    async endChatterUp() {
        this._gameRunning.next(false);

        // Update user stats
        const stats = this._userService.user.chatterUpStats;
        stats.bestScores[this._currentChatterUpGame.value.type] = Math.max(stats.bestScores[this._currentChatterUpGame.value.type], this._currentChatterUpGame.value.score);
        stats.totalScores[this._currentChatterUpGame.value.type] += this._currentChatterUpGame.value.score;

        if (this._userService.user.chatterUpGames.length === 0) {
            stats.streakDays[this._currentChatterUpGame.value.type] = 1;
        } else {
            let streakExtended = false;
            for (let gameId of this._userService.user.chatterUpGames) {
                try {
                    const game = await this.getGame(gameId);
                    if (game.type === this._currentChatterUpGame.value.type) {
                        if (this._currentChatterUpGame.value.startTime.valueOf() - game.startTime.valueOf() < 1000 * 60 * 60 * 24) {
                            streakExtended = true;
                            break;
                        }
                    }
                } catch (error) {
                    console.warn('May have computed streak days incorrectly');
                }
            }
            stats.streakDays[this._currentChatterUpGame.value.type] = streakExtended ? stats.streakDays[this._currentChatterUpGame.value.type] + 1 : 0;
        }
        // NOTE: Game count was updated when game started
        this._userService.updateUser({chatterUpStats: stats});

        // Update Hall of Fame
        this.updateHallOfFame(this._userService.user.id);

        //Update top ten lists
        this.updateGreatestHits(this._currentChatterUpGame.value.id);
    }

    async sendMessage(message: string, elapsedTime: number): Promise<boolean> {
        if (this._currentChatterUpGame.value.id === '') return Promise.resolve(false);

        if (!this._gameRunning.value) this._gameRunning.next(true);
        const currentChatterUpGame = _.cloneDeep(this._currentChatterUpGame.value);

        let score: -2 | -1 | 0 | 1 | 2 | -999 = 0;
        let explanation: string | undefined = undefined;
        let response: ChatMessage | null = null;
        try {
            ({score, explanation, response} = await this.getFeedback(message));
        } catch (error) {
            console.error('Error scoring message:', error);
            return Promise.reject();
        }
        const timeSent =  new Date(this._currentChatterUpGame.value.lastMessageTime.valueOf() + elapsedTime);
        const newUserMessage: ChatMessage = {
            ...DEFAULT_CHAT_MESSAGE,
            id: currentChatterUpGame.id + '_user_' + timeSent,
            sender: 'user',
            timeSent,
            text: message,
            scored: true,
            score,
            flagged: score === -999,
        };
        
        if (explanation !== undefined) newUserMessage.explanation = explanation;
        currentChatterUpGame.messages.push(newUserMessage);
        response && currentChatterUpGame.messages.push(response as ChatMessage);
        currentChatterUpGame.lastMessageTime = response ? response.timeSent : newUserMessage.timeSent;

        currentChatterUpGame.flagged ||= newUserMessage.flagged;
        currentChatterUpGame.score += score;
        currentChatterUpGame.timeRemaining -= elapsedTime;

        try {
            const result = await setDoc(doc(this.db, this.getGamePath()), currentChatterUpGame);
            const docSnapshot = await getDoc(doc(this.db, this.getGamePath()));
            if (docSnapshot.exists()) {
                const firestoreGame = docSnapshot.data() as FirestoreChatterUpGame;
                const game = this.getGameFromFirestoreGame(firestoreGame);
                this._currentChatterUpGame.next(game);
            } else {
                console.error("Data didn't get stored for some reason:", docSnapshot, 'Using local version.');
                this._currentChatterUpGame.next(currentChatterUpGame);
            }
        } catch (error) {
            console.error('Error saving message:', error);
            return Promise.reject();
        }
        return Promise.resolve(true);
    }

    getGameFromFirestoreGame(fsGame: FirestoreChatterUpGame): ChatterUpGame {
        const game: ChatterUpGame = {
            id: fsGame.id,
            conversation: fsGame.conversation,
            startTime: this.convertDate(fsGame.startTime),
            lastMessageTime: this.convertDate(fsGame.lastMessageTime),
            type: fsGame.type,
            scenario: fsGame.scenario,
            messages: [],
            score: fsGame.score,
            flagged: fsGame.flagged,
            timeRemaining: fsGame.timeRemaining,
            userId: fsGame.userId,
            username: fsGame.username,
            userMembershipLevel: fsGame.userMembershipLevel,
        };
        for (let m of fsGame.messages) {
            const message: ChatMessage = {
                id: m.id,
                timeSent: this.convertDate(m.timeSent),
                sender: m.sender,
                text: m.text,
                scored: m.scored,
                score: m.score,
                flagged: m.flagged,
            };
            if (m.explanation !== undefined) message.explanation = m.explanation;
            game.messages.push(message);
        }
        return game;
    }
    
    convertDate(timestamp: Timestamp): Date {
            // Convert Firestore Timestamp object back to a JS Date object for external use
        return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    }


    async getAchievements(user: User): Promise<Achievement[]> {
        const achievements: Achievement[] = [];
        const currentUser = this._userService.user;

        achievements.push({name: `First Words`, description: `Complete your first conversation`, icon: ``, earned: user.chatterUpGames.length > 0});
        achievements.push({name: `Now You're Talking`, description: `Complete ten conversations`, icon: ``, earned: user.chatterUpGames.length > 9});
        
        const gameCounts = {business: 0, dating: 0, social: 0};
        for (let gameId of user.chatterUpGames) {
            const game = await this.getGame(gameId);
            if (game.type === GameType.business) gameCounts.business++;
            else if (game.type === GameType.dating) gameCounts.dating++;
            else gameCounts.social++;
        }
        achievements.push({name: `Talkin' Business`, description: `Complete a business conversation`, icon: ``, earned: gameCounts.business > 0});
        achievements.push({name: `Networking Pro`, description: `Complete 10 business conversations`, icon: ``, earned: gameCounts.business > 9});
        achievements.push({name: `Dating Dabbler`, description: `Complete a dating conversation`, icon: ``, earned: gameCounts.dating > 0});
        achievements.push({name: `Dating Dynamo`, description: `Complete 10 dating conversations`, icon: ``, earned: gameCounts.dating > 9});
        achievements.push({name: `Party Talk`, description: `Complete a social conversation`, icon: ``, earned: gameCounts.social > 0});
        achievements.push({name: `Life of the Party`, description: `Complete 10 social conversations`, icon: ``, earned: gameCounts.social > 9});
        achievements.push({name: `Networking Ninja`, description: `Score 20+ in a business conversation`, icon: ``, earned: user.chatterUpStats.bestScores.business >= 20});
        achievements.push({name: `Networking Master`, description: `Average 20+ in business conversations`, icon: ``, earned: user.chatterUpStats.totalScores.business / user.chatterUpStats.gameCounts.business >= 20});
        achievements.push({name: `Beyond 'Hey'`, description: `Score 20+ in a dating conversation`, icon: ``, earned: user.chatterUpStats.bestScores.dating >= 20});
        achievements.push({name: `Dating Guru`, description: `Average 20+ in dating conversations`, icon: ``, earned: user.chatterUpStats.totalScores.dating / user.chatterUpStats.gameCounts.dating >= 20});
        achievements.push({name: `Social Butterfly`, description: `Score 20+ in a social conversation`, icon: ``, earned: user.chatterUpStats.bestScores.social >= 20});
        achievements.push({name: `Socialite`, description: `Average 20+ in social conversations`, icon: ``, earned: user.chatterUpStats.totalScores.social / user.chatterUpStats.gameCounts.social >= 20});
        achievements.push({name: `The Conversationalist`, description: `Practice chatting 3 days in a row`, icon: ``, earned: Math.max(user.chatterUpStats.streakDays.business, user.chatterUpStats.streakDays.dating, user.chatterUpStats.streakDays.social) >= 3});
        achievements.push({name: `Talk Marathoner`, description: `Practice chatting 7 days in a row`, icon: ``, earned: Math.max(user.chatterUpStats.streakDays.business, user.chatterUpStats.streakDays.dating, user.chatterUpStats.streakDays.social) >= 7});
        return Promise.resolve(achievements);
    }

    async getFeedback(message: string): Promise<{score: -2 | -1 | 0 | 1 | 2 | -999, explanation: string | undefined, response: ChatMessage | null}> {

        // switch (this._currentChatterUpGame.value.type):
        const prompt: OpenAiPrompt = environment.openai.prompts[this._currentChatterUpGame.value.type];
        prompt.variables.scenario = this._currentChatterUpGame.value.scenario;

        const response = await this.openai.responses.parse({
            prompt,
            input: [{
                role: 'user',
                content: message,
            }],
            text: {
                format: zodTextFormat(OpenAiResponse, "coach_response"),
            },
            conversation: this._currentChatterUpGame.value.conversation?.id,
        });
        const parsedResponse = response.output_parsed as {score: -2 | -1 | 0 | 1 | 2 | -999, explanation: string, response: string};
        return Promise.resolve({
            score: parsedResponse.score,
            explanation: parsedResponse.explanation,
            response: this.getCoachMessage(parsedResponse.response),
        });
    }

    getCoachMessage(response: string): ChatMessage {
        const newMessage: ChatMessage = {
            ...DEFAULT_CHAT_MESSAGE,
            timeSent: new Date(),
            sender: 'coach',
            text: response,
            scored: false,
            score: 0,
        };
        newMessage.id = this.currentChatterUpGame.id + '_coach_' + newMessage.timeSent.valueOf();
        return newMessage;
    }

    async getOpenaiApiKey(): Promise<string> {
      const projectId = environment.firebaseConfig.messagingSenderId;
      const secretName = environment.openai.secretName;

        // Get a reference to the callable function
        const getSecret = httpsCallable(this.functions, 'getSecret');

        // Call the function with the game ID
        return getSecret({ projectId, secretName })
        .then((result) => {
            // Read result data.
            const data = result.data as string;
            return Promise.resolve(data);
        }).catch((error) => {
            // Handle errors.
            const code = error.code;
            const message = error.message;
            console.error('Error calling getSecret function call:', code, message);
            return Promise.reject('Error calling getSecret function call');
        });            
    }

}
