// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    firebaseConfig: {
        apiKey: "AIzaSyCGuKQb5nKUWmhKOtjc1yKjP4lNbEsCO4k",
        authDomain: "chatter-up-70a2f.firebaseapp.com",
        projectId: "chatter-up-70a2f",
        storageBucket: "chatter-up-70a2f.firebasestorage.app",
        messagingSenderId: "212324288165",
        appId: "1:212324288165:web:6c00a077ffc28125242f4c",
        measurementId: "G-V36RHPPESD"
    },
    openai: {
        secretName: 'openai_api_key',
        projectId: '212324288165',
        prompts: {
            business: {
                "id": "pmpt_68f16b2fb3948193a7be772331c832a9059f9228eb27216c",
                "version": "3",
                "variables": {
                    "scenario": "example scenario"
                },
            },
            dating: {
                "id": "pmpt_68f16f185cb48196bfec8da82f62245e0a8fa33e2447d124",
                "version": "2",
                "variables": {
                    "scenario": "example scenario"
                },
            },
            social: {
                "id": "pmpt_68f171f323c48196ae8658fd5295906f0f98ff411680f0ea",
                "version": "3",
                "variables": {
                    "scenario": "example scenario"
                },
            },
        },
    },
    stripe: {
        publicKey: 'pk_test_FwGIQeNsaDdByaIg3Jfnvb3b',
        secretName: 'stripe_private_key',
    },
};
