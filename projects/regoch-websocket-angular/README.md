# regoch-websocket-angular
> Websocket Client for Angular framework which works best with the [Regoch Websocket Server](https://github.com/smikodanic/regoch-websocket-server).

Very small but very powerful library made according to [RFC6455 Standard](https://www.iana.org/assignments/websocket/websocket.xml) for websocket version 13.

## Installation
```
npm install --save regoch-websocket-angular
```

## Website
[www.regoch.org](http://www.regoch.org/websocket-client-angular)


## Websocket Server Features
- websocket version: **13**
- subprotocol: **[jsonRWS](http://www.regoch.org/websocket-protocol-jsonRWS)**
- chat in the rooms
- small file size
- integrate Angular Service
- powerful API
- possible RxJS integration
- Router
- helper


## Development
```bash
npm run dev
```

## How to use
1) Inject service *RegochWebsocketAngularService* in the module
```javascript
//// app.module.ts /////
import { RegochWebsocketAngularService } from 'regoch-websocket-angular';

... providers: [RegochWebsocketAngularService] ...
```

2) Init services *RegochWebsocketAngularService, Router and Helper*
```javascript
//// app.component.ts /////
import { RegochWebsocketAngularService } from 'regoch-websocket-angular';

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

    // init router and helper
    this.router = new Router({debug: false});
    this.helper = new Helper();
  }

async connectMe(): Promise<void> {
    const wsocket = await this.rwa.connect();
    console.log('+++Connected', wsocket);
    this.messageReceiver();
  }
```

```html
<!--app.component.ts -->
<button (click)="connectMe()">Connect</button>
<button (click)="rwa.disconnect()">Disconnect</button>
```





## API
- **connect()** - connect to the websocket server
- **disconnect()** - disconnect from the websocket server

- **infoSocketId()** - receive the client's socket id
- **infoSocketList()** - receive the list of sockets connected on the server
- **infoRoomList()** - receive the list of all rooms
- **infoRoomListmy()** - receive the list of subscribed rooms

- **sendOne(to:number, msg:any)** - send message to one websocket socket/client (parameter *to* is the socket ID)
- **send(to:number[], msg:any)** - send message to one or more clients
- **broadcast(msg:any)** - send message to all clients except the sender
- **sendAll(msg:any)** - send message to all clients and the sender

- **roomEnter(roomName:string)** - enter the room and start to listen the room's messages
- **roomExit(roomName:string)** - exit from the room and stop to listen the room's messages
- **roomExitAll()** - exit from the all rooms
- **roomSend(roomName:string, msg:any)** - exit from the room and stop to listen the room's messages

- **setNick(nickname:string)** - set the client's nickname
- **route(uri:string, body?:any)** - send route to the server, for example: *{uri: '/login', body: {username: 'john', password: 'trtmrt'}}*

- **on(eventName:string, listener:Function)** - listen events: *'connected', 'message', 'route'*
- **once(eventName:string, listener:Function)** - listen events: *'connected', 'message', 'route'* only once




## subprotocol "jsonRWS"
*Subprotocol description:*
The subprotocol is created for communication between websocket server and client.

*Subprotocol definitons:*
a) Client have to send message in valid JSON format. Fields: **{id:number, from:number, tonumber|string|number[], cmd:string, payload?:any}**
b) Server have to send message in valid JSON format. Fields: **{id:number, from:number, tonumber|string|number[], cmd:string, payload?:any}**
c) The incoming message is converted from string to object.
d) The outgoing message is converted from object to string.



### Licence
Copyright (c) 2020 Saša Mikodanić licensed under [MIT](./LICENSE) .
