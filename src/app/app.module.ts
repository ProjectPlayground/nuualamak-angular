import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule, MdSnackBar } from '@angular/material';
import { Angular2AutoScroll } from 'angular2-auto-scroll/lib/angular2-auto-scroll.directive';
import 'hammerjs';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { UserService } from './shared/user/user-service';
import { FirebaseService } from './shared/firebase-service';
import { Routes, RouterModule } from '@angular/router';
import { RoomComponent } from './room/room.component';
import { ToolbarService } from './shared/toolbar.service';
import { LoadingService } from './shared/loading.service';
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';
import { RoomService } from './room/room.service';
import { ChatService } from './chat/chat.service';
import { ChangePasswordDialog } from './profile/change-pssword/change-password.dialog';
import { CanActivateViaAuthGuard } from './shared/can-activate-via-auth.guard';
import { SettingComponent } from './setting/setting.component';
import { ShopComponent } from './shop/shop.component';
import { EmojiModule } from '../../vendor/angular2-emoji';
import { Ng2EmojiPipe } from '../../vendor/ng2-emoji/ng2-emoji.pipe';
import { ItemService } from './shop/item/item.service';
import { AddItemDialog } from './shop/add-item/add-item.component';
import { AddRoomDialog } from './room/add-room/add-room.dialog';
import { ValidationMessageService } from './shared/validation-message.service';
//import { EmojiModule } from 'angular2-emoji/src/lib/';
//import { Ng2EmojiPipe } from 'ng2-emoji/ng2-emoji';

const appRoutes: Routes = [
  {path: 'login/disconnect', component: LoginComponent},
  {path: 'login', component: LoginComponent},
  {path: 'room', component: RoomComponent, canActivate: [CanActivateViaAuthGuard]},
  {path: 'room/:room/chat', component: ChatComponent,canActivate: [CanActivateViaAuthGuard]},
  {path: 'setting', component: SettingComponent, canActivate: [CanActivateViaAuthGuard]},
  {path: 'shop', component: ShopComponent, canActivate: [CanActivateViaAuthGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [CanActivateViaAuthGuard]},
  {path: '', component: LoginComponent, canActivate: [CanActivateViaAuthGuard]},
  {path: '**', component: LoginComponent, canActivate: [CanActivateViaAuthGuard]}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RoomComponent,
    ChatComponent,
    ProfileComponent,
    Angular2AutoScroll,
    Ng2EmojiPipe,
    ChangePasswordDialog,
    SettingComponent,
    ShopComponent,
    AddItemDialog,
    AddRoomDialog
  ],
  entryComponents: [
    ChangePasswordDialog,
    AddItemDialog,
    AddRoomDialog
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    ReactiveFormsModule,
    EmojiModule
  ],
  providers: [
    UserService,
    FirebaseService,
    ToolbarService,
    LoadingService,
    RoomService,
    ChatService,
    ItemService,
    ValidationMessageService,
    CanActivateViaAuthGuard,
    MdSnackBar
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
