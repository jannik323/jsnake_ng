"use strict";

let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");
ctx.lineWidth = 1;

const KEYS = {};
const FOODS = [];
const BODIES = [];

let touch = "none";
let debug = false;

const PI = Math.PI;


// local storage keybinds
const KEYBINDS = {

    Left:[],
    Right:[],
    Boost:[],   

}

if (localStorage.keybinds) {
    let actions = localStorage.keybinds.split(" ");
    actions.forEach((v,i)=>{
        
        actions[i] = v.split(",");
        
    });

    console.log(actions)
    resetKeybinds(actions[0],actions[1],actions[2]);
    savekeybinds()
}else{
    resetKeybinds();
    savekeybinds()
    
}






 // make butttons for keybinds in menu

for(let action in KEYBINDS){
    let parent = document.getElementById('keybindmenu');
    let div = document.createElement('div');
    div.innerHTML = action + " :";
    div.value = action ;
    div.classList.add("Keybinddiv");
    parent.appendChild(div);


    let button = document.createElement('button');
    button.innerHTML = KEYBINDS[action][0];
    button.classList.add("keybindbtn");
    button.addEventListener("click", ()=>{setkeybindbtn(button)});
    div.appendChild(button);

    let array = document.createElement('input');
    array.value = KEYBINDS[action]
    array.disabled = true;
    // textarea.classList.add("menubtn");
    div.appendChild(array);

    // typeoption.value = v.name;

}
let parent = document.getElementById('keybindmenu');
let button = document.createElement('button');
    button.innerHTML = "Save Keyinds"
    button.classList.add("menubtn","margin-top");
    button.addEventListener("click", ()=>{savekeybinds()});
    parent.appendChild(button);


// end of making shit for html

const FOODTYPES = ["boost","ghost","speed","nospeed","bigbutt","spawn","randomgrow","boost","ghost","speed","randomgrow","spawn","randomgrow"]
const SPAWNFOOD = ["grow","grow","grow","grow","randomgrow","randomgrow","randomgrow"];

const POWERUPS = [];

const fart = new Audio("fart.mp3"); 
let playfarts = false;
let menu = false;
let rgbmode = false;
let highscore = localStorage.getItem("highscore"); 
let score = 0;

// local storage

let smoothsnakemode;
if (localStorage.smoothsnakemode) {

    if(localStorage.smoothsnakemode === "true"){
        smoothsnakemode = true;
    }else{
        smoothsnakemode = false;
    }
    
}else{
    localStorage.smoothsnakemode = true;
    smoothsnakemode = true;
}




// food class

class food{

    constructor(x,y,type){

        this.x = x;
        this.y = y;
        this.type = type;
        this.assigntype();
        this.randomloc();

    }

    update(i){


    }


    render(){

        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.arc(this.x-this.size/100,this.y-this.size/100, this.size, 0, 2 * PI);
        ctx.fillStyle = this.color ;
        ctx.fill();
        ctx.stroke(); 

    }

    randomloc(){

        this.x = randomrange(this.size,canvas.width-this.size);
        this.y = randomrange(this.size,canvas.height-this.size);
    }

    randomtype(){

        this.type = FOODTYPES[randomrange(0,FOODTYPES.length-1)];
        this.assigntype();
        this.randomloc();
    }

    assigntype(){

        switch(this.type){
            case "randomgrow":
            case "grow":
                this.size = 8;
                this.color = "red";
                break;
            case "boost":
                this.size = 7;
                this.color = "blue";
                break;
            case "ghost":
                this.size = 10;
                this.color = "grey";
                break;
            case "speed":
                this.size = 6;
                this.color = "yellow";
                break;
            case "nospeed":
                this.size = 6;
                this.color = "#6a6a16";
                break;
            case "bigbutt":
                this.size = 12;
                this.color = "brown";
                break;
            case "tempgrow":
                this.size = 8;
                this.color = "darkred";
                break;
            case "spawn":
                this.size = 15;
                this.color ="#004a00";
                break;
            
            default:
                this.size = 40;
                this.color = "pink";
                break;
        }
    }

}

//class body 

class body{


    constructor(x,y,size,parent,visbile){

        this.x = x;
        this.y = y;
        this.dir = 0;
        this.sizedefault = size;
        this.size = this.sizedefault;
        this.parent = parent;
        this.color = this.parent.color;
        this.bodypos = 0;
        this.eating = false;
        this.delayeat = false;
        this.visbile = visbile
        this.sides = {left:0,right:0}
    }

    update(bodyI = 0){

        // moving the body to the tail

        for(let i= snake1.POSITIONS.length-1-this.parent.bodypos; i>0 ;i--){

            this.x = snake1.POSITIONS[i].x;
            this.y = snake1.POSITIONS[i].y;
            this.dir = snake1.POSITIONS[i].dir + PI/2;
            if(distance(this.x,this.parent.x,this.y,this.parent.y) > this.size+this.parent.size){
                this.bodypos = snake1.POSITIONS.length-1-i;
                break;
            }

        }

        // eating logic
        
        if(this.parent.eating === true){
            this.parent.eating = false;
            if(bodyI !== BODIES.length-1){
                this.delayeat = true;
                setTimeout(() => {
                    this.eating = true;
                    this.delayeat = false;
                    
                }, 30);
        }else{this.visbile = true;}}

        if(this.delayeat){
            this.size = this.sizedefault +4;
        }else{
            this.size = this.sizedefault;
        }

        if(bodyI !== BODIES.length-1 && !this.visbile ){this.visbile = true}


        // calculate sides

        this.sides.left = {x:this.x -Math.cos(this.dir)*this.size, y:this.y - Math.sin(this.dir)*this.size};
        this.sides.right = {x:this.x +Math.cos(this.dir)*this.size,y:this.y + Math.sin(this.dir)*this.size};


        // color

        this.color = this.parent.color;
    }


    render(end){

        

        if(this.visbile){
        ctx.beginPath();
        ctx.strokeStyle = "black";

        if(BODIES.length>0 && end){
            ctx.arc(this.x-this.size/100,this.y-this.size/100, this.size, this.dir ,this.dir + PI)}else{
            ctx.arc(this.x-this.size/100,this.y-this.size/100, this.size, 0,PI*2)
            }

        ctx.fillStyle = this.color ;
        ctx.fill();
        ctx.stroke(); 
    }
        

    }

    shrinkToParent(){
        if(this.parent.bodypos === 0){
        this.sizedefault = this.parent.size *0.99;}
        else{
        this.sizedefault = this.parent.sizedefault *0.99;
        }
    }



}


// snake class

class snake{ 

    constructor(x,y,dir,acc,size){

        this.x = x;
        this.y = y;
        this.dir = dir;
        this.acc = acc;
        this.speed = 0;
        this.dir_v = 0;
        this.size = size;
        this.snakelength = 0;
        this.speedboost = 300;
        this.hue = 126
        this.colordefault = "hsl("+this.hue +", 59%, 61%)"
        this.color = this.colordefault;
        this.POSITIONS = []; 
        this.bodypos = 0;  
        this.nocolbod = false;    
        this.eating = false;
        this.sides = {left:0,right:0}


    }

    update(){

        if(rgbmode){this.hue ++; this.colordefault = "hsl("+this.hue +", 59%, 61%)";}
        

        this.POSITIONS.push({x:this.x,y:this.y,dir:this.dir}); 
        

        this.x += Math.cos(this.dir)*this.speed;
        this.y += Math.sin(this.dir)*this.speed;
        this.dir += this.dir_v;
        this.speed *= 0.9;
        this.dir_v *= 0.84;
        this.color = this.colordefault;
        if(this.speedboost < 300){this.speedboost += 1;}
        this.speed += this.acc;


        if( KEYBINDS["Left"].some(keybindcheck) || touch === "left"){
            this.dir_v -= 0.05;
            this.speed *= 1 + Math.abs(this.dir_v)/5;
        }

                        // if(this.dir_v <0){this.dir_v += 0.1}

        if( KEYBINDS["Right"].some(keybindcheck) || touch === "right" ){
            this.dir_v += 0.05;
            this.speed *= 1 + Math.abs(this.dir_v)/5;
        }

        if( KEYBINDS["Boost"].some(keybindcheck) && this.speedboost >10 || touch=== "boost" && this.speedboost >10 ){
            this.speed *= 1.03;
            this.speedboost -= 10;
        }
        
        // walls collision

        if(this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height){location.reload();}
            
        

        // food detection
    
        if (FOODS.length !== 0){ 

            FOODS.forEach((v,i)=>{

                let fooddistance = distance(this.x,v.x,this.y,v.y);
                if(fooddistance < this.size+v.size){
                    if(playfarts){fart.play()}
                    score++;
                    if(score>highscore){localStorage.setItem("highscore", score); highscore=score;}
                    switch(v.type){

                        case "grow":
                            v.randomloc();
                            this.snakelength += 1;
                            break;
                        case "randomgrow":
                            v.randomtype()
                            this.snakelength += 1;
                            break;
                        case "boost":
                            v.randomtype()
                            this.speedboost +=300;
                            break;
                        case "ghost":
                            v.randomtype()
                            this.nocolbod = true;
                            POWERUPS.push("Ghost");
                            setTimeout(()=>{
                                this.nocolbod = false;
                                let delI = POWERUPS.findIndex((v)=>{v === "Ghost"});
                                POWERUPS.splice(delI,1);                                
                            },10000)
                            break;
                        case "speed":
                            v.randomtype()
                            this.acc *=1.5;
                            POWERUPS.push("Speed-Up");
                            setTimeout(()=>{
                                this.acc /= 1.5;
                                let delI = POWERUPS.findIndex((v)=>{v === "Speed-Up"});
                                POWERUPS.splice(delI,1);     
                                
                            },10000)
                            break;
                        case "nospeed":
                            v.randomtype()
                            this.acc /= 1.5;
                            POWERUPS.push("Speed-Down");
                            setTimeout(()=>{
                                this.acc *= 1.5;
                                let delI = POWERUPS.findIndex((v)=>{v === "Speed-Down"});
                                POWERUPS.splice(delI,1);  
                                
                            },10000)
                            break;
                        case "bigbutt":
                            v.randomtype()
                            BODIES[BODIES.length-1].sizedefault += 4;
                            break;
                        case "tempgrow":
                            FOODS.splice(i,1);
                            this.snakelength += 1;
                            break;
                        case "spawn":
                            v.randomtype()
                            let spawnamount = 5;
                            for(let i = 0;i<spawnamount; i++){
                                const new_food = new food(0,0,"tempgrow");
                                FOODS.push(new_food);}
                            break;
                        default:
                        console.log("wtf are you eating snake?");
                        break;
                }

                }  
            })
        }

        // body detection

        if (BODIES.length !== 0 && !this.nocolbod ){ 

            BODIES.forEach((v,i)=>{

                if(i !==0){
                let bodydistance = distance(this.x,v.x,this.y,v.y);
                if (bodydistance < this.size+v.size){
                    
                    location.reload();

                }
                }


            })



        }

        //pos size detection


        if(BODIES.length>0){
        let bodysize = BODIES[BODIES.length-1].bodypos;
        if(this.POSITIONS.length > bodysize*2){
            snake1.POSITIONS = snake1.POSITIONS.slice(bodysize/2,snake1.POSITIONS.length);
        }}
        

        // calculate sides

        this.sides.left = {x:this.x -Math.cos(this.dir+PI/2)*this.size, y:this.y - Math.sin(this.dir+PI/2)*this.size};
        this.sides.right = {x:this.x +Math.cos(this.dir+PI/2)*this.size,y:this.y + Math.sin(this.dir+PI/2)*this.size};



    }

    render(x = false){
        

        ctx.beginPath();
        ctx.strokeStyle = "black";
        if(BODIES.length>0 && x ){
        ctx.arc(this.x-this.size/100,this.y-this.size/100, this.size, this.dir - PI/2,this.dir + PI*1/2)}
        else{
        ctx.arc(this.x-this.size/100,this.y-this.size/100, this.size, 0,PI*2)
        }

        ctx.fillStyle = this.color;
        ctx.fill()
        ctx.stroke(); 
        

        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.strokeStyle = "darkred";
        ctx.moveTo(this.x,this.y);
        ctx.lineTo(this.x +Math.cos(this.dir)*this.size, this.y + Math.sin(this.dir)*this.size);
        ctx.stroke();
        ctx.lineWidth = 1; 


        // text

        ctx.strokeStyle = "black";
        ctx.strokeText( "Speed : "+this.speed.toFixed(2), 5, 20);
        ctx.strokeText("Length : "+Math.round(this.snakelength), 5, 40);
        ctx.strokeText("Boost : "+Math.round(this.speedboost), 5, 60);
        ctx.strokeText("Score : "+score, 5, 80);
        ctx.strokeText("Highscore : "+highscore, 5, 100);
        if(debug){
            ctx.strokeText("dirv : "+this.dir_v, 5, 120);
            ctx.strokeText("POS : "+this.POSITIONS.length, 5, 140);
            ctx.strokeText("nocolbod : "+ this.nocolbod, 5, 160);
            ctx.strokeText("acceleration : "+ this.acc, 5, 180);
        }

    }

}



// make snake , food , body

const snake1 = new snake(canvas.width/2,canvas.height/2,0,0.5,10)

for(let i = 0; i< SPAWNFOOD.length; i++){
const new_food = new food(0,0,SPAWNFOOD[i]);
FOODS.push(new_food);
}

// game loop 

window.requestAnimationFrame(main); 

let lastRenderTime = 0;
let GameSpeed = 30;
let lastGameSpeed = 30;

function main(currentTime){
    window.requestAnimationFrame(main);
    const sslr = (currentTime- lastRenderTime)/1000
    if (sslr < 1 / GameSpeed) {return}
    lastRenderTime = currentTime;  
    render();
    update();
}



function update(){

if(snake1.snakelength !== BODIES.length){

    if(snake1.snakelength < 2){

        const new_body = new body(0,0,10,snake1,true)
        new_body.shrinkToParent();
        BODIES.push(new_body);

    }else{
        addbody(false);
        snake1.eating = true;}
    
}

snake1.update();
FOODS.forEach((v,i)=>{v.update(i);})
BODIES.forEach((v,i)=>{v.update(i);})

}

function render(){

ctx.clearRect(0,0,canvas.width,canvas.height)


if(smoothsnakemode){
    snake1.render(true);
}else{
    snake1.render(false);
}


FOODS.forEach((v)=>{v.render();})


if(smoothsnakemode){
if(BODIES.length > 0){
    let lastbody = BODIES[BODIES.length-1];
    if(lastbody.visbile){
    lastbody.render(true);
    }else{
    BODIES[BODIES.length-2].render(true);
    }
}}else{
    BODIES.forEach((v)=>{v.render(false);})

}


// debug  POSITION line

if(debug){
ctx.beginPath();
ctx.moveTo(snake1.POSITIONS[0].x,snake1.POSITIONS[0].y);
snake1.POSITIONS.forEach((v,i)=>{ctx.lineTo(v.x,v.y);})
ctx.stroke()}


// smooth body 

if(BODIES.length>0 && smoothsnakemode){
ctx.fillStyle = snake1.color;
ctx.strokeStyle = "black";
ctx.lineJoin = "round";
ctx.beginPath();
ctx.moveTo(snake1.sides.left.x,snake1.sides.left.y);
BODIES.forEach(v=>{if(v.visbile){ctx.lineTo(v.sides.left.x,v.sides.left.y)}})
BODIES.slice().reverse().forEach(v=>{if(v.visbile){ctx.lineTo(v.sides.right.x,v.sides.right.y)}})
ctx.lineTo(snake1.sides.right.x,snake1.sides.right.y);
ctx.fill();
ctx.stroke();


ctx.strokeStyle = snake1.color;
ctx.lineWidth = 2;

let lastbody = BODIES[BODIES.length-1];
if(lastbody.visbile){
    ctx.beginPath();
    ctx.moveTo(lastbody.sides.right.x,lastbody.sides.right.y);
    ctx.lineTo(lastbody.sides.left.x,lastbody.sides.left.y);
    ctx.stroke();
}else{
    ctx.beginPath();
    ctx.moveTo(BODIES[BODIES.length-2].sides.right.x,BODIES[BODIES.length-2].sides.right.y);
    ctx.lineTo(BODIES[BODIES.length-2].sides.left.x,BODIES[BODIES.length-2].sides.left.y);
    ctx.stroke();
}


ctx.strokeStyle = "black";
ctx.lineJoin="miter";
ctx.lineWidth = 1;


}

// end of smooth body




for(let i = 0;i<POWERUPS.length;i++){
    ctx.strokeText(POWERUPS[i], 100, (i+1) * 20 );
}

}

//distance

function distance(x1,x2,y1,y2){

return Math.sqrt(((x2-x1)**2)+((y2-y1)**2));

}

//add body

function addbody(visbile){

    const new_body = new body(0,0,10,BODIES[BODIES.length-1],visbile);
    new_body.shrinkToParent();
    BODIES.push(new_body);

}

//random num

function randomrange(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}


//toggles

function togglePause(){
    let menudiv = document.getElementById("pausemenu");

    let keybind = document.getElementById("keybindmenu");
    keybind.style.display = "none";
    let settings = document.getElementById("settingsmenu");
    settings.style.display = "none";

    if(GameSpeed === 0){
        GameSpeed = lastGameSpeed; 
        menu = false;
        menudiv.style.display = "none";

    }else{
        GameSpeed = 0; 
        menu = true;
        menudiv.style.display = "flex";

    }

    

}

function Pause(){
    let menudiv = document.getElementById("pausemenu");
    GameSpeed = 0; 
    menu = true;
    menudiv.style.display = "flex";
}


function toggledebug(){
    
    if(debug){
        debug = false;
    }else{
        debug = true;
    }
}

function togglesnakestyle(){
    
    if(smoothsnakemode){
        smoothsnakemode = false;
        localStorage.smoothsnakemode = false;

    }else{
        smoothsnakemode = true;
        localStorage.smoothsnakemode = true;

    }
}

function toggleMenu(id){

    let keybind = document.getElementById(id);
    if(keybind.style.display==="flex"){
        keybind.style.display = "none";
    }else{
        keybind.style.display = "flex";

    }
}




// check if is keybind

function keybindcheck(key){return KEYS[key]}

// setkeybindbtn

function setkeybindbtn(btn){
    btn.innerHTML = "Press a Key"
    btn.addEventListener("keydown",e=>{
        btn.innerHTML  = e.key ;
        let keyI = KEYBINDS[btn.parentElement.value].findIndex(v=>{return v === e.key;})
        if(keyI === -1){
            KEYBINDS[btn.parentElement.value].push(e.key );
        }else{
            KEYBINDS[btn.parentElement.value].splice(keyI,1);
        }

        btn.parentElement.lastChild.value = KEYBINDS[btn.parentElement.value];

       
    }, {once: true});
    
    
}

// reset

function resetKeybinds(Left = ["a"],Right = ["d"],Boost = ["w"]){
    KEYBINDS.Left = Left
    KEYBINDS.Right = Right
    KEYBINDS.Boost = Boost

    let Keybinddiv = document.getElementById("keybindmenu");
    for(let i = 3;i< Keybinddiv.children.length; i++){
        console.log(Keybinddiv.children[i].childNodes[2]);
        Keybinddiv.children[i].childNodes[2].value = KEYBINDS[Keybinddiv.children[i].value];
    }

}


// save keybinds

function savekeybinds(){

    let keystring = "" ;
    for(let a in KEYBINDS){
        keystring = keystring + " "+ KEYBINDS[a].toString(); 
    }
    keystring = keystring.slice(1);
    console.log("save key: '"+ keystring+ "'")
    localStorage.keybinds = keystring;
}



addEventListener("keydown", e => {
    // console.log("key: ",e.key);
    KEYS[e.key] = true;
});

addEventListener("keypress",e=>{
    switch(e.key){
        case "p":
            togglePause();
            break;
        case "j":
            toggledebug();
        default:
            break;
    }

})

addEventListener("keyup", e => {
    KEYS[e.key] = false;
});

addEventListener("touchstart", e =>{    
if(e.touches.length >1){touch = "boost"}else{
if (e.touches[0].clientX > canvas.width/2){
touch = "right";
}else{
touch = "left";
}}
})

addEventListener("touchend", () =>{
    touch = "none";
})
