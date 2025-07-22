const style = {
    "widthShadow" : 2,
    "radiusShadow" : 0,
    "marginShadow": 9,

    "widthBody" : 20,
    "centerBody" : 10,
    "radiusBody" : 2,

    "spaceBetweenCandles" : 8,

    "greenCandle" : "#2DCA72",
    "greenShadow": "#1E874C",
    "redCandle": "#F53D6B",
    "redShadow": "#D50B3E"
}

import { getValuesSliced } from "../tools.js";
import { VisualGrid } from "../visualGrid.js";

/* Each cabndle has 4 positions
positions_y = {
    "p1": 0, //beginning, of the candle and lower shadow
    "p2":0, // end of lower shadow and start of the body
    "p3":0, // end of the body and start of higher shadow
    "p4":0 // end of higher shadow and candle
}
*/
export class Candle{
    constructor(chart, navigation, data, backgroundColor){
        this.chart = chart;
        this.canvas = this.chart.canvas;
        this.ctx = this.chart.ctx;
        this.navigation = navigation;
        this.data = data;
        this.valuesSliced = [];

        style["backgroundColor"] = backgroundColor;


        this.secondsAnimations = 0.5;
        this.d = {}; //object for each delta y1, y2...
        //animate te offsetXupdate
        this.deltaDataX = 0;
        this.dx = 0;

        this.needUpdate = false;
        this.needAnimationUpdate = true; //if the user is seeing the most recent data
    }

    get widthPoint(){
        return style.widthBody + style.spaceBetweenCandles;
    }

    setXYHistory(){
        //get x and y for each stock value
        let values = this.data.valuesStock;
        const n_items = values.length;
        let widthPoint = this.widthPoint;


        for (let i = n_items -1; i>=0 ; i--){
            let value = values[i]
        
        
            value.higher = Number(value.higher);
            value.close  = Number(value.close);
            value.open   = Number(value.open);
            value.lower  = Number(value.lower);


            let positions = {};
            let delta = value.close - value.open;
            value.delta = delta;
            positions.delta = delta;

            let open;

            if(i + 1 == n_items){
                //most recent stock
                positions.x = this.canvas.width/2;

                open = this.canvas.height/2;
            }else{
                const nextValue = values[i+1];

                positions.x = nextValue.positions.x - widthPoint;

                const deltaOpen = nextValue.open - value.open;
                
                if(deltaOpen >= 0){
                    open = nextValue.positions.yOpen - (nextValue.open - value.open);
                }else{
                    open = nextValue.positions.yOpen + (value.open - nextValue.open);
                }
            }

            if (delta >= 0){
                positions.yOpen = open;
                positions.y2 = open; //open
                positions.y1 = positions.y2 - (value.open - value.lower);
                positions.y3 = positions.y2 + (value.close - value.open);
                positions.y4 = positions.y3 + (value.higher - value.close);

                positions.yClose = positions.y3; //use in some graphical charts
            }else{
                positions.yOpen = open;
                positions.y3 = open; //open
                positions.y4 = positions.y3 + (value.higher - value.open);
                positions.y2 = positions.y3 - (value.open - value.close);
                positions.y1 = positions.y2 - (value.close - value.lower);
                
                positions.yClose = positions.y2; //use in some graphical charts
            }

            positions.centerX = positions.x + style.centerBody;

            value.positions = positions;

        }


        VisualGrid.applyPositionMultiplier(this.chart, values, ['delta', 'y1', 'y2', 'y3', 'y4', 'yClose', 'yOpen'])
    }

    setXYUpdate(isNewValue=false){
        this.newValue = this.data.newCurrentValue;
        this.newValue.higher = Number(this.newValue.higher);
        this.newValue.close  = Number(this.newValue.close);
        this.newValue.open   = Number(this.newValue.open);
        this.newValue.lower  = Number(this.newValue.lower);

        let currentValue = JSON.parse(JSON.stringify(this.data.valuesStock[this.data.valuesStock.length - 1]));
        const widthPoint = this.widthPoint;


        const pm = this.chart.positionMultiplier;

        
        const deltaOpen = this.newValue.open - currentValue.open;
        let open;
        if(deltaOpen >= 0){
            open = currentValue.positions.yOpen + ((this.newValue.open - currentValue.open) * pm);
        }else{
            open = currentValue.positions.yOpen - ((currentValue.open - this.newValue.open) * pm);
        }



        this.newValue.delta = this.newValue.close - this.newValue.open;

        const positions = {};
        positions.delta = this.newValue.delta * pm;

        
        if(isNewValue){
            currentValue.positions.y1 = open;
            currentValue.positions.y2 = open;
            currentValue.positions.y3 = open;
            currentValue.positions.y4 = open;

            this.data.valuesStock.push(currentValue);


            positions.x = currentValue.positions.x + widthPoint;
            this.deltaDataX = widthPoint;
            this.dx = this.deltaDataX / this.chart.fps / this.secondsAnimations;

        }else{
            positions.x = currentValue.positions.x;
        }


        if(positions.delta >= 0){
            positions.yOpen = open
            positions.y2 = open; //open
            positions.y1 = positions.y2 - ((this.newValue.open - this.newValue.lower) * pm);
            positions.y3 = positions.y2 + ((this.newValue.close - this.newValue.open) * pm);
            positions.y4 = positions.y3 + ((this.newValue.higher - this.newValue.close) * pm);

            positions.yClose = positions.y3; //use in some graphical charts
        }else{
            positions.yOpen = open
            positions.y3 = open; //open
            positions.y4 = positions.y3 + ((this.newValue.higher - this.newValue.open) * pm);
            positions.y2 = positions.y3 - ((this.newValue.open - this.newValue.close) * pm);
            positions.y1 = positions.y2 - ((this.newValue.close - this.newValue.lower) * pm);
            
            positions.yClose = positions.y2; //use in some graphical charts
        }


        positions.centerX = positions.x + style.centerBody;



        this.newValue.positions = positions;


        

        this.deltaData = {
            "y1": positions.y1 - currentValue.positions.y1,
            "y2": positions.y2 - currentValue.positions.y2,
            "y3": positions.y3 - currentValue.positions.y3,
            "y4": positions.y4 - currentValue.positions.y4,
            "yClose": positions.yClose - currentValue.positions.yClose,
            "close": this.newValue.close - currentValue.close, //the close is update with smoothUpdateValues, before the positionMultiplier(pm) used the same value as yClose but with pm the values are different
        }



        let maxDelta = 0;
        for (let i in this.deltaData){
            const abs = Math.abs(this.deltaData[i]);
            if (abs > maxDelta){
                maxDelta = abs;
            }
        }


        if(maxDelta>0){
            this.d = {
                y1: this.deltaData.y1 / this.chart.fps / this.secondsAnimations,
                y2: this.deltaData.y2 / this.chart.fps / this.secondsAnimations,
                y3: this.deltaData.y3 / this.chart.fps / this.secondsAnimations,
                y4: this.deltaData.y4 / this.chart.fps / this.secondsAnimations,
                yClose: this.deltaData.yClose / this.chart.fps / this.secondsAnimations,
                close: this.deltaData.close / this.chart.fps / this.secondsAnimations,
            };
            
            this.needUpdate = true;
        }else{
            this.needUpdate = false;
        }


        currentValue = this.data.valuesStock[this.data.valuesStock.length - 1];
        currentValue.delta = this.newValue.delta;
        currentValue.positions.delta = this.newValue.positions.delta;
    
    }

    smoothUpdateValues(){
        if(this.needUpdate){
            if(this.needAnimationUpdate){
                let currentValue = JSON.parse(JSON.stringify(this.data.valuesStock[this.data.valuesStock.length - 1]));
                let needUpdate = false;


                for(let key in this.deltaData){
                    if(Math.abs(this.deltaData[key]) > Math.abs(this.d[key])){        
                        if(key == "close"){
                            currentValue.close += this.d[key];
                        }else{
                            currentValue.positions[key] += this.d[key];
                        }
                        this.deltaData[key] -= this.d[key];


                        needUpdate = true;
                    }else{
                        if(key == "close"){
                            currentValue.close += this.deltaData[key];
                        }else{
                            currentValue.positions[key] += this.deltaData[key];
                        }
                        this.deltaData[key] = 0;
                        continue;
                    }
        
                }



                if(this.deltaDataX > this.dx){
                    this.navigation.offsetXUpdate += this.dx;
                    this.deltaDataX -= this.dx;
                }else{
                    this.navigation.offsetXUpdate += this.deltaDataX;
                    this.deltaDataX = 0;
                }
                

        
                //stop the updating
                if(!needUpdate){
                    this.data.valuesStock[this.data.valuesStock.length - 1] = {...this.newValue};
                    this.needUpdate = false;
                }else{
                    this.data.valuesStock[this.data.valuesStock.length - 1] = currentValue;
                }


            }else{
                this.data.valuesStock[this.data.valuesStock.length - 1] = {...this.newValue};
                this.needUpdate = false;
            }


            
        }
    }

    setScaleYOffsetY(){
        const navigation = this.navigation;

        //get the scaleY
        let minY = Infinity;
        let maxY = -Infinity;
        for (const candle of this.valuesSliced) {
            const { y1, y4 } = candle.positions;
            minY = Math.min(minY, y1);
            maxY = Math.max(maxY, y4);
        }

        let averageY = (minY + maxY)/2;
        let variationY = (maxY - minY) * navigation.zoomFactor;


        let oldNewScaleY = navigation.newScaleY;
        let oldNewOffsetY = navigation.newOffsetY;
        if (variationY > this.chart.canvas.height/1.5) {
            navigation.newScaleY = (this.chart.canvas.height/1.5) / variationY ;
        }else{ //reset
            navigation.newScaleY = 1;
        }


        navigation.newOffsetY = (this.chart.canvas.height / 2) - (averageY);

        //avoid recursion
        if(oldNewScaleY != navigation.newScaleY){
            navigation.dScaleY = (navigation.newScaleY - navigation.scaleY)/this.chart.fps/0.2;
        }
        if(oldNewOffsetY != navigation.newOffsetY){
            navigation.dOffsetY = (navigation.newOffsetY - navigation.offsetY)/this.chart.fps/0.2;
        }
    }
    

    render(){

        this.smoothUpdateValues();

        let widthPoint = this.widthPoint * this.navigation.zoomFactor;
        this.valuesSliced = getValuesSliced(this.chart, widthPoint);

        
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



        for (let i = this.valuesSliced.length - 1; i>=0 ; i--){
            let candle = this.valuesSliced[i]
            let positions = {...candle.positions};

            positions.x = positions.x + offsetX - offsetXUpdate;

            createCandle(ctx, positions)

        }


        ctx.restore();


    }
}






//help functions
function createCandle(ctx, positions){

    let x1_shadow = positions.x + style.marginShadow;
    let x2_shadow = x1_shadow + style.widthShadow;

    let color_body;
    let color_shadow;
    if(positions.delta >= 0){
        color_body = style.greenCandle;
        color_shadow = style.greenShadow
    }else{
        color_body = style.redCandle;
        color_shadow = style.redShadow
    }

    if(positions.y3 < positions.y4){
        createSquare(ctx, x1_shadow, x2_shadow, positions.y3, positions.y4, color_shadow)
    }
    createSquare(ctx, positions.x, positions.x + style.widthBody, positions.y2, positions.y3, color_body)
    if(positions.y1 < positions.y2){
        createSquare(ctx, x1_shadow, x2_shadow, positions.y1, positions.y2, color_shadow)
    }

}

function createSquare(ctx, x1, x2, y1, y2, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
}






















/*
//old functions with border radius design
function createBodyCandleBorderRadius(ctx, x1, x2, y1, y2, color, radius){
    //make sure that the radius is good on small candles
    let height = y2 - y1;
    radius = Math.min(radius, height / 2)

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x1, y1 + radius); // begin
    ctx.lineTo(x1, y2 - radius); // left edge
    ctx.quadraticCurveTo(x1, y2, x1 + radius, y2); // top left
    ctx.lineTo(x2 - radius, y2); // top edge
    ctx.quadraticCurveTo(x2, y2, x2, y2 - radius); // top right
    ctx.lineTo(x2, y1 + radius); // right edge
    ctx.quadraticCurveTo(x2, y1, x2 - radius, y1); //bottom right
    ctx.lineTo(x1 + radius, y1); // bottom edge
    ctx.quadraticCurveTo(x1, y1, x1, y1 + radius); //top left
    ctx.closePath();
    ctx.fill(); // fill the square

}
function createHigherShadowBorderRadius(ctx, x1, x2, y1, y2, color, radius){
    //make sure that the radius is good on small shadows
    let height = y2 - y1;
    radius = Math.min(radius, height / 2)

    ctx.fillStyle = color; 

    ctx.beginPath();
    ctx.moveTo(x1, y1); // begin
    ctx.lineTo(x1, y2 - radius); // left edge
    ctx.quadraticCurveTo(x1, y2, x1 + radius, y2); // top left
    ctx.lineTo(x2 - radius, y2); // top edge
    ctx.quadraticCurveTo(x2, y2, x2, y2 - radius); // top right
    ctx.lineTo(x2, y1); // right edge
    ctx.lineTo(x1, y1); // bottom edge
    ctx.closePath();
    ctx.fill(); // fill the square

}
function createLowerShadowBorderRadius(ctx, x1, x2, y1, y2, color, radius){
    //make sure that the radius is good on small shadows
    let height = y2 - y1;
    radius = Math.min(radius, height / 2)

    ctx.fillStyle = color; 

    ctx.beginPath();
    ctx.moveTo(x1, y1 + radius); // begin
    ctx.lineTo(x1, y2); // left edge
    ctx.lineTo(x2, y2); // top edge
    ctx.lineTo(x2, y1 + radius); // right edge
    ctx.quadraticCurveTo(x2, y1, x2 - radius, y1); //bottom right
    ctx.lineTo(x1 + radius, y1); // bottom edge
    ctx.quadraticCurveTo(x1, y1, x1, y1 + radius); //top left
    ctx.closePath();
    ctx.fill(); // fill the square
}
*/