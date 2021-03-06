System.register(['@angular/core', '../util/util'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, util_1;
    var EmojiInputComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (util_1_1) {
                util_1 = util_1_1;
            }],
        execute: function() {
            EmojiInputComponent = (function () {
                function EmojiInputComponent() {
                    this.popupAnchor = 'top';
                    this.modelChange = new core_1.EventEmitter();
                    this.emojiUtil = new util_1.EmojiUtil();
                    this.popupOpen = false;
                }
                EmojiInputComponent.prototype.ngOnInit = function () {
                    this.input = '';
                    this.filterEmojis = '';
                    this.allEmojis = this.emojiUtil.getAll();
                };
                EmojiInputComponent.prototype.ngOnChanges = function () {
                    if (this.model !== this.input) {
                        this.input = this.model;
                    }
                };
                EmojiInputComponent.prototype.togglePopup = function () {
                    this.popupOpen = !this.popupOpen;
                };
                EmojiInputComponent.prototype.getFilteredEmojis = function () {
                    var _this = this;
                    return this.allEmojis.filter(function (e) {
                        if (_this.filterEmojis === '') {
                            return true;
                        }
                        else {
                            for (var _i = 0, _a = e.aliases; _i < _a.length; _i++) {
                                var alias = _a[_i];
                                if (alias.includes(_this.filterEmojis)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    });
                };
                EmojiInputComponent.prototype.onEmojiClick = function (e) {
                    this.input = this.input + e;
                    this.modelChange.emit(this.input);
                    this.popupOpen = false;
                };
                EmojiInputComponent.prototype.onChange = function (event) {
                    this.input = this.emojiUtil.emojify(event.srcElement.value);
                    this.model = this.input;
                    this.modelChange.emit(this.input);
                };
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', Object)
                ], EmojiInputComponent.prototype, "popupAnchor", void 0);
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', Object)
                ], EmojiInputComponent.prototype, "model", void 0);
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', Boolean)
                ], EmojiInputComponent.prototype, "fullWidth", void 0);
                __decorate([
                    core_1.Output(), 
                    __metadata('design:type', Object)
                ], EmojiInputComponent.prototype, "modelChange", void 0);
                EmojiInputComponent = __decorate([
                    core_1.Component({
                        selector: 'emoji-input',
                        templateUrl: './input.html',
                        styleUrls: ['./input.scss']
                    }), 
                    __metadata('design:paramtypes', [])
                ], EmojiInputComponent);
                return EmojiInputComponent;
            }());
            exports_1("EmojiInputComponent", EmojiInputComponent);
        }
    }
});
//# sourceMappingURL=input.js.map