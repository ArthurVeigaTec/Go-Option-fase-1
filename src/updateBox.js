import { embedImgFromSVG } from "./tools.js";
import { breathCirclesAnimation } from "./breathCirclesAnimation.js";

//there is some style in the constructor!! (values tied to the sreen size)
const style = {
    "backgroundColor" : "#202029",
    "strokeColor": "#3F3F50",
    "green": "#2DCA72",
    "red": "#F53D6B",

    "fontWeight" : "700",
    "fontFamily" : "Inter",
    "lineWidth" : 2,
}

export class updateBox{
    constructor(chart, data){
        this.chart = chart;   
        this.data = this.chart.data;
        this.canvas = this.chart.canvas;
        this.ctx = this.chart.ctx;

        //img's
        this.imgArrowUp = embedImgFromSVG(`<svg width="256px" height="256px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="matrix(-1, 0, 0, 1, 0, 0)" stroke="#F53D6B"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 6V18M12 6L7 11M12 6L17 11" stroke="#2DCA72" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`)
        this.imgArrowDown  = embedImgFromSVG(`<svg width="256px" height="256px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="matrix(1, 0, 0, -1, 0, 0)" stroke="#F53D6B"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 6V18M12 6L7 11M12 6L17 11" stroke="#F53D6B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`)



        //the size object inicialize
        this.x = this.canvas.height * 0.024;
        this.y = this.canvas.height * 0.024;
        this.width = this.canvas.height * 0.15;
        this.height = this.canvas.height * 0.036;
        this.borderRadius = this.height * 0.1;
        this.margin = this.width * 0.02;
        this.fontSize = this.height / 2;


        //breathCircleAnimation -> BCA
        this.xBCA = this.x + this.width - this.margin - (this.height * 0.50);
        this.yBCA = this.y + this.height/2;
        this.fpsBCA = this.chart.fps;
        this.sizeBCA = 1;
        this.secondsBCA = 0.8;
        this.BCA = new breathCirclesAnimation(this.chart, this.xBCA, this.yBCA, this.height, this.fpsBCA, this.secondsBCA);


    }


    render(){
        const ctx = this.ctx;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset the tranformation to avid mirror text
    
    
        const { x, y, width, height, borderRadius, margin } = this;
    
    
    
    
        ctx.fillStyle = style["backgroundColor"]; 
        ctx.strokeStyle = style["strokeColor"];
        ctx.lineWidth = style["lineWidth"] //thickness

    
    
        // box design
        renderBox(ctx, x, y, width, height, borderRadius);

        const currentValue = this.data.valuesStock[this.data.valuesStock.length - 1];
        if(currentValue){
            this.deltaCurrent = (((currentValue.close - currentValue.open)/currentValue.open)*100).toFixed(2);

            const isPositive = this.deltaCurrent >= 0;
            
            if(this.deltaCurrent == "-0.00"){
                this.deltaCurrent = "0.00";
            }


            // Set styles based on deltaCurrent
            const mainColor = isPositive ? style.green : style.red;
            const colorBCA = isPositive ? "green" : "red";
            const imgArrow = isPositive ? this.imgArrowUp : this.imgArrowDown;
        
           
    
            ctx.drawImage(imgArrow, x + margin, y, height - margin, height - margin)
        
    
            //text
            drawText(ctx, x, y, this.deltaCurrent, mainColor, width, height, this.fontSize);    
    
    
            //breathCircleAnimation
            this.BCA.render(colorBCA);
        }


        ctx.restore();
    }




}









//help function
function renderBox(ctx, x, y, width, height, borderRadius){
    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo(x + width - borderRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
    ctx.lineTo(x + width, y + height - borderRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
    ctx.lineTo(x + borderRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
    ctx.lineTo(x, y + borderRadius);
    ctx.quadraticCurveTo(x, y, x + borderRadius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawText(ctx, x, y, deltaCurrent, color, width, height, fontSize){
    if (deltaCurrent !== undefined && !isNaN(deltaCurrent)) {
        let text = `${deltaCurrent}%`;
        ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
        ctx.fillStyle = color;
    
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x + width / 2, y + height / 2);
    }
}