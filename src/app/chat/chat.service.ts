import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserService } from '../shared/user/user-service';
import { UserModel } from '../shared/user/user.model';
import { ChatMessage } from './chat-message';

@Injectable()
export class ChatService {

  private numberLastMessage = 20;
  private refRooms: firebase.database.Reference;

  constructor(private userService: UserService) {
    this.refRooms = firebase.database().ref('rooms');
  }

  getLastsEvent(roomName: string) {
    return this.refRooms.child(roomName).limitToLast(this.numberLastMessage);
  }

  send(roomName: string, typedMsg: string) {
    return this.userService.getCurrent()
      .then((user: UserModel) => {
        return this.refRooms.child(roomName).push({
          user: {uid: user.uid, username: user.username},
          content: typedMsg,
          timestamp: new Date().getTime()
        });
      });
  }

  subscribeRoomMessage(roomName: string): firebase.Promise<Array<ChatMessage>> {
    return new Promise((resolve, reject) => this.refRooms.child(roomName)
      .limitToLast(this.numberLastMessage).on('value', resolve, reject))
      .then((snapshot: firebase.database.DataSnapshot) => {
        let chatMessages = snapshot.val();
        return Object.keys(chatMessages ? chatMessages : [])
          .map(key => chatMessages[key]);
      });
  }

  unSubscribeRoomMessage(roomName: string) {
    this.refRooms.child(roomName)
      .limitToLast(this.numberLastMessage).off();
  }
}
