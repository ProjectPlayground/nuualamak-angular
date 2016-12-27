import { Component, OnInit } from '@angular/core';

import { ToolbarService } from '../shared/toolbar.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {

  constructor(public toolbarService: ToolbarService) { }

  ngOnInit() {
    this.toolbarService.title('Setting');
  }

}
