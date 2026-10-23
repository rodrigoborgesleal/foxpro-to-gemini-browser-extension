# Class Browser via CLI — viabilidade e receita

**Pergunta:** dá para extrair o código de um formulário Visual FoxPro (`.scx`) por linha de comando usando o *Class Browser* da própria IDE?

**Resposta curta:** sim. Não existe um parâmetro oficial de CLI que faça isso, mas o `BROWSER.APP` é um aplicativo VFP normal: ele aceita o arquivo como parâmetro, expõe o objeto `_oBrowser` e o botão **View Class Code** é o controle `cmdExport`. Acionando esse botão por código, o Class Browser grava o formulário reconstruído como `DEFINE CLASS ... ENDDEFINE` em um arquivo texto.

Validado em **Visual FoxPro 09.00.0000.2412**, Windows x64, com os exemplos instalados em `Samples\Solution`.

---

## Receita mínima (VFP)

```foxpro
* executa dentro do VFP, sem interação do usuário
_SCREEN.Visible = .T.                      && precisa existir durante o Init
DO (HOME() + "browser.app") WITH "C:\projeto\form.scx"

* espera a inicialização do Class Browser
DO WHILE !(TYPE("_oBrowser") = "O" AND _oBrowser.lInitialized)
    DOEVENTS
ENDDO

_oBrowser.Visible = .F.                    && esconde a janela

* destino gravável (o padrão é HOME()\viewcode.prg, somente leitura)
_oBrowser.cViewCodeFileName = "C:\temp\out.prg"

* seleciona o nó da classe (nó 1 = arquivo, nó 2 = classe do formulário)
_oBrowser.oleClassList.Object.Nodes(2).Selected = .T.

* "View Class Code"
_oBrowser.cmdExport.Click()

* resultado: C:\temp\out.prg
QUIT
```

### Como o comando é executado

O VFP 9 não tem modo headless, mas aceita um arquivo de configuração e um comando de inicialização:

```ini
; config.fpw
COMMAND = DO ("C:\...\server\vfp\extractor.prg")
RESOURCE = OFF
```

```bat
vfp9.exe -t -cC:\...\config.fpw
```

O caminho do job chega ao script por variável de ambiente (`FOX2TXT_JOB`), evitando problemas de aspas em caminhos com espaço.

---

## O que foi descoberto

| Descoberta | Evidência |
| --- | --- |
| `BROWSER.APP` aceita o `.scx` como parâmetro | `DO (HOME()+"browser.app") WITH "cmdbtn.scx"` abre o formulário; o caption vira `cmdbtn.scx (...) - Class Browser` |
| O objeto do Class Browser é `_oBrowser` | `TYPE("_oBrowser") = "O"`, classe `Form`, nome `classbrowser1` |
| `_oBrowser` tem 37 controles | `cmdOpen`, `cmdExport`, `cmdSubclass`, `cmdFind`, `cmdRename`, `cmdRedefine`, `cmdBrowser`… |
| **View Class Code é o `cmdExport`** | `_oBrowser.cmdExport.ToolTipText` = `"View Class Code"` |
| O código é gravado em arquivo | `_oBrowser.cViewCodeFileName` = `HOME()\viewcode.prg` por padrão |
| A lista de classes é um TreeView | `oleClassList.OLEClass` = `MSComctlLib.TreeCtrl.2`; `Nodes.Count = 2` (arquivo + classe) |
| A geração funciona com a janela oculta | `_oBrowser.Visible = .F.` antes de `cmdExport.Click()` — saída idêntica |
| A saída é o formulário reconstruído | `DEFINE CLASS form1 AS form`, propriedades, `ADD OBJECT ... WITH`, `PROCEDURE ... ENDPROC` |

### Exemplo de saída

```foxpro
****
*-- Form:         form1
*-- ParentClass:  form
*-- BaseClass:    form
*-- Time Stamp:   11/04/02 06:10:11 PM
*
DEFINE CLASS form1 AS form

    DataSession = 2
    Caption = "See Command Button Design Options"
    ...

    ADD OBJECT shape1 AS shape WITH ;
        Top = 62, ;
        Left = 10, ;
        ...

    PROCEDURE commandgroup1.Click
        #DEFINE YOUCLICK_LOC "You clicked "
        DO CASE
            CASE THIS.Value = 1
                MESSAGEBOX(YOUCLICK_LOC + ...)
        ENDCASE
    ENDPROC
ENDDEFINE
```

O Class Browser também gera um preâmbulo executável (`PUBLIC oform1`, `SET CLASSLIB TO ...`, `NEWOBJECT(...)`, `Show`). O Fox2Txt remove esse preâmbulo por padrão, porque ele aponta para classes temporárias e não interessa ao arquivo `.txt` anexado ao Gemini.

---

## Tempo medido

| Formulário | Tamanho do `.scx` | Saída | Tempo total (processo VFP incluso) |
| --- | --- | --- | --- |
| `cmdbtn.scx` | 4 KB | 8,8 KB / 414 linhas | ~1,7 s |
| `1_many.scx` | 5,6 KB | 12,1 KB / 513 linhas | ~1,7 s |
| `buttons.scx` | 7,1 KB | 18,7 KB / 847 linhas | ~1,7 s |
| `polygons.scx` | 8,1 KB | 23,5 KB / 1155 linhas | ~1,7 s |

Dentro do VFP, a geração em si leva ~250–300 ms; o restante é o start do `vfp9.exe`.

---

## Cuidados

1. **`_SCREEN.Visible = .F.` cedo demais quebra a inicialização.** O Class Browser fica com `lInitialized = .F.` e a extração falha. A janela principal precisa existir durante o `Init`; esconda-a depois.
2. **O destino padrão é somente leitura.** `cViewCodeFileName` aponta para `HOME()\viewcode.prg` (Program Files). Sempre defina um caminho gravável.
3. **Efeito colateral no diretório do `.scx`.** O Class Browser cria um `solution.vcx`/`.vct` ao lado do arquivo para representar a classe. Por isso o serviço **sempre copia** `.scx`/`.sct` para uma pasta temporária antes de abrir — o projeto do usuário não é alterado.
4. **Uma instância por vez.** O Class Browser usa estado global (`_oBrowser`, `browser.dbf`); o servidor serializa as requisições.
5. **Precisa de sessão de desktop.** `BROWSER.APP` cria formulários; não funciona em serviço do Windows.
6. **Code page ANSI.** O arquivo gerado está em cp1252; converta para UTF-8 antes de enviar ao navegador.
7. **Sem contrato de API.** `cmdExport`, `cViewCodeFileName` e `oleClassList` são detalhes internos do `BROWSER.APP` (versão `ClassBrowser 06.00.0002`). Se a Microsoft mudar o app, a automação pode quebrar — o modo `scctext` serve de alternativa.

---

## Alternativa oficial: SCCTEXT

O VFP instala `HOME()\SCCTEXT.PRG` (conversor usado por sistemas de controle de versão). Ele é uma classe, não um comando:

```foxpro
* SCCTEXT.PRG fica em Program Files (somente leitura);
* copie para uma pasta gravável antes de compilar
COPY FILE (HOME()+"scctext.prg") TO ("C:\temp\scctext.prg")
SET PROCEDURE TO "C:\temp\scctext.prg" ADDITIVE

o = CREATEOBJECT("SccTextEngine", "C:\temp\form.scx", "K", "C:\temp\out.txt", .T., 4)
o.SetErrorOff = .T.
o.Process()
? o.iResult   && 0 = sucesso
```

- Tipo `"K"` = formulário (`PRJTYPE_FORM`).
- Gera um **dump completo** do `.scx` (todos os campos e memos, inclusive propriedades binárias em hexadecimal).
- É mais rápido (~80 ms) e mais estável que automatizar a UI, mas a saída é menos legível para um LLM do que o `DEFINE CLASS` do Class Browser.
- O Fox2Txt oferece os dois modos; o padrão é `classbrowser`.
- A prévia de layout reaproveita esse dump. No modo `classbrowser` o Fox2Txt gera um `layout.txt` com o SCCTEXT **antes** de abrir o Class Browser; depois que o browser abre o formulário, o SCCTEXT passa a enxergar zero registros.

---

## Anexo no Gemini (extensão)

A extensão não digita o código no editor. Ela monta um `File` `text/plain` com o nome `<form>.<modo>.txt` e o entrega ao Gemini como se o usuário tivesse arrastado o arquivo para o campo de mensagem:

1. Localiza o contêiner `.xap-uploader-dropzone` — o mesmo que recebe o drag & drop nativo do Gemini.
2. Dispara `dragenter`, `dragover` e `drop` com um `dataTransfer` que expõe `files` e `types: ["Files"]`.
3. Se o chip de anexo (`[data-test-id="uploaded-file"]` / `[data-test-id="filename-label"]`) não aparecer, abre o menu **Envio e ferramentas** e usa o `input[type=file]` oculto, atribuindo o arquivo via `DataTransfer` e disparando `change`.
4. Confirma o anexo pelo contador de chips/nome do arquivo e para. **Não envia a mensagem.**

A injeção roda no **mundo principal** da página (`chrome.scripting.executeScript({ world: "MAIN" })`): o `dataTransfer` sintético precisa ser visível para os listeners Angular, o que não acontece a partir do mundo isolado de um content script. Não é necessário `chrome.debugger` nem abrir o seletor de arquivos do Windows.

### Plano B: inserir como texto

Se o upload falhar (DOM alterado, formato recusado, aba sem login), o painel oferece **Inserir como texto no Gemini (plano B)**. A função `insertTextInPage` também roda no mundo principal e:

1. Localiza o editor (`rich-textarea .ql-editor[contenteditable="true"]`).
2. Usa a instância Quill exposta em `rich-textarea.__quill` (`insertText`), o que dispara os eventos que o Angular do Gemini escuta.
3. Se o Quill não estiver disponível, tenta `document.execCommand("insertText", ...)`.
4. Como último recurso, altera o DOM do editor e dispara um evento `input`.

O texto é **acrescentado** ao conteúdo atual, e a mensagem continua sem ser enviada até você pressionar Enter.

Limitações: a aba precisa estar logada, o Gemini precisa aceitar `.txt`, e `.xap-uploader-dropzone`, o menu e o input de arquivo são detalhes internos que podem mudar. Nesse caso, use o plano B ou **Copiar**/**Baixar .txt** no painel e anexe o arquivo manualmente.

---

## Caminho inverso (texto → `.scx`/`.sct`)

O `DEFINE CLASS` gerado pelo Class Browser não é um formato-fonte recompilável: o `.scx` é uma tabela DBF + memo `.sct`, e o VFP não tem um comando “compilar `DEFINE CLASS` → `.scx`”. O SCCTEXT do VFP 9 também é, na prática, somente ida (`SCC_FORM_SUPPORT 1`; o código de volta existe, mas fica bloqueado pela checagem de suporte).

O Fox2Txt usa o **FoxBin2Prg** para o round-trip:

```foxpro
DO foxbin2prg.prg WITH "form.scx"   && gera form.sc2 (texto editável)
DO foxbin2prg.prg WITH "form.sc2"   && gera form.scx + form.sct
```

O `.sc2` preserva registros, propriedades, métodos, `UNIQUEID`, timestamps e campos binários. Depois de editar o `.sc2`, o servidor recompila, executa `COMPILE FORM` e reexporta o binário para comparar com o texto enviado. O resultado é devolvido em ZIP; os arquivos originais permanecem intactos.

O FoxBin2Prg oficial exige VFP 9 SP1 (build 3504+). O Fox2Txt aplica uma única alteração na cópia em `%TEMP%` para aceitar também o build 2412; o arquivo em `server/vendor` não é modificado. Detalhes em `server/vendor/foxbin2prg/NOTICE.md`.
