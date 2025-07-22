const style = {
    "green" : "#2DCA72",
    "red" : "#F53D6B",
}


//3 circles for create a infinite breathing animation in some updating points
export class breathCirclesAnimation{
    constructor(chart, x, y, heightBox, fps, seconds){ //heightBox is the box around the animation
        this.chart = chart;
        this.canvas = this.chart.canvas;
        this.ctx = this.chart.ctx;

        this.x = x;
        this.y = y;

        
        
        this.fase = 0; //0 for circle 2 and 1 for circle 3
        this.status = 0; //0 for expanding and 1 for contracting

        
        this.maxRadius3 = heightBox * 0.4;
        this.maxRadius2 = heightBox * 0.3;

        this.radius1 = heightBox * 0.2;
        this.radius2 = this.radius1; //start value
        this.radius3 = this.maxRadius2;//start value

        this.d = this.radius1/fps/seconds; //delta
    }


    render(colorParam){
        const color = style[colorParam];
        const x = this.x;
        const y = this.y;
        const ctx = this.ctx;


        const colorCircle1 = color;
        const colorCircle2 = color + "80"; //50% opacity
        const colorCircle3 = color + "40"; //25% opacity
    

    
        if(this.status == 0){ //expanding
            if(this.fase == 0){ //circle 2
                if(this.radius2 + this.d >= this.maxRadius2){
                    this.radius2 = this.maxRadius2;
                    this.radius3 = this.maxRadius2;
                    this.fase = 1;
                }else{
                    this.radius2 += this.d;
                    this.radius3 += this.d;
                }


            }else if(this.fase == 1){
                if(this.radius3 + this.d >= this.maxRadius3){
                    this.radius3 = this.maxRadius3;
                    this.status = 1;
                }else{
                    this.radius3 += this.d;
                }
    
            }
        }else if(this.status == 1){ //contracting
            if(this.fase == 1){
                if(this.radius3 <= this.maxRadius2){
                    this.fase = 0;
                    this.radius3 = this.maxRadius2 //reset to standart value
                }else{
                    this.radius3 -= this.d;
                }
    

            }else if(this.fase == 0){
                if(this.radius2 <= this.radius1){
                    this.status = 0;
                    this.radius2 = this.radius1 //reset to standart value
                    this.radius3 = this.radius1
                }else{
                    this.radius2 -= this.d;
                    this.radius3 -= this.d
                }
    

            }
        }
    
        //circle 1
        const radius_circle1 = this.radius1;


        drawCircle(ctx, x, y, this.radius3, colorCircle3) // always keep circle 3 to not interfere in circle 2 color
        drawCircle(ctx, x, y, this.radius2, colorCircle2)
        drawCircle(ctx, x, y, this.radius1, colorCircle1);

    }
}





        

//help functions
function drawCircle(ctx, x, y, radius_circle, color){
    ctx.beginPath();
    ctx.arc(x, y , radius_circle, 0, 2 * Math.PI); // Círculo completo
    ctx.fillStyle = color; // Cor de preenchimento
    ctx.fill(); // Preenche o círculo
}
