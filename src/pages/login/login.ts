import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { SignupPage } from '../signup/signup';

import firebase from 'firebase';
import { FeedPage } from '../feed/feed';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  email: string = "yattishr@hotmail.com";
  password: string = "12345678";

  constructor(public navCtrl: NavController, public toastCtrl: ToastController) {

  }

  gotoSignup() {
    this.navCtrl.push(SignupPage);
    console.log("Signup page button clicked...");
  }

  login() {
    firebase.auth().signInWithEmailAndPassword(this.email, this.password)
    .then((user) => {
      console.log(user)
      this.toastCtrl.create({
        message: "Welcome to Feedly " + user.user.displayName,
        duration: 3000
      }).present();
      this.navCtrl.setRoot(FeedPage); // use setRoot when you dont want the user to navigate back to origin page.

    }).catch((err) => {
      console.log(err)
      this.toastCtrl.create({
      message: err.message,
      duration: 3000      
    }).present();  
})
  }
}