import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CallPage } from './call.page';

describe('CallPage', () => {
  let component: CallPage;
  let fixture: ComponentFixture<CallPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CallPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
