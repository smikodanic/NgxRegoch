import { Component } from '@angular/core';
import { RegochWebsocketAngularService } from 'regoch-websocket-angular';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  socketID: number;
  socketIDsStr: string;
  roomNames: string[];
  myRoomNames: string[];
  incomingMessage: any;

  inputs: any = {};


  constructor(
    public rwa: RegochWebsocketAngularService
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



  async connectMe(): Promise<void> {
    const wsocket = await this.rwa.connect();
    console.log('+++Connected', wsocket);
    this.messageReceiver();
  }


  /*** Questions Tests */
  async infoSocketId_test(): Promise<void> {
    try {
      this.socketID = await this.rwa.infoSocketId();
    } catch (err) {
      console.error(err);
    }
  }

  async infoSocketList_test(): Promise<void> {
    try {
      const socketIDs = await this.rwa.infoSocketList();
      this.socketIDsStr = JSON.stringify(socketIDs);
    } catch (err) {
      console.error(err);
    }
  }

  async infoRoomList_test(): Promise<void> {
    try {
      const rooms = await this.rwa.infoRoomList(); // [{name, socketIDs}]
      if (!!rooms) {
        this.roomNames = rooms.map(room => room.name);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async infoRoomListmy_test(): Promise<void>  {
    try {
      const rooms = await this.rwa.infoRoomListmy(); // [{name, socketIDs}]
      if (!!rooms) {
        this.myRoomNames = rooms.map(room => room.name);
      }
    } catch (err) {
      console.error(err);
    }
  }


  /*** Send Tests */
  sendOne_test(): void {
    const to = +this.inputs.to1;
    const payload = this.inputs.payload1;
    this.rwa.sendOne(to, payload);
  }

  send_test(): void {
    const tos = this.inputs.to2; // string 210205081923171300, 210205082042463230
    const to = tos.split(',').map((t: string) => +t); // array of numbers [210205081923171300, 210205082042463230]
    const payload = this.inputs.payload2;
    this.rwa.send(to, payload);
  }

  broadcast_test(): void {
    const payload = this.inputs.payload3;
    this.rwa.broadcast(payload);
  }

  sendAll_test(): void {
    const payload = this.inputs.payload4;
    this.rwa.sendAll(payload);
  }


   messageReceiver(): void {
    this.rwa.on('message', (msg, msgSTR) => {
      console.log('message SUBPROTOCOL', msg); // message after subprotocol
      console.log('message STRING', msgSTR); // received message
      this.incomingMessage = msg.payload;
    });
  }


  // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
  printInfo(msg: any): void {
    const msgSize = this.rwa.helper.getMessageSize(msg);
    if (this.rwa.wsocket && this.rwa.wsocket.readyState === 1) { console.log(`Sent (${msgSize}): ${msg}`); }
  }


  /*** ROOM ***/
  roomEnter_test(): void {
    const roomName = this.inputs.roomName;
    this.rwa.roomEnter(roomName);
  }

  roomExit_test(): void {
    const roomName = this.inputs.roomName;
    this.rwa.roomExit(roomName);
  }

  roomExitAll_test(): void {
    this.rwa.roomExitAll();
  }

  roomSend_test(): void {
    const roomName = this.inputs.roomName;
    const roomMessage = this.inputs.roomMessage;
    this.rwa.roomSend(roomName, roomMessage);
  }



  /*** SERVER COMMANDS ***/
  setNick_test(): void {
    const nickname = this.inputs.nickname;
    this.rwa.setNick(nickname);
  }

  route_test(): void {
    const uri = this.inputs.routeUri;
    const bodyStr = this.inputs.routeBody;
    const body = JSON.parse(bodyStr);
    this.rwa.route(uri, body);
  }


  route_test2(): void {
    const uri = this.inputs.routeUri2;
    this.rwa.route(uri, undefined);

    // receive route
    this.rwa.once('route', (msg: any, msgSTR: string) => {
      console.log('route msg::', msg);
      // router transitional variable
      const router = this.rwa.router;
      const payload: {uri: string, body?: any} = msg.payload;

      // router transitional varaible
      router.trx = {
        uri: payload.uri,
        body: payload.body,
        client: this
      };

      // route definitions
      router.def('/returned/back/:n', (trx) => { console.log('trx.params::', trx.params); });
      router.notfound((trx) => { console.log(`The URI not found: ${trx.uri}`); });

      // execute the router
      router.exe().catch(err => {
        console.log(err);
      });

    });
  }





}
