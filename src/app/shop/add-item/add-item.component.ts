import { Component, OnInit } from '@angular/core';
import { ItemModel } from '../item/item.model';
import { MdDialogRef, MdSnackBar, MdSnackBarConfig } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.component.html',
  styleUrls: ['./add-item.component.css']
})
export class AddItemDialog implements OnInit {

  private snackBarConfig: MdSnackBarConfig;

  itemToAdd: ItemModel;
  addItemForm: FormGroup;
  backgroundImage;

  constructor(public dialogRef: MdDialogRef<AddItemDialog>, private formBuilder: FormBuilder,
              public snackBar: MdSnackBar) {

    this.snackBarConfig = new MdSnackBarConfig();
    this.snackBarConfig.duration = 2000;
    this.snackBarConfig.politeness = 'polite';

    this.addItemForm = formBuilder.group({
      itemName: ['', Validators.required],
      //TODO split itemCategoryData on real categories
      itemCategoryData: ['', Validators.required],
      daysToExpire: ['', Validators.required],
      itemPrice: ['', Validators.required]
    });

  }

  ngOnInit() {
    this.itemToAdd = new ItemModel();
    this.itemToAdd.name = '';
    this.itemToAdd.category = '';
  }

  cancel() {
    this.dialogRef.close(false);
  }

  add() {
    this.dialogRef.close(this.itemToAdd);
  }

  pickBackgroundImage(event) {
    if (event.srcElement.files && event.srcElement.files[0]) {
      var reader = new FileReader();
      let that = this;
      reader.onload = function (e: any) {
        that.backgroundImage = e.target.result;
      };
      reader.readAsDataURL(event.srcElement.files[0]);
    } else {
      this.snackBar.open('Fail to get picture', '', this.snackBarConfig);
    }
  }

}
