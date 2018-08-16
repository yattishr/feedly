import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, ActionSheetController, AlertController, ModalController } from 'ionic-angular';
import firebase from 'firebase';
import moment from 'moment';
import { query } from '@angular/core/src/animation/dsl';
import { LoginPage } from '../login/login';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommentsPage } from '../comments/comments';
import { Firebase } from '@ionic-native/firebase';

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
  image: string;


  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private loadingCrtl: LoadingController, 
              private toastCtrl: ToastController,
              private camera: Camera,
              private http: HttpClient,
              private actionSheetCtrl: ActionSheetController,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private firebaseCordova: Firebase) 
  {
    this.getPosts();
    this.firebaseCordova.getToken().then((token) => {
      console.log(token);
      this.updateToken(token, firebase.auth().currentUser.uid)
    }).catch((err) => {
      console.log(err);   
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedPage');
  }


  updateToken(token: string, uid: string) {
    firebase.firestore().collection("users").doc(uid).set({
      token: token,
      tokenUpdate: firebase.firestore.FieldValue.serverTimestamp()
    }, {
      merge: true
    }).then(() => {
      console.log("token saved to cloud firestore");
    }).catch((err) => {
      console.log(err);
    })
  }

  // retrieve the posts from firestore and order posts by created descending order.
  getPosts() {
    this.posts = []; // initialize the posts array to blank.

    let loading = this.loadingCrtl.create({
      content: "Loading Feed..."
    });
    loading.present();



    let query = firebase.firestore().collection("posts").orderBy("created","desc").limit(this.pageSize);

    // onSnapShot is called everytime some data is changed in the resultset of your query.
    query.onSnapshot((snapshot) => {
      console.log("Changed...");
      let changedDocs = snapshot.docChanges();
      changedDocs.forEach((change) => {
        if(change.type == "added") {
          console.log("Document with id " + change.doc.id + " has been added.");
        }
        if(change.type == "modified") {
          // console.log("Document with id " + change.doc.id + " has been modified.");
          for(let i = 0; i < this.posts.length; i++) {
            if(this.posts[i].id == change.doc.id) {
              this.posts[i] == change.doc;
            }
          }
        }
        if(change.type == "removed") {
          console.log("Document with id " + change.doc.id + " has been removed.");          
        }        

      })
    })

    query.get()
    .then((docs) => {

      docs.forEach((doc) => {
        this.posts.push(doc);
      })
      loading.dismiss();

    this.cursor = this.posts[this.posts.length - 1];    
    console.log(this.posts)  
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
    }).then(async (doc) => {
      console.log(doc);
      if(this.image) {
        await this.upload(doc.id)
      }
      this.text = "";
      this.image = undefined;

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

  // function for updating the post Likes. makes use of Firebase updateLikes function.
  like(post) {
    let body = {
      postId: post.id,
      userId: firebase.auth().currentUser.uid,
      action: post.data().likes && post.data().likes[firebase.auth().currentUser.uid] == true ? "unlike": "like",
    }


    let toast = this.toastCtrl.create({
      message: "Updating Like...Please wait..."
    }) 

    toast.present();

    const urlString = "https://us-central1-feedlyapp-a4d0b.cloudfunctions.net/updateLikesCount";
    console.log("my post body: ", JSON.stringify(body));
    this.http.post(urlString, JSON.stringify(body), {
      responseType: "text"
    }).subscribe((data) => {
      console.log(data);
      toast.setMessage("Like updated.");
      setTimeout(() => {
        toast.dismiss();
      }, 3000)
    }, (error) => {
      console.log(error);
      toast.setMessage("Error occured while updating Likes. Please try again later.");
      setTimeout(() => {
        toast.dismiss();
      }, 3000)      
    })
  }


  comment(post) {
    this.actionSheetCtrl.create({
      buttons: [
        {
          text: "View all Comments",
          handler: () => {
            //TODO update handler.
            this.modalCtrl.create(CommentsPage, {
              "post": post
            }).present()
          }
        },
        {
          text: "New Comment",
          handler: () => {
            this.alertCtrl.create({
              title: "New Comment",
              message: "Type your comment",
              inputs: [
                {
                  name: "comment",
                  type: "text"
                }
              ],
              buttons: [
                {
                  text: "Cancel"
                },
                {
                  text: "Post",
                  handler: (data) => {
                    if (data.comment) {
                      firebase.firestore().collection("comments").add({
                        text: data.comment,
                        post: post.id,
                        owner: firebase.auth().currentUser.uid,
                        owner_name: firebase.auth().currentUser.displayName,
                        created: firebase.firestore.FieldValue.serverTimestamp()
                      }).then((doc) => {
                        this.toastCtrl.create({
                          message: "Comment posted successfully",
                          duration: 3000
                        }).present();
                      }).catch((err) => {
                        this.toastCtrl.create({
                          message: err.message,
                          duration: 3000
                        }).present();
                      })
                    }
                  }
                }
              ]
            }).present();
          }
        }
      ]
    }).present();
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


  addPhoto() {
    this.launchCamera();
  }

  launchCamera() {
      let options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetHeight: 512,
      targetWidth: 512,
      allowEdit: true
    }
    this.camera.getPicture(options).then((base64Image) => {
      console.log(base64Image)
      this.image = "data:image/png:base64," + base64Image;
    }).catch((err) => {
      console.log(err);
    })
  }

  upload(name: string) {

    return new Promise((resolve, reject) => {

      let loading = this.loadingCrtl.create({ 
        content: "Uploading image..."        
      })
      loading.present();

      let ref = firebase.storage().ref("postImages/" + name);
      let uploadTask = ref.putString(this.image.split(',')[1], "base64");
      uploadTask.on("state_changed", (taskSnapshot: any) => {
        console.log(taskSnapshot);
        let percentage = taskSnapshot.bytesTransferred / taskSnapshot.totalBytes * 100;
        loading.setContent("Uploading " + percentage + "%...")
      }, (error) => {
        console.log(error);
      }, () => {
        console.log("The upload has completed.");
        uploadTask.snapshot.ref.getDownloadURL().then((url) => {
          // console.log(url);
          firebase.firestore().collection("posts").doc(name).update({
            image: url
          }).then(() => {
            loading.dismiss()
            resolve()
          }).catch((err) => {
            loading.dismiss()            
            reject()
          })
        }).catch((err) => {
          loading.dismiss()          
          reject()
        })
      })
    })
  }

  // convert the time into human readable form for display.
  ago(time) {
    let difference = moment(time).diff(moment());
    return moment.duration(difference).humanize();
  }

}
