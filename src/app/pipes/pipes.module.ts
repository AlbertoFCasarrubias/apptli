import { NgModule } from '@angular/core';
import {ScheduleStatusPipe} from './schedule-status/schedule-status.pipe';

@NgModule({
    declarations: [ScheduleStatusPipe],
    imports: [],
    exports: [ScheduleStatusPipe],
})

export class PipesModule {}
