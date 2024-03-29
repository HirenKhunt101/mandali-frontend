// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`. 

export const environment = {
  production: false,
  // url: 'http://localhost:4200/',
  // url: 'https://mandali-frontend-bbtdtk68y-hirenkhunt101.vercel.app/',
  url: "https://mandali-frontend.vercel.app/",
  backendurl: 'https://mandali-backend.vercel.app/mandali/',
  DECRYPT: "put32charactershereeeeeeeeeeeee!",
  firebaseConfig: {
    apiKey: "AIzaSyC5yPAlq8-eqPGF7ip4cuws9VSPsimewIA",
    authDomain: "mandali-fbf84.firebaseapp.com",
    projectId: "mandali-fbf84",
    storageBucket: "mandali-fbf84.appspot.com",
    messagingSenderId: "595595593551",
    appId: "1:595595593551:web:f47cbf5a7e8e7f5f6b273a",
    measurementId: "G-X4V4BL63LS"
  },
  BROKERAGE_CHARGE: 0,
  STT_CHARGE_PERCENTAGE: 0.001,
  STAMP_DUTY_CHARGE_PERCENTAGE: 0.00015,
  SEBI_CHARGES_PERCENTAGE: 0.000001,
  TURNOVER_TAX_CHARGE_PERCENTAGE: 0.03,
  NSE_TRANSACTION_CHARGE_PERCENTAGE: 0.0000325,
  BSE_TRANSACTION_CHARGE_PERCENTAGE: 0.0000375,
  GST_RATE: 0.18
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
