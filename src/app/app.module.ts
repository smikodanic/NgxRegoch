import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegochWebsocketAngularModule, RegochWebsocketAngularService } from 'regoch-websocket-angular';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [RegochWebsocketAngularService],
  bootstrap: [AppComponent]
})
export class AppModule { }
