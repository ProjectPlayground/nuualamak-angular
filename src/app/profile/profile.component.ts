import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MdSnackBar, MdSnackBarConfig, MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingService } from '../shared/loading.service';
import { ToolbarService } from '../shared/toolbar.service';
import { UserService } from '../shared/user/user-service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { GlobalValidator } from '../shared/global.validator';
import { UserModel } from '../shared/user/user.model';
import { ChangePasswordDialog } from './change-pssword/change-password.dialog';
import { ValidationMessageService } from '../shared/validation-message.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user = new UserModel();
  userAvatar: string;
  userGender: string;
  editMode = false;
  isLoadingAvatar = false;
  profileForm: FormGroup;
  formErrors = {
    email: '',
    username: '',
    age: '',
    country: '',
    location: '',
    hobbies: ''
  };
  private snackBarConfig: MdSnackBarConfig;

  constructor(public dialog: MdDialog, public toolbarService: ToolbarService,
              public loadingService: LoadingService, public userService: UserService,
              public messageService: ValidationMessageService,
              public snackBar: MdSnackBar, public formBuilder: FormBuilder) {

    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';

    this.buildProfileForm();
  }

  ngOnInit() {
    this.editMode = false;
    this.toolbarService.title('Your profile');

    this.loadingService.show(true);
    this.isLoadingAvatar = true;
    this.userService.getCurrent()
      .then(user => {
        this.user = user;
        this.userAvatar = user.avatar;
        this.userGender = user.gender;
        this.loadingService.show(false);
        this.isLoadingAvatar = false;
      })
      .catch(err => {
        this.loadingService.show(false);
        this.isLoadingAvatar = false;
        console.error(err);
        this.snackBar.open('Fail to get your profile data', '', this.snackBarConfig);
      });
  }

  editItems(editMode: boolean) {
    this.editMode = editMode;
    if (!editMode) {
      this.buildProfileForm();
    }
  }

  changeAvatar(event) {
    if (event.srcElement.files && event.srcElement.files[0]) {
      let reader = new FileReader();
      let that = this;
      reader.onload = function (e: any) {
        that.userAvatar = e.target.result;
      };
      reader.readAsDataURL(event.srcElement.files[0]);
    } else {
      this.snackBar.open('Fail to get picture', '', this.snackBarConfig);
    }
  }

  changePassword() {
    this.dialog.open(ChangePasswordDialog, <MdDialogConfig>{
      disableClose: true
    }).afterClosed().subscribe(newPassword => {
      if (newPassword) {
        this.userService.updatePassword(newPassword)
          .then(() => {
            this.snackBar.open('Password has been successfully updated', '', this.snackBarConfig);
          })
          .catch(err => {
            console.error(err);
            this.snackBar.open('Fail to update your password', '', this.snackBarConfig);
          });
      }
    });
  }

  save() {
    this.user.email = this.profileForm.value.email;
    this.user.username = this.profileForm.value.username;
    this.user.gender = this.userGender;
    this.user.age = this.profileForm.value.age;
    this.user.country = this.profileForm.value.country;
    this.user.location = this.profileForm.value.location;
    this.user.hobbies = this.profileForm.value.hobbies;
    this.loadingService.show(true);
    this.userService.updateUser(this.user, this.userAvatar)
      .then(() => {
        this.editMode = false;
        this.loadingService.show(false);
        this.snackBar.open('Profile has been successfully updated', '', this.snackBarConfig);
      })
      .catch(err => {
        this.editMode = false;
        this.loadingService.show(false);
        console.error(err);
        this.snackBar.open('Fail to update your profile', '', this.snackBarConfig);
      });
  }

  private buildProfileForm() {
    this.userGender = this.user.gender;
    this.userAvatar = this.user.avatar;
    this.profileForm = this.formBuilder.group({
      username: [{value: this.user.username, disabled: false}, Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthUsername),
        Validators.maxLength(this.messageService.maxLengthUsername)])],
      email: [{value: this.user.email, disabled: false}, Validators.compose([Validators.required,
        GlobalValidator.mailFormat,
        Validators.maxLength(this.messageService.maxLengthEmail)])],
      age: [{value: this.user.age, disabled: false},
        Validators.pattern('^[0-9]?[0-9]?$|^1[0-4]?[0-9]?$')],
      country: [{value: this.user.country, disabled: false},
        Validators.maxLength(this.messageService.maxLengthCountry)],
      location: [{value: this.user.location, disabled: false},
        Validators.maxLength(this.messageService.maxLengthLocation)],
      hobbies: [{value: this.user.hobbies, disabled: false},
        Validators.maxLength(this.messageService.maxLengthHobbies)]
    });
    this.profileForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.profileForm, this.formErrors));
    this.messageService.onValueChanged(this.profileForm, this.formErrors);
  }
}
