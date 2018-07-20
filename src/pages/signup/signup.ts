import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import firebase from 'firebase';
import { FeedPage } from '../feed/feed';



@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  name: string = "";
  email: string = "";
  password: string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, public alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }


  signup() {
    console.log(this.name, this.email, this.password);
    firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
    .then((data) => {
      console.log(data);
      let newUser: firebase.User = data.user;
          newUser.updateProfile({
          displayName: this.name,
          photoURL: ""
          }).then((res) => {
            console.log("Profile updated successfully.")
            console.log(res)
            this.alertCtrl.create({
              title: "Account Created",
              message: "Your account has been created successfully.",
              buttons: [
                {
                  text: "OK",
                  handler: () => {
                    // Navigate to the feeds page.
                    this.navCtrl.setRoot(FeedPage);
                  }
                }
              ]
            }).present();
          }).catch((err) => {
            console.log(err)
          })
      }).catch((err) => {
        console.log(err);
        this.toastCtrl.create({
          message: err.message,
          duration: 3000      
        }).present();        
      }
    )
  }

  goBack()  {
    this.navCtrl.pop();
  }

}


