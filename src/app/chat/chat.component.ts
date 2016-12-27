import { Component, OnInit, ViewChildren, ElementRef, QueryList, Renderer } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ToolbarService } from '../shared/toolbar.service';
import { LoadingService } from '../shared/loading.service';
import { MdSnackBar, MdSnackBarConfig } from '@angular/material';
import { UserModel } from '../shared/user/user.model';
import { ChatMessage } from './chat-message';
import { UserService } from '../shared/user/user-service';
import { ChatService } from './chat.service';
import { ItemModel } from '../shop/item/item.model';
import { ItemService } from '../shop/item/item.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  private snackBarConfig: MdSnackBarConfig;

  currentRoom: string;
  typedMsg: string;
  messageList: Array<ChatMessage>;
  isPaused = false;
  firstLoad = true;
  user: UserModel;
  itemsBought: Array<ItemModel>;

  @ViewChildren('chatContent') chatContentList: QueryList<ElementRef>;

  constructor(public route: ActivatedRoute, public toolbarService: ToolbarService,
              public loadingService: LoadingService, private userService: UserService,
              public chatService: ChatService, private itemService: ItemService,
              public renderer: Renderer, public snackBar: MdSnackBar) {

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
            itemsBought.map((itemBought: ItemModel) => {
              switch (itemBought.category) {
                case 'background_image':
                  this.chatContentList.forEach(chatContent =>
                    this.renderer.setElementStyle(chatContent.nativeElement, 'background-image', itemBought.background_image));
                  break;
                case 'font':
                  this.chatContentList.forEach(chatContent =>
                    this.renderer.setElementStyle(chatContent.nativeElement, 'font-family', itemBought.font_name));
                  break;
                case 'font_color':
                  this.chatContentList.forEach(chatContent =>
                    this.renderer.setElementStyle(chatContent.nativeElement, 'color', itemBought.font_color));
                  break;
                case 'emoticon':
                  this.chatContentList.forEach(chatContent =>
                    this.renderer.setElementClass(chatContent.nativeElement, 'bold', true));
                  break;
                case 'bold':
                  this.chatContentList.forEach(chatContent =>
                    this.renderer.setElementClass(chatContent.nativeElement, 'bold', true));
                  break;

              }
            });
          })
          .catch(err => console.log(err));
      });
  }

  sendMsg() {
    this.chatService.send(this.currentRoom, this.typedMsg.trim())
      .then(() => this.typedMsg = '')
      .catch(err => {
        this.snackBar.open('Fail sending rooms messages', '', this.snackBarConfig);
      });
  }

  togglePauseChat() {
    if (this.isPaused) {
      this.subscribeToRoom();
    } else {
      this.chatService.getLastsEvent(this.currentRoom).off();
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

}
