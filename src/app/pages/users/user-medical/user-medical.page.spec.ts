import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UserMedicalPage } from './user-medical.page';

describe('UserMedicalPage', () => {
  let component: UserMedicalPage;
  let fixture: ComponentFixture<UserMedicalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserMedicalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserMedicalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
