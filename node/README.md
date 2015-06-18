#Requirements : 

####NodeJs >0.8.x : [download](http://nodejs.org/download/)

####Modules : 
* Required 

```
sudo npm install -g socket.io 
sudo npm install -g underscore 
sudo npm install -g sha1
sudo npm install -g jQuery
sudo npm install -g policyfile
```

* Deployment

```
sudo npm install -g jitsu
```

#Deployment : 
```
jitsu deploy
```

####Read the [NodeJitsu documentation](https://www.nodejitsu.com/getting-started/)

#Security

You can modify the private key by setting [this value](https://github.com/KnpLabs/vpauto-server/blob/master/server.js#L8).
####WARNING : Ensure you have the same private key for the NodeJs application and for the Symfony2 application
