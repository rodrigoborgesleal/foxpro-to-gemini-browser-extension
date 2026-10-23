#DEFINE CRLF CHR(13) + CHR(10)
*------------------------------------------------------------------------------
* fb2p.prg - conversao bidirecional .scx/.sct <-> .sc2 com FoxBin2Prg
*
* Entrada (variaveis de ambiente):
*   FOX2TXT_JOB          pasta do job
*   FOX2TXT_FB2P         pasta do runtime do FoxBin2Prg (fora do projeto)
*   FOX2TXT_FB2P_FILE    arquivo de entrada (form.scx ou form.sc2)
*   FOX2TXT_FB2P_TYPE    BIN2PRG | PRG2BIN
*
* Saida:
*   out.txt              copia do .sc2 no modo BIN2PRG
*   layout.txt           pr??via de layout (SCCTEXT, opcional)
*   form.scx / form.sct  binario gerado no modo PRG2BIN
*   status.txt           chave=valor
*------------------------------------------------------------------------------
SET TALK OFF
SET SAFETY OFF
SET NOTIFY OFF
SET ESCAPE OFF
SET RESOURCE OFF
SET PROCEDURE TO
CLOSE DATABASES ALL

LOCAL cJob, cFb2p, cFile, cDirection, cStatus, cOut, cLayout
LOCAL lnStart, lnOk, lnLayout, lnRecords, lnFields, cErrLog, cErrText
LOCAL cScx, cSct, cSc2

cJob = ADDBS(GETENV("FOX2TXT_JOB"))
cFb2p = ADDBS(GETENV("FOX2TXT_FB2P"))
cFile = GETENV("FOX2TXT_FB2P_FILE")
cDirection = UPPER(GETENV("FOX2TXT_FB2P_TYPE"))
cStatus = cJob + "status.txt"
cOut = cJob + "out.txt"
cLayout = cJob + "layout.txt"
cErrLog = cJob + "foxbin2prg_errorlog.ERR"
lnStart = SECONDS()
lnOk = 0
lnLayout = 0
lnRecords = 0
lnFields = 0
cScx = cJob + "form.scx"
cSct = cJob + "form.sct"
cSc2 = cJob + "form.sc2"

IF EMPTY(cJob) OR !DIRECTORY(cJob)
    STRTOFILE("ok=0" + CRLF + "error=pasta do job invalida" + CRLF, cStatus)
    QUIT
ENDIF

IF EMPTY(cFb2p) OR !FILE(cFb2p + "foxbin2prg.prg")
    STRTOFILE("ok=0" + CRLF + "error=FoxBin2Prg nao instalado em " + cFb2p + CRLF, cStatus)
    QUIT
ENDIF

IF EMPTY(cFile) OR !FILE(cFile)
    STRTOFILE("ok=0" + CRLF + "error=arquivo de entrada nao encontrado: " + cFile + CRLF, cStatus)
    QUIT
ENDIF

IF !INLIST(cDirection, "BIN2PRG", "PRG2BIN")
    cDirection = IIF(LOWER(JUSTEXT(cFile)) == "sc2", "PRG2BIN", "BIN2PRG")
ENDIF

ON ERROR DO Fail WITH ERROR(), MESSAGE(), PROGRAM(), LINENO()

TRY
    * Gera a pr??via de layout antes de o FoxBin2Prg abrir o formulario.
    * A falha aqui nao invalida a conversao.
    IF cDirection == "BIN2PRG"
        lnLayout = IIF(DoLayout(cJob, cFile, cLayout), 1, 0)
    ENDIF

    * Evita que um erro antigo seja confundido com o resultado atual.
    ERASE (cErrLog)
    ERASE (ADDBS(cFb2p) + "foxbin2prg_errorlog.ERR")

    DO (cFb2p + "foxbin2prg.prg") WITH cFile, cDirection, "", ;
        (cDirection == "BIN2PRG"), "1", "0", "1", "", "1", "0"

    IF !FILE(cErrLog) AND FILE(ADDBS(cFb2p) + "foxbin2prg_errorlog.ERR")
        cErrLog = ADDBS(cFb2p) + "foxbin2prg_errorlog.ERR"
    ENDIF
    IF FILE(cErrLog)
        cErrText = FILETOSTR(cErrLog)
        IF !EMPTY(ALLTRIM(cErrText))
            Fail(0, "FoxBin2Prg: " + LEFT(STRTRAN(cErrText, CRLF, " "), 500), "fb2p", 0)
        ENDIF
    ENDIF

    DO CASE
    CASE cDirection == "BIN2PRG"
        IF !FILE(cSc2)
            Fail(0, "FoxBin2Prg nao gerou o arquivo .sc2", "fb2p", 0)
        ENDIF
        IF FileBytes(cSc2) = 0
            Fail(0, "FoxBin2Prg gerou um .sc2 vazio", "fb2p", 0)
        ENDIF
        COPY FILE (cSc2) TO (cOut)
        lnOk = 1

    CASE cDirection == "PRG2BIN"
        * Se o cabeçalho do .sc2 apontar para outro nome, o FoxBin2Prg grava
        * esse nome. Normaliza para form.scx/form.sct para o restante do fluxo.
        IF !FILE(cScx) OR !FILE(cSct)
            LOCAL ARRAY aScx[1]
            LOCAL lnScx, lnI, lcName, lcStem
            lnScx = ADIR(aScx, cJob + "*.scx")
            FOR lnI = 1 TO lnScx
                lcName = aScx[lnI, 1]
                IF UPPER(lcName) == "ORIGINAL.SCX"
                    LOOP
                ENDIF
                lcStem = JUSTSTEM(lcName)
                IF FILE(cJob + lcStem + ".sct")
                    COPY FILE (cJob + lcName) TO (cScx)
                    COPY FILE (cJob + lcStem + ".sct") TO (cSct)
                    EXIT
                ENDIF
            ENDFOR
        ENDIF

        IF !FILE(cScx) OR !FILE(cSct)
            Fail(0, "FoxBin2Prg nao gerou o .scx/.sct", "fb2p", 0)
        ENDIF
        IF FileBytes(cScx) = 0 OR FileBytes(cSct) = 0
            Fail(0, "FoxBin2Prg gerou .scx/.sct vazio", "fb2p", 0)
        ENDIF

        * Compila e valida a tabela gerada. O FoxBin2Prg ja recompila com
        * cRecompile=1, mas repetir aqui deixa o erro explicito no status.
        COMPILE FORM (cScx)
        USE (cScx) ALIAS fb2chk IN 0 SHARED
        lnRecords = RECCOUNT("fb2chk")
        lnFields = FCOUNT("fb2chk")
        USE IN fb2chk
        lnOk = 1
    ENDCASE
CATCH TO loErr
    Fail(loErr.ErrorNo, loErr.Message, "fb2p", loErr.LineNo)
ENDTRY

IF lnOk = 1
    STRTOFILE("ok=1" + CRLF + ;
              "mode=foxbin2prg" + CRLF + ;
              "direction=" + cDirection + CRLF + ;
              "bytes=" + TRANSFORM(FileBytes(IIF(cDirection == "BIN2PRG", cOut, cScx))) + CRLF + ;
              "lines=" + TRANSFORM(CountLines(IIF(cDirection == "BIN2PRG", cOut, cScx))) + CRLF + ;
              "layout=" + TRANSFORM(lnLayout) + CRLF + ;
              "records=" + TRANSFORM(lnRecords) + CRLF + ;
              "fields=" + TRANSFORM(lnFields) + CRLF + ;
              "ms=" + TRANSFORM(INT((SECONDS() - lnStart) * 1000)) + CRLF, cStatus)
ENDIF

QUIT


PROCEDURE DoLayout(tcJob, tcSrc, tcLayout)
    LOCAL cEngine, oScc, llOk
    llOk = .F.

    TRY
        cEngine = tcJob + "scctext.prg"
        IF !FILE(cEngine)
            COPY FILE (HOME() + "scctext.prg") TO (cEngine)
        ENDIF

        SET PROCEDURE TO (cEngine) ADDITIVE
        oScc = CREATEOBJECT("SccTextEngine", tcSrc, "K", tcLayout, .T., 4)
        IF VARTYPE(oScc) == "O"
            oScc.SetErrorOff = .T.
            oScc.Process()
            oScc = .NULL.
            llOk = FILE(tcLayout) AND FileBytes(tcLayout) > 0
        ENDIF
    CATCH
        llOk = .F.
    ENDTRY

    SET PROCEDURE TO
    CLOSE DATABASES ALL
    RETURN llOk
ENDPROC


FUNCTION FileBytes(tcFile)
    LOCAL nHandle, nSize
    IF !FILE(tcFile)
        RETURN 0
    ENDIF
    nHandle = FOPEN(tcFile)
    IF nHandle < 0
        RETURN 0
    ENDIF
    nSize = FSEEK(nHandle, 0, 2)
    =FCLOSE(nHandle)
    RETURN nSize
ENDFUNC


FUNCTION CountLines(tcFile)
    LOCAL ARRAY aDummy[1]
    IF !FILE(tcFile)
        RETURN 0
    ENDIF
    RETURN ALINES(aDummy, FILETOSTR(tcFile))
ENDFUNC


PROCEDURE Fail(tnErr, tcMsg, tcProg, tnLine)
    LOCAL cStatus
    cStatus = ADDBS(GETENV("FOX2TXT_JOB")) + "status.txt"
    STRTOFILE("ok=0" + CRLF + ;
              "mode=foxbin2prg" + CRLF + ;
              "error=" + STRTRAN(tcMsg, CRLF, " ") + CRLF + ;
              "errno=" + TRANSFORM(tnErr) + CRLF + ;
              "where=" + tcProg + ":" + TRANSFORM(tnLine) + CRLF, cStatus)
    QUIT
ENDPROC
