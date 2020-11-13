import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ParseFilePage } from './parse-file.page';

describe('ParseFilePage', () => {
  let component: ParseFilePage;
  let fixture: ComponentFixture<ParseFilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParseFilePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ParseFilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
