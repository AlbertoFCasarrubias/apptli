import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VideocallPage } from './videocall.page';

describe('VideocallPage', () => {
  let component: VideocallPage;
  let fixture: ComponentFixture<VideocallPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideocallPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VideocallPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
