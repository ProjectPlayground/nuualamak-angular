import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MdSnackBar, MdSnackBarConfig } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ToolbarService } from '../shared/toolbar.service';
import { LoadingService } from '../shared/loading.service';
import { UserModel } from '../shared/user/user.model';
import { ChatMessage } from './chat-message';
import { UserService } from '../shared/user/user-service';
import { ChatService } from './chat.service';
import { ItemModel } from '../shop/item/item.model';
import { ItemService } from '../shop/item/item.service';
import { ChatTheme } from './chat-theme';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  private snackBarConfig: MdSnackBarConfig;

  currentRoom: string;
  typedMsg: string;
  user: UserModel;
  messageList: Array<ChatMessage>;
  itemsBought: Array<ItemModel>;
  chatTheme: ChatTheme;

  isPaused = false;
  firstLoad = true;

  constructor(public route: ActivatedRoute, public toolbarService: ToolbarService,
              public loadingService: LoadingService, private userService: UserService,
              public chatService: ChatService, private itemService: ItemService,
              public snackBar: MdSnackBar, private sanitizer: DomSanitizer) {

    this.chatTheme = new ChatTheme();
    this.itemsBought = new Array<ItemModel>();
    this.typedMsg = '';
    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
  }

  ngOnInit() {
    this.loadingService.show(true);
    this.route.params.subscribe((params: Params) => {
      this.currentRoom = params['room'];
      this.toolbarService.title('Room: ' + this.currentRoom);
      this.subscribeToRoom();
    });
    this.messageList = null;
    this.isPaused = false;
    this.firstLoad = true;
    this.userService.getCurrent()
      .then(user => {
        this.user = user;
        this.itemService .getActiveItemsBought(this.user)
          .then((itemsBought: Array<ItemModel>) => {
            this.itemsBought = itemsBought;
            this.applyItemsStyles(itemsBought);
          })
          .catch(err => console.log(err));
      });
  }

  ngOnDestroy() {
    this.unSubscribeToRoom();
  }

  sendMsg() {
    this.chatService.send(this.currentRoom, this.typedMsg.trim())
      .then(() => this.typedMsg = '')
      .catch(err => {
        console.error(err);
        this.snackBar.open('Fail sending rooms messages', '', this.snackBarConfig);
      });
  }

  togglePauseChat() {
    if (this.isPaused) {
      this.subscribeToRoom();
    } else {
      this.unSubscribeToRoom();
    }
    this.isPaused = !this.isPaused;
  }

  getFarCodeTimestamp(msg: ChatMessage) {
    const dayLength = 86400000;
    const hourLength = 3600000;
    let isNearFarCode = 0;
    if ((new Date().getTime() - msg.timestamp) >= dayLength) {
      isNearFarCode = 2;
    } else if ((new Date().getTime() - msg.timestamp) >= hourLength) {
      isNearFarCode = 1;
    }
    return isNearFarCode;
  }

  getTimePassed(msg) {
    return new Date().getTime() - msg.timestamp
  }

  private applyItemsStyles(itemsBought: Array<ItemModel>) {
    itemsBought.map((itemBought: ItemModel) => {
      switch (itemBought.category) {
        case 'theme':
          this.chatTheme.backgroundImage = itemBought.backgroundImage;
          this.chatTheme.takeAllPlace = itemBought.takeAllPlace;
          break;
        case 'font':
          this.chatTheme.fontName = itemBought.fontName;
          break;
        case 'fontColor':
          this.chatTheme.fontColor = itemBought.fontColor;
          break;
        case 'emoticon':
          //TODO change emojis list
          break;
        case 'bold':
          this.chatTheme.isBold = true;
          break;
      }
    });
  }

  private subscribeToRoom() {
    this.chatService.getLastsEvent(this.currentRoom).on('value', (snapshot) => {
      let chatMessage = snapshot.val();
      this.firstLoad ? this.loadingService.show(false) : 0;
      this.firstLoad = false;
      this.messageList = Object.keys(chatMessage ? chatMessage : [])
        .map(key => chatMessage[key]);
      this.snackBar.open('New messages received...', '', this.snackBarConfig);
    });
  }

  private unSubscribeToRoom() {
    this.chatService.getLastsEvent(this.currentRoom).off();
  }
}
