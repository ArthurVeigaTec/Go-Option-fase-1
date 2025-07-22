import { Chart } from "./src/chart.js";

window.addEventListener("load",async () => {

let updateController = { active: false }; //controller to garantee that if the createChart() is called again, the old cycle is stopped

//get itens from the menu
const menu = {
  "symbolStock": {
    "name": "Ativo",
    "value": "BTCUSDTOTC",  //default value
    "options": {
      "BTCUSDTOTC": {
        "name": "BTCUSDTOTC",
        "value": "BTCUSDTOTC"
      },
      "LTCUSDT": {
        "name": "LTCUSDT",
        "value": "LTCUSDT",
      },
      "XRPUSDT": {
        "name": "XRPUSDT",
        "value": "XRPUSDT",
      },
      "ADAUSDT": {
        "name": "ADAUSDT",
        "value": "ADAUSDT",
      }
    },
    "custom": true,
    "autoSave": true, //if true, the value will be saved in the url
    "onChange": createChart
  },
  "typeChart": {
    "name": "Tipo Gráfico",
    "value": "line",
    "options": {
      "line": {
        "name": "Linha",
        "value": "line",
      },
      "candle": {
        "name": "Velas",
        "value": "candle",
      }
    },
    "custom": false,
    "autoSave": true,
    "onChange": createChart
  },
  "timeFrame": {
    "name": "Período do gráfico",
    "value": "1m",
    "options": {
      "1m": {
        "name": "1 minuto",
        "value": "1m",
        "seconds": 60,
      },
      "5m": {
        "name": "5 minutos",
        "value": "5m",
        "seconds": 300,
      },
      "15m": {
        "name": "15 minutos",
        "value": "15m",
        "seconds": 900,
      },
      "30m": {
        "name": "30 minutos",
        "value": "30m",
        "seconds": 1800,
      },
      "60m": {
        "name": "1 hora",
        "value": "60m",
        "seconds": 3600,
      },
      "120m": {
        "name": "2 horas",
        "value": "120m",
        "seconds": 7200,
      }
    },
    "custom": false,
    "autoSave": true,
    "onChange": createChart
  },
  "drawTools": {
    "name": "Ferramentas de Desenho",
    "value": "",
    "options": {
      "linha": {
        "name": "Linha",
        "value": "linha",
      },
      "linhaDeTendencia": {
        "name": "Linha de Tendência",
        "value": "linhaDeTendencia",
      },
      "linhaHorizontal": {
        "name": "Linha Horizontal",
        "value": "linhaHorizontal",
      },
      "linhaVertical": {
        "name": "Linha Vertical",
        "value": "linhaVertical",
      },
      "linhasDeFibonacci": {
        "name": "Linhas de Fibonacci",
        "value": "linhasDeFibonacci",
      }
    },
    "custom": false,
    "autoSave": false,
    "onChange": () => {
      alert("ferramentas de desenho seram implementadas em breve. Aguarde!")
    }
  },
  'indicators': {
    'name': 'Indicadores',
    'value': '',
    'options': {
      'momentum': {
        'name': 'Momentum',
        'value': 'momentum',
      },
      'sma': {
        'name': 'Média Móvel (SMA)',
        'value': 'sma',
      },
      'bollingerBands': {
        'name': 'Bandas de Bollinger',
        'value': 'bollingerBands',
      },
      'rsi': {
        'name': 'RSI',
        'value': 'rsi',
      },
      'fractal': {
        'name': 'Fractal',
        'value': 'fractal',
      },
      'macd': {
        'name': 'MACD',
        'value': 'macd',
      },
      'elliotWaves': {
        'name': 'Ondas de Elliot',
        'value': 'elliotWaves',
      },
      'stochasticOscillator': {
        'name': 'Oscilador Estocástico',
        'value': 'stochasticOscillator',
      },
      'cci': {
        'name': 'Commodity Channel Index (CCI)',
        'value': 'cci',
      },
      'adx': {
        'name': 'ADX',
        'value': 'adx',
      }
    },
    'custom': false,
    'autoSave': false,
    'onChange': () => {
      alert("indicadores seram implementados em breve. Aguarde!")
    }
  }
}

scanUrls();
function scanUrls(){ //get the params from the url and change the active option if necessary according to the rules
  const urlParams = new URLSearchParams(window.location.search);

  // Itera sobre todos os parâmetros
  for (const [key, value] of urlParams) {
    if(menu[key]){
      const item = menu[key];


      if(item.value != value){
        if(value in item.options){
          changeActiveOption(key, value);
          continue;
        }
        if(item.custom){
          changeActiveOption(key, value, true);
          continue;
        }
      }
    }
  }
}


createMenu();
function createMenu(){
  const menu_container = document.querySelector(".menu");

  menu_container.innerHTML = "";
  const sub_menu = document.createElement("div");
  sub_menu.classList.add("sub_menu");
  menu_container.appendChild(sub_menu);



  for(const item_name in menu){
    const item = menu[item_name];
  
    const submenu = subMenu(item_name); //return info about the submenu(acitveOption, submenu_header html, submenu_body html)
  
    const button = document.createElement("button");
    button.textContent = submenu.current_option ? `${item.name}: ${submenu.current_option.name}` : item.name;
  
    button.addEventListener("click", () => {
      sub_menu.innerHTML = "";
      sub_menu.classList.add("sub_menu_ativo");
      sub_menu.appendChild(submenu.submenu_header);
      sub_menu.appendChild(submenu.submenu_body);
    });
  
    menu_container.appendChild(button);
  }

  
  //close submenu when click outside
  document.addEventListener("click", (event) => {
    if (!menu_container.contains(event.target) && !sub_menu.contains(event.target)) {
      sub_menu.classList.remove("sub_menu_ativo");
    }
  });
}


function subMenu(item_name){
  const item = menu[item_name];

  const options = item.options;

  const submenu_header = document.createElement("div");
  submenu_header.classList.add("header");
  submenu_header.innerHTML = `<span>${item.name}</span>`;

  const submenu_body = document.createElement("div");
  submenu_body.classList.add("body");

  let current_option = "";



  if(item.custom){
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Digite o ${item.name} personalizado`;
    submenu_body.appendChild(input);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        changeActiveOption(item_name, event.target.value, true);
      }
    });
  }

  for(const option_name in options){
    const option = options[option_name];

    const span = document.createElement("span");
    span.textContent = option.name;
    if(option_name == item.value){
      span.classList.add("active");
      current_option = option;
    }
    span.addEventListener("click", () => {
      changeActiveOption(item_name, option_name);
    });
    submenu_body.appendChild(span);
  }


  return {
    'submenu_header': submenu_header,
    'submenu_body': submenu_body,
    'current_option': current_option
  }
}

function changeActiveOption(item_name, option_name_param, custom=false){
  const item = menu[item_name];


  if(custom){
    item.value = option_name_param;
    item.options[option_name_param] = {
      "name": option_name_param,
      "value": option_name_param
    }
  }else{

    for(const option_name in item.options){
      const option = item.options[option_name];

      if(option_name == option_name_param){
        item.value = option.value;
      }
    }
  }

  if(item.autoSave){
    changeUrlParams(item_name, item.value);
  }
  createMenu();
  item.onChange();
}

function changeUrlParams(key, value){
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(key, value);
  window.history.pushState({}, "", `?${urlParams.toString()}`);
}













function createChart(){
    // Invalidate the previous update cycle
    updateController.active = false;

    const localController = { active: true };
    updateController = localController;
  
    /* chart params */
    const canvas = document.getElementById("canvas");
      if (canvas.getContext) {
          
          //url params
          const symbolStock = menu.symbolStock.value;
          const typeChart = menu.typeChart.value;   
          const timeFrame = menu.timeFrame.value;
          const secondsTimeFrame = menu.timeFrame.options[timeFrame].seconds; //60, 300, 900, 1800, 3600, 7200
  
          const fps = 40; 
          const nItemsPerUpdate = 100;
  
          const urlApi = "https://binary.zlincontent.com/api/feed/last-prices";
          
          let chart = new Chart(canvas, symbolStock, typeChart, timeFrame, fps, nItemsPerUpdate, urlApi, secondsTimeFrame); //inicialize the chart
  
  
  
  
  
  
          //atualizar o chart
          const updatedRate = 1000; //1 second
  
          async function updateCycle() {
            if (!updateController.active) return;

              try {
                const response = await updateHistoryAPI(symbolStock);
          
                if(response.live[symbolStock]){ 
                  let currentValue = response.live[symbolStock];
  
  
                  const currentData = chart.currentData;
                  if(currentData.length > 0){ //the chart already finished the history
                      const openTimeApi = currentValue.open_times[timeFrame];
                      const lastTimeStamp = currentData[currentData.length-1].open_time;
  
                      let newValue = [];
  
              
                      if(typeChart == "line" || lastTimeStamp + secondsTimeFrame == openTimeApi){ //if the typeChart is line, every point need to be new
                          newValue = {
                              "candle_id": openTimeApi,    
                              "close": currentValue.close,
                              "higher": currentValue.high,
                              "lower": currentValue.low,
                              "open": currentValue.open,
                              "open_time": openTimeApi,
                              'volume': currentValue.volume,
                              "point_update": true,
                          }
              
                          chart.newPoint(newValue);
  
                      } else if(openTimeApi == lastTimeStamp){
                        newValue = {
                        "candle_id": lastTimeStamp,
                        "open_time": lastTimeStamp,
                        "close": currentValue.close,
                        "higher": currentValue.high,
                        "lower": currentValue.low,
                        "open": currentValue.open,
                        'volume': currentValue.volume,
                        "point_update": true,
                        }
                        
                        chart.updatePoint(newValue);
                      } else{
                          //some problem happen, maybe internet connection
                          console.error("Problem with the update object");
                      }
  
                  }
  
            
                } else{
                  console.error("There is some problem with the update object");
                }
          
            
              } catch (error) {
                console.error("There is some problem with the update object", error);
              } finally {
                if (localController.active) {
                    setTimeout(updateCycle, updatedRate);
                }
              }
            };
          
          updateCycle()
  

                
          //listen the buy or sell button
          listenBuyOrSellButton(chart); //add the buttons and the event listener

          //listen the notification buttons
          listenNotificationButton(chart);

          //listen the hover of the buy and sell buttons
          hoverBtnsCompraEVenda(chart);
      }
}
createChart();

















function updateHistoryAPI(symbol){
    return fetch(`https://binary.zlincontent.com/api/feed/refresh?symbols=${symbol}`)
    .then(response => response.json())
    .catch(error => console.error('Error to get history data', error));
};




function listenBuyOrSellButton(chart){
  const btnBuy = document.querySelector(".btn_buy");
  //to avoid overlapping event listeners
  const newBtnBuy = btnBuy.cloneNode(true);
  btnBuy.replaceWith(newBtnBuy);

  const btnSell = document.querySelector(".btn_sell");
  const newBtnSell = btnSell.cloneNode(true);
  btnSell.replaceWith(newBtnSell);


  let lineActive = false;

  newBtnBuy.addEventListener("click", () => {
    startLine("buy");
  });

  newBtnSell.addEventListener("click", () => {
    startLine("sell");
  });

  function startLine(buyOrSell){
    if(!lineActive){
      lineActive = true;
      chart.buyLine.start(buyOrSell);

      //destroy the line after 10 seconds
      setTimeout(() => {
        lineActive = false;
        chart.buyLine.destroy();
      }, 10000);
    }
  }
}
  

function listenNotificationButton(chart){
  const btn_notif_good = document.querySelector(".btn_notif_good");
  //to avoid overlapping event listeners
  const newBtnNotifGood = btn_notif_good.cloneNode(true);
  btn_notif_good.replaceWith(newBtnNotifGood);

  const btn_notif_bad = document.querySelector(".btn_notif_bad");
  const newBtnNotifBad = btn_notif_bad.cloneNode(true);
  btn_notif_bad.replaceWith(newBtnNotifBad);

  newBtnNotifGood.addEventListener("click", () => {
    lancaNotificacao("good"); 
  });

  newBtnNotifBad.addEventListener("click", () => {
    lancaNotificacao("bad");
  });


  function lancaNotificacao(goodOrBad){

      const timeToDestroy = 5; //seconds -> a notificacao vai fechar apos 5 segundos ou quando o usuario clicar nela
      chart.notificationBubble.start(goodOrBad, "Titulo", "Descrição", 5);
      //chart.notificationBubble.destroy();
  }
}


function hoverBtnsCompraEVenda(chart){
  const btnBuy = document.querySelector(".btn_buy");
  const btnSell = document.querySelector(".btn_sell");

  btnBuy.addEventListener("mouseenter", () => {
    chart.valuesScale.hoverBtnsTransaction("buy");
  });

  btnSell.addEventListener("mouseenter", () => {
    chart.valuesScale.hoverBtnsTransaction("sell");
  });

  btnBuy.addEventListener("mouseleave", () => {
    chart.valuesScale.unhoverBtnsTransaction();
  });

  btnSell.addEventListener("mouseleave", () => {
    chart.valuesScale.unhoverBtnsTransaction();
  });
}

});