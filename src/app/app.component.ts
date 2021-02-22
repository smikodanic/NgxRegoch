import { Component } from '@angular/core';
import { RegochWebsocketAngularService } from 'regoch-websocket-angular';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'NgxRegoch';


  constructor(
    private rwa: RegochWebsocketAngularService
  ) {
    const wcOpts = {
      wsURL: 'ws://localhost:3211?authkey=TRTmrt',
      timeout: 3 * 1000, // wait 3secs for answer
      reconnectAttempts: 5, // try to reconnect 5 times
      reconnectDelay: 3000, // delay between reconnections is 3 seconds
      subprotocols: ['jsonRWS'],
      debug: true
    };
    this.rwa.setOpts(wcOpts);
  }


  conn(): void {
    this.rwa.connect();
  }

  disconn(): void {
    this.rwa.disconnect();
  }


}
