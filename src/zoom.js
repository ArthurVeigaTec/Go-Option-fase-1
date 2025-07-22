export class zoom{
    constructor(chart, navigation){
        this.chart = chart;
        this.navigation = navigation;

        this.minZoomFactor = 0.4;
        this.maxZoomFactor = 40;
                
        this.zoomSpeed = 0.1;
        this.zoomFactor = 1;
    }

    increase(){
        this.zoomFactor = Math.min(this.zoomFactor + this.zoomSpeed, this.maxZoomFactor);
    }

    decrease(){
        this.zoomFactor = Math.max(this.zoomFactor - this.zoomSpeed, this.minZoomFactor);
    }
    
}