const style = {
    "good" : "#2DCA72",
    "bad": "#F53D6B",
    "goodHover": "#27b866",
    "badHover": "#e3305c",
    "margin": 15,
    "gap": 8,

    "circleRadius": 6,
    "colorCircle": "#FAFAFA",

    "balloonBorderRadius": 8,
    "balloonPadding": 8,

    "fontFamily": "Inter",
    "fontSizeTitle": 12,
    "fontWeightTitle": 400,
    "fontSizeText": 16,
    "fontWeightText": 700,
    "colorText": "#FAFAFA",
    "gapText": 4,

}

import { roundRectCanvas } from "./tools.js";


export class NotificationBubble{

    constructor(chart){
        this.chart = chart;

        this.active = false;
        this.goodOrBad = null;
        this.title = "";
        this.text = "";


        this.canvas = this.chart.canvas;
        this.data = this.chart.data;
        this.date = this.chart.date;
        this.valuesScale = this.chart.valuesScale;

        this.maxTime = Infinity; //max time in seconds before use the destroy function


        //listening click
        this.balloonArea = null; // area clickable
        this.isHovered = false;

        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }


    render(){
        if(this.active){    
            const timestamp = Math.floor(Date.now() / 1000); //seconds
            if(timestamp > this.maxTime){
                this.destroy();
                return;
            }

            const ctx = this.chart.ctx;


            //draw the white circle
            const y = this.canvas.height / 2;
            const x = this.canvas.width / 2;

            ctx.beginPath();
            ctx.arc(x, y, style.circleRadius, 0, 2 * Math.PI);
            ctx.fillStyle = style.colorCircle;
            ctx.fill();
            ctx.closePath();





            //info text
            const fontTitle = `${style.fontWeightTitle} ${style.fontSizeTitle}px ${style.fontFamily}`;
            const fontText = `${style.fontWeightText} ${style.fontSizeText}px ${style.fontFamily}`;

            ctx.font = fontTitle;
            let widthTitle = ctx.measureText(this.title).width;
            let heightTitle = style.fontSizeTitle;
    
            ctx.font = fontText;
            let widthText = ctx.measureText(this.text).width;
            let heightText = style.fontSizeText;

            const widthContent = Math.max(widthTitle, widthText) + 2 * style.balloonPadding;
            const heightContent = heightTitle + heightText + 2 * style.balloonPadding;




            //draw the balloon
            const leftXBalloon = x + 2 * style.circleRadius + style.gap;
            const middleYBalloon = y - heightContent / 2;


            //hover effect
            if(this.isHovered){
                ctx.fillStyle = this.goodOrBad === "good" ? style.goodHover : style.badHover;
            }else{
                ctx.fillStyle = this.goodOrBad === "good" ? style.good : style.bad;
            }
    
            roundRectCanvas(
                ctx,
                leftXBalloon,
                middleYBalloon,
                widthContent,
                heightContent,
                style.balloonBorderRadius
            );
            ctx.fill();





            //draw title and text
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0); // reset the tranformation to avid mirror text

            const leftXTitleText = leftXBalloon + style.balloonPadding;
            ctx.fillStyle = style.colorText;
            ctx.textBaseline = "top";


            //draw title
            const topYTitle = y - heightContent / 2 + style.balloonPadding;
            ctx.font = fontTitle;
            ctx.fillText(this.title, leftXTitleText, topYTitle);


            //draw text
            const topYText = topYTitle + heightTitle + style.gapText;
            ctx.font = fontText;
            ctx.fillText(this.text, leftXTitleText, topYText);


            ctx.restore();





            //save the ballon area to be clickable
            this.balloonArea = {
                x: leftXBalloon,
                y: middleYBalloon,
                width: widthContent,
                height: heightContent
            };
        }




    }

    start(goodOrBad, title, text, time){
        if(!["good", "bad"].includes(goodOrBad)) {
            console.warn("goodOrBad must be 'good' or 'bad'");
            return;
        }


        this.active = true;
        this.goodOrBad = goodOrBad;
        this.title = title;
        this.text = text;

        const timestamp = Math.floor(Date.now() / 1000); //seconds
        this.maxTime = timestamp + time;
    }

    destroy(){
        this.active = false;
    }

    handleClick(event) {
        if (!this.active || !this.balloonArea) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const { x, y, width, height } = this.balloonArea;

        const adjustedMouseY = this.canvas.height - mouseY;

        const clickedInside = (
            mouseX >= x &&
            mouseX <= x + width &&
            adjustedMouseY >= y &&
            adjustedMouseY <= y + height
        );

        if (clickedInside) {
            this.destroy();
        }
    }

    
    handleMouseMove(event) {
        if (!this.active || !this.balloonArea) {
            this.canvas.style.cursor = 'default';
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const adjustedMouseY = this.canvas.height - mouseY;

        const { x, y, width, height } = this.balloonArea;

        const isInside = (
            mouseX >= x &&
            mouseX <= x + width &&
            adjustedMouseY >= y &&
            adjustedMouseY <= y + height
        );

        this.isHovered = isInside;
        this.canvas.style.cursor = isInside ? 'pointer' : 'default';
    }
}


