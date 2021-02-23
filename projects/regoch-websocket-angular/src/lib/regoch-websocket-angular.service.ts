import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import jsonRWS from './lib/subprotocol/jsonRWS';
import { Helper } from './lib/Helper';



interface IwcOpts {
 wsURL: string;
 timeout: number;
 reconnectAttempts: number;
 reconnectDelay: number;
 subprotocols: string[];
 debug: boolean;
}




@Injectable({
  providedIn: 'root'
})
export class RegochWebsocketAngularService {

  wcOpts: IwcOpts; // websocket client options
  wsocket: any; // Websocket instance https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
  socketID: number; // socket ID number, for example: 210214082949459100
  eventEmitter: EventEmitter;
  helper: any;
  private attempt: number; // reconnect attempt counter

  constructor(
  ) {
    this.eventEmitter = new EventEmitter();
    this.attempt = 1;
    this.helper = new Helper();
  }


  /**
   * Set options
   */
  setOpts(wcOpts: IwcOpts): void {
    this.wcOpts = wcOpts;
  }


  /************* CLIENT CONNECTOR ************/
  /**
   * Connect to the websocket server.
   */
  connect(): Promise<any> {
    const wsURL: string = this.wcOpts.wsURL; // websocket URL: ws://localhost:3211/something?authkey=TRTmrt
    this.wsocket = new WebSocket(wsURL, this.wcOpts.subprotocols);

    this.onEvents();

    // return socket as promise
    return new Promise(resolve => {
      // this.eventEmitter.removeAllListeners(); // not needed if once() is used
      this.eventEmitter.once('connected', () => { resolve(this.wsocket); });
      // console.log(`"connected" listeners: ${this.eventEmitter.listenerCount('connected')}`.cliBoja('yellow'));
    });
  }


  /**
   * Disconnect from the websocket server.
   */
  disconnect(): void {
    if (!!this.wsocket) { this.wsocket.close(); }
    this.blockReconnect();
  }



  /**
   * Try to reconnect the client when the socket is closed.
   * This method is fired on every 'close' socket's event.
   */
  async reconnect(): Promise<void> {
    const attempts = this.wcOpts.reconnectAttempts;
    const delay = this.wcOpts.reconnectDelay;
    if (this.attempt <= attempts) {
      await this.helper.sleep(delay);
      this.connect();
      console.log(`Reconnect attempt #${this.attempt} of ${attempts} in ${delay}ms`);
      this.attempt++;
    }
  }


  /**
   * Block reconnect usually after disconnect() method is used.
   */
  blockReconnect(): void {
    this.attempt = this.wcOpts.reconnectAttempts + 1;
  }



  /**
   * Event listeners.
   */
  onEvents(): void {
    this.wsocket.onopen = async (openEvt) => {
      console.log('WS Connection opened');
      this.attempt = 1;
      this.socketID = await this.infoSocketId();
      console.log(`socketID: ${this.socketID}`);
      this.eventEmitter.emit('connected');
      this.onMessage(false, true); // emits the messages to eventEmitter
    };

    this.wsocket.onclose = (closeEvt) => {
      console.log('WS Connection closed');
      delete this.wsocket; // Websocket instance https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
      delete this.socketID;
      this.reconnect();
    };

    this.wsocket.onerror = (errorEvt) => {
      // console.error(errorEvt);
    };
  }



  /************* RECEIVER ************/
  /**
   * Receive the message event and push it to msgStream.
   */
  onMessage(cb: any, toEmit: boolean): void {
    this.wsocket.onmessage = (event) => {
      try {
        const msgSTR = event.data;
        this.debugger('Received::', msgSTR);
        const msg = jsonRWS.incoming(msgSTR); // test against subprotocol rules and convert string to object

        if (!!cb) { cb(msg, msgSTR); }

        if (!!toEmit) {
          if (msg.cmd === 'route') { this.eventEmitter.emit('route', msg, msgSTR); }
          else { this.eventEmitter.emit('message', msg, msgSTR); }
        }

      } catch (err) {
        console.error(err);
      }

    };
  }



  /************* QUESTIONS ************/
  /*** Send a question to the websocket server and wait for the answer. */
  /**
   * Send question and expect the answer.
   */
  question(cmd: string): Promise<object> {
    // send the question
    const payload = undefined;
    const to = this.socketID;
    this.carryOut(to, cmd, payload);

    // receive the answer
    return new Promise(async (resolve, reject) => {
      this.onMessage(async (msgObj) => {
        if (msgObj.cmd === cmd) { resolve(msgObj); }
      }, false);
      await this.helper.sleep(this.wcOpts.timeout);
      reject(new Error(`No answer for the question: ${cmd}`));
    });
  }

  /**
   * Send question about my socket ID.
   */
  async infoSocketId(): Promise<number> {
    const answer: any = await this.question('info/socket/id');
    this.socketID = +answer.payload;
    return this.socketID;
  }

  /**
   * Send question about all socket IDs connected to the server.
   */
  async infoSocketList(): Promise<number[]> {
    const answer: any = await this.question('info/socket/list');
    return answer.payload;
  }

  /**
   * Send question about all rooms in the server.
   */
  async infoRoomList(): Promise<{name: string, socketIds: number[]}[]> {
    const answer: any = await this.question('info/room/list');
    return answer.payload;
  }

  /**
   * Send question about all rooms where the client was entered.
   */
  async infoRoomListmy(): Promise<{name: string, socketIds: number[]}[]> {
    const answer: any = await this.question(`info/room/listmy`);
    return answer.payload;
  }






  /************* SEND MESSAGE TO OTHER CLIENTS ************/
  /**
   * Send message to the websocket server if the connection is not closed
   * (https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState).
   */
  carryOut(to: number|number[]|string, cmd: string, payload: any): void {
    const id = this.helper.generateID(); // the message ID
    const from = +this.socketID; // the sender ID
    if (!to) { to = 0; } // server ID is 0
    const msgObj = {id, from, to, cmd, payload};
    const msg = jsonRWS.outgoing(msgObj);
    this.debugger('Sent::', msg);

    // the message must be defined and client must be connected to the server
    if (!!msg && !!this.wsocket && this.wsocket.readyState === 1) {
      this.wsocket.send(msg);
    } else {
      throw new Error('The message is not defined or the client is disconnected.');
    }
  }


  /**
   * Send message (payload) to one client.
   */
  sendOne(to: number, msg: any): void {
    const cmd = 'socket/sendone';
    const payload = msg;
    this.carryOut(to, cmd, payload);
  }


  /**
   * Send message (payload) to one or more clients.
   */
  send(to: number[], msg: any): void {
    const cmd = 'socket/send';
    const payload = msg;
    this.carryOut(to, cmd, payload);
  }


  /**
   * Send message (payload) to all clients except the sender.
   */
  broadcast(msg: any): void {
    const to = 0;
    const cmd = 'socket/broadcast';
    const payload = msg;
    this.carryOut(to, cmd, payload);
  }

  /**
   * Send message (payload) to all clients and the sender.
   */
  sendAll(msg: any): void {
    const to = 0;
    const cmd = 'socket/sendall';
    const payload = msg;
    this.carryOut(to, cmd, payload);
  }



  /************* ROOM ************/
  /**
   * Subscribe in the room.
   */
  roomEnter(roomName: string): void {
    const to = 0;
    const cmd = 'room/enter';
    const payload = roomName;
    this.carryOut(to, cmd, payload);
  }

  /**
   * Unsubscribe from the room.
   */
  roomExit(roomName: string): void {
    const to = 0;
    const cmd = 'room/exit';
    const payload = roomName;
    this.carryOut(to, cmd, payload);
  }

  /**
   * Unsubscribe from all rooms.
   */
  roomExitAll(): void {
    const to = 0;
    const cmd = 'room/exitall';
    const payload = undefined;
    this.carryOut(to, cmd, payload);
  }

  /**
   * Send message to the room.
   */
  roomSend(roomName: string, msg: any): void {
    const to = roomName;
    const cmd = 'room/send';
    const payload = msg;
    this.carryOut(to, cmd, payload);
  }




  /********* SEND MESSAGE (COMMAND) TO SERVER *********/
  /**
   * Setup a nick name.
   */
  setNick(nickname: string): void {
    const to = 0;
    const cmd = 'socket/nick';
    const payload = nickname;
    this.carryOut(to, cmd, payload);
  }


  /**
   * Send route command.
   */
  route(uri: string, body: any): void {
    const to = 0;
    const cmd = 'route';
    const payload = {uri, body};
    this.carryOut(to, cmd, payload);
  }




  /*********** LISTENERS ************/
  /**
   * Wrapper around the eventEmitter
   */
  on(eventName: string, listener: any): any {
    return this.eventEmitter.on(eventName, listener);
  }

  /**
   * Wrapper around the eventEmitter
   */
  once(eventName: string, listener: any): any {
    return this.eventEmitter.once(eventName, listener);
  }



  /*********** MISC ************/
  /**
   * Debugger. Use it as this.debug(var1, var2, var3)
   */
  debugger(...textParts): void {
    const text = textParts.join('');
    if (this.wcOpts.debug) { console.log(text); }
  }


}
