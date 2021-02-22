import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RegochWebsocketAngularModule, RegochWebsocketAngularService } from 'regoch-websocket-angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RegochWebsocketAngularModule
  ],
  providers: [RegochWebsocketAngularService],
  bootstrap: [AppComponent]
})
export class AppModule { }
