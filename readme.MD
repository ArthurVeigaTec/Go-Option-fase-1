O sistema consiste em uma biblioteca de geração de gráficos para trade! 

Atualmente a biblioteca conta com dois tipos de gráficos: candle e line!

A biblioteca recebe informações via api e de acordo com as regras de design estipuladas renderiza o gráfico e a interação com o gráfico para o cliente!



Como utilizar:
Para utilizar a biblioteca basta importa-la, passar os parametros necessarios para fazer a renderizacao do historico e passar os novos dados de atualização de acordo com a lógica estabelecida.



Componente da biblioteca:
A biblioteca conta com os seguinte componentes/funcionalidades:

-Renderização do histórico mais recente
-Translate do gráfico
-Obtenção de mais histórico de acordo com o translate
-Atualização e inclusão de novos pontos no gráfico
-Animação de inclusão de novos pontos no gráfico
-Zoom no gráfico
-Variação suave cdo gráfico de acordo com o translate e novos dados para que todo o gráfico caiba na tela
-Campo de data e hora dos pontos
-Escala de valores no gráfico
-Campo de variação (mostra a variação entre um ponto e outro)
-linha de compra e venda que mostra aonde o usuário esolheu comprar ou vender
-caixa de notificação
-efeito de hover para os botões de compra e venda



Observações:
-a biblioteca pode renderizar diversos tempos gráficos pois essa informação é passada via parametro e não interfere no funcionamento da mesma que apenas renderiza os dados que ela recebe!

-a bibliotgeca é capaz de renderizar desde ativos com valores pequenos até ativos com valores grandes, aplicando os devidos multiplicadores

-opções de ativos (para testar com varias opções): BTCUSDTOTC , LTCUSDT , XRPUSDT , ADAUSDT , 