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
