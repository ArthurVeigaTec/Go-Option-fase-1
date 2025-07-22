const style = {
    "buyLine" : "#2DCA72",
    "sellLine": "#F53D6B",
}


import { getRealY } from "./tools.js";

export class BuyLine{
    constructor(chart){
        this.chart = chart;
        this.active = false;

        this.yLine = 0;
        this.minY = 0;
        this.maxY = Infinity;

        this.canvas = this.chart.canvas;
        this.data = this.chart.data;
        this.date = this.chart.date;
    }


    render(){
        if(this.active){    
            const {zoomFactor, scaleY, offsetY} = this.chart.navigation;
            const yLineReal = getRealY(this.yLine, this.canvas, offsetY, zoomFactor, scaleY);
    

            if(yLineReal > this.minY && yLineReal < this.maxY){
                const ctx = this.chart.ctx;

                ctx.save();


                ctx.strokeStyle = this.buyOrSell === "buy" ? style.buyLine : style.sellLine;
                ctx.lineWidth = 3;
    
                ctx.beginPath();
                ctx.moveTo(0, yLineReal);
                ctx.lineTo(this.canvas.width, yLineReal);
                ctx.stroke();
    
                ctx.restore();
            }
        }
    }

    start(buyOrSell){
        this.active = true;
        this.buyOrSell = buyOrSell;

        //get the most recent candle close value
        this.minY = this.date.heightLineDate;
        this.maxY = this.canvas.height;  

        let firstItem = this.data.valuesStock[this.data.valuesStock.length - 1];
        if(firstItem){
            this.yLine = firstItem.positions.yClose;
        }

    }

    destroy(){
        this.active = false;
    }
}