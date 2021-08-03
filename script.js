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

const KEYBINDS = {

    Left:["a"],
    Right:["d"],
    Boost:["w"],   




}
 // make butttons for keybinds in menu

for(let action in KEYBINDS){
    let parent = document.getElementById('keybindmenu');
    let div = document.createElement('div');
    div.innerHTML = action + ": ";
    div.value = action ;
    div.classList.add("Keybinddiv");
    parent.appendChild(div);
    let button = document.createElement('button');
    button.innerHTML = KEYBINDS[action][0];
    button.value = 0 ;
    button.classList.add("menubtn");
    button.addEventListener("click", ()=>{setkeybindbtn(button)});
    div.appendChild(button);

    // typeoption.value = v.name;

}

const FOODTYPES = ["boost","ghost","speed","nospeed","bigbutt","spawn","randomgrow"]
const SPAWNFOOD = ["grow","grow","randomgrow","randomgrow"];

let menu = false;


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
        ctx.arc(this.x-this.size/100,this.y-this.size/100, this.size, 0, 2 * Math.PI);
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


    constructor(x,y,size,color,parent,visbile){

        this.x = x;
        this.y = y;
        this.sizedefault = size;
        this.size = this.sizedefault;
        this.color = color;
        this.parent = parent;
        this.bodypos = 0;
        this.eating = false;
        this.delayeat = false;
        this.visbile = visbile
    }

    update(bodyI = 0){

        for(let i= snake1.POSITIONS.length-1-this.parent.bodypos; i>0 ;i--){

            this.x = snake1.POSITIONS[i].x;
            this.y = snake1.POSITIONS[i].y;
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
                    
                }, 100);
        }else{this.visbile = true;}}

        if(this.delayeat){
            this.size = this.sizedefault +2;
        }else{
            this.size = this.sizedefault;
        }

        if(bodyI !== BODIES.length-1 && !this.visbile ){this.visbile = true}


    }


    render(){

        if(this.visbile){
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.arc(this.x-this.size/100,this.y-this.size/100, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = this.color ;
        ctx.fill();
        ctx.stroke(); }
        

    }

    shrinkToParent(){

        this.size = this.parent.size *0.99;
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
        this.colordefault = "green";
        this.color = this.colordefault;
        this.POSITIONS = []; 
        this.bodypos = 0;  
        this.nocolbod = false;    
        this.eating = false;

    }

    update(){

        
        this.POSITIONS.push({x:this.x,y:this.y}); 
        

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
            this.speed *= 1 + Math.abs(this.dir_v)/8;
        }

                        // if(this.dir_v <0){this.dir_v += 0.1}

        if( KEYBINDS["Right"].some(keybindcheck) || touch === "right" ){
            this.dir_v += 0.05;
            this.speed *= 1 + Math.abs(this.dir_v)/8;
        }

        if( KEYBINDS["Boost"].some(keybindcheck) && this.speedboost >10 || touch=== "boost" && this.speedboost >10 ){
            this.speed *= 1.03;
            this.speedboost -= 10;
            this.color = "darkgreen";
        }
        
        

        if(this.x < 0){this.x = canvas.width}
        if(this.x > canvas.width){this.x = 0}
        if(this.y < 0){this.y = canvas.height}
        if(this.y > canvas.height){this.y = 0}
            
        

        // food detection
    
        if (FOODS.length !== 0){ 

            FOODS.forEach((v,i)=>{

                let fooddistance = distance(this.x,v.x,this.y,v.y);
                if(fooddistance < this.size+v.size){
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
                            this.colordefault = "grey";
                            setTimeout(()=>{
                                this.nocolbod = false;
                                this.colordefault = "green";
                                
                            },10000)
                            break;
                        case "speed":
                            v.randomtype()
                            this.acc *=2;
                            this.colordefault = "red";
                            setTimeout(()=>{
                                this.acc /= 2;
                                this.colordefault = "green";
                                
                            },10000)
                            break;
                        case "nospeed":
                            v.randomtype()
                            this.acc /= 2;
                            this.colordefault = "#6a6a16";
                            setTimeout(()=>{
                                this.acc *= 2;
                                this.colordefault = "green";
                                
                            },10000)
                            break;
                        case "bigbutt":
                            v.randomtype()
                            BODIES[BODIES.length-1].size += 4;
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
                                FOODS.push(new_food);
                            }


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
                    
                    window.location.reload(true)

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
        



    }

    render(){
        

        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.arc(this.x-this.size/100,this.y-this.size/100, this.size, 0, 2 * Math.PI);
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


        ctx.strokeStyle = "black";
        ctx.strokeText( "Speed : "+this.speed.toFixed(2), 5, 10);
        ctx.strokeText("Boost : "+Math.round(this.speedboost), 5, 50);
        ctx.strokeText("Length : "+Math.round(this.snakelength), 5, 30);
        if(debug){
            ctx.strokeText("dirv : "+this.dir_v, 5, 70);
            ctx.strokeText("POS : "+this.POSITIONS.length, 5, 90);
            ctx.strokeText("nocolbod : "+ this.nocolbod, 5, 110);
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

        const new_body = new body(0,0,10,"lightgreen",snake1,true)
        BODIES.push(new_body);
        new_body.shrinkToParent();

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
snake1.render();

FOODS.forEach((v)=>{v.render();})
BODIES.forEach((v)=>{v.render();})


if(debug){
ctx.beginPath();
snake1.POSITIONS.forEach((v,i)=>{
        if (i === 0){
            ctx.moveTo(v.x,v.y);
        }else{
            ctx.lineTo(v.x,v.y);
        }


})
ctx.stroke()}

}

//distance

function distance(x1,x2,y1,y2){

return Math.sqrt(((x2-x1)**2)+((y2-y1)**2));

}

//add body

function addbody(visbile){

    const new_body = new body(0,0,10,"lightgreen",BODIES[BODIES.length-1],visbile);
    new_body.shrinkToParent();
    BODIES.push(new_body);

}



function randomrange(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}


function togglePause(){
    let menudiv = document.getElementById("pausemenu");

    let keybind = document.getElementById("keybindmenu");
    keybind.style.display = "none";

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

function toggledebug(){

    if(debug){
        debug= false;
    }else{
        debug = true;
    }
}

function toggleKeybind(){

    let keybind = document.getElementById("keybindmenu");
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
    btn.addEventListener("keypress",e=>{
        btn.innerHTML  = e.key ;
        KEYBINDS[btn.parentElement.value] = [];
        KEYBINDS[btn.parentElement.value].push(e.key );
    });
    
    if(btn.innerHTML = " "){
        btn.innerHTML = "spacebar";
    }
    
}




addEventListener("keydown", e => {
    console.log("key: ",e.key);
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