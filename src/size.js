export class Size{
    constructor(chart){
        this.chart = chart;
        this.canvas = this.chart.canvas;

        this.config();
        this.checking();
    }

    config(){
        this.chart.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.chart.ctx.setTransform(1, 0, 0, 1, 0, 0)
        
        const rect = this.canvas.getBoundingClientRect();
        this.chart.canvas.width = rect.width;
        this.chart.canvas.height = rect.height;
      
        //use the first quadrant
        this.chart.ctx.translate(0, this.chart.canvas.height);
        this.chart.ctx.scale(1, -1);
    }

    checking(){
          window.addEventListener('resize', ()=>{
            clearTimeout(this.resizeTimeOut); //clear the previous
          
            // Wait 0.5 seconds before changing the size of the canvas
            this.resizeTimeOut = setTimeout(() => location.reload(), 500);
          });
    }

}