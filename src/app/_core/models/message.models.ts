export interface Message {
    id: string;
    dateSent: Date;
    fromName: string;
    toName: string;
    fromEmail: string;
    toEmail: string;
    message: string;
}

export const DEFAULT_MESSAGE: Message = {
    id: '',
    dateSent: new Date(),
    fromName: '',
    toName: '',
    fromEmail: '',
    toEmail: '',
    message: '',
}
