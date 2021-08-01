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


// food class

class food{

    constructor(x,y,size,color){

        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;

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
        this.color = "green";
        this.POSITIONS = []; 
        this.bodypos = 0;       

    }

    update(){

        
        this.POSITIONS.push({x:this.x,y:this.y}); 
        

        this.x += Math.cos(this.dir)*this.speed;
        this.y += Math.sin(this.dir)*this.speed;
        this.dir += this.dir_v;
        this.speed *= 0.9;
        this.dir_v *= 0.65;
        this.color = "green";
        if(this.speedboost < 300){this.speedboost += 1;}
        

        // if(KEYS["w"]){
            this.speed += this.acc;
        // }

        // if(KEYS["s"]){
        //     this.speed -= this.acc*1.1;
        // }

        if(KEYS["a"] || touch === "left"){
            this.dir_v -= 0.15;
            this.speed *= 1 + Math.abs(this.dir_v)/5;

        }
        if(KEYS["d"]|| touch === "right"){
            this.dir_v += 0.15;
            this.speed *= 1 + Math.abs(this.dir_v)/5;
        }
        if((KEYS[" "] && this.speedboost >10 ) || touch=== "boost" ) {
            this.speed *= 1.05;
            this.speedboost -= 10;
            this.color = "darkgreen";
        }
        
        

        if(this.x < 0 || this.y < 0 || this.y > canvas.height || this.x > canvas.width){this.dir += Math.PI}
        
    
        if (FOODS.length !== 0){ 

            FOODS.forEach((v,i)=>{

                let fooddistance = distance(this.x,v.x,this.y,v.y);
                if(fooddistance < this.size+v.size)
                {
                    v.randomloc();
                    this.snakelength += 1

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
        ctx.strokeText( "Speed : "+this.speed.toFixed(2), 0, 10);
        ctx.strokeText("Length : "+Math.round(this.snakelength), 0, 20);
        ctx.strokeText("Boost : "+Math.round(this.speedboost), 0, 30);
        ctx.strokeText("POS LE : "+this.POSITIONS.length, 0, 40);

    }

}



// make snake , food , body

const snake1 = new snake(canvas.width/2,canvas.height/2,0,0.5,10)
const food1 = new food(0,0,5,"red");
FOODS.push(food1);
food1.randomloc();

// game loop 

window.requestAnimationFrame(main); 

let lastRenderTime = 0;
let GameSpeed = 30;

function main(currentTime){
    window.requestAnimationFrame(main);
    const sslr = (currentTime- lastRenderTime)/1000
    if (sslr < 1 / GameSpeed) {return}
    lastRenderTime = currentTime;  
    render();
    update();
}



function update(){
snake1.update();
FOODS.forEach((v,i)=>{v.update(i);})
BODIES.forEach((v,i)=>{v.update(i);})

if(snake1.snakelength !== BODIES.length){
  

    if(snake1.snakelength === 1){
        const new_body = new body(100,100,10,"lightgreen",snake1);
        BODIES.push(new_body);
    }else{
        
        let delI = BODIES[BODIES.length-1].bodypos+BODIES[BODIES.length-1].bodypos;
        snake1.POSITIONS = snake1.POSITIONS.slice(snake1.POSITIONS.length-delI,snake1.POSITIONS.length);
        
        
        const new_body = new body(100,100,10,"lightgreen",BODIES[BODIES.length-1]);
        console.log(BODIES[BODIES.length-1],delI);
        BODIES.push(new_body);
        
    }
    
    
}

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
