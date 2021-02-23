# NgxRegoch
Regoch libraries for Angular framework.


## 1. regoch-websocket-angular
> Websocket Client for angular framework. Works best with the [Regoch Websocket Server](https://github.com/smikodanic/regoch-websocket-server).


**INSTALLATION**
```bash
npm install --save regoch-websocket-angular
```


**DEVELOPMENT**
In first terminal open the app where the library will be tested.
```bash
$ cd /NgxRegoch
$ ng serve -o
```

In the second terminal build the project (library) regoch-websocket-client
```bash
$ cd /NgxRegoch/projects/regoch-websocket-angular
$ ng build RegochWebsocketAngular --watch
```

Make link to the builded library.
```bash
$ cd /NgxRegoch/dist/regoch-websocket-angular
$ sudo npm link
```

Now both the test app and the lib will be updated as the code is changed.


**READ MORE ...**
More info *regoch-websocket-angular* library at [README.md](./projects/regoch-websocket-angular/README.md) .
