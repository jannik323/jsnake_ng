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
                this.size = 11;
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

    constructor(x,y,size,color,parent){

        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.parent = parent;
        this.bodypos = 0;
    }

    update(){

        for(let i= snake1.POSITIONS.length-1-this.parent.bodypos; i>0 ;i--){

            this.x = snake1.POSITIONS[i].x;
            this.y = snake1.POSITIONS[i].y;
            if(distance(this.x,this.parent.x,this.y,this.parent.y) > this.size+this.parent.size){
                this.bodypos = snake1.POSITIONS.length-1-i;
                // snake1.POSITIONS.shift();
                break;
            }

        }

    }


    render(){

        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.arc(this.x-this.size/100,this.y-this.size/100, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = this.color ;
        ctx.fill();
        ctx.stroke(); 
        

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
        

        // if(KEYS["w"]){
            this.speed += this.acc;
        // }

        // if(KEYS["s"]){
        //     this.speed -= this.acc*1.1;
        // }

        if(KEYS["a"] || touch === "left"){
            if(this.dir_v >0){this.dir_v -= 0.1}
            this.dir_v -= 0.05;
            this.speed *= 1 + Math.abs(this.dir_v)/8;

        }
        if(KEYS["d"]|| touch === "right"){
            if(this.dir_v <0){this.dir_v += 0.1}
            this.dir_v += 0.05;
            this.speed *= 1 + Math.abs(this.dir_v)/8;
        }
        if((KEYS[" "] && this.speedboost >10 ) || touch=== "boost" ) {
            this.speed *= 1.05;
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
                            this.acc += 1;
                            this.colordefault = "red";
                            setTimeout(()=>{
                                this.acc -= 1;
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
        ctx.strokeText("Length : "+Math.round(this.snakelength), 5, 30);
        ctx.strokeText("Boost : "+Math.round(this.speedboost), 5, 50);

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
    if(snake1.snakelength === 1){
        const new_body = new body(0,0,10,"lightgreen",snake1);
        new_body.shrinkToParent();
        BODIES.push(new_body);
    }else{
        
        let delI = BODIES[BODIES.length-1].bodypos+ (BODIES[BODIES.length-1].bodypos)*2;
        snake1.POSITIONS = snake1.POSITIONS.slice(snake1.POSITIONS.length-delI,snake1.POSITIONS.length);
        
        
        const new_body = new body(0,0,10,"lightgreen",BODIES[BODIES.length-1]);
        new_body.shrinkToParent();
        console.log(BODIES[BODIES.length-1],delI);
        BODIES.push(new_body);
        
    }
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


}

//distance

function distance(x1,x2,y1,y2){

return Math.sqrt(((x2-x1)**2)+((y2-y1)**2));

}



function randomrange(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}


function togglePause(){
    let menudiv = document.getElementById("pausemenu");
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


addEventListener("keydown", e => {
    console.log("key: ",e.key);
    KEYS[e.key] = true;
});

addEventListener("keyup", e => {
    KEYS[e.key] = false;
});

addEventListener("touchstart", e =>{

    
if(e.touches.length >1){touch = "boost"}else{
if (e.touches[0].clientX > canvas.width/2){
touch = "right";
}else{
touch = "left";
}
}


})

addEventListener("touchend", () =>{
    touch = "none";
})