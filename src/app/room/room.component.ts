import { Component, OnInit } from '@angular/core';
import { ToolbarService } from '../shared/toolbar.service';
import { LoadingService } from '../shared/loading.service';
import { MdSnackBar, MdSnackBarConfig, MdDialog, MdDialogConfig } from '@angular/material';
import { RoomService } from './room.service';
import { AddRoomDialog } from './add-room/add-room.dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {

  private snackBarConfig: MdSnackBarConfig;

  firstLoad = true;
  rooms: Array<string>;

  constructor(public roomService: RoomService, public toolbarService: ToolbarService,
              public loadingService: LoadingService,
              public router: Router, public snackBar: MdSnackBar, public dialog: MdDialog) {

    this.rooms = new Array();
    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
    this.toolbarService.title('Pick a room');
  }

  ngOnInit() {
    this.firstLoad = true;
    this.loadingService.show(true);
    this.roomService.getAll()
      .then(rooms => {
        this.rooms = rooms;
        this.loadingService.show(false);
        this.firstLoad = false;
      })
      .catch(err => {
        this.loadingService.show(false);
        this.firstLoad = false;
        this.snackBar.open('Fail loading rooms messages', '', this.snackBarConfig);
      });
  }

  addRoom() {
    this.dialog.open(AddRoomDialog, <MdDialogConfig>{
      disableClose: true
    }).afterClosed().subscribe(newRoomName => {
      if (newRoomName) {
        this.loadingService.show(true);
        this.roomService.add(newRoomName)
          .then(() => {
            this.loadingService.show(false);
            this.router.navigate([newRoomName, 'chat']);
            this.snackBar.open('Room added', '', this.snackBarConfig);
          })
          .catch(err => {
            this.loadingService.show(false);
            if (err.name === 'already_exist') {
              this.snackBar.open(err.message, '', this.snackBarConfig);
            } else {
              this.snackBar.open('Fail adding chat room', '', this.snackBarConfig);
            }
          });
      }
    });
  }
}
