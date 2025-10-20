import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { initializeApp } from '@firebase/app';
import { getFirestore, collection, addDoc, getDoc, updateDoc } from 'firebase/firestore';
import { DEFAULT_MESSAGE, Message } from '@models';

const MESSAGES_COLLECTION = 'messages';

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    readonly app = initializeApp(environment.firebaseConfig);
    readonly db = getFirestore(this.app);

    getMessagesCollectionPath() {
        return MESSAGES_COLLECTION;
    }

    getMessageDocumentPath(id: string) {
        return `${this.getMessagesCollectionPath()}/${id}}`;
    }

    async sendMessage(message: Message) {

        // 1. Prepare the data to save to server
        const newMessage = {...DEFAULT_MESSAGE, ...message};
        newMessage.dateSent = new Date();

        try {
            // 2. Add the document. This returns a DocumentReference instantly.
            const docRef = await addDoc(collection(this.db, this.getMessagesCollectionPath()), newMessage);
            // console.log(`Message successfully added with temporary ID: ${docRef.id}`);

            // 3. Retrieve the full snapshot to get the data as saved by Firestore
            const docSnapshot = await getDoc(docRef);

            if (!docSnapshot.exists || docSnapshot.id !== docRef.id) {
                console.error("IDs don't match:", docRef, docSnapshot);
                throw new Error(`Failed to retrieve document with ID ${docRef.id} after creation.`);
            }

            // 4. Resave record with id
            await updateDoc(docRef, {id: docSnapshot.id});

            return Promise.resolve(true);
        } catch (error) {
            console.error("Error creating message record:", error);
            return Promise.reject();
        }

    }
}