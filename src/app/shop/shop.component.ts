import { Component, OnInit } from '@angular/core';
import { MdDialog, MdDialogConfig, MdSnackBar, MdSnackBarConfig } from '@angular/material';

import { ItemService } from './item/item.service';
import { ItemModel } from './item/item.model';
import { UserService } from '../shared/user/user-service';
import { UserModel } from '../shared/user/user.model';
import { AddItemDialog } from './add-item/add-item.component';
import { LoadingService } from '../shared/loading.service';
import { ItemBoughtModel } from './item/item-bought.model';
import { ToolbarService } from '../shared/toolbar.service';
import { ConfirmMessageDialog } from '../confirm-message/confirm-message.dialog';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {

  private snackBarConfig: MdSnackBarConfig;

  firstLoad = true;
  currentUser: UserModel;
  items: Array<ItemModel>;
  itemsBought: Array<ItemBoughtModel>;

  constructor(public userService: UserService, public itemService: ItemService,
              public loadingService: LoadingService, public toolbarService: ToolbarService,
              public snackBar: MdSnackBar, public dialog: MdDialog) {

    this.itemsBought = new Array<ItemBoughtModel>();
    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
  }

  ngOnInit() {
    this.toolbarService.title('Shop');
    this.firstLoad = true;
    this.loadingService.show(true);
    this.getItems();
    this.userService.getCurrent()
      .then(user => {
        this.currentUser = user;
        this.getItemsBought();
      });
  }

  addItem() {
    this.dialog.open(AddItemDialog, <MdDialogConfig>{disableClose: true})
      .afterClosed().subscribe((newItem: ItemModel) => {
      if (newItem) {
        this.loadingService.show(true);
        this.itemService.add(newItem)
          .then(() => this.getItems())
          .catch(err => {
            this.loadingService.show(false);
            console.error(err);
            this.snackBar.open('Fail to add item', '', this.snackBarConfig);
          });
      }
    });
  }

  buyItem(item: ItemModel) {
    if (this.currentUser.nuuBits >= item.price) {
      let dialogRef = this.dialog.open(ConfirmMessageDialog, <MdDialogConfig>{disableClose: false})
      dialogRef.componentInstance.title = 'Confirmation of purchase';
      dialogRef.componentInstance.content = 'Are you sure to buy this item ?';
      dialogRef.afterClosed().subscribe((isOk: boolean) => {
        if (isOk) {
          this.loadingService.show(true);
          this.itemService.buy(this.currentUser, item)
            .then(() => {
              this.getItemsBought();
              this.loadingService.show(false);
              this.snackBar.open('Item bought with success', '', this.snackBarConfig);
            })
            .catch(err => {
              this.loadingService.show(false);
              console.error(err);
              this.snackBar.open('We\'re sorry, Fail to buy the item', '', this.snackBarConfig);
            });
        }
      });
    } else {
      this.snackBar.open('Not enough Nuu-bits to buy this item', '', this.snackBarConfig);
    }
  }

  activateItem(item: ItemModel) {
    let dialogRef = this.dialog.open(ConfirmMessageDialog, <MdDialogConfig>{disableClose: false})
    dialogRef.componentInstance.title = 'Activation confirmation';
    dialogRef.componentInstance.content = 'Are you sure to activate this item ?';
    dialogRef.afterClosed().subscribe((isOk: boolean) => {
      if (isOk) {
        this.loadingService.show(true);
        this.itemService.activate(this.getItemBoughtInfo(item), this.itemsBought, this.items)
          .then(() => {
            this.getItemsBought();
            this.loadingService.show(false);
            this.snackBar.open('The selected item is now activated', '', this.snackBarConfig);
          })
          .catch(err => {
            this.loadingService.show(false);
            console.error(err);
            this.snackBar.open('We\'re sorry, Fail to activate the item', '', this.snackBarConfig);
          });
      }
    });
  }

  isItemBought(item: ItemModel): boolean {
    return this.getItemBoughtInfo(item) !== undefined;
  }

  isItemActive(item: ItemModel): boolean {
    if (this.isItemBought(item)) {
      return this.getItemBoughtInfo(item).isActivated;
    }
    return false;
  }

  isItemInactive(item: ItemModel): boolean {
    if (this.isItemBought(item) && !this.isItemActive(item)) {
      return this.getItemBoughtInfo(item).activationDate !== undefined;
    }
    return false;
  }

  getActivationDate(item: ItemModel): string {
    let itemBought = this.getItemBoughtInfo(item);
    if (itemBought && itemBought.activationDate) {
      return itemBought.activationDate.toString();
    } else {
      return '';
    }
  }

  private getItemsBought() {
    this.itemService.getItemsBought(this.currentUser)
      .then(itemsBought => this.itemsBought = itemsBought);
  }

  private getItems() {
    this.itemService.getAll()
      .then(items => {
        this.items = items;
        this.loadingService.show(false);
        this.firstLoad = false;
      })
      .catch(err => {
        this.loadingService.show(false);
        this.firstLoad = false;
        console.error(err);
        this.snackBar.open('Fail loading items', '', this.snackBarConfig);
      });
  }

  private getItemBoughtInfo(item: ItemModel): ItemBoughtModel {
    return this.itemsBought.filter(itemBought => itemBought.itemId === item.id)[0];
  }
}
