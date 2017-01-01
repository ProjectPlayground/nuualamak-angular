import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

import { EmojiUtil } from '../util/util';

@Component({
  selector: 'emoji-input',
  templateUrl: './input.html',
  styleUrls: ['./input.scss']
})
export class EmojiInputComponent implements OnInit, OnChanges {

  @Input() popupAnchor = 'top';
  @Input() model: any;
  @Input() fullWidth: boolean;
  @Input() marginTopEmojiOpener: '3px';
  @Output() modelChange: any = new EventEmitter();

  input: string;
  filterEmojis: string;
  emojiUtil: EmojiUtil = new EmojiUtil();
  allEmojis: Array<any>;
  popupOpen: boolean = false;
  private caretOffset = 0;

  ngOnInit() {
    this.input = '';
    this.filterEmojis = '';
    this.allEmojis = this.emojiUtil.getAll();
  }

  ngOnChanges() {
    if (this.model !== this.input) {
      this.input = this.model;
    }
  }

  saveCursorPosition(customInput) {
    this.caretOffset = customInput._inputElement.nativeElement.selectionStart;
  }

  togglePopup() {
    this.popupOpen = !this.popupOpen;
  }

  getFilteredEmojis() {
    return this.allEmojis.filter((e) => {
      if (this.filterEmojis === '') {
        return true;
      } else {
        for (let alias of e.aliases) {
          if (alias.includes(this.filterEmojis)) {
            return true;
          }
        }
      }
      return false;
    });
  }

  onEmojiClick(e) {
    this.input = this.input.slice(0, this.caretOffset) + e + this.input.slice(this.caretOffset + 1);
    this.modelChange.emit(this.input);
    this.popupOpen = false;
  }

  onChange(event) {
    this.input = this.emojiUtil.emojify(event.srcElement.value);
    this.model = this.input;
    this.modelChange.emit(this.input);
  }
}
