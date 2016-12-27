import { Injectable } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';
import { UserModel } from './user.model';
import { UserItemsService } from './user-items-service';

@Injectable()
export class UserService {

  private refDatabaseUsers: firebase.database.Reference;
  private refStorageUsers: firebase.storage.Reference;

  private currentUser: UserModel;
  bonusNuuBits: {got: boolean, value: number, consecutiveLogIn: number};

  constructor(public userItemsService: UserItemsService, public localStorage: LocalStorageService) {
    this.refDatabaseUsers = firebase.database().ref('users');
    this.refStorageUsers = firebase.storage().ref('users');
  }

  getCurrent() {
    if (this.currentUser) {
      return Promise.resolve(this.currentUser);
    } else {
      let userUid;
      if (firebase.auth().currentUser) {
        userUid = firebase.auth().currentUser.uid;
      } else {
        userUid = this.localStorage.get('user');
      }
      return new Promise((resolve, reject) =>
        firebase.auth().onAuthStateChanged(resolve, reject)).then((user: firebase.User) => {
        return this.refDatabaseUsers.child(user.uid).once('value')
          .then(snapshot => {
            this.currentUser = snapshot.val();
            return this.currentUser;
          });
      });
    }
  }

  login(userModel: UserModel, password: string) {
    return firebase.auth().signInWithEmailAndPassword(userModel.email, password)
      .then(() => {
        return this.getCurrent().then(user => {
          this.localStorage.set('user', user.uid);
          this.bonusNuuBits = {got: false, value: 0, consecutiveLogIn: 0};
          this.getNuuBitsBonus(user);
          return Promise.all([this.updateUserInfo(user),
            this.userItemsService.updateItemsBoughtExpiration(user)]);
        });
      });
  }

  create(userModel: UserModel, password: string) {
    return firebase.auth().createUserWithEmailAndPassword(userModel.email, password)
      .then(() => {
        userModel.uid = firebase.auth().currentUser.uid;
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        userModel.lastLoggedDate = today.getTime();
        userModel.consecutiveLogIn = 0;
        userModel.nuuBits = 0;
        return this.refDatabaseUsers.child(userModel.uid).set(userModel)
          .then(() => this.currentUser = userModel);
      });
  }

  isAuth() {
    return this.currentUser ? true : new Promise((resolve, reject) =>
      firebase.auth().onAuthStateChanged(resolve, reject))
      .then((user: firebase.User) => {
        return user;
      });
  }

  logOut() {
    this.currentUser = undefined;
    firebase.auth().signOut();
  }

  updatePassword(newPassword: string) {
    return firebase.auth().currentUser.updatePassword(newPassword);
  }

  updateUser(user: UserModel, userAvatar: string) {
    //Upload the avatar only if it was changed
    if (userAvatar.startsWith('data')) {
      return this.refStorageUsers.child(user.uid)
        .putString(userAvatar.substring(userAvatar.indexOf(',') + 1), firebase.storage.StringFormat.BASE64)
        .then((fileSnapshot: firebase.storage.UploadTaskSnapshot) => {
          user.avatar = fileSnapshot.downloadURL;
          return this.updateUserAuthEmail(user);
        });
    } else {
      return this.updateUserAuthEmail(user);
    }
  }

  /**
   * Update the user informations
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  updateUserInfo(user: UserModel) {
    return this.refDatabaseUsers.child(user.uid).update(user)
      .then(() => this.currentUser = user);
  }

  /**
   * Update user nuu bits with bonus from consecutive login
   *
   * @param user
   */
  private getNuuBitsBonus(user) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let nextLasLoggedDay = new Date(user.lastLoggedDate);
    nextLasLoggedDay.setDate(nextLasLoggedDay.getDate() + 1);
    user.consecutiveLogIn++;
    if (nextLasLoggedDay.getTime() === today.getTime()) {
      switch (user.consecutiveLogIn) {
        case 0:
        case 1:
          break;
        case 2:
        case 3:
          user.nuuBits += 1;
          this.bonusNuuBits.value = 1;
          this.bonusNuuBits.got = true;
          break;
        case 5:
          user.nuuBits += 3;
          this.bonusNuuBits.value = 3;
          this.bonusNuuBits.got = true;
          break;
        case 7:
          user.nuuBits += 8;
          this.bonusNuuBits.value = 8;
          this.bonusNuuBits.got = true;
          break;
        case 10:
          user.nuuBits += 25;
          this.bonusNuuBits.value = 25;
          this.bonusNuuBits.got = true;
          break;
        default:
          if (user.consecutiveLogIn % 10 === 0) {
            user.nuuBits += 250;
            this.bonusNuuBits.value = 250;
            this.bonusNuuBits.got = true;
          }
      }
      this.bonusNuuBits.consecutiveLogIn = user.consecutiveLogIn;
    } else if (user.lastLoggedDate < today.getTime()) {
      user.consecutiveLogIn = 0;
    }
    user.lastLoggedDate = today.getTime();
  }

  /**
   * Update user auth email if changed then user info
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  private updateUserAuthEmail(user: UserModel) {
    if (firebase.auth().currentUser.email !== user.email) {
      return firebase.auth().currentUser.updateEmail(user.email)
        .then(() => this.updateUserInfo(user));
    } else {
      return this.updateUserInfo(user);
    }
  }

  /**
   * Convert Base64 to BLOB
   *
   * @param b64Data
   * @param contentType
   * @param sliceSize
   * @returns {Blob}
   */
  private b64toBlob(b64Data, contentType?, sliceSize?) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    let byteCharacters = atob(b64Data);
    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, {type: contentType});
  }

}
