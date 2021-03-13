var requests = document.getElementById("requests");
var vidops = document.getElementById("vidos");
var usernamestuff = document.getElementById("usernamestuff");
var box = document.getElementById("box");
var chattext = document.getElementById('txt');
var chat = document.getElementById("messages");
var requests = document.getElementById("requests");
var sendbutton = document.getElementById("sendbutton");
var usernamebox = document.getElementById("usernamebox");
var chatMenu = document.getElementById("chatMenu");
var loggedIn = false;
var normalSource = document.getElementById("Normal");
var highSource = document.getElementById("High");
var startButton = document.getElementById("startbutton");
var socket;
var welcomeMessage = document.getElementById("welcomeMessage");
var streamVideoModal = document.getElementById("streamVideoMenu");
var requestModal = document.getElementById('requestMenu');
var streamingInputBox = document.getElementById("streamingInput");
var requestInputBox = document.getElementById('requestInputBox');
var requestMode = false;
var reactions = document.getElementById('reactions');
const urlParams = new URLSearchParams(window.location.search);
const roomId = 1;
var reactionsEnabled = true;
var chatFormDiv = document.getElementById('chatFormDiv');
var alerted = false;
var programList = document.getElementById("programList");
var programListX = document.getElementById("programListX");
var request = new XMLHttpRequest;
var subtitleCheck = document.getElementById("subtitleCheck");
var languageCheck = document.getElementById("languageCheck");
const { RTCPeerConnection, RTCSessionDescription } = window;

window.onload = () => {
    document.querySelector("#my-page").style.display = "block";
    document.querySelector("#rightbar").style.display = "inline-flex";
    document.getElementById('subtitleCheck').checked = Cookies.get('subtitles')==1? true : false;
    document.getElementById('languageCheck').checked = Cookies.get('language')==1? true : false;

}

var ioURL = "";

socket = io(ioURL, {transports: ['websocket']});


socket.on('connect', () => {
    let username = Cookies.get("uname");
// Create a local Room instance associated to the remote Room.
const room = new mediasoupClient.Room();
// Transport for sending our media.
let sendTransport;
// Transport for receiving media from remote Peers.
let recvTransport;

console.debug('ROOM:', room);

room.join(username)
  .then((peers) => {
    console.debug('PEERS:', peers);

    // Create the Transport for sending our media.
    sendTransport = room.createTransport('send');
    // Create the Transport for receiving media from remote Peers.
    recvTransport = room.createTransport('recv');

    peers.forEach(peer => handlePeer(peer));
  })
  .then(() => {
    // Get our mic and camera
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
  })
  .then((stream) => {

    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

      // Show local stream
      
      const localStream = new MediaStream([videoTrack, audioTrack]);
      const video = document.createElement('video');
      video.setAttribute('style', 'max-width: 400px;');
      video.srcObject = localStream;
      document.getElementById('video-container').appendChild(video);
      video.play();

    // Create Producers for audio and video.
    const audioProducer = room.createProducer(audioTrack);
    const videoProducer = room.createProducer(videoTrack);

    // Send our audio.
    audioProducer.send(sendTransport);
    // Send our video.
    videoProducer.send(sendTransport);
  });

});

let username = Cookies.get("uname");

document.getElementById("txt").placeholder = username;

chattext.addEventListener('keydown', function(e) {

    const keyCode = e.which || e.keyCode;

    //enter but not holding shift, send the message
    if (keyCode === 13 && !e.shiftKey) {

        e.preventDefault(); // prevents page reloading
        var messageBody = document.getElementById("txt").value; 
        var spaceChar = messageBody.indexOf(" ");
        if ($('#txt').val() == "!pause") {
            socket.emit('pause');
        }
        else if ($('#txt').val() == "!unpause") {
            socket.emit('unpause');
        }

        if ((messageBody) && (requestMode == false)) {
            socket.emit('chat_message', $('#txt').val(), username);
        }
        else if((messageBody) && (requestMode == true)) {
            socket.emit('request', $('#txt').val(), username);
        }

        $('#txt').val('');
        return false;
    }
});

function clickMessageButton() {

    //enter but not holding shift, send the message
    if ($('#txt').val() == "!pause") {
        socket.emit('pause');
    }
    else if ($('#txt').val() == "!unpause") {
        socket.emit('unpause');
    }
    else {
        socket.emit('chat_message', $('#txt').val(), username);
    }
    $('#txt').val('');
    return false;
}


function switchMenu(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");

    for (i = 0; i < tabcontent.length; i++){
        tabcontent[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "flex";
    if (tabName == 'requests') {
        requestMode = true; 
        chatMenu.style.display = "none";
        backMenu.style.display = "flex";
        document.getElementById("txt").placeholder = 'Type your request here';
        document.querySelector("#requests").scrollTo(0, document.querySelector("#requests").scrollHeight);
    }
    else if (tabName == 'messages') {
        requestMode = false; 
        document.getElementById("txt").placeholder = username;
        chatMenu.style.display = "inline"; 
        backMenu.style.display = "none";
        chatFormDiv.style.display = "flex";
    }
    else if (tabName == 'userList') {
        requestMode = false; 
        chatFormDiv.style.display = "none"; 
        backMenu.style.display = "flex"; 
        chatMenu.style.display="none";
    }
    chattext.focus();
    //evt.currentTarget.className += " active";
}

function requestStart(show, season, episode, format, subs) {
    socket.emit('startvideo', show, season, episode, format, subs);
    closeProgramList();
    startNotification(username, show, season, episode);
}

function newRequestStart(show, season, episode, subs) {
    socket.emit('startvideo', show, season, episode, subs);
    closeProgramList();
    startNotification(username, show, season, episode);
}

function requestYoutubeStart() {
    var filledValue;
    setTimeout(function () {
        filledValue = streamingInputBox.value;
    }, 1);
    setTimeout(function () {
        socket.emit('request_youtube_start', filledValue);
    }, 10);
    socket.on('youtube_ack', function () {
        CloseStreamVideoMenu(); socket.emit('startNotification', username, 'youtube', filledValue, 1) 
    });
}


function startNotification(username, show, season, episode) {
    socket.emit('startNotification', username, show, season, episode);
}

socket.on('chat_message', function(msg){
    $('#messages').append($('<li>').html(msg));
    if (window.innerWidth > window.innerHeight) {
        $('#messages').stop().animate({
            scrollTop: $('#messages')[0].scrollHeight
        }); 
    }
    else {
        $('#messages').scrollTo(0,0);
    }
});

socket.on('recorded_chat_message', function(recordedUsername, recordedMessage) {
    $('#messages').append($('<li>').html(recordedMessage));
});

socket.on('request', function(msg){
    $('#requests').append($('<li>').html(msg));
});

socket.on('recorded_request', function(recordedUsername, recordedRequest) {
    $('#requests').append($('<li>').html(recordedRequest));
});

socket.on('onlineUsers', function(onlineUsername) {
    $('#userList').append($('<li>').html(onlineUsername));
});

socket.on('video_is_ready', () => {
    location.reload();
});


chatForm.addEventListener('submit', function(e){
    e.preventDefault();
});

function watch(v) {
    var subtitlesQuery;
    var languageQuery;
    if (subtitleCheck.checked) {
        subtitlesQuery = 1; 
    }
    else {subtitlesQuery = 0}
    if (languageCheck.checked) {
        languageQuery = 1;
    }
    else {languageQuery = 0;}
    try {
        request.onreadystatechange = () => {
            if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
                let responseObject = JSON.parse(request.responseText);
                $('#messages').append($('<li>').html(`<div class="individualMessages">${responseObject.rs}</div>`));
                socket.emit('ajax_response', request.responseText);
                location.reload();
            }
        }
        request.open("POST", `/watch?v=${v}&s=${subtitlesQuery}&l=${languageQuery}`, true)
        $('#messages').append($('<li>').html(`<div class="individualMessages">Your request has been sent to the server. Please Wait.</div>`));
        request.send();
    }
    catch(e) {
        console.log(e);
    }
}

/*
function getProgramListing(){
    if (request.readyState === XMLHttpRequest.DONE)
    {
        var val = request.responseText;
        document.getElementById('my-menu-list-items').innerHTML = val;
        console.log('creating list');
    }
    else {
        console.log(request.readyState);
    }
}

function displaySeasons(show_id) {
    try {
        request.onreadystatechange = getSeasons;
        request.open("GET", "/display_seasons?show=" + show_id, true);
        console.log('getting '+ "/display_seasons?show=" + show_id);
        request.send();
    }
    catch (e) {
        alert("can't get season list"); 
    }
}

function getSeasons() {
    if (request.readyState == 4)
    {
        var val = request.responseText;
        document.getElementById('programList').innerHTML = val;
        console.log(val);
    }
}

function displayEpisodes(show_id, season) {
    try {
        request.onreadystatechange = getSeasons;
        request.open("GET", "/display_episodes?show=" + show_id + "&season=" + season, true);
        request.send();
    }
    catch (e) {
        alert("can't get episode list"); 
    }
}

function getEpisodes() {
    if (request.readyState == 4)
    {
        var val = request.responseText;
        document.getElementById('programList').innerHTML = val;
    }
}
*/

function closeProgramList() {      
    programList.style.display = "none";
    programListX.style.display = "none";
}

function streamVideoMenu() {
    streamVideoModal.style.display = "flex";
    streamingInputBox.focus
}


function CloseStreamVideoMenu() {
    streamVideoModal.style.display = "none";
    chattext.focus();
}

window.onclick = function(event) { 
    if (event.target == streamVideoModal) {
        streamVideoModal.style.display = "none";
    }
}



  
var stare = document.getElementById("stare");
var heart = document.getElementById("heart");
var applause = document.getElementById("applause");
var cat = document.getElementById("cat");
var cry = document.getElementById("cry");
var celebrate = document.getElementById("celebrate");
var derp = document.getElementById("derp");
var horse = document.getElementById("horse");
var nope = document.getElementById("nope");
var ufo = document.getElementById("ufo");
var reactionsEnabled = [];
var stareAnim = document.getElementById("stareAnimIcon");
var heartAnim = document.getElementById("heartAnimIcon");
var applauseAnim = document.getElementById("applauseAnimIcon");
var cryAnim = document.getElementById("cryAnimIcon");
var catAnim = document.getElementById("catAnimIcon");
var celebrateAnim = document.getElementById("celebrateAnimIcon");
var derpAnim = document.getElementById("derpAnimIcon");
var horseAnim = document.getElementById("horseAnimIcon");
var nopeAnim = document.getElementById("nopeAnimIcon");
var ufoAnim = document.getElementById("ufoAnimIcon");
var stareBounce = new Bounce();
var heartBounce = new Bounce();
var applauseBounce = new Bounce();
var catBounce = new Bounce();
var celebrateBounce = new Bounce();
var cryBounce = new Bounce();
var derpBounce = new Bounce();
var horseBounce = new Bounce();
var nopeBounce = new Bounce();
var ufoBounce = new Bounce();
var off = document.getElementById("off");
var reactionsAnim = document.getElementById("reactionsAnim");
var reactionsDisabled = false;
var reactionsDiv = document.getElementById("reactions");

$("#off").click(function () { 
    if (reactionsDisabled == false){  
    reactionsDisabled = true;
    off.style.filter = "grayscale(100%)";
       off.style.position = "relative";
       off.style.top = "2px";   
       reactionsAnim.style.display = "none";
    stare.style.display = "none";
    heart.style.display = "none";
    applause.style.display = "none";
    cat.style.display = "none";
    celebrate.style.display = "none";
    cry.style.display = "none";
    derp.style.display = "none";
    horse.style.display = "none";
    nope.style.display = "none";
    ufo.style.display = "none";
    }
    else {

            reactionsDisabled = false;
    off.style.filter = "none";
       off.style.position = "relative";
       off.style.top = "2px";   
       reactionsAnim.style.display = "inline";
    stare.style.display = "flex";
    heart.style.display = "flex";
    applause.style.display = "flex";
    cat.style.display = "flex";
    celebrate.style.display = "flex";
    cry.style.display = "flex";
    derp.style.display = "flex";
    horse.style.display = "flex";
    nope.style.display = "flex";
    ufo.style.display = "flex";
    }
    
    });

if (reactionsDisabled == true) {
    reactionsAnim.style.display = "none";
    stare.style.display = "none";
    heart.style.display = "none";
    applause.style.display = "none";
    cat.style.display = "none";
    celebrate.style.display = "none";
    cry.style.display = "none";
    derp.style.display = "none";
    horse.style.display = "none";
    nope.style.display = "none";
    ufo.style.display = "none";
       
}

    $("#box").mouseenter(function (){
        $("#reactions").fadeIn(200);    
        reactionsEnabled[0] = true;
        reactionsEnabled[1] = true;
        reactionsEnabled[2] = true;
        reactionsEnabled[3] = true;
        reactionsEnabled[4] = true;
        reactionsEnabled[5] = true;
        reactionsEnabled[6] = true;
        reactionsEnabled[7] = true;
        reactionsEnabled[8] = true;
        reactionsEnabled[9] = true;


    });
    $("#box").mouseleave(function (){
        setTimeout(function(){$("#reactions").fadeOut(500);}, 2000);
        reactionsEnabled[0] = false;
        reactionsEnabled[1] = false;
        reactionsEnabled[2] = false;
        reactionsEnabled[3] = false;
        reactionsEnabled[4] = false;
        reactionsEnabled[5] = false;
        reactionsEnabled[6] = false;
        reactionsEnabled[7] = false;
        reactionsEnabled[8] = false;
        reactionsEnabled[9] = false;

    });
    stareBounce
        .translate({
    from: {x: 0, y:-250},
    to: {x: 400, y:-250}, 
    duration: 8000,
    stiffness: 10
     }).skew({
        from: { x:0, y:0 },
        to: {x:120, y:0},
        easing: "sway",
        duration: 1000,
        delay: 0, 
        bounces: 4,
        stiffness: 3});

   heartBounce
        .translate({
    from: {x: 500, y:0},
    to: {x: 500, y:-500}, 
    duration: 8000,
    stiffness: 10
     });

   applauseBounce
        .translate({
    from: {x: 500, y:0},
    to: {x: 500, y:-500}, 
    duration: 8000,
    stiffness: 10
     });

catBounce
        .translate({
    from: {x: 0, y:0},
    to: {x: 0, y:-400}, 
    duration: 8000,
    stiffness: 10
     });

celebrateBounce
        .translate({
    from: {x: 0, y:0},
    to: {x: 300, y:0}, 
    duration: 8000,
    stiffness: 10
     });
cryBounce
        .translate({
    from: {x: 500, y:0},
    to: {x: 500, y:-500}, 
    duration: 8000,
    stiffness: 10
     });
derpBounce
        .translate({
    from: {x: 0, y:0},
    to: {x: 0, y:0}, 
    duration: 8000,
    stiffness: 10
     });
horseBounce
        .translate({
    from: {x: 500, y:0},
    to: {x: 500, y:-250}, 
    duration: 8000,
    stiffness: 10
     });
nopeBounce
        .translate({
    from: {x: 500, y:-150},
    to: {x: 250, y:-150}, 
    duration: 8000,
    stiffness: 10
     });
ufoBounce
        .translate({
    from: {x: 500, y:0},
    to: {x: 500, y:-500}, 
    duration: 8000,
    stiffness: 10
     });

           
    $("#stare").click(function () {
        document.getElementById('reactionsAnim').innerHTML = `<div class="stareAnim"style="transform: scaleX(-1);-webkit-transform: scaleX(-1);"><img id="stareAnimIcon" src="stare.png" style="width: 3em; height: 3em; "></div>`;
     if (reactionsEnabled[0] == true)  { 
        reactionsEnabled[0] = false;
        stare.style.filter = "grayscale(100%)";
       stare.style.position = "relative";
       stare.style.top = "2px";   
        socket.emit('stare');
        jQuery("#stareAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#stareAnimIcon").fadeOut(1000);stare.style.filter = "none";}, 1000);
        setTimeout(function() {reactionsEnabled[0]=true;}, 1500);
    stareBounce.applyTo(stareAnimIcon);
    }
    });
  
  

     $("#stare").mouseup(function () {
  
       stare.style.position = "relative";
       stare.style.top = "0px";   
    });

   socket.on('stare', function() { if (reactionsEnabled[0] == true)  { 
       document.getElementById('reactionsAnim').innerHTML = `<div class="stareAnim"style="transform: scaleX(-1);-webkit-transform: scaleX(-1);"><img id="stareAnimIcon" src="stare.png" style="width: 3em; height: 3em; "></div>`;
     if (reactionsEnabled[0] == true)  { 
        reactionsEnabled[0] = false;
        stare.style.filter = "grayscale(100%)";
       stare.style.position = "relative";
       stare.style.top = "2px";   
        jQuery("#stareAnimIcon").fadeIn(200); 
        setTimeout(function(){jQuery("#stareAnimIcon").fadeOut(1000);stare.style.filter = "none";}, 1000);
        setTimeout(function() {reactionsEnabled[0]=true;}, 1500);
    stareBounce.applyTo(stareAnimIcon);
    }
    }});

$("#heart").mousedown(function () {
    document.getElementById('reactionsAnim').innerHTML = `<div class="heartAnim"><img id="heartAnimIcon" src="heart.gif" style="width: 20em; height: auto; "></div>`;
     if (reactionsEnabled[1] == true)  { 
        reactionsEnabled[1] = false;
        heart.style.filter = "grayscale(100%)";
        heart.style.position = "relative";
        heart.style.top = "2px";   
        socket.emit('heart');
        jQuery("#heartAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#heartAnimIcon").fadeOut(1000);heart.style.filter = "none";}, 1000);
        setTimeout(function() {reactionsEnabled[1]=true;}, 1500);
    heartBounce.applyTo(heartAnimIcon);
    }
    });
  
  

     $("#heart").mouseup(function () {
  
       heart.style.position = "relative";
       heart.style.top = "0px";   
    });

   socket.on('heart', function() { if (reactionsEnabled[1] == true)  { 
    document.getElementById('reactionsAnim').innerHTML = `<div class="heartAnim"><img id="heartAnimIcon" src="heart.gif" style="width: 20em; height: auto; "></div>`;

     if (reactionsEnabled[1] == true)  { 
        reactionsEnabled[1]= false;
        heart.style.filter = "grayscale(100%)";
        heart.style.position = "relative";
        heart.style.top = "2px";   
        socket.emit('heart');
        jQuery("#heartAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#heartAnimIcon").fadeOut(1000);heart.style.filter = "none";}, 1000);
        setTimeout(function() {reactionsEnabled[1]=true;}, 1500);
    heartBounce.applyTo(heartAnimIcon);
    }
    }});

$("#applause").mousedown(function () {
    document.getElementById('reactionsAnim').innerHTML = `<div class="applauseAnim"><img id="applauseAnimIcon" src="applause.gif" style="width: 15em; height: auto; "></div>`;

     if (reactionsEnabled[2] == true)  { 
        reactionsEnabled[2] = false;
        applause.style.filter = "grayscale(100%)";
        applause.style.position = "relative";
        applause.style.top = "2px";   
        socket.emit('applause');
        jQuery("#applauseAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#applauseAnimIcon").fadeOut(1000);applause.style.filter = "none";}, 1000);
        setTimeout(function() {reactionsEnabled[2]=true;}, 1500);
        applauseBounce.applyTo(applauseAnimIcon);
    }
    });
  
  

     $("#applause").mouseup(function () {
  
       applause.style.position = "relative";
       applause.style.top = "0px";   
    });

   socket.on('applause', function() { if (reactionsEnabled[2] == true)  { 
    document.getElementById('reactionsAnim').innerHTML = `<div class="applauseAnim"><img id="applauseAnimIcon" src="applause.gif" style="width: 15em; height: auto; "></div>`;

              if (reactionsEnabled[2] == true)  { 
        reactionsEnabled[2] = false;
        applause.style.filter = "grayscale(100%)";
        applause.style.position = "relative";
        applause.style.top = "2px";   
        socket.emit('applause');
        jQuery("#applauseAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#applauseAnimIcon").fadeOut(1000);applause.style.filter = "none";}, 1000);
        setTimeout(function() {reactionsEnabled[2]=true;}, 1500);
        applauseBounce.applyTo(applauseAnimIcon);
    }
    }});



    $("#cat").mousedown(function () {
        document.getElementById('reactionsAnim').innerHTML = `<div class="catAnim"><img id="catAnimIcon" src="cat.gif" style="width: 15em; height: auto; "></div>`;

     if (reactionsEnabled[3] == true)  { 
        reactionsEnabled[3] = false;
        cat.style.filter = "grayscale(100%)";
        cat.style.position = "relative";
        cat.style.top = "2px";   
        socket.emit('cat');
        jQuery("#catAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#catAnimIcon").fadeOut(1000);cat.style.filter = "none";}, 9000);
        setTimeout(function() {reactionsEnabled[3]=true;}, 9500);
        catBounce.applyTo(catAnimIcon);
    }
    });
  
  

     $("#cat").mouseup(function () {
  
       cat.style.position = "relative";
       cat.style.top = "0px";   
    });

   socket.on('cat', function() { if (reactionsEnabled[3] == true)  { 
    document.getElementById('reactionsAnim').innerHTML = `<div class="catAnim"><img id="catAnimIcon" src="cat.gif" style="width: 15em; height: auto; "></div>`;

              if (reactionsEnabled[3] == true)  { 
        reactionsEnabled[3] = false;
        cat.style.filter = "grayscale(100%)";
        cat.style.position = "relative";
        cat.style.top = "2px";   
        socket.emit('cat');
        jQuery("#catAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#catAnimIcon").fadeOut(1000);cat.style.filter = "none";}, 9000);
        setTimeout(function() {reactionsEnabled[3]=true;}, 9500);
        catBounce.applyTo(catAnimIcon);
    }
    }});
    $("#celebrate").mousedown(function () {
        
        document.getElementById('reactionsAnim').innerHTML = `<div class="celebrateAnim"><img id="celebrateAnimIcon" src="celebrate.gif" style="width: 50em; height: auto; "></div>`;

     if (reactionsEnabled[4] == true)  { 
        reactionsEnabled[4] = false;
        celebrate.style.filter = "grayscale(100%)";
        celebrate.style.position = "relative";
        celebrate.style.top = "2px";   
        socket.emit('celebrate');
        jQuery("#celebrateAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#celebrateAnimIcon").fadeOut(1000);celebrate.style.filter = "none";}, 1000);
        setTimeout(function() {reactionsEnabled[4]=true;}, 1500);
        celebrateBounce.applyTo(celebrateAnimIcon);
    }
    });
  
  

     $("#celebrate").mouseup(function () {
  
       celebrate.style.position = "relative";
       celebrate.style.top = "0px";   
    });

   socket.on('celebrate', function() { if (reactionsEnabled[4] == true)  { 
    document.getElementById('reactionsAnim').innerHTML = `<div class="celebrateAnim"><img id="celebrateAnimIcon" src="celebrate.gif" style="width: 50em; height: auto; "></div>`;

              if (reactionsEnabled[4] == true)  { 
        reactionsEnabled[4] = false;
        celebrate.style.filter = "grayscale(100%)";
        celebrate.style.position = "relative";
        celebrate.style.top = "2px";   
        socket.emit('celebrate');
        jQuery("#celebrateAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#celebrateAnimIcon").fadeOut(1000);celebrate.style.filter = "none";}, 1000);
        setTimeout(function() {reactionsEnabled[4]=true;}, 1500);
        celebrateBounce.applyTo(celebrateAnimIcon);
    }
    }});
$("#cry").mousedown(function () {
    document.getElementById('reactionsAnim').innerHTML = `<div class="cryAnim"><img id="cryAnimIcon" src="cry.gif" style="width: 15em; height: auto; "></div>`;

     if (reactionsEnabled[5] == true)  { 
        reactionsEnabled[5] = false;
        cry.style.filter = "grayscale(100%)";
        cry.style.position = "relative";
        cry.style.top = "2px";   
        socket.emit('cry');
        jQuery("#cryAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#cryAnimIcon").fadeOut(1000);cry.style.filter = "none";}, 1000);
        setTimeout(function() {reactionsEnabled[5]=true;}, 1500);
        cryBounce.applyTo(cryAnimIcon);
    }
    });
  
  

     $("#cry").mouseup(function () {
  
       cry.style.position = "relative";
       cry.style.top = "0px";   
    });

   socket.on('cry', function() { if (reactionsEnabled[5] == true)  { 
    document.getElementById('reactionsAnim').innerHTML = `<div class="cryAnim"><img id="cryAnimIcon" src="cry.gif" style="width: 15em; height: auto; "></div>`;

              if (reactionsEnabled[5] == true)  { 
        reactionsEnabled[5] = false;
        cry.style.filter = "grayscale(100%)";
        cry.style.position = "relative";
        cry.style.top = "2px";   
        socket.emit('cry');
        jQuery("#cryAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#cryAnimIcon").fadeOut(1000);cry.style.filter = "none";}, 1000);
        setTimeout(function() {reactionsEnabled[5]=true;}, 1500);
        cryBounce.applyTo(cryAnimIcon);
    }
    }});
    $("#derp").mousedown(function () {
        document.getElementById('reactionsAnim').innerHTML = `<div class="derpAnim"><img id="derpAnimIcon" src="derp.gif" style="width: 30em; height: auto; "></div>`;

     if (reactionsEnabled[6] == true)  { 
        reactionsEnabled[6] = false;
        derp.style.filter = "grayscale(100%)";
        derp.style.position = "relative";
        derp.style.top = "2px";   
        socket.emit('derp');
        jQuery("#derpAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#derpAnimIcon").fadeOut(1000);derp.style.filter = "none";}, 3500);
        setTimeout(function() {reactionsEnabled[6]=true;}, 4000);
        derpBounce.applyTo(derpAnimIcon);
    }
    });
  
  

     $("#derp").mouseup(function () {
  
       derp.style.position = "relative";
       derp.style.top = "0px";   
    });

   socket.on('derp', function() { if (reactionsEnabled[46] == true)  { 
    document.getElementById('reactionsAnim').innerHTML = `<div class="derpAnim"><img id="derpAnimIcon" src="derp.gif" style="width: 30em; height: auto; "></div>`;

              if (reactionsEnabled[6] == true)  { 
        reactionsEnabled[6] = false;
        derp.style.filter = "grayscale(100%)";
        derp.style.position = "relative";
        derp.style.top = "2px";   
        socket.emit('derp');
        jQuery("#derpAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#derpAnimIcon").fadeOut(1000);derp.style.filter = "none";}, 3500);
        setTimeout(function() {reactionsEnabled[6]=true;}, 4000);
        derpBounce.applyTo(derpAnimIcon);
    }
    }});
    $("#horse").mousedown(function () {
        document.getElementById('reactionsAnim').innerHTML = `<div class="horseAnim"><img id="horseAnimIcon" src="horse.gif" style="width: 45em; height: auto; "></div>`;

     if (reactionsEnabled[7] == true)  { 
        reactionsEnabled[7] = false;
        horse.style.filter = "grayscale(100%)";
        horse.style.position = "relative";
        horse.style.top = "2px";   
        socket.emit('horse');
        jQuery("#horseAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#horseAnimIcon").fadeOut(1000);horse.style.filter = "none";}, 4000);
        setTimeout(function() {reactionsEnabled[7]=true;}, 4500);
        horseBounce.applyTo(horseAnimIcon);
    }
    });
  
  

     $("#horse").mouseup(function () {
  
       horse.style.position = "relative";
       horse.style.top = "0px";   
    });

   socket.on('horse', function() { if (reactionsEnabled[7] == true)  { 
    document.getElementById('reactionsAnim').innerHTML = `<div class="horseAnim"><img id="horseAnimIcon" src="horse.gif" style="width: 45em; height: auto; "></div>`;

              if (reactionsEnabled[7] == true)  { 
        reactionsEnabled[7] = false;
        horse.style.filter = "grayscale(100%)";
        horse.style.position = "relative";
        horse.style.top = "2px";   
        socket.emit('horse');
        jQuery("#horseAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#horseAnimIcon").fadeOut(1000);horse.style.filter = "none";}, 4000);
        setTimeout(function() {reactionsEnabled[7]=true;}, 4500);
        horseBounce.applyTo(horseAnimIcon);
    }
    }});
    $("#nope").mousedown(function () {
        document.getElementById('reactionsAnim').innerHTML = `<div class="nopeAnim"><img id="nopeAnimIcon" src="nope.gif" style="width: 50em; height: auto; "></div>`;

     if (reactionsEnabled[8] == true)  { 
        reactionsEnabled[8] = false;
        nope.style.filter = "grayscale(100%)";
        nope.style.position = "relative";
        nope.style.top = "2px";   
        socket.emit('nope');
        jQuery("#nopeAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#nopeAnimIcon").fadeOut(1000);nope.style.filter = "none";}, 3000);
        setTimeout(function() {reactionsEnabled[8]=true;}, 3500);
        nopeBounce.applyTo(nopeAnimIcon);
    }
    });
  
  

     $("#nope").mouseup(function () {
  
       nope.style.position = "relative";
       nope.style.top = "0px";   
    });

   socket.on('nope', function() { if (reactionsEnabled[8] == true)  { 
    document.getElementById('reactionsAnim').innerHTML = `<div class="nopeAnim"><img id="nopeAnimIcon" src="nope.gif" style="width: 50em; height: auto; "></div>`;

              if (reactionsEnabled[8] == true)  {  
        reactionsEnabled[8] = false;
        nope.style.filter = "grayscale(100%)";
        nope.style.position = "relative";
        nope.style.top = "2px";   
        socket.emit('nope');
        jQuery("#nopeAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#nopeAnimIcon").fadeOut(1000);nope.style.filter = "none";}, 3000);
        setTimeout(function() {reactionsEnabled[8]=true;}, 3500);
        nopeBounce.applyTo(nopeAnimIcon);
    }
    }});

     $("#ufo").mouseup(function () {
  
       ufo.style.position = "relative";
       ufo.style.top = "0px";   
    });

   socket.on('ufo', function() { if (reactionsEnabled[9] == true)  { 
    document.getElementById('reactionsAnim').innerHTML = `<div class="ufoAnim"><img id="stareAnimIcon" src="ufo.gif" style="width: 30em; height: auto; "></div>`;

              if (reactionsEnabled[9] == true)  { 
        reactionsEnabled[9] = false;
        ufo.style.filter = "grayscale(100%)";
        ufo.style.position = "relative";
        ufo.style.top = "2px";   
        socket.emit('ufo');
        jQuery("#ufoAnimIcon").fadeIn(200);   
        setTimeout(function(){jQuery("#ufoAnimIcon").fadeOut(1000);ufo.style.filter = "none";}, 2000);
        setTimeout(function() {reactionsEnabled[9]=true;}, 2500);
        ufoBounce.applyTo(ufoAnimIcon);
    }
    }});

    $("#ufo").mousedown(function () {
        document.getElementById('reactionsAnim').innerHTML = `<div class="ufoAnim"><img id="stareAnimIcon" src="ufo.gif" style="width: 30em; height: auto; "></div>`;

        if (reactionsEnabled[9] == true)  { 
            reactionsEnabled[9] = false;
            ufo.style.filter = "grayscale(100%)";
            ufo.style.position = "relative";
            ufo.style.top = "2px";   
            socket.emit('ufo');
            jQuery("#ufoAnimIcon").fadeIn(200);   
            setTimeout(function(){jQuery("#ufoAnimIcon").fadeOut(1000);ufo.style.filter = "none";}, 2000);
            setTimeout(function() {reactionsEnabled[9]=true;}, 2500);
            ufoBounce.applyTo(ufoAnimIcon);
        }
    });


    document.addEventListener(
        "DOMContentLoaded", () => {
          const menu = new Mmenu( "#my-menu", {
            //options
            //"dividers": {
             // "add": true
            //},
            lazySubmenus: {
                "load" : true
            },
            "setSelected": {
              "hover": true,
              "parent": true
            },
            //"sectionIndexer": true,
            extensions: [
                          "theme-black", 
                          "shadow-page",
                          "shadow-menu",
                          "shadow-panels",
                          "fx-menu-slide",
                          "fx-panels-slide-100",
                          "multiline"
                        ],
            navbars : [
            /*{
                "position": "top",
                "content": [
                    "searchfield"
                ]
            },*/ {
                "position": "top",
                "content": [
                  "prev",
                  "breadcrumbs",
                  "close"
                ]
              }
            ],
          /*"searchfield": {
            "panel": true,
            "showTextItems": true,
         }*/
        }, {
            //config
            /*searchfield: {
              clear: true
            },*/
            /*navbars: {
              breadcrumbs: {
                removeFirst: true
              }
            },*/
            offCanvas: {
                page: {
                    selector: "#my-page"
                }
            }
        });
        const api = menu.API;
        document.querySelector( "#my-open-button" )
            .addEventListener(
                "click", (evnt) => {
                    evnt.preventDefault();


                        console.log(Cookies.get('language'));
                        console.log(Cookies.get('subtitles'));

                        /*try {
                            request.onreadystatechange = getProgramListing;
                            request.open("GET", "/display_shows", true);
                            console.log('getting /display_shows');
                            request.send();
                            const panel = document.querySelector("#my-list");
                            const listview = panel.querySelector( ".mm-listview" );
                            const listitem = document.createElement( "li" );
                            listitem.innerHTML = `<a href="/">Site</a>`;
                            listview.append(listitem);
                            api.initListview(listview);
                        }
                        catch(e) {
                          alert("can't connect to server");
                          console.log(e);
                        }*/
                    api.open();

                }
            )
          }
      );

function set_subtitles() {
    Cookies.set('subtitles', subtitleCheck.checked? 1: 0, {expires: 100});
}

function set_language() {
    Cookies.set('language', languageCheck.checked? 1: 0, {expires: 100});
}

// Create a local Room instance associated to the remote Room.
const room = new mediasoupClient.Room();
// Transport for sending our media.
let sendTransport;
// Transport for receiving media from remote Peers.
let recvTransport;

console.debug('ROOM:', room);

room.join(username)
  .then((peers) => {
    console.debug('PEERS:', peers);

    // Create the Transport for sending our media.
    sendTransport = room.createTransport('send');
    // Create the Transport for receiving media from remote Peers.
    recvTransport = room.createTransport('recv');

    peers.forEach(peer => handlePeer(peer));
  })
  .then(() => {
    // Get our mic and camera
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
  })
  .then((stream) => {
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

      // Show local stream
      
      const localStream = new MediaStream([videoTrack, audioTrack]);
      const video = document.createElement('video');
      video.setAttribute('style', 'max-width: 400px;');
      video.srcObject = localStream;
      document.getElementById('video-container').appendChild(video);
      video.play();

    // Create Producers for audio and video.
    const audioProducer = room.createProducer(audioTrack);
    const videoProducer = room.createProducer(videoTrack);

    // Send our audio.
    audioProducer.send(sendTransport);
    // Send our video.
    videoProducer.send(sendTransport);
  });

// Event fired by local room when a new remote Peer joins the Room
room.on('newpeer', (peer) => {
  console.debug('A new Peer joined the Room:', peer.name);

  // Handle the Peer.
  handlePeer(peer);
});

// Event fired by local room
room.on('request', (request, callback, errback) => {
  console.debug('REQUEST:', request);
  socket.emit('mediasoup-request', request, (err, response) => {
    if (!err) {
      // Success response, so pass the mediasoup response to the local Room.
      callback(response);
    } else {
      errback(err);
    }
  });
});

// Be ready to send mediaSoup client notifications to our remote mediaSoup Peer
room.on('notify', (notification) => {
  console.debug('New notification from local room:', notification);
  socket.emit('mediasoup-notification', notification);
});

// Handle notifications from server, as there might be important info, that affects stream
socket.on('mediasoup-notification', (notification) => {
  console.debug('New notification came from server:', notification);
  room.receiveNotification(notification);
});


function handlePeer(peer) {
  // Handle all the Consumers in the Peer.
  peer.consumers.forEach(consumer => handleConsumer(consumer));

  // Event fired when the remote Room or Peer is closed.
  peer.on('close', () => {
    console.log('Remote Peer closed');
  });

  // Event fired when the remote Peer sends a new media to mediasoup server.
  peer.on('newconsumer', (consumer) => {
    console.log('Got a new remote Consumer');

    // Handle the Consumer.
    handleConsumer(consumer);
  });
}


function handleConsumer(consumer) {
  // Receive the media over our receiving Transport.
  consumer.receive(recvTransport)
    .then((track) => {
      console.debug('Receiving a new remote MediaStreamTrack:', consumer.kind);

      // Attach the track to a MediaStream and play it.
      const stream = new MediaStream();
      stream.addTrack(track);

      if (consumer.kind === 'video') {
        const video = document.createElement('video');
        video.setAttribute('style', 'max-width: 400px;');
        video.setAttribute('playsinline', '');
        video.srcObject = stream;
        document.getElementById('video-container').appendChild(video);
        video.play();
      }
      if (consumer.kind === 'audio') {
        const audio = document.createElement('audio');
        audio.srcObject = stream;
        document.getElementById('video-container').appendChild(audio);
        audio.play();
      }
    });

  // Event fired when the Consumer is closed.
  consumer.on('close', () => {
    console.log('Consumer closed');
  });
}