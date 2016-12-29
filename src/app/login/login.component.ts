import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { MdSnackBar, MdSnackBarConfig } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserModel } from '../shared/user/user.model';
import { UserService } from '../shared/user/user-service';
import { ToolbarService } from '../shared/toolbar.service';
import { LoadingService } from '../shared/loading.service';
import { GlobalValidator } from '../shared/global.validator';
import { ValidationMessageService } from '../shared/validation-message.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  userModel = new UserModel();
  password: string;
  confirmPassword: string;
  isOnLogin = true;
  loginForm: FormGroup;
  formErrors = {
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  };

  private snackBarConfig: MdSnackBarConfig;

  constructor(public userService: UserService, public toolbarService: ToolbarService,
              public loadingService: LoadingService, public messageService: ValidationMessageService,
              public router: Router, public snackBar: MdSnackBar, public formBuilder: FormBuilder) {

    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';
  }

  ngOnInit() {
    this.userModel = new UserModel();
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthUsername),
        Validators.maxLength(this.messageService.maxLengthUsername)])],
      email: ['', Validators.compose([Validators.required,
        GlobalValidator.mailFormat,
        Validators.maxLength(this.messageService.maxLengthEmail)])],
      password: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthPassword),
        Validators.maxLength(this.messageService.maxLengthPassword)])],
      confirmPassword: ['', Validators.required]
    });
    this.loginForm.valueChanges
      .subscribe(data => {
        this.messageService.onValueChanged(this.loginForm, this.formErrors);
      });
    this.messageService.onValueChanged(this.loginForm, this.formErrors);

    if (this.router.url.indexOf('disconnect') !== -1) {
      this.toolbarService.show(false);
      this.userService.logOut();
    } else {
      this.userService.isAuth()
        .then(isAuth => {
          if (isAuth) {
            this.router.navigate(['room']);
          } else {
            this.toolbarService.show(false);
          }
        });
    }
  }

  login() {
    if (this.isOnLogin) {
      this.loadingService.show(true);
      //  let loading = this.loadingCtrl.create({
      //    content: 'Loading',
      //    spinner: 'crescent',
      //    showBackdrop: false
      //  });
      this.userService.login(this.userModel, this.password)
        .then(() => {
          this.loadingService.show(false);
          this.router.navigate(['room']);
          this.toolbarService.show(true);
          this.snackBar.open('Log in Success', '', this.snackBarConfig);
          if (this.userService.bonusNuuBits.got) {
            this.snackBarConfig.duration = 5000;
            this.snackBar.open(`Nice, you've got ${this.userService.bonusNuuBits.value} 
            after ${this.userService.bonusNuuBits.consecutiveLogIn} consecutive login !`, '', this.snackBarConfig);
          }
        })
        .catch((err: firebase.FirebaseError) => {
          this.loadingService.show(false);
          console.error(err);
          let errMsg = 'Log in Fail';
          switch (err.code) {
            case 'auth/invalid-email':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
              errMsg = 'Incorrect email or password';
              break;
          }
          this.snackBar.open(errMsg, '', this.snackBarConfig);
        });
    } else {
      this.isOnLogin = true;
      GlobalValidator.endSamePassword(this.loginForm, 'login');
    }
  }

  signUp() {
    if (this.isOnLogin) {
      this.isOnLogin = false;
      setTimeout(GlobalValidator.samePassword(this.loginForm, 'login'), 2000);
    } else {
      this.loadingService.show(true);
      this.userService.create(this.userModel, this.password)
        .then(() => {
          this.loadingService.show(false);
          this.router.navigate(['room']);
          this.toolbarService.show(true);
          this.snackBar.open('Sign Up Success', '', this.snackBarConfig);
        })
        .catch((err: firebase.FirebaseError) => {
          this.loadingService.show(false);
          console.error(err);
          let errMsg = 'Sign Up Fail';
          switch (err.code) {
            case 'auth/email-already-in-use':
              errMsg = err.message;
              break;
            case 'auth/network-request-failed':
              errMsg = 'No internet connection';
              break;
          }
          this.snackBar.open(errMsg, '', this.snackBarConfig);
        });
    }
  }

  resetPassword() {
    this.userService.resetPassword(this.userModel).then(() => {
      this.snackBar.open('Reset password email sent', '', this.snackBarConfig);
    }, (err) => {
      console.error(err);
      this.snackBar.open('Could not reset your password, please contact admin', '', this.snackBarConfig);
    });
  }

}
