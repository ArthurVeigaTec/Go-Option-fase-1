export function getValuesSliced(chart, widthPointParam){
    const {offsetX, offsetXUpdate, zoomFactor} = chart.navigation;
    const widthPoint =  widthPointParam; // dont need the zoomFactor, the other varaibles are reduced to a normal zoom!
    const safetyMargin = 2; //info in the edge may be cut
    const n_items = Math.ceil(chart.canvas.width/widthPoint);


    let sliceEnd = chart.data.valuesStock.length;
    let sliceStart = sliceEnd - n_items - safetyMargin;


    const virtualOffsetX = (offsetX - offsetXUpdate) * zoomFactor;

    const currentValue = chart.data.valuesStock[chart.data.valuesStock.length - 1];

    if(currentValue){
        const currentX = getRealX(currentValue.positions.x, chart.canvas, offsetX, offsetXUpdate, zoomFactor);
        
        if (currentX > chart.valuesScale.xBox){


            let offsetX_out = currentX - chart.valuesScale.xBox;
            let n_items_out = Math.ceil(offsetX_out/widthPoint)
            
            sliceEnd = sliceEnd - n_items_out
            sliceStart = sliceEnd - n_items;
    
            sliceEnd = sliceEnd + safetyMargin;
            sliceStart = sliceStart - safetyMargin;
        }
    
        if(sliceEnd > chart.data.valuesStock.length){
            sliceEnd = chart.data.valuesStock.length
        }
    
    
        if(sliceStart < 0){
            sliceStart = 0;
        }
    
        if(sliceEnd < 0){
            sliceEnd = 0;
        }
    
    
        let valuesSliced = chart.data.valuesStock.slice(sliceStart, sliceEnd);
        return valuesSliced
    }else{
        return [];
    }

}


export function embedImgFromSVG(svg){
    const img = new Image();
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
        URL.revokeObjectURL(url);
    };
    img.src = url;


    return img;
}



export function getRealY(y, canvas, offsetY, zoomFactor, scaleY){
    let realY = (((y - (canvas.height / 2) + offsetY) * zoomFactor * scaleY) + (canvas.height / 2))
    return realY;
}

export function getRealX(x, canvas, offsetX, offsetXUpdate, zoomFactor){
    let realX = ((x - (canvas.width / 2) + offsetX - offsetXUpdate) * zoomFactor) + (canvas.width / 2)
    return realX
}


export function roundRectCanvas(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
}