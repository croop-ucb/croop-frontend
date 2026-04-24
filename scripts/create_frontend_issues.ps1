# create_frontend_issues.ps1
# Script para criação das issues do repositório croop-frontend.
# Pré-requisitos:
# - GitHub CLI instalado
# - gh auth login já executado
# - Executar este script dentro da raiz do repositório croop-frontend

gh label create frontend --color 1D76DB --description "Tarefas do aplicativo mobile" 2>$null
gh label create requisito --color 5319E7 --description "Issue vinculada ao Documento de Requisitos de Software" 2>$null

function New-CroopIssue {
    param (
        [string]$Title,
        [string]$Body
    )

    gh issue create `
        --title $Title `
        --body $Body `
        --label "frontend,requisito"
}

New-CroopIssue `
    -Title "FRONT-005 - Criar fluxo de associação de dispositivo IoT (UC-004)" `
    -Body @"
UC relacionado:
- UC-004 - Associar Planta ao Dispositivo IoT

Regras de negócio:
- RN-005 - Associação Planta-Dispositivo

Objetivo:
Criar no aplicativo o fluxo necessário para vincular uma planta cadastrada a um dispositivo IoT disponível.

Escopo:
- Exibir lista de plantas cadastradas.
- Permitir selecionar uma planta.
- Solicitar a identificação do dispositivo.
- Permitir confirmar a associação.
- Exibir confirmação quando a associação for realizada.

Critérios de aceite:
- Dado que existe uma planta cadastrada e um dispositivo disponível, quando o usuário confirmar a associação, então o app deve apresentar confirmação de vínculo realizado.
- Dado que o dispositivo informado já esteja vinculado a outra planta, quando o usuário tentar associá-lo, então o app deve informar indisponibilidade do dispositivo.
- Dado que o usuário cancele a operação, quando estiver no fluxo de associação, então o app deve interromper o processo e retornar à etapa anterior prevista.
"@

New-CroopIssue `
    -Title "FRONT-006 - Criar componente de leitura atual de umidade (UC-005)" `
    -Body @"
UC relacionado:
- UC-005 - Monitorar Umidade do Solo

Regras de negócio:
- RN-006 - Frequência de Leitura

Objetivo:
Criar componente visual para exibir a leitura atual de umidade recebida do sensor.

Escopo:
- Exibir umidade medida em porcentagem.
- Exibir data da medição.
- Exibir hora da medição.
- Exibir indicação visual do estado da leitura.
- Disponibilizar os dados para análise visual no detalhe da planta.

Critérios de aceite:
- Dada uma leitura válida recebida pelo sistema, quando o usuário acessar a planta monitorada, então o app deve exibir o valor de umidade em porcentagem.
- Dada uma leitura válida recebida pelo sistema, quando ela for exibida no app, então devem ser exibidas data e hora da medição.
- Dado que não exista leitura válida disponível, quando o usuário acessar a área de monitoramento, então o app deve informar ausência de dados de umidade.
"@

New-CroopIssue `
    -Title "FRONT-007 - Criar histórico de umidade da planta (UC-005, UC-010)" `
    -Body @"
UCs relacionados:
- UC-005 - Monitorar Umidade do Solo
- UC-010 - Consultar Histórico de Cuidados

Regras de negócio:
- RN-006 - Frequência de Leitura
- RN-012 - Registro de histórico

Objetivo:
Criar tela para consulta do histórico de leituras de umidade da planta.

Escopo:
- Exibir registros de leituras de umidade.
- Organizar dados por data e hora.
- Apresentar dados em formato de gráfico e tabela.
- Exibir mensagem quando não houver registros.

Critérios de aceite:
- Dado que existam leituras registradas, quando o usuário acessar o histórico, então o app deve exibir os registros organizados por data e hora.
- Dado que existam leituras registradas, quando o histórico for exibido, então os dados devem aparecer em formato de gráfico e tabela.
- Dado que não existam registros, quando o usuário acessar o histórico, então o app deve exibir mensagem informando ausência de dados.
"@

New-CroopIssue `
    -Title "FRONT-008 - Exibir resultado da irrigação automática no detalhe da planta (UC-006)" `
    -Body @"
UC relacionado:
- UC-006 - Executar Irrigação Automática

Regras de negócio:
- RN-007 - Decisão de Irrigação
- RN-008 - Personalização por Planta
- RN-012 - Registro de histórico

Objetivo:
Exibir ao usuário informações referentes à irrigação automática realizada ou não realizada pelo sistema.

Escopo:
- Exibir estado atual da planta após análise da umidade.
- Exibir quando a irrigação automática for realizada.
- Exibir quando a irrigação automática não for realizada por umidade adequada.
- Exibir quando a irrigação automática não for realizada por excesso de umidade.
- Exibir registro relacionado à ação automática no histórico.

Critérios de aceite:
- Dado que a umidade esteja abaixo do nível mínimo da planta, quando o sistema executar irrigação automática, então o app deve apresentar a ação como realizada.
- Dado que a umidade esteja dentro da faixa ideal, quando o sistema avaliar a planta, então o app deve indicar que não houve necessidade de irrigação.
- Dado que a umidade esteja acima da faixa ideal, quando o sistema avaliar a planta, então o app deve indicar alerta de excesso de umidade.
- Dada uma ação automática registrada, quando o usuário consultar o histórico, então o registro deve indicar data, hora, tipo e status.
"@

New-CroopIssue `
    -Title "FRONT-009 - Exibir falhas da irrigação automática e comunicação IoT (UC-006)" `
    -Body @"
UC relacionado:
- UC-006 - Executar Irrigação Automática

Regras de negócio:
- RN-007 - Decisão de Irrigação
- RN-012 - Registro de histórico

Objetivo:
Criar estados visuais para falhas relacionadas à comunicação com o dispositivo ou à execução da irrigação automática.

Escopo:
- Exibir falha de comunicação com o dispositivo.
- Exibir tentativa agendada em 5 minutos.
- Exibir alerta quando houver 3 falhas em até 20 minutos.
- Exibir falha de execução da irrigação pelo dispositivo.
- Registrar visualmente o erro para consulta posterior.

Critérios de aceite:
- Dado que o sistema não consiga se comunicar com o dispositivo, quando a irrigação automática for solicitada, então o app deve exibir estado de falha de comunicação.
- Dado que a comunicação falhe, quando houver nova tentativa agendada, então o app deve indicar que haverá nova tentativa em 5 minutos.
- Dado que o fluxo de falha ocorra 3 vezes em até 20 minutos, quando o usuário for informado, então o app deve exibir alerta de possível defeito no sensor ou dispositivo.
- Dado que o dispositivo falhe ao executar irrigação, quando o erro for registrado, então o app deve informar a falha ao usuário.
"@

New-CroopIssue `
    -Title "FRONT-010 - Criar fluxo de irrigação manual (UC-007)" `
    -Body @"
UC relacionado:
- UC-007 - Solicitar Irrigação Manual

Regras de negócio:
- RN-009 - Irrigação Manual Controlada
- RN-012 - Registro de histórico

Objetivo:
Permitir que o usuário solicite irrigação manual de uma planta vinculada a dispositivo.

Escopo:
- Exibir plantas disponíveis para irrigação.
- Permitir selecionar uma planta.
- Permitir solicitar irrigação manual.
- Exibir confirmação da execução.
- Exibir erro quando houver falha de comunicação ou execução.

Critérios de aceite:
- Dada uma planta vinculada a dispositivo, quando o usuário solicitar irrigação manual, então o app deve enviar a solicitação ao sistema.
- Dada uma irrigação executada com sucesso, quando o dispositivo concluir a ação, então o app deve confirmar a execução ao usuário.
- Dada uma falha de comunicação com o dispositivo, quando o usuário solicitar irrigação, então o app deve exibir erro e informar o usuário.
- Dada uma falha de execução no dispositivo, quando ela ocorrer, então o app deve exibir erro e informar o usuário.
"@

New-CroopIssue `
    -Title "FRONT-011 - Criar alerta de irrigação manual em condição de risco (UC-007)" `
    -Body @"
UC relacionado:
- UC-007 - Solicitar Irrigação Manual

Regras de negócio:
- RN-009 - Irrigação Manual Controlada

Objetivo:
Exibir alerta quando o usuário tentar irrigar manualmente uma planta cuja umidade esteja acima do ideal.

Escopo:
- Detectar retorno de bloqueio por umidade acima do ideal.
- Exibir notificação pop-up questionando se o usuário deseja manter a decisão.
- Permitir ao usuário visualizar o motivo do alerta.
- Encerrar ou retornar o fluxo conforme decisão do usuário e resposta do sistema.

Critérios de aceite:
- Dado que a umidade esteja acima do ideal, quando o usuário tentar irrigar manualmente, então o app deve exibir alerta sobre a condição de risco.
- Dado que o alerta seja exibido, quando o usuário cancelar, então a solicitação de irrigação não deve prosseguir.
- Dado que o fluxo seja encerrado, quando o usuário retornar à tela da planta, então o estado da planta deve permanecer consultável.
"@

New-CroopIssue `
    -Title "FRONT-012 - Criar tela de cronograma de cuidados (UC-008)" `
    -Body @"
UC relacionado:
- UC-008 - Gerar Cronograma de Cuidados

Regras de negócio:
- RN-008 - Personalização por Planta
- RN-010 - Geração de Cronograma
- RN-012 - Registro de histórico

Objetivo:
Criar tela para disponibilizar ao usuário o cronograma personalizado de cuidados gerado pelo sistema.

Escopo:
- Exibir cronograma gerado.
- Exibir horários e intervalos de irrigação.
- Exibir cuidados organizados de forma compreensível.
- Exibir quando o sistema utilizar parâmetros padrão por ausência de dados essenciais.
- Exibir quando o sistema utilizar valores base da espécie por ausência de histórico.

Critérios de aceite:
- Dado que exista cronograma gerado, quando o usuário acessar a tela, então o app deve exibir o cronograma disponível.
- Dado que o cronograma possua horários e intervalos, quando apresentado, então o app deve exibi-los de forma clara.
- Dado que o sistema tenha utilizado parâmetros padrão, quando o cronograma for exibido, então o app deve permitir identificar que os dados foram gerados com base em parâmetros disponíveis.
"@

New-CroopIssue `
    -Title "FRONT-013 - Criar tela de notificações (UC-009)" `
    -Body @"
UC relacionado:
- UC-009 - Receber Notificações

Regras de negócio:
- RN-011 - Notificações Inteligentes
- RN-012 - Registro de histórico

Objetivo:
Criar tela para o usuário visualizar notificações geradas pelo sistema.

Escopo:
- Exibir notificações recebidas.
- Exibir notificações sobre necessidade de irrigação.
- Exibir notificações sobre excesso de água.
- Exibir notificações sobre falha do sensor.
- Exibir data/hora ou contexto do evento quando disponível.

Critérios de aceite:
- Dado que exista evento relevante, quando a notificação for enviada, então ela deve aparecer na tela de notificações.
- Dado que a notificação seja sobre necessidade de irrigação, excesso de água ou falha do sensor, quando exibida, então deve ser possível identificar o tipo de evento.
- Dado que não existam notificações, quando o usuário acessar a tela, então o app deve exibir estado informando ausência de notificações.
"@

New-CroopIssue `
    -Title "FRONT-014 - Criar estados de falha e não duplicidade de notificações (UC-009)" `
    -Body @"
UC relacionado:
- UC-009 - Receber Notificações

Regras de negócio:
- RN-011 - Notificações Inteligentes

Objetivo:
Representar no aplicativo os estados alternativos do fluxo de notificações.

Escopo:
- Representar quando um evento não exige notificação.
- Representar quando uma notificação já foi enviada recentemente.
- Representar falha no envio de notificação.
- Exibir erro ou estado apropriado quando o reenvio falhar.

Critérios de aceite:
- Dado que um evento não exija notificação, quando o sistema avaliar o evento, então o app não deve exibir alerta desnecessário.
- Dado que uma notificação igual já tenha sido enviada recentemente, quando o evento se repetir, então o app não deve duplicar o alerta visual.
- Dado que ocorra falha no envio da notificação, quando o usuário consultar o estado do sistema, então o app deve representar a falha de forma adequada.
"@

New-CroopIssue `
    -Title "FRONT-015 - Criar tela de histórico de cuidados (UC-010)" `
    -Body @"
UC relacionado:
- UC-010 - Consultar Histórico de Cuidados

Regras de negócio:
- RN-012 - Registro de histórico

Objetivo:
Criar tela para consulta do histórico de cuidados, incluindo registros de irrigação, sensores e notificações.

Escopo:
- Recuperar registros de irrigação, sensores e notificações.
- Organizar registros por data e hora.
- Apresentar histórico em formato de gráfico e tabela.
- Exibir mensagem quando não houver registros.
- Exibir mensagem de erro quando ocorrer falha ao buscar dados.

Critérios de aceite:
- Dado que existam registros, quando o usuário acessar o histórico, então o app deve exibir os dados organizados por data e hora.
- Dado que os registros sejam apresentados, quando a tela for carregada, então o app deve exibir dados em formato de gráfico e tabela.
- Dado que não existam registros, quando o usuário acessar o histórico, então o app deve informar ausência de dados.
- Dado que ocorra erro ao buscar registros, quando a consulta falhar, então o app deve exibir mensagem de erro e sugerir nova tentativa.
"@

New-CroopIssue `
    -Title "FRONT-016 - Criar paginação do histórico de cuidados (UC-010)" `
    -Body @"
UC relacionado:
- UC-010 - Consultar Histórico de Cuidados

Regras de negócio:
- RN-012 - Registro de histórico

Objetivo:
Implementar exibição paginada ou por partes quando houver grande volume de registros no histórico.

Escopo:
- Exibir registros por partes.
- Manter organização por data e hora.
- Permitir carregamento de mais registros.
- Preservar legibilidade da listagem.

Critérios de aceite:
- Dado que exista grande volume de registros, quando o usuário acessar o histórico, então o app deve exibir os dados por partes.
- Dado que os dados sejam exibidos por partes, quando o usuário solicitar mais registros, então o app deve carregar a próxima parte mantendo a ordenação por data e hora.
"@
