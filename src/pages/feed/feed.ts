import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import firebase from 'firebase';
import moment from 'moment';
import { query } from '@angular/core/src/animation/dsl';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})
export class FeedPage {
  text: string = "";
  posts: any[] = [];
  pageSize: number = 5;
  cursor: any; // used to record the number of posts that have been retrieved from firestore.
  infiniteEvent: any;
  currentLoggedUser: string = "Tony";


  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private loadingCrtl: LoadingController, 
              private toastCtrl: ToastController) 
  {
    this.getPosts();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedPage');
  }


  // retrieve the posts from firestore and order posts by created descending order.
  getPosts() {
    this.posts = []; // initialize the posts array to blank.

    let loading = this.loadingCrtl.create({
      content: "Loading Feed..."
    });
    loading.present();



    let query = firebase.firestore().collection("posts").orderBy("created","desc")
    .limit(this.pageSize);

    // onSnapShot is called everytime some data is changed in the resultset of your query.
    query.onSnapshot((snapshot) => {
      console.log("Changed...");
      let changedDocs = snapshot.docChanges();
      changedDocs.forEach((change) => {
        // if(change.type == "added") {
        //   console.log("Document with id " + change.doc.id + " has been added.");
        // }
        if(change.type == "modified") {
          console.log("Document with id " + change.doc.id + " has been modified.");
        }
        // if(change.type == "removed") {
        //   console.log("Document with id " + change.doc.id + " has been removed.");          
        // }        

      })
    })

    query.get()
    .then((docs) => {

      docs.forEach((doc) => {
        this.posts.push(doc);
      })
      loading.dismiss();

    this.cursor = this.posts[this.posts.length - 1];      
    }).catch((err) => {
      console.log(err);
    })
    console.log(this.posts);
  }

  // post/store the data to firestore database.
  post() {
    firebase.firestore().collection("posts").add({
      text: this.text,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: firebase.auth().currentUser.uid,
      owner_name: firebase.auth().currentUser.displayName
    }).then((doc) => {
      console.log(doc);
      this.text = "";

      let toast = this.toastCtrl.create({
        message: "Your post has been created successfully.",
        duration: 3000
      }).present();

      this.getPosts();
    }).catch((err) => {
      console.log(err);
    })
  }

  loadMorePosts(event) {
    firebase.firestore().collection("posts").orderBy("created", "desc").startAfter(this.cursor).limit(this.pageSize).get()
    .then((docs) => {

      docs.forEach((doc) => {
        this.posts.push(doc);
      })

      console.log(this.posts)

      if (docs.size < this.pageSize) {
        // all documents have been loaded
        event.enable(false);
        this.infiniteEvent = event;
      } else {
        event.complete();
        this.cursor = this.posts[this.posts.length - 1];
      }

    }).catch((err) => {
      console.log(err)
    })

  }

  refresh(event) {

    this.posts = [];

    // call the getPosts function to load the Posts
    this.getPosts();

    if (this.infiniteEvent) {
      this.infiniteEvent.enable(true);
    }

    event.complete();
  }


  logout() {
    firebase.auth().signOut().then(() => {
      this.navCtrl.setRoot(LoginPage);
      let toast = this.toastCtrl.create({
        message: "You have been successfully logged out.",
        duration: 3000
      }).present();      
    });
  }

  // convert the time into human readable form for display.
  ago(time) {
    let difference = moment(time).diff(moment());
    return moment.duration(difference).humanize();
  }

}
