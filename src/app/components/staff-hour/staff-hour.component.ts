import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'staff-hour',
  templateUrl: './staff-hour.component.html',
  styleUrls: ['./staff-hour.component.scss'],
})
export class StaffHourComponent implements OnInit {
  @Input('day') day:any;
  @Input('init') init:any;
  @Output() change: EventEmitter<string> = new EventEmitter<string>();
  end = '20:00';
  start = '07:00';
  activeDay = true;
  minuteValues = '0,15,30,45'

  constructor() { }

  ngOnInit() {
    this.parseInit();
  }

  parseInit()
  {
    if(this.init && this.init.indexOf('#')>0)
    {
      const tmp = this.init.split('#');
      this.start = tmp[0];
      this.end = tmp[1];
    }
  }

  ngOnChanges(changes: SimpleChanges)
  {
    if(changes && changes.init && changes.init.currentValue)
    {
      this.init = changes.init.currentValue;
      this.parseInit();
    }

    if(changes && changes.init && changes.init.currentValue == null)
    {
      this.activeDay = false;
    }
  }

  toogleActiveDay()
  {
    if(!this.activeDay)
    {
      const resp = {
        day: this.day,
        start:null,
        end:null
      };
      this.change.emit(JSON.stringify(resp));
    }
  }

  changeHour()
  {
    const resp = {
      day: this.day,
      start:this.start,
      end:this.end
    };

    this.change.emit(JSON.stringify(resp));
  }

}
