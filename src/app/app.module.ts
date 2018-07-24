import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import firebase from 'firebase';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { FeedPage } from '../pages/feed/feed';
import { Camera } from '@ionic-native/camera';


  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCIEp2YqjTTFiWl9T-X914Eb0xngwu7lM4",
    authDomain: "feedlyapp-a4d0b.firebaseapp.com",
    databaseURL: "https://feedlyapp-a4d0b.firebaseio.com",
    projectId: "feedlyapp-a4d0b",
    storageBucket: "feedlyapp-a4d0b.appspot.com",
    messagingSenderId: "903923686423"
  };
  firebase.initializeApp(config);
  firebase.firestore().settings({ timestampsInSnapshots: true });

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SignupPage,
    FeedPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SignupPage,
    FeedPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
