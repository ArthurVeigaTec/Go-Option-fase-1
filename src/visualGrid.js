//this file is used to make visual modifications in the grid, positions, etc


export class VisualGrid{
    static definePositionMultiplier(chart){
        const values = chart.data.valuesStock;

        let minRange = Infinity;

        for(let i = 0; i < values.length; i++){
            const value = values[i];
            const higher = value.higher;
            const lower = value.lower;

            const range = higher - lower;
            if(range < minRange && range > 0){ //in some candles its normal to be zero, cause there is o variation, but to get the position multiplier we need to avoid this
                minRange = range;
            }
        }

        // minRange * multiplier ≈ 10
        const positionMultiplier = 10 / minRange;

        // round to the nearest power of 10 (more "clean")
        const rounded = Math.pow(10, Math.round(Math.log10(positionMultiplier)));

        chart.positionMultiplier = Math.max(1, rounded);
    }

    static applyPositionMultiplier(chart, values, valuesToAplly = []){ // used by setXYHistory
        //called by setHistory and its an array of objects
        const n_items = values.length;
        for (let i = n_items -1; i>=0 ; i--){
            const value = values[i];

            applyFromRules(value.positions);
        }

        function applyFromRules(value){
            for (let position of valuesToAplly) {
                value[position] *= chart.positionMultiplier;
            }
        }
    }
}