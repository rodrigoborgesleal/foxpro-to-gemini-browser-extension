# FoxPro → Gemini

Extensão do Chrome + serviço local que **extrai o código-fonte de um formulário Visual FoxPro (`.scx`)** e **anexa o resultado como arquivo `.txt` ao campo de mensagem do Gemini** — como se o arquivo tivesse sido arrastado para dentro do chat.

A extração usa o **Class Browser** nativo do VFP 9 (`BROWSER.APP`): o formulário é aberto, o botão **View Class Code** é acionado e o código `DEFINE CLASS` gerado é devolvido como texto. Também há um modo alternativo com o **SCCTEXT** oficial e um plano B que insere o código como texto no editor do Gemini. O painel ainda oferece uma **prévia visual do layout** do formulário, desenhada a partir das propriedades do `.scx`.

O painel só é ativado em uma aba do `gemini.google.com` com uma conta Google logada — nas demais abas o ícone fica desabilitado.

```
Chrome (side panel)                Node (127.0.0.1:8765)            VFP 9 (CLI)
──────────────────                 ─────────────────────            ───────────
escolhe pasta/.scx  ──HTTP JSON──▶ grava .scx/.sct em temp  ──▶  vfp9.exe + extractor.prg
                                                                    │
                                                                    ├─ BROWSER.APP WITH "form.scx"
                                                                    ├─ _oBrowser.cViewCodeFileName = out
                                                                    └─ _oBrowser.cmdExport.Click()
texto extraído      ◀────────────  lê out.txt (cp1252→UTF-8)  ◀────┘
      │
      └─ cria um File .txt e o anexa ao Gemini (drop/file input) — nada é enviado automaticamente
```

## Requisitos

| Item | Observação |
| --- | --- |
| Windows | O VFP 9 é 32 bits e precisa de sessão de desktop (não roda como serviço/session 0). |
| Visual FoxPro 9 | Testado com `09.00.0000.2412`. O `vfp9.exe` é localizado automaticamente em `C:\Program Files (x86)\Microsoft Visual FoxPro 9`, ou você informa o caminho nas configurações do app de bandeja. |
| Node.js 18+ | Necessário apenas para rodar pelo código-fonte/CLI. O executável empacotado já inclui o runtime. |
| Google Chrome 120+ | A interface usa **Side Panel** e só ativa em `gemini.google.com` com conta logada. |

## Instalação

### 1. Aplicativo de bandeja (recomendado)

```bat
cd server
npm.cmd install
npm.cmd run tray
```

`npm.cmd start` é equivalente a `npm.cmd run tray`.

> No PowerShell, use `npm.cmd` (o `npm.ps1` pode estar bloqueado pela política de execução). No `cmd.exe`, `npm install` e `npm run tray` funcionam normalmente.

Na primeira execução o Fox2Txt abre a tela de **Configurações** e cria:

| O quê | Onde |
| --- | --- |
| Configurações | `%APPDATA%\Fox2Txt\config.json` |
| Log do servidor | `%APPDATA%\Fox2Txt\logs\server.log` |
| Dados temporários | `%TEMP%\fox2txt` |

O ícone fica na bandeja do Windows (talvez em “Mostrar ícones ocultos”). Clique nele para abrir as configurações. O menu da bandeja permite **iniciar/parar o servidor**, abrir a pasta de dados, abrir os logs e sair. O servidor escuta apenas em `http://127.0.0.1:8765`.

### 1b. Servidor sem bandeja (opcional)

Para rodar só o servidor, sem Electron:

```bat
cd server
start-server.cmd
```

ou:

```bat
cd server
npm.cmd run server
```

`start-server.cmd` chama `node server.js` diretamente. Ele usa o mesmo `config.json` do aplicativo de bandeja. Deixe a janela aberta.

### 1c. Gerar o executável

```bat
cd server
npm.cmd run dist
```

Gera `server\dist\Fox2Txt-0.2.0-portable.exe` (executável portátil, sem instalador). Para um instalador com atalhos:

```bat
npm.cmd run dist:installer
```

Também é possível gerar só a pasta desempacotada com `npm.cmd run pack` (`server\dist\win-unpacked\Fox2Txt.exe`). O executável não exige Node.js instalado. As configurações continuam em `%APPDATA%\Fox2Txt`.

> Os executáveis gerados não são assinados digitalmente. O Windows pode exibir o aviso do SmartScreen (“O Windows protegeu o seu PC”); use **Mais informações → Executar assim mesmo** se confiar no arquivo.

### 2. Extensão

1. Abra `chrome://extensions`.
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione a pasta `extension`.
4. Abra `gemini.google.com` e faça login na sua conta Google. Só então o ícone da extensão fica ativo: clique nele e o painel lateral abre ao lado do Gemini.

### 3. Uso

1. No painel, clique em **Escolher pasta** e selecione a pasta do projeto FoxPro.
2. Escolha o formulário `.scx` na lista.
3. Selecione o formato e clique em **Extrair e anexar ao Gemini**.
4. A extensão abre/reutiliza a aba `gemini.google.com` e anexa o código como um arquivo `.txt` (o mesmo efeito de arrastar o arquivo para o campo de mensagem). Ela para aí. **Escreva seu comando e pressione Enter** para enviar.

Se o anexo falhar (Gemini mudou o DOM, aba sem login, upload recusado), use o botão **Inserir como texto no Gemini (plano B)** na prévia. Ele coloca o código diretamente no editor do Gemini; depois revise e pressione Enter. O plano B também exige a aba logada.

O painel mostra uma prévia, o tamanho e o tempo da extração. Há também **Copiar** e **Baixar .txt**. O arquivo anexado chama-se `<nome-do-scx>.<modo>.txt` (ex.: `cadastro.classbrowser.txt`).

A prévia tem duas abas:

- **Código** — editor com realce de sintaxe do Visual FoxPro 9 (comentários, strings, comandos, SQL, PEMs e variáveis de sistema) e IntelliSense: sugestões de comandos, funções, classes base, propriedades/eventos/métodos de `THIS`, `THISFORM`, `_SCREEN` e da cadeia de objetos (`THISFORM.cmdSalvar.`), além de variáveis, `#DEFINE` e rotinas do próprio arquivo. Use **Ctrl+Espaço** ou **Ctrl+J** para abrir as sugestões, **↑/↓** para navegar, **Enter/Tab** para aceitar e **Esc** para fechar.
- **Layout** — prévia visual do formulário, com posição, tamanho, cores, fontes, bordas e controles desenhados a partir das propriedades do `.scx`. Use **Ajustar** para enquadrar o formulário e o controle de **Zoom** para aproximar/afastar. O botão **Expandir** (ou `Esc` no modo expandido) funciona nas duas abas.

O texto editado é o que vai para **Copiar**, **Baixar .txt**, **Inserir como texto** e para o anexo quando você clica em **Extrair e anexar** sem sair do formulário atual. A prévia de layout é somente leitura e não altera o texto extraído.

### Ativação do painel

A extensão é **gated** (só liga quando pode funcionar):

| Situação da aba ativa | Ícone | Painel |
| --- | --- | --- |
| `gemini.google.com` com conta Google logada | colorido | habilitado |
| `gemini.google.com` sem login | com badge `!` | desabilitado; um clique no ícone mostra o aviso na página |
| Qualquer outra aba | desabilitado | indisponível |

O login é detectado pela própria página do Gemini (`extension/gemini-auth.js`), sem ler cookies: o script procura o avatar da conta, os links de `accounts.google.com` e o editor de mensagens. Quando você faz login ou logout, o estado é atualizado na hora e o painel reage sozinho. Se o painel estiver aberto e a aba deixar de ser o Gemini (ou a sessão cair), ele mostra uma tela de aviso com **Abrir Gemini** / **Verificar novamente** em vez de executar a extração.

## Formatos de extração

| Modo | O que gera | Quando usar |
| --- | --- | --- |
| `classbrowser` (padrão) | Código `DEFINE CLASS ... ENDDEFINE` com propriedades, `ADD OBJECT` e métodos — a mesma saída do botão *View Class Code* | Melhor contexto para o Gemini: código limpo e legível |
| `scctext` | Dump completo do `.scx` no formato do conversor oficial `SCCTEXT.PRG` (todos os registros, propriedades e memos) | Depurar perda de informação, comparar versões, casos em que o Class Browser falha |

O preâmbulo executável (`PUBLIC`/`NEWOBJECT`/`Show`) é removido por padrão no modo `classbrowser`; o cabeçalho `*-- Form: ... DEFINE CLASS` é mantido.

A prévia de layout usa o dump do **SCCTEXT** nos dois modos. No modo `scctext` o próprio `out.txt` é reaproveitado; no modo `classbrowser` o VFP gera um `layout.txt` adicional **antes** de abrir o Class Browser (depois dele o SCCTEXT enxerga zero registros). Se o layout falhar, a extração de texto continua normalmente e a aba **Layout** fica indisponível.

## CLI (sem Chrome)

```bat
cd server
node cli.js "C:\Projetos\MeuApp\forms\cadastro.scx"
node cli.js cadastro.scx --mode=scctext -o cadastro.txt
node cli.js cadastro.scx --preamble
```

Saída padrão: `<nome>.classbrowser.txt` ou `<nome>.scctext.txt` ao lado do `.scx`.
O `.sct` (memo) é lido automaticamente quando existe.

## Configuração

### Pelo aplicativo de bandeja

Abra **Configurações** no ícone da bandeja:

| Campo | Padrão | Função |
| --- | --- | --- |
| Caminho do `vfp9.exe` | auto | Força uma instalação específica do VFP 9. Em branco = procura nas instalações padrão. |
| Tempo limite | 60 s | Tempo máximo por extração. |
| Iniciar servidor automaticamente | ligado | Sobe o servidor junto com o aplicativo. |
| Iniciar com o Windows | desligado | Registra o Fox2Txt para abrir junto com o Windows. |
| Manter arquivos temporários | desligado | Mantém a pasta do job para diagnóstico. |
| Log detalhado | desligado | Inclui stdout/stderr do VFP nos erros e no log. |
| Modo padrão (CLI) | `classbrowser` | Usado por `cli.js` e por requisições HTTP sem `mode`. |

As alterações são lidas a cada extração; não é necessário reiniciar o servidor ao trocar o caminho do VFP ou o tempo limite. A porta permanece `8765` porque a extensão usa esse endereço fixo.

### Variáveis de ambiente

Continuam disponíveis para uso avançado/CLI e têm precedência sobre o `config.json`:

| Variável | Padrão | Função |
| --- | --- | --- |
| `FOX2TXT_PORT` | `8765` | Porta do servidor local (no modo CLI/sem bandeja). |
| `FOX2TXT_VFP` | auto | Caminho do `vfp9.exe`. |
| `FOX2TXT_TIMEOUT_MS` | `60000` | Tempo máximo por extração. |
| `FOX2TXT_KEEP` | — | `1` mantém a pasta do job para depuração. |
| `FOX2TXT_DEBUG` | — | `1` inclui detalhes do erro na resposta HTTP e no log. |
| `FOX2TXT_ALLOW_ALL` | — | `1` libera CORS para qualquer origem (só para desenvolvimento). |
| `FOX2TXT_CONFIG_DIR` | `%APPDATA%\Fox2Txt` | Pasta alternativa para `config.json` e `logs`. |
| `FOX2TXT_CONFIG` | — | Caminho completo alternativo para o `config.json`. |

> A extensão usa `http://127.0.0.1:8765` no código (`extension/sidepanel.js`). Se você mudar a porta, ajuste também a constante `API`.

## Limitações

- **Uma extração por vez**: o servidor enfileira as chamadas; o VFP é single-threaded e o Class Browser usa estado global.
- **Sessão interativa**: o VFP abre uma janela por ~1–2 s (o extrator esconde tudo o que consegue). Não funciona em serviço do Windows.
- **Code page**: o VFP grava em ANSI (cp1252). O servidor converte para UTF-8; caracteres fora do cp1252 podem não ser representados.
- **`.sct` obrigatório**: o `.scx` não contém o código dos métodos; ele fica no memo `.sct`. Sem esse arquivo o VFP falha (e abre um diálogo que trava a extração), então o painel bloqueia a operação e avisa.
- **Classes pai**: o código gerado referencia a classe pai (`DEFINE CLASS x AS y`). Se `y` vier de um `.vcx` do projeto, o Gemini verá a referência, não a implementação de `y`.
- **Prévia de layout aproximada**: o `.scx` grava apenas propriedades diferentes do padrão. O renderizador aplica os padrões do VFP 9 (Arial 9, fundo do formulário `F0F0F0`, textbox branco etc.), então cores/fontes padrão e temas nativos do Windows podem variar. Classes herdadas de `.vcx` não são resolvidas: o controle é desenhado com a classe base e marcado com contorno tracejado.
- **Controles sem interação**: a prévia não executa código, consultas, imagens externas nem ActiveX. OLE/ActiveX aparece como placeholder e `PageFrame` com `Tabs = .F.` mostra apenas a página ativa (as demais dependem de código em tempo de execução).
- **Anexo**: o `.txt` é enviado ao Gemini no momento do anexo (é um upload normal). A aba precisa estar logada e o Gemini precisa aceitar `.txt`; formulários grandes geram dezenas de KB e o upload é rápido.
- **Gemini muda**: o contêiner de drag & drop (`.xap-uploader-dropzone`), o menu **Envio e ferramentas** e o `input[type=file]` são detalhes internos e podem mudar. Se o anexo falhar, use o botão **Inserir como texto no Gemini (plano B)**; em último caso, **Copiar**/**Baixar .txt** e anexe manualmente. Os seletores ficam em `attachFileInPage` e `insertTextInPage` (`extension/sidepanel.js`).
- **Bandeja**: o aplicativo de bandeja usa Electron. O executável portátil tem cerca de 100 MB; o servidor em si continua leve e sem dependências externas.
- **Ativação restrita**: a extensão (ícone e painel) só funciona na aba `gemini.google.com` com conta Google logada. A detecção é feita pelo DOM do Gemini; se o Google mudar a página, o painel pode ficar bloqueado mesmo com a sessão ativa — nesse caso ajuste os seletores em `extension/gemini-auth.js`.

## Solução de problemas

| Sintoma | Causa provável / solução |
| --- | --- |
| Ícone da extensão cinza / não abre o painel | A aba ativa não é `gemini.google.com` ou não há conta logada. Abra o Gemini, faça login e o ícone fica colorido. |
| Painel mostra “Entre na sua conta Google” | O Gemini está aberto sem sessão. Clique em **Abrir tela de login**, entre na conta e aguarde a verificação automática (ou use **Verificar novamente**). |
| Painel mostra “Abra o Gemini para começar” | O painel ficou aberto em uma aba que não é o Gemini. Use **Abrir Gemini**; o painel é liberado ao voltar para a aba do Gemini. |
| O painel não abre mesmo logado | Recarregue a extensão em `chrome://extensions` e recarregue a aba do Gemini (o content script só é injetado em abas abertas depois da instalação). |
| “Servidor local offline” | Inicie o servidor pelo ícone da bandeja ou rode `start-server.cmd`. Confira `http://127.0.0.1:8765/health`. |
| “VFP ausente” no painel | Abra **Configurações** na bandeja e informe o `vfp9.exe` em **Visual FoxPro 9**; ou defina `FOX2TXT_VFP`. |
| `Class Browser nao inicializou` | O VFP não conseguiu abrir a interface. Garanta uma sessão de desktop ativa e que o VFP abre manualmente. |
| `A porta 8765 já está em uso` | Feche a outra instância do Fox2Txt/servidor. Em modo CLI você pode usar `FOX2TXT_PORT=8790` (e ajustar `API` em `extension/sidepanel.js`). |
| “O arquivo .sct (memo) não está na pasta” | Selecione a pasta que contém o `.scx` **e** o `.sct` (o memo guarda os métodos). |
| Arquivo não aparece como anexo | A aba não está logada, o `.txt` foi recusado ou o DOM mudou. Faça login, confira o aviso do Gemini e use o plano B **Inserir como texto**. |
| O plano B não insere texto | Confirme que a aba `gemini.google.com` está logada e com o campo de mensagem visível. O log detalhado pode ser ativado nas configurações. |
| A bandeja não aparece | Procure o ícone em “Mostrar ícones ocultos” da barra de tarefas e fixe-o. |
| Quero ver o que o servidor fez | **Configurações → Log do servidor** ou abra `%APPDATA%\Fox2Txt\logs\server.log`. |
| A janela do VFP pisca | Comportamento esperado do `BROWSER.APP`; a extração roda em ~1,6 s. |

## Estrutura

```
server/
  server.js          HTTP + CORS (127.0.0.1), exporta startServer/stop
  core.js            fila, job temporário, spawn do vfp9.exe, cp1252→UTF-8
  layout.js          SCCTEXT → JSON de objetos visuais para a prévia
  config.js          config.json, logs e caminhos (%APPDATA%\Fox2Txt)
  cli.js             uso sem extensão
  vfp/extractor.prg  automação do Class Browser / SCCTEXT (roda dentro do VFP)
  start-server.cmd   servidor sem bandeja
  systray/
    main.js          processo principal do Electron (bandeja, IPC, servidor)
    preload.js       API segura para a tela de configurações
    settings.html/css/js
    assets/          ícone da bandeja/aplicativo
  package.json       Electron + electron-builder (tray, pack, dist)
  dist/              gerado por npm run pack/dist
extension/
  manifest.json      MV3 + side panel + content script do Gemini
  background.js      gating: painel só em aba do Gemini logada
  gemini-auth.js     content script que detecta login/logout no Gemini
  sidepanel.html/css/js
                     tela de bloqueio (aba/login) + abas Código/Layout +
                     anexo no Gemini + plano B de inserção como texto
  vfp-layout.js      renderizador HTML/CSS da prévia de layout
docs/
  class-browser-cli.md   como a automação do Class Browser foi descoberta
```

## Segurança e privacidade

- O servidor escuta **somente** em `127.0.0.1`.
- CORS aceita apenas origens `chrome-extension://` (e `localhost` para testes); origens comuns recebem `403`.
- O `.txt` é enviado ao Gemini no momento em que é anexado (como qualquer upload). A mensagem em si só é enviada quando **você** pressiona Enter.
- A extensão não usa `chrome.debugger`: o anexo é feito com `chrome.scripting` no mundo principal da página, sem abrir o seletor de arquivos do Windows.
- Cada extração usa uma pasta temporária isolada, apagada ao final (a opção **Manter arquivos temporários** desativa essa limpeza para diagnóstico).
- As configurações e logs ficam apenas em `%APPDATA%\Fox2Txt`; o aplicativo de bandeja não envia dados para a internet.
- O servidor não aceita caminhos arbitrários: a extensão envia os **bytes** do `.scx`/`.sct`, não um caminho.
