#DEFINE CRLF CHR(13) + CHR(10)
*------------------------------------------------------------------------------
* extractor.prg - extracao headless de codigo de formulario Visual FoxPro
*
* Entrada : variavel de ambiente FOX2TXT_JOB apontando para uma pasta com
*           form.scx (+ form.sct) e mode.txt ("classbrowser" ou "scctext")
* Saida   : out.txt (codigo) e status.txt (chave=valor)
*
* Modo classbrowser: abre o formulario no Class Browser nativo
* (BROWSER.APP) e aciona o botao "View Class Code" (cmdExport), que
* reconstroi o formulario como codigo DEFINE CLASS executavel.
*
* Modo scctext: usa o conversor oficial SCCTEXT.PRG (dump completo do SCX).
*------------------------------------------------------------------------------
SET TALK OFF
SET SAFETY OFF
SET NOTIFY OFF
SET ESCAPE OFF
SET RESOURCE OFF
SET PROCEDURE TO
CLOSE DATABASES ALL

LOCAL cJob, cMode, cSrc, cOut, cStatus, cErr, cLayout, llLayout
cJob   = ADDBS(GETENV("FOX2TXT_JOB"))
cOut   = cJob + "out.txt"
cStatus = cJob + "status.txt"
cLayout = cJob + "layout.txt"
llLayout = .F.

IF EMPTY(cJob) OR !DIRECTORY(cJob)
    STRTOFILE("ok=0" + CRLF + "error=FOX2TXT_JOB invalido" + CRLF, cStatus)
    QUIT
ENDIF

cMode = "classbrowser"
IF FILE(cJob + "mode.txt")
    cMode = LOWER(ALLTRIM(FILETOSTR(cJob + "mode.txt")))
ENDIF

cSrc = cJob + "form.scx"
IF !FILE(cSrc)
    STRTOFILE("ok=0" + CRLF + "error=form.scx nao encontrado" + CRLF, cStatus)
    QUIT
ENDIF

ON ERROR DO Fail WITH ERROR(), MESSAGE(), PROGRAM(), LINENO()

LOCAL nStart
nStart = SECONDS()

TRY
    DO CASE
    CASE cMode = "scctext"
        DoScctext(cJob, cSrc, cOut)
        * No modo SCCTEXT o proprio out.txt tambem serve de fonte do layout.
        llLayout = .T.
    OTHERWISE
        * Gera o dump SCCTEXT primeiro: depois que o Class Browser abre o
        * formulario, o SccTextEngine deixa de enxergar os registros.
        llLayout = TryScctext(cJob, cSrc, cLayout)
        DoClassBrowser(cSrc, cOut)
    ENDCASE

    IF !FILE(cOut)
        Fail(0, "nenhum arquivo de saida foi gerado", "extractor", 0)
    ENDIF

    LOCAL cText, nBytes
    LOCAL ARRAY aDummy[1]
    cText = FILETOSTR(cOut)
    nBytes = LEN(cText)
    IF nBytes = 0
        Fail(0, "arquivo de saida vazio", "extractor", 0)
    ENDIF

    STRTOFILE("ok=1" + CRLF + ;
              "mode=" + cMode + CRLF + ;
              "bytes=" + TRANSFORM(nBytes) + CRLF + ;
              "lines=" + TRANSFORM(ALINES(aDummy, cText)) + CRLF + ;
              "layout=" + IIF(llLayout, "1", "0") + CRLF + ;
              "ms=" + TRANSFORM(INT((SECONDS() - nStart) * 1000)) + CRLF, cStatus)

CATCH TO loErr
    Fail(loErr.ErrorNo, loErr.Message, "extractor", loErr.LineNo)
ENDTRY

QUIT


PROCEDURE DoClassBrowser(tcSrc, tcOut)
    LOCAL oB, oNodes, i, nWait

    * a janela principal precisa existir durante o Init do Class Browser;
    * ela e escondida logo abaixo, antes da geracao do codigo
    _SCREEN.Visible = .T.

    DO (HOME() + "browser.app") WITH tcSrc

    * espera o Class Browser terminar de inicializar (com limite de tempo)
    nWait = SECONDS() + 10
    DO WHILE SECONDS() < nWait
        IF TYPE("_oBrowser") = "O" AND _oBrowser.lInitialized
            EXIT
        ENDIF
        DOEVENTS
    ENDDO

    IF TYPE("_oBrowser") <> "O"
        Fail(0, "Class Browser nao criou _oBrowser", "DoClassBrowser", 0)
    ENDIF

    oB = _oBrowser
    IF !oB.lInitialized
        Fail(0, "Class Browser nao inicializou", "DoClassBrowser", 0)
    ENDIF

    * esconde a UI: extracao roda sem janela visivel
    oB.Visible = .F.
    FOR i = 1 TO _SCREEN.FORMCOUNT
        TRY
            IF _SCREEN.FORMS(i).Name <> oB.Name
                _SCREEN.FORMS(i).Visible = .F.
            ENDIF
        CATCH
        ENDTRY
    ENDFOR

    * seleciona o no da classe do formulario (no 1 = arquivo, no 2 = classe)
    TRY
        oNodes = oB.oleClassList.Object.Nodes
        IF oNodes.Count >= 2
            oNodes(2).Selected = .T.
        ENDIF
    CATCH
    ENDTRY

    * destino do codigo gerado (default seria HOME()\viewcode.prg, somente leitura)
    oB.cViewCodeFileName = tcOut

    oB.cmdExport.Click()

ENDPROC


PROCEDURE DoScctext(tcJob, tcSrc, tcOut)
    LOCAL cEngine, oScc

    * SCCTEXT.PRG fica em HOME() (somente leitura); copia para a pasta do job
    cEngine = tcJob + "scctext.prg"
    COPY FILE (HOME() + "scctext.prg") TO (cEngine)

    SET PROCEDURE TO (cEngine) ADDITIVE

    oScc = CREATEOBJECT("SccTextEngine", tcSrc, "K", tcOut, .T., 4)
    IF VARTYPE(oScc) <> "O"
        Fail(0, "nao foi possivel instanciar SccTextEngine", "DoScctext", 0)
    ENDIF
    oScc.SetErrorOff = .T.
    oScc.Process()

    IF oScc.iResult <> 0
        Fail(0, "SCCTEXT falhou: " + oScc.cMessage, "DoScctext", 0)
    ENDIF
ENDPROC


* Versao tolerante a falhas do SCCTEXT, usada apenas para gerar o layout
* quando o modo principal e o Class Browser. Nunca chama Fail()/QUIT.
PROCEDURE TryScctext(tcJob, tcSrc, tcOut)
    LOCAL cEngine, oScc, llOk

    llOk = .F.

    TRY
        cEngine = tcJob + "scctext.prg"
        IF !FILE(cEngine)
            COPY FILE (HOME() + "scctext.prg") TO (cEngine)
        ENDIF

        SET PROCEDURE TO (cEngine) ADDITIVE

        oScc = CREATEOBJECT("SccTextEngine", tcSrc, "K", tcOut, .T., 4)
        IF VARTYPE(oScc) = "O"
            oScc.SetErrorOff = .T.
            oScc.Process()
            * O SCCTEXT descarrega o arquivo ao encerrar o processo; o Node
            * confere o layout.txt depois que o VFP fecha.
            oScc = .NULL.
            llOk = .T.
        ENDIF
    CATCH
        llOk = .F.
    ENDTRY

    RETURN llOk
ENDPROC


PROCEDURE Fail(tnErr, tcMsg, tcProg, tnLine)
    LOCAL cStatus
    cStatus = ADDBS(GETENV("FOX2TXT_JOB")) + "status.txt"
    STRTOFILE("ok=0" + CRLF + ;
              "error=" + STRTRAN(tcMsg, CRLF, " ") + CRLF + ;
              "errno=" + TRANSFORM(tnErr) + CRLF + ;
              "where=" + tcProg + ":" + TRANSFORM(tnLine) + CRLF, cStatus)
    QUIT
ENDPROC
