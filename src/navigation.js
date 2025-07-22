import { zoom } from "./zoom.js";

export class Navigation{
    constructor(chart, secondsTimeFrame){
        this.chart = chart;
        this.isLoadingData = false;

        this.zoom = new zoom(chart, this)

        this.scaleY = 1;
        this.dScaleY = 0; //use for smooth scaleY change

        this.lastOffsetX = 0;
        this.offsetX = 0;
        this.offsetXUpdate = 0 // when user is seeing the most recent data, a animation process to left is needed
        this.newOffsetX = 0;
        this.lastOffsetY = 0;
        this.offsetY = 0;
        this.newOffsetY = 0;
        this.dOffsetY = 0; //use for smooth offsetY change
        this.maxOffsetX = 0;
        this.minOffsetX = 0;

        this.needSmooth = false; //start with false to avoid smooth when the chart is loading, then the getHistory will turn on when the chart is ready

        this.secondsTimeFrame = secondsTimeFrame;

        //save the mouse positiuons to hover
        this.mouseX;
        this.mouseY;

        this.move();
        this.zoomListener();
        this.navigationMobile();
    }

    setMaxMinOffsetX(){

        let width_chart = (this.chart.render.widthPoint * this.zoomFactor) * this.chart.data.valuesStock.length;
        this.maxOffsetX = Math.max(0, (width_chart - (this.chart.canvas.width/2)) / this.zoomFactor);
        this.minOffsetX = -((this.chart.canvas.width/3) / this.zoomFactor);


    }

    smoothScaleY(){
        if(isNaN(this.scaleY) || isNaN(this.newScaleY) || isNaN(this.dScaleY)){
            this.scaleY = 1;
            this.newScaleY = 1;
            this.dScaleY = 0;
            return
        }
    
        if(this.scaleY == this.newScaleY){
            return;
        }
    
    
        if(this.dScaleY >= 0){
            if(this.scaleY >= this.newScaleY){
                this.scaleY = this.newScaleY;
                return
            };
        }else{        
            if(this.scaleY < this.newScaleY){
                this.scaleY = this.newScaleY;
                return
            };
        }
    
        
        if(this.zoom.isLoadingData){ //do not smooth if the interval is changing
            this.scaleY = this.newScaleY;
        }else{
            this.scaleY += this.dScaleY;
        }
    }

    smoothOffsetY(){
        if(isNaN(this.offsetY) || isNaN(this.newOffsetY) || isNaN(this.dOffsetY)){
            this.offsetY = 0;
            this.newOffsetY = 0;
            this.dOffsetY = 0;
            return
        }
    
        if(this.offsetY == this.newOffsetY){
            return;
        }
    
    
    
        if(this.dOffsetY >= 0){
            if(this.offsetY >= this.newOffsetY){
                this.offsetY = this.newOffsetY;
                return
            };
        }else{        
            if(this.offsetY < this.newOffsetY){
                this.offsetY = this.newOffsetY;
                return
            };
        }
    
    
                
        if(!this.needSmooth){ 
            this.offsetY = this.newOffsetY;
        }else{
            this.offsetY += this.dOffsetY;
        }



        
        this.chart.navigation.needSmooth = true; //turn on the smooth after the first call so the chart inicialize with no smooth
    }

    move(){
        this.isDragging = false; // Flag to check if dragging is active
        this.lastX = 0; // Store the position of the mouse when drag starts
        this.lastY = 0; // Store the position of the mouse when drag starts
        this.isMoving = false;


        // Mouse down event to start dragging
        this.chart.canvas.addEventListener("mousedown", (event) => {
            this.isDragging = true;
            this.lastX = event.clientX; // Record the mouse position when drag starts
            this.lastY = event.clientY; // Record the mouse position when drag starts
        });


        // Mouse move event to drag the element
        this.chart.canvas.addEventListener("mousemove", (event) => {
            //save the mouse positiuons to hoverthis.
            const drawCanvas = this.chart.canvas.getBoundingClientRect();
            this.mouseX = (event.clientX - drawCanvas.left) * (this.chart.canvas.width / drawCanvas.width);
            this.mouseY = (event.clientY - drawCanvas.top) * (this.chart.canvas.height / drawCanvas.height);


            if (this.isDragging  && !this.isLoadingData) {
                this.isMoving = true;
                let deltaX = event.clientX - this.lastX;  // Calculate the horizontal movement



                if(this.offsetX >= this.maxOffsetX){
                    //call for more historical data
                    this.isLoadingData = true;
                    this.chart.data.getHistory(true).then(() => {
                        this.isLoadingData = false
                    }).catch((error) => {
                        console.error("Error fetching new data: ",error);
                        this.isLoadingData = false;
                    })
                }
                

                //go right
                if(this.offsetX < this.maxOffsetX && (deltaX / this.zoomFactor) > 0){
                    this.offsetX += (deltaX / this.zoomFactor);  // Update the offset based on mouse movement
                    this.lastX = event.clientX;  // Update lastX to the current mouse position
                }

                //go left
                if(this.offsetX > this.minOffsetX && (deltaX / this.zoomFactor) < 0){
                    this.offsetX += (deltaX / this.zoomFactor);  // Update the offset based on mouse movement
                    this.lastX = event.clientX;  // Update lastX to the current mouse position
                }

        
            }
        });

        // Mouse up event to stop dragging
        this.chart.canvas.addEventListener("mouseup", () => {
            this.isDragging = false; // Stop dragging when the mouse is released
            this.isMoving = false;
        });

        // Mouse out event to stop dragging if the mouse leaves the canvas
        this.chart.canvas.addEventListener("mouseout", () => {
            this.isDragging = false; // Stop dragging when the mouse leaves the canvas
            this.isMoving = false;
        });

        // Or, if you want to stop dragging when the window loses focus (e.g., if the user switches tabs)
        window.addEventListener("blur", () => {
            this.isDragging = false; // Stop dragging when the window loses focus
            this.isMoving = false;  
        });
    }
    
    zoomListener(){
        let isZooming;
        const zoomChart = (event) => {
          
            // zoom direction
        
              if (event.deltaY < 0) {
                this.zoom.increase();
              } else {
                this.zoom.decrease();
              }
          
            
              
          }
          let isZoomingTimeout;
          canvas.addEventListener("wheel", (event) => {
            event.preventDefault();
            
            clearTimeout(isZoomingTimeout);
          
          
            isZooming = true;
          
            zoomChart(event);
          
            isZoomingTimeout = setTimeout(() => {
              isZooming = false;
            }, 100);
          }, { passive: false });
          
    }
    
    //translate and zoom mobile
    navigationMobile(){
        //Touch Zomm and Navigation
        this.isTouchDragging = false;
        this.touchLastX = 0;
        this.touchLastY = 0;
        this.initialTouchDistance = null;

        // Touch start event
        this.chart.canvas.addEventListener("touchstart", (event) => {
        if (event.touches.length === 1) { // Single touch for dragging
            this.isTouchDragging = true;
            this.touchLastX = event.touches[0].clientX;
            this.touchLastY = event.touches[0].clientY;
        } else if (event.touches.length === 2) { // Two touches for zooming
            if (this.fetchingMoreZoomData) return;

            this.isTouchDragging = false;
            this.initialTouchDistance = Math.hypot(
                event.touches[1].clientX - event.touches[0].clientX,
                event.touches[1].clientY - event.touches[0].clientY
            );
        }
        }, { passive: false });



        this.chart.canvas.addEventListener("touchmove", (event) => {
            event.preventDefault();

            if (!this.isLoadingData) {
                if (this.isTouchDragging && event.touches.length === 1) { //translate
                    const deltaX = event.touches[0].clientX - this.touchLastX;


                    if(this.offsetX >= this.maxOffsetX){
                        //call for more historical data
                        this.isLoadingData = true;
                        this.chart.data.getHistory(true).then(() => {
                            this.isLoadingData = false
                        }).catch((error) => {
                            console.error("Error fetching new data: ",error);
                            this.isLoadingData = false;
                        })
                    }
                    

                    //go right
                    if(this.offsetX < this.maxOffsetX && deltaX > 0){
                        this.offsetX += deltaX;  // Update the offset based on mouse movement
                        this.touchLastX = event.touches[0].clientX;  // Update lastX to the current mouse position
                    }

                    //go left
                    if(this.offsetX > this.minOffsetX && deltaX < 0){
                        this.offsetX += deltaX;  // Update the offset based on mouse movement
                        this.touchLastX = event.touches[0].clientX;  // Update lastX to the current mouse position
                    }
                    

                } 
                
                if (event.touches.length === 2) {
                    const currentTouchDistance = Math.hypot(
                        event.touches[1].clientX - event.touches[0].clientX,
                        event.touches[1].clientY - event.touches[0].clientY
                    );

                    if (this.initialTouchDistance) {
                        const zoomDelta = (currentTouchDistance - this.initialTouchDistance);


                        if (zoomDelta > 0) {
                            this.zoom.increase();
                        } else {
                            //zoom out
                            this.zoom.decrease();
                        }

                        this.initialTouchDistance = currentTouchDistance;
                    }
                }
            }


        }, { passive: false });


        // Touch end event
        canvas.addEventListener("touchend", () => {
            this.isTouchDragging = false;
            this.initialTouchDistance = null;
        });






    }



    get zoomFactor(){
        return this.zoom.zoomFactor;
    }

}