import { breathCirclesAnimation } from "../breathCirclesAnimation.js";
import { getRealY, getRealX } from "../tools.js";  
import { VisualGrid } from "../visualGrid.js";


const style = {
    "spaceBetween2Points": 300,

    "colorBasicGradient0": "rgba(169, 169, 188, 0.0)",
    "colorBasicGradient30": "rgba(169, 169, 188, 0.3)",
    "colorGreenGradient0": "rgba(45, 223, 35, 0.0)",
    "colorGreenGradient30": "rgba(45, 223, 35, 0.3)",
    "colorRedGradient0": "rgba(245, 61, 107, 0.0)",
    "colorRedGradient30": "rgba(245, 61, 107, 0.3)",

    "colorLine": "#A9A9BC",
    "widthLine": 4,
    "joinLine": "round",
}


import { getValuesSliced } from "../tools.js";

export class Line{
    constructor(chart, navigation, data, backgroundColor){
        this.chart = chart;
        this.canvas = this.chart.canvas;
        this.ctx = this.chart.ctx;
        this.navigation = navigation;
        this.data = data;
        this.valuesScale = this.chart.valuesScale;
        this.valuesSliced = [];
        this.deltaCurrent = 0;

        style["backgroundColor"] = backgroundColor;

        this.secondsAnimations = 0.5;
        this.dx = 0;
        this.dy = 0;
        this.needUpdate = false;
        this.needAnimationUpdate = true; //if the user is seeing the most recent data

        //BCA -> breath circle animation
        this.x = this.canvas.width/2;
        this.y = this.canvas.height/2;
        this.sizeBCA = 40;
        this.secondsBCA = 0.8;
        this.BCA = new breathCirclesAnimation(this.chart, this.x, this.y, this.sizeBCA, this.chart.fps, this.secondsBCA);


        //to know if the chart are rendering the first timeframe afeter history (first of live)
        this.firstTimeframeUpdated = true; 
        this.liveStarted = false;
    }

    get widthPoint(){
        return style.spaceBetween2Points;
    }


    setScaleYOffsetY(){
        const navigation = this.navigation;

        //get the scaleY
        let minY = Infinity;
        let maxY = -Infinity;

    
        for (const item of this.valuesSliced) {
            minY = Math.min(minY, item.positions.y1);
            maxY = Math.max(maxY, item.positions.y1);
        }

        let averageY = (minY + maxY)/2;
        let variationY = (maxY - minY) * navigation.zoomFactor;


        let oldNewScaleY = navigation.scaleY;
        let oldNewOffsetY = navigation.offsetY;
        if (variationY > this.canvas.height/1.5) {
            navigation.newScaleY = (this.canvas.height/1.5) / variationY ;
        }else{ //reset
            navigation.newScaleY = 1;
        }


        navigation.newOffsetY = (this.canvas.height / 2) - (averageY);

        //avoid recursion
        if(oldNewScaleY != navigation.newScaleY){
            navigation.dScaleY = (navigation.newScaleY - navigation.scaleY)/this.chart.fps/0.2;
        }
        if(oldNewOffsetY != navigation.newOffsetY){
            navigation.dOffsetY = (navigation.newOffsetY - navigation.offsetY)/this.chart.fps/0.2;
        }


        
    }

    setXYHistory(){
        let values = this.data.valuesStock;
        const n_items = values.length;
        let widthPoint = this.widthPoint;
        

        for (let i = n_items-1; i>=0 ; i--){
            let value = values[i];

            
            value.close  = Number(value.close);
            const positions = {};
            let delta = value.close - value.open;
            value.delta = delta;
            positions.delta = delta;

            if(i + 1 == n_items){
                //most recent stock
                positions.x = this.canvas.width/2;
                positions.y1 = this.canvas.height/2;
            }else{
                const nextValue = values[i+1];
    
                positions.x = nextValue.positions.x - widthPoint;
                positions.y1 = (value.close - nextValue.close) + nextValue.positions.y1;
            }

            
            //use in some graphical parts
            positions.yClose = positions.y1;
            positions.centerX = positions.x;


            value.positions = positions;

            
        }
        
        VisualGrid.applyPositionMultiplier(this.chart, values, ['delta', 'y1', 'yClose'])
    }

    setXYUpdate(isNewValue=false){
        this.newValue = this.data.newCurrentValue;
        const currentValue = JSON.parse(JSON.stringify(this.data.valuesStock[this.data.valuesStock.length - 1]));
        const widthPoint = this.widthPoint;
        const secondsTimeFrame = this.chart.secondsTimeFrame;
        let widthPointLive = (widthPoint / secondsTimeFrame);
        this.newValue.close  = Number(this.newValue.close);

        const pm = this.chart.positionMultiplier;


        //there is two ways of get data from api: history and live
        //in the line chart, every new point get from live is rendered (with the correct width), to get the update effect
        //on the first timeframe rendered, there is less points to render, if is 18:45:15, these last 15 seconds are not rendered, the last point is 18:45:00
        //to correct this visual effect, the first timeframe rendered need to be updated with the correct width
        //correct width is the widthPoint * (secondsTimeFrame - secondsPassed)
        //the live api do not send a diferent opentime everry seconds, just when the timeframe is changed, so I use the js timsestamp
        if(!this.liveStarted){
            this.opentimeFirstTimeframe = this.newValue.open_time;
            this.time = Math.floor(new Date().getTime()/1000);
            this.liveStarted = true;
            this.secondsPassed = this.time - this.opentimeFirstTimeframe;
        }
        if(this.firstTimeframeUpdated){
            widthPointLive = widthPoint / (secondsTimeFrame - this.secondsPassed);

            const opentime = this.newValue.open_time;
            if(opentime != this.opentimeFirstTimeframe){
                this.firstTimeframeUpdated = false;
            }
        }




        if(isNewValue){
            this.data.valuesStock.push(currentValue);
        }


        
        const positions = {};
        this.newValue.delta = this.newValue.close - this.newValue.open;
        positions.delta = this.newValue.delta * pm;

        if(isNewValue){
            positions.x = currentValue.positions.x + widthPointLive;

        }else{
            positions.x = currentValue.positions.x;
        }
        
        positions.y1 = (((this.newValue.close - currentValue.close) * pm) + currentValue.positions.y1);

        //use in some graphical parts
        positions.yClose = positions.y1;
        positions.centerX = positions.x;

        this.newValue.positions = positions;



        //define delta for the animation
        this.deltaData = {
            "y1" : this.newValue.positions.y1 - currentValue.positions.y1,
            "x" : this.newValue.positions.x - currentValue.positions.x,
            "close": this.newValue.close - currentValue.close,
        }

 


        if(this.deltaData.x != 0){
            this.dx = this.deltaData.x/this.chart.fps/this.secondsAnimations; 
            this.needUpdate = true;
        }

        if(this.deltaData.y1 != 0){
            this.dy = this.deltaData.y1/this.chart.fps/this.secondsAnimations; 
            this.needUpdate = true;
        }
        if(this.deltaData.close != 0){
            this.dClose = this.deltaData.close/this.chart.fps/this.secondsAnimations; 
            this.needUpdate = true;
        }
        
    }

    smoothUpdateValues(){
        if(this.needUpdate){
            if(this.needAnimationUpdate){

                let currentValue = JSON.parse(JSON.stringify(this.data.valuesStock[this.data.valuesStock.length - 1]));
                let needUpdate = false;
    


                
                if(this.deltaData.x > this.dx){
                    currentValue.positions.x += this.dx;
                    currentValue.positions.centerX = currentValue.positions.x;
                    this.navigation.offsetXUpdate += this.dx;
    
                    this.deltaData.x -= this.dx;
    
                    needUpdate = true;

                }else{  
                    //if there is some rest
                    currentValue.positions.x += this.deltaData.x;
                    this.navigation.offsetXUpdate += this.deltaData.x;
                    this.deltaData.x = 0;
                }
    
    
                if(Math.abs(this.deltaData.y1) > Math.abs(this.dy)){
                    currentValue.positions.y1 += this.dy;
                    currentValue.positions.yClose = currentValue.positions.y1;
    
      
                    this.deltaData.y1 -= this.dy;
    

                    needUpdate = true;

                }else{
                    currentValue.positions.y1 += this.deltaData.y1;
                    this.deltaData.y1 = 0;
                }
    
                
                if(Math.abs(this.deltaData.close) > Math.abs(this.dClose)){
                    currentValue.close += this.dClose;
                    this.deltaData.close -= this.dClose;
    
                    needUpdate = true;

                }else{  
                    //if there is some rest
                    currentValue.close += this.deltaData.close;
                    this.deltaData.close = 0;
                }

    
                if(!needUpdate){
                    this.data.valuesStock[this.data.valuesStock.length - 1] = {...this.newValue};
                    this.needUpdate = false;
                }else{
                    this.data.valuesStock[this.data.valuesStock.length - 1] = {...currentValue};
                }


            }else{
                this.data.valuesStock[this.data.valuesStock.length - 1] = {...this.newValue};
                this.needUpdate = false;
            }

        }
    }

    render(){
        this.smoothUpdateValues();

        const currentValue = this.data.valuesStock[this.data.valuesStock.length - 1];
        const lastValue = this.data.valuesStock[this.data.valuesStock.length - 2];
        if(currentValue){
            this.deltaCurrent = currentValue.close - currentValue.open;
        }
    

        let widthPoint = this.widthPoint * this.navigation.zoomFactor;
        //this.valuesSliced = getValuesSliced(this.chart, widthPoint); //take out because the new update line logic is to create a new point every second. So I had to lower the widthPoint in the new values which interfers with getvaluesSliced
        this.valuesSliced = this.data.valuesStock;


        this.setScaleYOffsetY();
        this.navigation.smoothScaleY();
        this.navigation.smoothOffsetY();


        const ctx = this.ctx;
        const canvas = this.canvas;
        const {offsetX, offsetXUpdate, offsetY, zoomFactor, scaleY} = this.navigation;

        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        
        
        ctx.save();

        ctx.translate(canvas.width / 2, canvas.height / 2); 
        ctx.scale(zoomFactor, zoomFactor * scaleY);
        ctx.translate(-canvas.width / 2, -canvas.height / 2); 
        ctx.translate(0, offsetY );




        let firstItem;
        let lastItem;
        let valuesCopy;
        if(this.valuesSliced.length>0){
            valuesCopy = this.valuesSliced.map(item => ({
                    x: item.positions.x + offsetX - offsetXUpdate, 
                    y: item.positions.y1
                }));
    
    
            firstItem = valuesCopy[valuesCopy.length-1];
            lastItem = valuesCopy[0];
    


    
            //design the gradient shadow
            let realHeight = canvas.height/(zoomFactor * scaleY);
            let minY = (0 - (canvas.height / 2))/(zoomFactor * scaleY) + (canvas.height / 2) - (offsetY);
            //let maxY = (canvas.height - (canvas.height / 2) - 10)/(zoomFactor * scaleY) + (canvas.height / 2) - (offsetY);


            
            //render the gradient
            renderGradient(this, this.navigation, ctx, minY, realHeight, firstItem, lastItem, valuesCopy);
    
        }
    


        ctx.restore();

        //superior stroke need to be render withou zoomFactor and scaleY to avoid compact lines and bad style
        if(this.valuesSliced.length>0){
            //design the superior stroke
            renderSuperiorStroke(this.chart, firstItem, valuesCopy);
    
        }

    }



    //breath circle animation (called by valuesScale.js)
    //need to be called by valuesScale.js because need to be upper from the lines and above from the valuesScale box content
    renderBCA(){
        const currentValue = this.data.valuesStock[this.data.valuesStock.length - 1];


        if(currentValue){
            const canvas = this.canvas;
            const {offsetX, offsetXUpdate, offsetY, zoomFactor, scaleY} = this.navigation;

            const colorBCA = this.deltaCurrent >= 0 ? "green" : "red";

            this.BCA.x = getRealX(currentValue.positions.x, canvas, offsetX, offsetXUpdate, zoomFactor);
            this.BCA.y = getRealY(currentValue.positions.y1, canvas, offsetY, zoomFactor, scaleY)
            this.BCA.render(colorBCA);
        }
    }

}









//help functions
function renderGradient(lineChart, navigation, ctx, minY, realHeight, firstItem, lastItem, valuesCopy){
    ctx.beginPath();
    ctx.moveTo(firstItem.x,firstItem.y);

    for (let i = valuesCopy.length - 2; i>=0 ; i--){
        let item = valuesCopy[i]
        ctx.lineTo(item.x, item.y);

    }
    
    ctx.lineTo(lastItem.x, minY);
    ctx.lineTo(firstItem.x, minY);
    ctx.lineTo(firstItem.x,firstItem.y);
    ctx.closePath();


    let isHovering = ctx.isPointInPath(navigation.mouseX, navigation.mouseY);

    const gradient = ctx.createLinearGradient(0, minY, 0, minY + realHeight);
    if(isHovering){
        if(lineChart.deltaCurrent >= 0){
            gradient.addColorStop(0, style.colorGreenGradient0);
            gradient.addColorStop(1, style.colorGreenGradient30);   
        }else{
            gradient.addColorStop(0, style.colorRedGradient0);
            gradient.addColorStop(1, style.colorRedGradient30);   
        }
    }else{
        gradient.addColorStop(0, style.colorBasicGradient0);
        gradient.addColorStop(1, style.colorBasicGradient30);  
    }


    ctx.fillStyle = gradient;
    ctx.fill();

}

function renderSuperiorStroke(chart, firstItem, valuesCopy){
    const canvas = chart.canvas;
    const ctx = chart.ctx;
    const {offsetY, zoomFactor, scaleY} = chart.navigation;


    ctx.beginPath();
    const firstX = getRightX(firstItem.x, canvas, zoomFactor);
    const firstY = getRealY(firstItem.y, canvas, offsetY, zoomFactor, scaleY);
    ctx.moveTo(firstX, firstY);

    for (let i = valuesCopy.length - 2; i >= 0; i--) {
        let item = valuesCopy[i];
        const x = getRightX(item.x, canvas, zoomFactor);
        const y = getRealY(item.y, canvas, offsetY, zoomFactor, scaleY);
        ctx.lineTo(x, y);
    }

    ctx.strokeStyle = style.colorLine;
    ctx.lineWidth = style.widthLine;
    ctx.lineJoin = style.joinLine;
    ctx.stroke();    




    function getRightX(x, canvas, zoomFactor){ //need to compensate the ctx.restore() and aplly some calculations to get the right x
        let realX = ((x - (canvas.width / 2)) * zoomFactor) + (canvas.width / 2)
        return realX
        
    }
}

