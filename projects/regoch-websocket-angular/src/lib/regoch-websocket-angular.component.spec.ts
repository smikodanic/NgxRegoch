import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegochWebsocketAngularComponent } from './regoch-websocket-angular.component';

describe('RegochWebsocketAngularComponent', () => {
  let component: RegochWebsocketAngularComponent;
  let fixture: ComponentFixture<RegochWebsocketAngularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegochWebsocketAngularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegochWebsocketAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
