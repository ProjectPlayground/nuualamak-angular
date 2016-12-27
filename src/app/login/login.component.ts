import { Component, OnInit } from '@angular/core';
import { UserModel } from '../shared/user/user.model';
import { UserService } from '../shared/user/user-service';
import { Router, NavigationExtras } from '@angular/router';
import { ToolbarService } from '../shared/toolbar.service';
import { LoadingService } from '../shared/loading.service';
import { MdSnackBar, MdSnackBarConfig, AriaLivePoliteness } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
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
    } else if (this.userService.isAuth()) {
      this.router.navigate(['room']);
    } else {
      this.toolbarService.show(false);
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
        .catch(err => {
          this.loadingService.show(false);
          //TODO login err msgs
          console.log(err);
          this.snackBar.open('Log in Fail', '', this.snackBarConfig);
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
        .catch(err => {
          this.loadingService.show(false);
          this.snackBar.open('Sign Up Fail', '', this.snackBarConfig);
          console.log(err);
        });
    }
  }

  private snackBarConfig: MdSnackBarConfig;

}
