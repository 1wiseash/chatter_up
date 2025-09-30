import DOMPurify from 'dompurify';

export class SafeText {

    private _text: string;

    constructor(value?: string | SafeText) {
        this._text = value ? value.toString() : '';
    }

    static parse(value: string): SafeText {
        return new SafeText(value);
    }

    toString() {
        return this._text;
    }

    valueOf() {
        return this._text;
    }

    stripEmails(): SafeText {
        this._text =  this._text.replace(/(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g, '(email removed)');
        return this;
    }

    stripUrls(): SafeText {
        this._text =  this._text.replace(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g, '(url removed)');
        return this;
    }

    stripPhoneNumbers(): SafeText {
        this._text =  this._text.replace(/1?-?\.? ?\(?\d{3}[\-\)\.\s]? ?\d{3}[\-\.\s]?\d{4}/g, '(phone number removed)');
        return this;
    }

    strip(): SafeText {
        return this.stripEmails().stripPhoneNumbers().stripUrls();
    }

    sanitize(): SafeText {
        this._text = DOMPurify.sanitize(this._text);
        return this;
    }

}
