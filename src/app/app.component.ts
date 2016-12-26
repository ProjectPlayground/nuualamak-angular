import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './shared/firebase-service';
import { ToolbarService } from './shared/toolbar.service';
import { LoadingService } from './shared/loading.service';
import { UserService } from './shared/user/user-service';
import { UserModel } from './shared/user/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  currentUser: UserModel;
  showToolbar = true;
  isLoading = false;
  toolbarTitle = 'Nualamak';

  constructor(public firebaseService: FirebaseService, public userService: UserService,
              public toolbarService: ToolbarService, public loadingService: LoadingService) {

  }

  ngOnInit(): void {
    this.toolbarService.showSource$.subscribe(show => {
      if (show) {
        this.userService.getCurrent()
          .then(currentUser => this.currentUser = currentUser);
      }
      this.showToolbar = show;
    });
    this.toolbarService.titleSource$.subscribe(title => this.toolbarTitle = title);
    this.loadingService.showSource$.subscribe(show => this.isLoading = show);
  }
}
