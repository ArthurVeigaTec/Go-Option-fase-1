const style = {
    "colorLine": "#FAFAFA1A",
    "fontFamily": "Inter",
    "textColor": "#FAFAFA",
}

export class date{
    constructor(chart){
        this.chart = chart;
        this.canvas = this.chart.canvas;
        this.ctx = this.chart.ctx;

        this.interval_dates = 5;

        this.centerX = this.canvas.width / 2;
        this.heightLineDate = this.canvas.height * 0.05;
        this.fontSize = this.heightLineDate/3;
    }

    monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    render(){
        const ctx = this.ctx;
        const {offsetX, offsetXUpdate, zoomFactor} = this.chart.navigation;

        ctx.fillStyle = style.colorLine;

        ctx.fillRect(0, this.heightLineDate , this.canvas.width, 1); // top line to finish the date area


        let valuesCopy = [...this.chart.render.valuesSliced];


        //get the date values for each value
        for (let i = valuesCopy.length - 1; i>=0 ; i--){
            let stock = valuesCopy[i]
            let previoustock = valuesCopy[i-1];

            const openTime = stock.open_time;
            const openTimePrevious = previoustock ? previoustock.open_time : undefined;

            let delta_date = this.chart.navigation.secondsTimeFrame * this.interval_dates;


            if(this.chart.typeChart === "line"){ //at every new period, the line should show the new date
                if(openTimePrevious && openTime != openTimePrevious){
                    putDate();
                }
            }else{
                if(openTime%delta_date==0){
                    putDate();
                }
            }

            function putDate(){
                const dateTime = new Date(openTime * 1000);
                stock.day = String(dateTime.getDate()).padStart(2, '0');
                stock.month = dateTime.getMonth(); //just the number to get the index for monthNames array
                stock.hours = String(dateTime.getHours()).padStart(2, '0');
                stock.minutes = String(dateTime.getMinutes()).padStart(2, '0');
            }

        }



        //render the date designs
        let lastDay = undefined;
        for (let i = valuesCopy.length - 1; i>=0 ; i--){
            let stock = valuesCopy[i]
            let positionX = stock.positions.centerX

            if(stock.day){
                const x =   this.centerX + ((positionX + offsetX - offsetXUpdate - this.centerX) * zoomFactor);
            
                ctx.fillRect(x, this.heightLineDate , 1, this.canvas.height); //each vertical line
            

                //add text date
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0); // reset the tranformation to avid mirror text


                let dateChart;
                if(lastDay && lastDay != stock.day){
                    dateChart = `${stock.day} ${this.monthNames[stock.month]}`
                }else{
                    dateChart = `${stock.hours}:${stock.minutes}`
                }
                lastDay = stock.day;




                
                ctx.font = `${this.fontSize}px ${style.fontFamily}`;
                ctx.textBaseline = "middle"
                ctx.fillStyle = style.textColor;


                const textWidth = ctx.measureText(dateChart).width;
                let adjustedX = x - textWidth/2;
                let adjustedY = (this.canvas.height - this.heightLineDate/2)

                ctx.fillText(dateChart, adjustedX, adjustedY);
                ctx.restore();
            }
        }
    }
}