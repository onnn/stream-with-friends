var fs = require('fs');
var express = require('express');
const expressSanitizer = require('express-sanitizer');
var sanitizer = require('sanitizer');

var app = express();
var http = require('http').createServer(app);
//var server = require('https').create(options, app);
//const {exec} = require('child_process');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var spawn  = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
//const mediasoup = require("mediasoup");
var re = /(?<=frame= +)([0-9]*)(?=\sfps(.*))/;
var { DateTime } = require('luxon');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var path = require('path');
var now = DateTime.local().setZone("America/Chicago");
var cookieParser = require('cookie-parser');
app.use(cookieParser());
const cors = require('cors');
let archivedMessages = [];
let archivedRequests = [];
let onlineUsers = [];
var cookies = require("cookies");
var ffmpeg_pid;
let alphanumeric_regex = /^[A-Za-z0-9\s]+[A-Za-z0-9\s]+$(\.0-9+)?/
const rateLimit = require("express-rate-limit");
const MongoClient = require('mongodb').MongoClient;
const mongo_uri = 'mongodb://localhost:27017';
const mediasoup = require('mediasoup');
const config = require('./config');
const rooms = new Map();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 20
})

function ArchivedMessage(storedMessage) { 
    this.storedMessage = storedMessage; 
}

function ArchivedRequest(storedRequest) {
    this.storedRequest = storedRequest;
}

app.set('views', '/mnt/views');
app.set('view engine', 'pug');

app.use(session( {
    secret: 'animalcollective',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365,
    },
    store: new MongoStore({url: 'mongodb://127.0.0.1:27017'})

}));


app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use('/login', loginLimiter);

passport.use(new LocalStrategy(function (username, password, done) {
    if (alphanumeric_regex.test(username) && password == 'imgay')
    {
        console.log("password correct");
        return done(null, true);
    }
    else {
        console.log("no");
        fs.appendFile('./log/server.log', `auth failed with ${username}, ${password}`, (err) => { 
            if (err) throw err; 
        });
        console.log(`auth failed with ${username}, ${password}`)
        return done(null, false, {message: "Incorrect Login"});
    }
}));

app.get('/', function(request, response){

    if (request.user && request.cookies['uname']) 
    {
        app.use(express.static('/mnt/room'));
        app.use(express.static('/mnt/images'));
        app.use(express.static('/mnt/css'));
        app.use(express.static('/mnt/js'));
        app.use(express.static('/mnt/fonts'));
        response.render('index');
        //response.sendFile('/mnt/room/index.html');    
    }
    else {

        app.use(express.static('/mnt/public'));
        app.use(express.static('/mnt/public/public_images'));
        response.sendFile('/mnt/public/index.html');
    }

});

app.use('/dev', function (req, res) {
   
    app.use(express.static('/mnt/room'));
    app.use(express.static('/mnt/images'));
    app.use(express.static('/mnt/css'));
    app.use(express.static('/mnt/js'));
    app.use(express.static('/mnt/fonts'));

    res.render('devindex');
   
});

app.use('/hls', function (req, res) {
    
    fs.readFile('/mnt/hls' + req.url, function (error, content) {
        if (error) {
            res.writeHead(500);
            res.end(error.code);
        }
        else {
            res.end(content, 'utf-8');
        }
    })
})


app.post('/login', passport.authenticate('local'), function(req, res){
    var gcookie = req.cookies['uname'];
    socket_username = req.body.username;
    if (gcookie === undefined) {
        res.cookie('uname', socket_username, {
            maxAge: 900000000, 
            httpOnly: false, 
            secure: true
        })
    }
    console.log(socket_username);
    res.redirect('/');
}); 

app.get('/programList', checkAuth, function(req, res) {
    fs.readFile('/mnt/views/includes/gen.html', 'utf8', (err, data) => {
        if (err) throw err;
        res.send(data);
        res.end();
    })
});

app.post('/watch', checkAuth, function(req, res) {
    MongoClient.connect(mongo_uri, {useNewUrlParser: true })
    .then((client) => {
        const db = client.db('streamwithfriends');
        const collection = db.collection('dir');
        const videoCursor = collection.aggregate(
            [{$match:{'children.children.id': req.query.v}}, {$unwind: '$children' }, {$match:{'children.children.id': req.query.v} }, {$unwind: '$children.children'}, {$match: {'children.children.id': req.query.v} }]).forEach((result) => {
                startVideo(result, req, res, (responseString, errno) => {
                    var responseArray = {en: errno, rs: responseString, resultObject: result};
                    var responseJSON = JSON.stringify(responseArray);
                    res.send(responseJSON);
                })
            });


    }).catch(function (){
        console.log("promise rejected"); 
    });
});

app.get('/logout', checkAuth, function(req,res){
    req.logOut();
    res.clearCookie('connect.sid');
    res.clearCookie('uname');
    req.session.destroy(function (err) {
        res.redirect('/');
        console.log(err);
    })
})


app.use('/display_shows', checkAuth, function(req, res) {
    MongoClient.connect(mongo_uri, {useNewUrlParser: true })
    .then(client => {
        const db = client.db('streamwithfriends');
        const collection = db.collection('shows');
        //const options = {
        //    projection: { path: 1 }
        //};
        const vid = collection.find( {}, {"sort" : [['show', 'asc']]} ,function (err, result) {
            if (err) throw err;
            if (result) {
                var strBuilder = "";
 
                result.forEach(element => {
                    strBuilder = `${strBuilder}<li onclick=displaySeasons("${element.show}")>${element.show}</li>`;
                }, () => {res.send(strBuilder);});
            }
            else res.send('no results found');
        });
    }).catch(function (){
        console.log("promise rejected"); 
    });
});

app.get('/display_seasons', checkAuth, function (req, res) {

    MongoClient.connect(mongo_uri, {useNewUrlParser: true })
    .then(client => {
        const db = client.db('streamwithfriends');
        const collection = db.collection('media');
        //const options = {
        //    projection: { path: 1 }
        //};
        const vid = collection.distinct('season', {show: req.query.show}, function (err, result) {
            if (err) throw err;
            if (result) {
                var strBuilder = "";
                result.forEach(element => {
                    strBuilder = `${strBuilder}<li onclick="displayEpisodes('${req.query.show}', '${element}', ${req.query.subtitles})">${element}</li>`;
                });
                res.send(strBuilder);
            }
            else res.send('no results found');
        });
    }).catch(function (){
        console.log("promise rejected");
    });
});

app.get('/display_episodes', checkAuth, function (req, res) {
    MongoClient.connect(mongo_uri, {useNewUrlParser: true })
    .then(client => {
        const db = client.db('streamwithfriends');
        const collection = db.collection('media');
        //const options = {
        //    projection: { path: 1 }
        //};
        const vid = collection.find({show: req.query.show, season: req.query.season}, function (err, result) {
            if (err) throw err;
            if (result) {
                var strBuilder = "";
                result.forEach(element => {
                    strBuilder = `${strBuilder}<li onclick="newRequestStart('${req.query.show}', '${req.query.season}', '${element.file}', '', '${req.query.subtitles}')">${element.file}</li>`;
                }, () => {res.send(strBuilder);});
            }
            else res.send('no results found');
        });
    }).catch(function (){
        console.log("promise rejected");
    });
});



function checkAuth(req, res, next) {
    console.log('checked');
    if(!req.user){
        console.log('noauth')
        res.status(401);
        res.end();
    }
    else{
        next();
    }
}

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
})

// MediaSoup server
const mediaServer = mediasoup.Server({
    numWorkers: null, // Use as many CPUs as available.
    logLevel: config.mediasoup.logLevel,
    logTags: config.mediasoup.logTags,
    rtcIPv4: config.mediasoup.rtcIPv4,
    rtcIPv6: config.mediasoup.rtcIPv6,
    rtcAnnouncedIPv4: config.mediasoup.rtcAnnouncedIPv4,
    rtcAnnouncedIPv6: config.mediasoup.rtcAnnouncedIPv6,
    rtcMinPort: config.mediasoup.rtcMinPort,
    rtcMaxPort: config.mediasoup.rtcMaxPort
  });
  

const { info } = require('console');
const { send } = require('process');
const { query, response } = require('express');
//http.createServer(//function (req, res) //{
    //res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    //res.end();
//}
//).listen(8080);
var server = app.listen(8088, () => {
	console.log('listening on 8088');
});
//server.listen(8086, function() {
 //   console.log('listening on *:8086');
//});
const io = require('socket.io')(server);

const socketCookieParser = require('socket.io-cookie-parser');
const { sio } = require('constants');
const { errorMonitor } = require('events');

io.use(socketCookieParser());
io.sockets.on('connection', function(socket) {
    var socket_username = socket.request.cookies['uname'];
        
    var ip6address = socket.conn.remoteAddress;
    var ip_address = ip6address.toString().split(':')[3];
    console.log('New socket connection from ', ip_address);

    fs.appendFile('./log/server.log', `New socket connection from ${ip_address}.`, (err) => { 
        if (err) throw err; 
    });

    for (var i = 0; i <= onlineUsers.length; i++){ 
        socket.emit('onlineUsers', onlineUsers[i]);
    }        
        

    socket.emit('username', socket_username);
    onlineUsers.push(socket_username);
    socket.emit('onlineUsers', socket_username);
    console.log(onlineUsers);
    console.log(now.toString() + " " +  socket_username + " logged in from " + ip_address);
    fs.appendFile('./log/server.log', now.toString() + " " + socket_username + " logged in from " + ip_address + "\n", (err) => { 
        if (err) throw err; 
    });


    if (archivedMessages.length > 0){
        for (var i = 0; i <= archivedMessages.length - 1; i++){ 
            socket.emit('chat_message', archivedMessages[i].storedMessage);
        }        
    }

    fs.readFile("/home/debian/requests", function (err, data) {
    
        if (err) throw err;

        textByLine = data.toString('utf8').split("\n");

        for (var i = 0; i <= textByLine.length - 1; i++){ 
            socket.emit('request', textByLine[i]);
        }
        
    });
            
    socket.on('stare', function() {io.emit('stare');console.log('stare')});
    socket.on('heart', function() {io.emit('heart');console.log('heart')});
    socket.on('applause', function() {io.emit('applause');console.log('applause')});
    socket.on('cry', function() {io.emit('cry');console.log('cry')});
    socket.on('cat', function() {io.emit('cat');console.log('cat')});
    socket.on('celebrate', function() {io.emit('celebrate');console.log('celebrate')});
    socket.on('derp', function() {io.emit('derp');console.log('derp')});
    socket.on('horse', function() {io.emit('horse');console.log('horse')});
    socket.on('nope', function() {io.emit('nope');console.log('nope')});
    socket.on('ufo', function() {io.emit('ufo');console.log('ufo')});

    socket.on('disconnect', function(username) {
        var index = onlineUsers.indexOf(socket_username);
        if (index !== -1) { 
            onlineUsers.splice(index,1);
        }
        socket.emit('removeUser', socket_username);
        console.log(now.toString() + socket_username + " left");
        console.log(onlineUsers);
        var index = onlineUsers.indexOf(socket_username);
        fs.appendFile('./log/server.log', now.toString() + " " + socket_username + " disconnected " + ip_address + "\n", (err) => { 
            if (err) throw err; 
        });        
    });

    socket.on('chat_message', function(message, username) {
        escaped_message = sanitizer.escape(message);
        sanitized_message = sanitizer.sanitize(escaped_message);
        io.emit('chat_message', '<strong>' + socket_username + '</strong>: ' + sanitized_message);        
        let newMessage = new ArchivedMessage(' <strong>' + socket_username + '</strong>: ' + sanitized_message);
        archivedMessages.push(newMessage);
        console.log(newMessage.storedMessage);
        fs.appendFile('./log/server.log', newMessage.storedMessage + "\n", (err) => { if (err) throw err; });
    });

    socket.on('request', function(message, username) {
        escaped_message = sanitizer.escape(message);
        sanitized_message = sanitizer.sanitize(escaped_message);
        var newRequestString =  "<strong>" + socket_username + "</strong> requested " + sanitized_message;
        io.emit('request', newRequestString);          
        io.emit('chat_message', newRequestString);
        fs.appendFile('./log/server.log', now.toString() + " " + newRequestString + "\n", (err) => { 
            if (err) throw err; 
        });
        fs.appendFile('/home/debian/requests', newRequestString + "\n", (err) => { 
            if (err) throw err; 
        });
    });

    socket.on('pause', function() {
        spawn('kill', ['-20', ffmpeg_pid]);
    });

    socket.on('unpause', function() {
        spawn('kill', ['-18', ffmpeg_pid]);
    })


    socket.on('startNotification', function(username, show, season, episode) {
    var videoTitle;
    var messageString;
        if (show == 'youtube') {
            youtube_child = spawn('/usr/local/bin/youtube-dl', ['-e', season]);
            youtube_child.stdout.on('data', function (data) { videoTitle = data.toString() });
            youtube_child.on('exit', function () {
                messageString = '<strong>' + socket_username + '</strong> ' + ' started a video: ' + videoTitle;
                io.emit('chat_message', messageString);
                let newMessage = new ArchivedMessage(messageString);
                console.log(newMessage.storedMessage);
                fs.appendFile('./log/server.log', newMessage.storedMessage + "\n", (err) => { 
                    if (err) throw err; 
                });
                archivedMessages.push(newMessage);
            });
        }
        /*
        else {
            messageString = '<strong>' + socket_username + '</strong> ' + ' started ' + show + ' season ' + season + ' episode ' + episode + '.';
            io.emit('chat_message', messageString);
            let newMessage = new ArchivedMessage(messageString);
            //console.log('hi');
            console.log(newMessage.storedMessage);
            fs.appendFile('./log/server.log', newMessage.storedMessage + "\n", (err) => { 
                if (err) throw err;
            });
            archivedMessages.push(newMessage);
        }
        */
    });
    
    socket.on('ajax_response', (socketResponseJSON) => {
        let socketResponseObject = JSON.parse(socketResponseJSON);
        var ajax_message;
        if (socketResponseObject.en == 0) {
            if (socketResponseObject.resultObject.name == "Movies") {
                ajax_message = `<strong>${socket_username}</strong> started ${socketResponseObject.resultObject.children.children.niceName}`;
            } else {
                ajax_message = `<strong>${socket_username}</strong> started ${socketResponseObject.resultObject.name} - ${socketResponseObject.resultObject.children.name} - ${socketResponseObject.resultObject.children.children.niceName}`;
            }
            io.emit('chat_message', ajax_message);
            let newMessage = new ArchivedMessage(ajax_message);
            archivedMessages.push(newMessage);
            console.log(newMessage.storedMessage);
            fs.appendFile('./log/server.log', newMessage.storedMessage + "\n", (err) => { if (err) throw err; });
        }
    })

    socket.on('request_youtube_start', function (url) {

        console.log(url + ' requested to start');   
        io.emit('youtube_ack', url);
        var youtube_child = spawn('/usr/local/bin/youtube-dl', ['-o', 'video', url]);                             
        youtube_child.stdout.on('data', function (data) { console.log(data.toString()); }); 
        youtube_child.stderr.on('data', function (data) { console.log(data.toString()); }); 
        youtube_child.on('exit', function (code) {

            console.log(code);
            spawn('killall', ['ffmpeg']);                                                             
            spawn('rm', ['video']);                                                             
            setTimeout(function () {spawn("mv", ['video.webm', 'video']);}, 500);
            setTimeout(function () {spawn("mv", ['video.mkv', 'video']);}, 500);
            setTimeout(function () {spawn("mv", ['video.mp4', 'video']);}, 500);
            setTimeout(function () {   
                var child = spawn(`ffmpeg`, [
                    `-re`, 
                    `-ss`, `0:00:00`, 
                    `-i` ,`video`,
                    `-vf`, `scale=720:-2,pad=iw:ih+30:0:0`,
                    `-preset`, `veryfast`,
                    `-vcodec`, `libx264`,
                    `-g`, `48`,
                    `-keyint_min`, `48`,
                    `-sc_threshold`, `0`,
                    `-hls_time`, `2`,
                    `-hls_playlist_type`, `event`,
                    `-pix_fmt`, `yuv420p`,
                    `-acodec`, `aac`,
                    `-ar`, `44100`,
                    `-ac`, `2`,
                    `-b:v`, `600k`,
                    `-b:a`, `96k`,
                    `-loglevel`, `info`,
                    `-hls_wrap`, `3`,
                    `-hls_list_size`, `5`,
                    `-hls_segment_filename`, `/mnt/hls/720p_%03d.ts`,
                    `/mnt/hls/720p.m3u8`
                ]);
                ffmpeg_pid = child.pid;
                child.stderr.on('data', function (data) { 
                    fs.appendFile('./ffmpeg.log', data.toString(), (err) => { 
                        if (err) throw err;        
                    });
                });

                child.on('exit', function (code) {
                    console.log('ffmpeg closed with ' + code);
                });

            }, 500);
        });
    });
  
  // Used for mediaSoup room
  let room = null;
  // Used for mediaSoup peer
  let mediaPeer = null;

  const roomId = 1;
  const peerName = socket.request.cookies['uname'];

  if (rooms.has(roomId)) {
    room = rooms.get(roomId);
  } else {
    room = mediaServer.Room(config.mediasoup.mediaCodecs);
    rooms.set(roomId, room);
    room.on('close', () => {
      rooms.delete(roomId);
    });
  }

  socket.on('mediasoup-request', (request, cb) => {
    switch (request.method) {

      case 'queryRoom':
        room.receiveRequest(request)
          .then((response) => cb(null, response))
          .catch((error) => cb(error.toString()));
        break;

      case 'join':
        room.receiveRequest(request)
          .then((response) => {
            // Get the newly created mediasoup Peer
            mediaPeer = room.getPeerByName(peerName);

            handleMediaPeer(mediaPeer);

            // Send response back
            cb(null, response);
          })
          .catch((error) => cb(error.toString()));
        break;

      default:
        if (mediaPeer) {
          mediaPeer.receiveRequest(request)
            .then((response) => cb(null, response))
            .catch((error) => cb(error.toString()));
        }
    }

  });

  socket.on('mediasoup-notification', (notification) => {
    console.debug('Got notification from client peer', notification);

    // NOTE: mediasoup-client just sends notifications with target 'peer'
    if (!mediaPeer) {
      console.error('Cannot handle mediaSoup notification, no mediaSoup Peer');
      return;
    }

    mediaPeer.receiveNotification(notification);
  });

  // Invokes when connection lost on a client side
  socket.on('disconnect', () => {
    if (mediaPeer) {
      mediaPeer.close();
    }
  });


  const handleMediaPeer = (mediaPeer) => {
    mediaPeer.on('notify', (notification) => {
      console.log('New notification for mediaPeer received:', notification);
      socket.emit('mediasoup-notification', notification);
    });

    mediaPeer.on('newtransport', (transport) => {
      console.log('New mediaPeer transport:', transport.direction);
      transport.on('close', (originator) => {
        console.log('Transport closed from originator:', originator);
      });
    });

    mediaPeer.on('newproducer', (producer) => {
      console.log('New mediaPeer producer:', producer.kind);
      producer.on('close', (originator) => {
        console.log('Producer closed from originator:', originator);
      });
    });

    mediaPeer.on('newconsumer', (consumer) => {
      console.log('New mediaPeer consumer:', consumer.kind);
      consumer.on('close', (originator) => {
        console.log('Consumer closed from originator', originator);
      });
    });

    // Also handle already existing Consumers.
    mediaPeer.consumers.forEach((consumer) => {
      console.log('mediaPeer existing consumer:', consumer.kind);
      consumer.on('close', (originator) => {
        console.log('Existing consumer closed from originator', originator);
      });
    });
  }




    socket.on('startvideo', function(show, season, episode, format, subs) {
        console.log('startvideo');
        var video_map = `0:v:0`;
        var audio_map = `0:a:0`;
        var subtitle_map = `0:s:0`;

        //var vf2 = `scale=720:-2`
        var filter = "-vf";
        var emittedStartNotification = false;
        if (format) {
            var filename = '/home/debian/tv/' + String(show) + '/' + String(season) + '/' + String(episode) + '.' + String(format);
        }
        else {
            var filename = episode;
        }
        var vf1 = `null`;
        vf1 = 'subtitles=' + filename;
        var subfile = '/home/debian/tv/' + String(show) + '/' + String(season) + '/' + String(episode) + '.' + 'srt';
        var vttfile = '/home/debian/tv/' + String(show) + '/' + String(season) + '/' + String(episode) + '.' + 'vtt';
        io.emit('videoStartedBySomeone');

        if (subs == 4){
            vf1 = 'subtitles='+vttfile;
        }
        //srt subs
        else if (subs == 3 ) {
            vf1 = 'subtitles='+subfile;
        }
        //embedded subs
        else if (subs == 2 || subs == 0){
            vf1 = 'subtitles=' + filename;
        }
        //picture based subs
        else if (subs == 1){
            vf1 = `[0:v][0:s]overlay[v]`;
            video_map = `[v]`;
            audio_map = `0:a:0`;
            filter = `-filter_complex`;
        }

        if (show == 'evangelion')
        {
            audio_map = `0:a:1`;
        }
        if (show == 'claymore')
        {
            vf1 = `[0:v][0:s:1]overlay[v]`;
            video_map = `[v]`;
            filter = `-vf`;
            audio_map = `0:a:1`;
        }

        console.log(filename);
        fs.appendFile('./log/server.log', filename, (err) => { 
            if (err) throw err; 
        });
        spawn('killall', ['ffmpeg']);
        setTimeout(function () {          
            var child = spawn(`ffmpeg`, [
            `-re`, 
            `-ss`, `0:00:00`, 
            `-i` ,`${filename}`,
            `-map`, `${video_map}`,
            `-map`, `${audio_map}`,
            `-filter_complex`, `${vf1}`,
            `-preset`, `veryfast`,
            `-vcodec`, `libx264`,
            `-g`, `120`,
            `-sc_threshold`, `0`,
            `-hls_time`, `2`,
            `-pix_fmt`, `yuv420p`,
            `-acodec`, `aac`,
            `-ar`, `44100`,
            `-ac`, `2`,
            `-b:v`, `3000k`,
            `-b:a`, `96k`,
            `-loglevel`, `info`,
            `-hls_playlist_type`, `event`,
            `-hls_flags`, `omit_endlist`, 
            `-hls_segment_filename`, `/mnt/hls/720p_%03d.ts`,
            `/mnt/hls/720p.m3u8`
        ]);
        ffmpeg_pid = child.pid;
        child.stderr.on('data', function (data) {     
            if ((re.test(data.toString()) == true) && ((data.toString().match(re)[0]) > 300) && (emittedStartNotification == false)) {
                io.emit('video_is_ready');
                emittedStartNotification = true;
                console.log('video is ready sent');
            }
            fs.appendFile('./log/ffmpeg.log', data.toString(), (err) => { 
                if (err) throw err;      
            });
        });
        
        child.on('exit', function (code) {
            spawn("sh", ['remove_ts_files.sh']);
            console.log('ffmpeg closed with ' + code);
            if (code == 1) {
                socket.emit('chat_message', 'Something\'s wrong with that video. Yell at maya to fix it');
            }
        });

        }, 500);
    });

});

function startVideo(videoObject, req, res, fn) {
    const videoPath = videoObject.children.children.path;
    console.log('startvideo');
    console.log(videoPath);
    var video_map = `0:v:0`;
    var subtitles = req.query.s;
    var language = req.query.l;
    var subtitle_map = `0:s:0`;
    var dataResponse; 
    //var vf2 = `scale=720:-2`
    var filter = "-vf";
    
    if (subtitles == 0) {
        var vf1 = `null`;
    }
    else if (subtitles == 1) {
        vf1 = `subtitles=${videoPath}`;
    }
    else {
        console.log("error: invalid subtitle selection");
    }

    if (language == 1) 
    {
        audio_map = `0:a:1`;
    }
    else {
        audio_map = `0:a:0`;
    }

    if (videoObject.name == "Dragon Ball Z" && req.query.l == 1) {
        audio_map = `0:a:2`;
    }



    fs.appendFile('./log/server.log', videoPath, err => { 
        if (err) throw err; 
    });

    var previous_pid = fs.readFileSync('/mnt/server/ffmpeg1_pid', {encoding: 'utf-8'});

    spawnSync(`kill`, [previous_pid]);
    var child = spawn(`ffmpeg`, [
        `-re`, 
        `-ss`, `0:00:00`, 
        `-i` ,`${videoPath}`,
        `-map`, `${video_map}`,
        `-map`, `${audio_map}`,
        `-filter_complex`, `${vf1}`,
        `-preset`, `veryfast`,
        `-vcodec`, `libx264`,
        `-g`, `120`,
        `-sc_threshold`, `0`,
        `-hls_time`, `2`,
        `-pix_fmt`, `yuv420p`,
        `-acodec`, `aac`,
        `-ar`, `44100`,
        `-ac`, `2`,
        `-b:v`, `3000k`,
        `-b:a`, `96k`,
        `-report`,
        `-hls_playlist_type`, `event`,
        `-hls_flags`, `omit_endlist`, 
        `-hls_segment_filename`, `/mnt/hls/720p_%03d.ts`,
        `/mnt/hls/720p.m3u8`
    ]);
    ffmpeg_pid = child.pid;
    fs.writeFile('/mnt/server/ffmpeg1_pid', child.pid.toString(), {encoding: 'utf-8'}, err => {
        if (err) throw err;
    })
    child.stderr.on('data', function f(data, errno) {
            //if ((re.test(data.toString()) == true) && ((data.toString().match(re)[0]) > 300) && (emittedStartNotification == false)) {
            //emittedStartNotification = true;
            //console.log('video is ready sent');
            //}

            if (data.toString().includes('matches no streams')) {
                console.log('language error');
                fn("Video can't play. Your selection doesn't have an alternate language stream. Toggle your option in the menu and try again.", 1);
                child.stderr.off('data', f);
                return false;
            }
            else if (data.toString().includes(`Error initializing`)) {
                console.log('error intializing subtitles');
                fn("Video can't play. No subtitles on your selection. Sorry. Toggle your option in the menu and try again.", 2);
                child.stderr.off('data', f);
                 //fn("No subtitles on this one. Sorry");
                 return false;
            }
            else if (data.toString().includes(`frame=`)) {
                console.log('SUCCESS!');
                 fn("Video started successfully on the server. It will definitely start now, but you might need to refresh.", 0);   
                 child.stderr.off('data', f); 
                 return false;
            }
            
 
        });
        child.on('exit', function (code) {
            spawn("sh", ['remove_ts_files.sh']);
            console.log('ffmpeg closed with ' + code);
        });

    }
