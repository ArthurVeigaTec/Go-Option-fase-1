import { getRealY } from "./tools.js";

const style = {
    "fontSize": 16,
    "fontFamily": "Inter",
    "gray": "#FAFAFA",
    "lightGray" :  "#FAFAFA1A",
    "white": "#202029",
    "marginText": 20,

    "colorBuyIntense": "rgba(45, 202, 114, 0.50)",
    "colorBuyPale": "rgba(45, 202, 114, 0)",
    "colorSellIntense": "rgba(245, 61, 107, 0.50)",
    "colorSellPale": "rgba(245, 61, 107, 0.00)",


}

export class valuesScale{
    constructor(chart, backgroundColor){
        this.chart = chart;
        this.canvas = this.chart.canvas;
        this.ctx = this.chart.ctx;
        this.navigation = this.chart.navigation
        this.data = this.chart.data;
        this.date = this.chart.date;

        this.isHoveringTransaction = false;
        this.typeTransaction = null;

        style["backgroundColor"] = backgroundColor;

        this.nLinesGoal = 20; //number of lines that is good to show in the values scale

    }

    //called after get history
    config(){
        

        this.firstValueClose = this.data.valuesStock[this.data.valuesStock.length - 1].close.toFixed(2);

        this.ctx.font = `${style.fontSize}px ${style.fontFamily}`;
        this.ctx.textBaseline = "middle"


        this.textWidth = this.ctx.measureText(this.firstValueClose).width;
        this.xBox = this.canvas.width - (this.textWidth + (2 * style.marginText));
        this.x_text = this.xBox + style.marginText;
    }

    defineInterval(){
        /*
        first take 10% of the deltaValueS as step
        try the getOtherValues with the interval (10%)
        compare the number of values with the targetLines 
        get the corrrect interval
        get a nice number for interval
        */
        //current value info
        let maxValue = 0;
        let minValue = Infinity;
        for(let item of this.data.valuesStock){
            maxValue = Math.max(maxValue, item.higher);
            minValue = Math.min(minValue, item.lower);
        }
        const deltaValue = maxValue - minValue;
        let interval = deltaValue * 0.1;

        let firstItem = this.data.valuesStock[this.data.valuesStock.length - 1];
        let firstClose = firstItem.close;
        let firstY = firstItem.positions.yClose;

        //config
        const canvas = this.canvas;
        const {zoomFactor, scaleY, offsetY} = this.navigation;
        const minY = this.date.heightLineDate;
        const maxY = this.canvas.height;  

        const pm = this.chart.positionMultiplier;

        //get the other values to render

        const values = getOtherValues(interval, minY, maxY, firstY, firstClose, canvas, offsetY, zoomFactor, scaleY, pm, true)
        
        const nLines = values.length;
        if(nLines > 0){ //avoid Infinity (divided by 0), occurs when its called before the first data info
            const ratio = this.nLinesGoal/nLines;

            const correctInterval = interval / ratio; 


            //avoid big jumps in the interval
            if (!this.lastNiceInterval) {
                this.lastNiceInterval = roundToNiceNumber(correctInterval);
            } else {
                const currentNice = roundToNiceNumber(correctInterval);
                if (currentNice > this.lastNiceInterval) {
                    // will only accept a larger interval if the correctInterval is greater than 1.5x the previous interval
                    if (correctInterval > this.lastNiceInterval * 1.5) {
                        this.lastNiceInterval = currentNice;
                    }
                } else if (currentNice < this.lastNiceInterval) {
                    // will only accept a smaller interval if the correctInterval is less than 0.75x the previous interval
                    if (correctInterval < this.lastNiceInterval * 0.75) {
                        this.lastNiceInterval = currentNice;
                    }
                }
            }
            this.interval = this.lastNiceInterval > 0.01 ? this.lastNiceInterval : 0.01;//0.01 is the minimum interval that show in the values scale

        }

    }


    render(){

        //config
        const canvas = this.canvas;
        const ctx = this.ctx;
        const {zoomFactor, scaleY, offsetY} = this.navigation;
        const minY = this.date.heightLineDate;
        const maxY = this.canvas.height;  

        const pm = this.chart.positionMultiplier;

        //current value info
        let firstItem = this.data.valuesStock[this.data.valuesStock.length - 1];
        if(firstItem){
            this.defineInterval(); //call every time let the chart more dynamic

            let firstClose = firstItem.close;
            let firstY = firstItem.positions.yClose;
            let firstYReal = getRealY(firstY, canvas, offsetY, zoomFactor, scaleY);

            //config text
            ctx.font = `${style.fontSize}px ${style.fontFamily}`;
            ctx.textBaseline = "middle";



            //get the other values to render
            this.otherValues = getOtherValues(this.interval, minY, maxY, firstY, firstClose, canvas, offsetY, zoomFactor, scaleY, pm)
    




            
            //render lines
            ctx.fillStyle = style.lightGray;
            for(let line of this.otherValues){
                ctx.fillRect(0, line.y, canvas.width , 1) 
            }

            //render the current line
            if(firstYReal > minY){
                //render the gradient of the hover btn transaction
                if (this.isHoveringTransaction) {
                    let gradient;
            
                    if (this.typeTransaction === "buy") {
                        gradient = ctx.createLinearGradient(0, firstYReal, 0, canvas.height); // down
                        gradient.addColorStop(0, style.colorBuyIntense);
                        gradient.addColorStop(1, style.colorBuyPale);
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, firstYReal, canvas.width, canvas.height - firstYReal);
                    } else { // sell
                        gradient = ctx.createLinearGradient(0, firstYReal, 0, 0); // up
                        gradient.addColorStop(0, style.colorSellIntense);
                        gradient.addColorStop(1, style.colorSellPale);
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, canvas.width, firstYReal);
                    }
            
                    // redraw the line on top of the gradient
                }

                
                //the current (gray) close line
                ctx.fillStyle = style.gray; 
                ctx.fillRect(0, firstYReal, canvas.width , 1) //the line of current close
            }





            //create the breath circle animation (BCA) in the line chart
            //has to be here because BCA need to be upper fro the lines and above the box content
            this.chart.render.renderBCA();






            //create the box to receive the data

            //erase the box content  
            ctx.fillStyle = style.backgroundColor;
            ctx.fillRect(this.xBox + 1, 0, this.canvas.width - this.xBox, this.canvas.height);

            //create the border-left
            ctx.fillStyle = style.lightGray;
            ctx.fillRect(this.xBox, 0 , 1, this.canvas.height);







            //render the text
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0); // reset the tranformation to avid mirror text


            //render the commom scale values
            ctx.fillStyle = style.lightGray;
            for(let line of this.otherValues){
                let yValue = (canvas.height / 2) + ((canvas.height / 2) - line.y); //important beacasuse y is inverted

                ctx.fillText(line.value.toFixed(2), this.x_text, yValue);
            }


            function formatFloor2(num) {
                return (Math.floor(num * 100) / 100).toFixed(2);
            }

            //render the current Value
            if(firstYReal > minY){
                firstYReal = (canvas.height / 2) + ((canvas.height / 2) - firstYReal); //important beacasuse y is inverted

                ctx.fillStyle = style.white; 
                ctx.fillRect(this.xBox, firstYReal - style.fontSize*1.5, canvas.width - this.xBox, style.fontSize*3)

                ctx.fillStyle = style.gray; 
                ctx.fillText(formatFloor2(firstClose), this.x_text, firstYReal);
            }


        
            ctx.restore();
        }

    }

    hoverBtnsTransaction(typeTransaction){ //buy or sell
        this.isHoveringTransaction = true;
        this.typeTransaction = typeTransaction;
    }

    unhoverBtnsTransaction(){
        this.isHoveringTransaction = false;
        this.typeTransaction = null;
    }
}




function roundToNiceNumber(x) {
    const exponent = Math.floor(Math.log10(x));
    const fraction = x / Math.pow(10, exponent);

    let niceFraction;
    if (fraction <= 1) {
        niceFraction = 1;
    } else if (fraction <= 2) {
        niceFraction = 2;
    } else if (fraction <= 5) {
        niceFraction = 5;
    } else {
        niceFraction = 10;
    }
    return niceFraction * Math.pow(10, exponent);
}


//help functions

function getOtherValues(interval, minY, maxY, yRefer, valueRefer, canvas, offsetY, zoomFactor, scaleY, pm){
    let valuesY = [];

    /*
    example

    interval = 10



                                    3.41
    getRealY(yRefer + ((biggerMultiple - valueRefer) * pm))      90 (biggerMultiple)


                                                                    delta -> 3.41 (biggerMultiple - valueRefer) -> 90 - 87.41


    481.500(yRefer)                                             87.41 (valueRefer)

                                    
                                                                    delta -> 7.41 (valueRefer - lowerMultiple)


                                    7.41
    getRealY(yRefer - ((valueRefer - lowerMultiple) * pm))      80 (lowerMultiple)
    */




    //get the lower values from reference
    let lowerMultiple =  Math.floor(valueRefer / interval) * interval; // the last value before the valueRefer
    let lowerY = yRefer - ((valueRefer - lowerMultiple) * pm);
    lowerY = getRealY(lowerY, canvas, offsetY, zoomFactor, scaleY);


    while(lowerY > minY && lowerMultiple > 0){
        valuesY.push({
            "y":lowerY,
            "value": lowerMultiple,
        })

        lowerMultiple -= interval;    
        lowerY = yRefer - ((valueRefer - lowerMultiple) * pm);
        lowerY = getRealY(lowerY, canvas, offsetY, zoomFactor, scaleY);

    }



    //get the bigger values from reference
    let biggerMultiple =  Math.ceil(valueRefer / interval) * interval; //the next value after the valueRefer
    let biggerY =  yRefer + ((biggerMultiple - valueRefer) * pm);
    biggerY = getRealY(biggerY, canvas, offsetY, zoomFactor, scaleY);


    while(biggerY < maxY){
        if (biggerY > minY) {
            valuesY.push({
                "y": biggerY,
                "value": biggerMultiple,
            });
        }
    
        biggerMultiple += interval;
        biggerY =  yRefer + ((biggerMultiple - valueRefer) * pm);
        biggerY = getRealY(biggerY, canvas, offsetY, zoomFactor, scaleY);
    }

    return valuesY

}
