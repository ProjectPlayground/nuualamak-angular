import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MdDialogRef } from '@angular/material';
import { ValidationMessageService } from '../../shared/validation-message.service';

@Component({
  selector: 'app-add-room',
  templateUrl: './add-room.dialogt.html',
  styleUrls: ['./add-room.dialog.css']
})
export class AddRoomDialog implements OnInit {

  newRoomName: string;
  addRoomForm: FormGroup;
  formErrors = {
    'roomName': '',
  };

  constructor(public dialogRef: MdDialogRef<AddRoomDialog>, public messageService: ValidationMessageService,
              public formBuilder: FormBuilder) {

    this.addRoomForm = formBuilder.group({
      roomName: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthRoomName),
        Validators.maxLength(this.messageService.maxLengthRoomName)])]
    });
    this.addRoomForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.addRoomForm, this.formErrors));
    this.messageService.onValueChanged(this.addRoomForm, this.formErrors);
  }

  ngOnInit() {
    this.newRoomName = '';
  }

  cancel() {
    this.dialogRef.close(false);
  }

  add() {
    this.dialogRef.close(this.newRoomName);
  }

}
