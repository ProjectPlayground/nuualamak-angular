import { Component, OnInit } from '@angular/core';
import { ItemModel } from '../item/item.model';
import { MdDialogRef, MdSnackBar, MdSnackBarConfig } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationMessageService } from '../../shared/validation-message.service';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemDialog implements OnInit {

  private snackBarConfig: MdSnackBarConfig;

  itemToAdd: ItemModel;
  addItemForm: FormGroup;
  backgroundImage: string;
  isBackgroundLoading = false;
  formErrors = {
    itemName: '',
    itemCategory: '',
    itemFontName: '',
    itemFontColor: '',
    itemDaysToExpire: '',
    itemPrice: ''
  };

  constructor(public dialogRef: MdDialogRef<AddItemDialog>, private formBuilder: FormBuilder,
              public messageService: ValidationMessageService, public snackBar: MdSnackBar) {

    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';

    this.addItemForm = formBuilder.group({
      itemName: ['', Validators.required],
      itemCategory: ['', Validators.required],
      takeAllPlace: [''],
      itemFontName: ['', Validators.required],
      itemFontColor: ['', Validators.required],
      itemDaysToExpire: ['', Validators.pattern('^[0-9]+.?[0-9]*$')],
      itemPrice: ['', Validators.pattern('^[0-9]+.?[0-9]*$')]
    });
  }

  ngOnInit() {
    this.itemToAdd = new ItemModel();
    this.addItemForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.addItemForm, this.formErrors));
    this.messageService.onValueChanged(this.addItemForm, this.formErrors);
  }

  cancel() {
    this.dialogRef.close(false);
  }

  add() {
    this.itemToAdd.name = this.addItemForm.value.itemName;
    this.itemToAdd.category = this.addItemForm.value.itemCategory;
    this.itemToAdd.daysToExpire = this.addItemForm.value.itemDaysToExpire;
    this.itemToAdd.price = this.addItemForm.value.itemPrice;
    switch (this.itemToAdd.category) {
      case 'theme':
        this.itemToAdd.backgroundImage = this.backgroundImage;
        this.itemToAdd.takeAllPlace = this.addItemForm.value.takeAllPlace;
        break;
      case 'font':
        this.itemToAdd.fontName = this.addItemForm.value.itemFontName;
        break;
      case 'fontColor':
        this.itemToAdd.fontColor = this.addItemForm.value.itemFontColor;
        break;
      case 'emoticon':
        //TODO change emojis list
        break;
      case 'bold':
        // no value needed
        break;
    }
    this.dialogRef.close(this.itemToAdd);
  }

  areInputsValid(): boolean {
    if (this.addItemForm.controls['itemCategory'].valid) {
      let isOk: boolean;
      switch (this.addItemForm.value.itemCategory) {
        case 'theme':
          isOk = Boolean(this.backgroundImage);
          break;
        case 'font':
          isOk = this.addItemForm.controls['itemFontName'].valid;
          break;
        case 'fontColor':
          isOk = this.addItemForm.controls['itemFontColor'].valid;
          break;
        case 'emoticon':
          //TODO change emojis list
          isOk = true;
          break;
        case 'bold':
          // no value needed
          isOk = true;
        default:
          isOk = true;
      }
      return isOk && this.addItemForm.controls['itemName'].valid
        && this.addItemForm.controls['itemDaysToExpire'].valid
        && this.addItemForm.controls['itemPrice'].valid;
    } else {
      return false;
    }
  }

  pickBackgroundImage(event) {
    if (event.srcElement.files && event.srcElement.files[0]) {
      var reader = new FileReader();
      let that = this;
      reader.onload = function (e: any) {
        that.backgroundImage = e.target.result;
        that.isBackgroundLoading = false;
      };
      this.isBackgroundLoading = true;
      reader.readAsDataURL(event.srcElement.files[0]);
    } else {
      this.snackBar.open('Fail to get picture', '', this.snackBarConfig);
    }
  }

}
