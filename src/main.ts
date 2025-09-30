import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { initializeApp } from "firebase/app";

import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
    if (window) {
        window.console.log = () => {};
        window.console.warn = () => {};
        window.console.error = () => {};
    }
}

// Initialize Firebase
const app = initializeApp(environment.firebaseConfig);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
