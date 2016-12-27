/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddRoomDialog } from './add-room.dialog';

describe('AddRoomDialog', () => {
  let component: AddRoomDialog;
  let fixture: ComponentFixture<AddRoomDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRoomDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRoomDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
