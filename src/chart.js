import { Size } from "./size.js";
import { Data } from "./data.js";
import { Navigation } from "./navigation.js";
import { updateBox } from "./updateBox.js";
import { valuesScale } from "./valuesScale.js";
import { date } from "./date.js";
import { BuyLine } from "./buyLine.js";
import { NotificationBubble } from "./notificationBubble.js";




//charts
import { Candle } from "./charts/candle.js";
import { Line } from "./charts/line.js";

const style = {
    "backgroundColor" : "#121217",
}

export class Chart{
    typesChart = {
        "candle": {
            "function": Candle,
        },
        "line": {
            "function": Line,
        }
    };



    constructor(canvas, symbolStock, typeChart, timeFrame, fps, nItemsPerUpdate, urlApi, secondsTimeFrame){
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.symbolStock = symbolStock;
        this.typeChart = typeChart;
        this.timeFrame = timeFrame;
        this.fps = fps;
        this.nItemsPerUpdate = nItemsPerUpdate;
        this.urlApi = urlApi;
        this.secondsTimeFrame = secondsTimeFrame;

         // for stocks in cents that are too small to be seen 
         // data define using the visualGrid
        this.positionMultiplier = 1;

        this.config();
    }

    config(){
        //background canvas
        this.canvas.style.backgroundColor = style["backgroundColor"];

        //size of the canvas
        this.size = new Size(this);

        this.data = new Data(this, this.urlApi, this.symbolStock, this.nItemsPerUpdate, this.timeFrame, this.secondsTimeFrame);
        
        this.navigation = new Navigation(this, this.secondsTimeFrame);

        
        this.date = new date(this, this.widthPoint);

        this.valuesScale = new valuesScale(this, style["backgroundColor"]);

        this.updateBox = new updateBox(this);

        //render function
        this.render = new this.typesChart[this.typeChart]["function"](this, this.navigation, this.data, style["backgroundColor"]);

        //when the user click on the buy or sell button, it will create a buyLine in the current close point
        this.buyLine = new BuyLine(this);

        this.notificationBubble = new NotificationBubble(this);

        this.listenVisibilityChange();

        //start the canvas
        this.start();

        //update new info and animation in the canvas
        this.update()

    }



    start(){
        this.data.getHistory();
    }


    update(){
        // Main animation
        const animation = ()=>{
            this.render.render();
            
            this.buyLine.render();

            this.notificationBubble.render();

            this.date.render();
            this.valuesScale.render();
            
            this.navigation.setMaxMinOffsetX();


            this.updateBox.render();


            requestAnimationFrame(animation);
        }
        animation();
        
    }


    listenVisibilityChange(){
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                location.reload(); 
            }
        });
    }


    newPoint(newValue){
        this.data.newCurrentValue = newValue;
        this.render.setXYUpdate(true);
    }

    updatePoint(newValue){
        this.data.newCurrentValue = newValue;
        this.render.setXYUpdate();
    }


    get currentData(){
        return this.data.valuesStock;
    }
}