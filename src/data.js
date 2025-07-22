import { VisualGrid } from "./visualGrid.js";

export class Data{
    constructor(chart, urlApi, symbolStock, nItemsPerUpdate, timeFrame, secondsTimeFrame){
        this.chart = chart;
        this.urlApi = urlApi;
        this.symbolStock = symbolStock;
        this.nItemsPerUpdate = nItemsPerUpdate;
        this.timeFrame = timeFrame;
        this.secondsTimeFrame = secondsTimeFrame;

        this.valuesStock = [];
        this.newCurrentValue = null;
    }


    getHistory(moreInfo = false){
      let to = ""; //timestamp to the last value 
      if(moreInfo){
        to = this.valuesStock[0].open_time - this.secondsTimeFrame //nao incluir o ultimo valor para nao ter duplicidade
      }

      return fetch(`${this.urlApi}?symbol=${this.symbolStock}&to=${to}&countback=${this.nItemsPerUpdate}&interval=${this.timeFrame}`)
      .then(response => response.json())
      .then(response => {
          if(Array.isArray(response)){
            if(moreInfo){
              this.valuesStock.unshift(...response)
            }else{
              this.valuesStock = response;

              VisualGrid.definePositionMultiplier(this.chart); //define the position multiplier of the visual grid when the chart start
            }

            this.chart.render.setXYHistory(moreInfo);


            if(!moreInfo){ //need to be after render xyhistory but only need to be called once
              this.chart.valuesScale.config();
            }
            
          }else{
              console.error("Response of history is not a array: ", response);
          }

      })
      .catch(error => console.error("Error while getting this history: ", error))
    }

}