'use strict';
/**
 * vfp-language.js - base estatica de sintaxe/IntelliSense do Visual FoxPro 9.
 *
 * Fontes consultadas somente para leitura:
 *   - C:\\Program Files (x86)\\Microsoft Visual FoxPro 9\\Foxcode.DBF
 *     (comandos e assinaturas de funcoes do IntelliSense nativo da IDE);
 *   - C:\\Program Files (x86)\\Microsoft Visual FoxPro 9\\VFP9ENU.DLL
 *     (strings de comandos/classes, via analise REA ja documentada);
 *   - analyser local foxpro9-vcode-mod/src/data/vfp-language.js
 *     (PEMs por classe base e descricoes em portugues).
 *
 * Eh um arquivo de dados puro: nao executa nada e nao depende de modulo.
 * Carregado antes de sidepanel.js em sidepanel.html.
 */

(function (root) {
  const DATA = {
  "KEYWORDS": [
    "ACCEPT",
    "ACTIVATE",
    "ADD",
    "ADDPROPERTY",
    "ALL",
    "ALTER",
    "AND",
    "APPEND",
    "ARRAY",
    "AS",
    "ASSERT",
    "AVERAGE",
    "AVG",
    "BEGIN",
    "BETWEEN",
    "BLANK",
    "BROWSE",
    "BUILD",
    "BY",
    "CALCULATE",
    "CALL",
    "CANCEL",
    "CASE",
    "CAST",
    "CATCH",
    "CD",
    "CHANGE",
    "CHDIR",
    "CLASS",
    "CLEAR",
    "CLOSE",
    "COMPILE",
    "CONTINUE",
    "COPY",
    "COUNT",
    "CREATE",
    "CURSOR",
    "DATABASE",
    "DEACTIVATE",
    "DEBUG",
    "DEBUGOUT",
    "DECLARE",
    "DEFINE",
    "DELETE",
    "DIMENSION",
    "DIR",
    "DISPLAY",
    "DISTINCT",
    "DO",
    "DOCK",
    "DOEVENTS",
    "DROP",
    "ECHO",
    "EDIT",
    "EJECT",
    "ELSE",
    "END",
    "ENDCASE",
    "ENDDEFINE",
    "ENDDO",
    "ENDFOR",
    "ENDFUNC",
    "ENDIF",
    "ENDMENU",
    "ENDPRINTJOB",
    "ENDPROC",
    "ENDSCAN",
    "ENDTEXT",
    "ENDTRY",
    "ENDWITH",
    "ERASE",
    "ERROR",
    "EXISTS",
    "EXIT",
    "EXPORT",
    "EXTERNAL",
    "FALSE",
    "FILER",
    "FINALLY",
    "FIND",
    "FLUSH",
    "FOR",
    "FORM",
    "FREE",
    "FROM",
    "FULL",
    "FUNCTION",
    "GATHER",
    "GETEXPR",
    "GO",
    "GOTO",
    "GROUP",
    "HAVING",
    "HELP",
    "HIDDEN",
    "HIDE",
    "IF",
    "IMPLEMENTS",
    "IMPORT",
    "IN",
    "INDEX",
    "INNER",
    "INPUT",
    "INSERT",
    "INTO",
    "IS",
    "JOIN",
    "KEYBOARD",
    "LABEL",
    "LEFT",
    "LIKE",
    "LIST",
    "LOAD",
    "LOCAL",
    "LOCATE",
    "LOOP",
    "LPARAMETERS",
    "MACRO",
    "MAX",
    "MD",
    "MENU",
    "MIN",
    "MKDIR",
    "MODIFY",
    "MOUSE",
    "MOVE",
    "NEXT",
    "NODEFAULT",
    "NOT",
    "NOTE",
    "NULL",
    "OBJECT",
    "OLEPUBLIC",
    "ON",
    "OPEN",
    "OR",
    "ORDER",
    "OTHERWISE",
    "OUTER",
    "PACK",
    "PARAMETERS",
    "PLAY",
    "POP",
    "PRINTJOB",
    "PRIVATE",
    "PROCEDURE",
    "PROTECTED",
    "PUBLIC",
    "PUSH",
    "QUIT",
    "RD",
    "READ",
    "RECALL",
    "REGIONAL",
    "REINDEX",
    "RELEASE",
    "REMOVE",
    "RENAME",
    "REPLACE",
    "REPORT",
    "RESTORE",
    "RESUME",
    "RETRY",
    "RETURN",
    "RIGHT",
    "RMDIR",
    "ROLLBACK",
    "RUN",
    "SAVE",
    "SCAN",
    "SCATTER",
    "SCROLL",
    "SEEK",
    "SELECT",
    "SET",
    "SHOW",
    "SIZE",
    "SKIP",
    "SORT",
    "STEP",
    "STORE",
    "SUM",
    "SUSPEND",
    "TABLE",
    "TEXT",
    "THEN",
    "THROW",
    "TO",
    "TOP",
    "TOTAL",
    "TRANSACTION",
    "TRUE",
    "TRY",
    "TYPE",
    "UNION",
    "UNKNOWN",
    "UNLOCK",
    "UPDATE",
    "USE",
    "VALIDATE",
    "VALUES",
    "WAIT",
    "WHERE",
    "WHILE",
    "WINDOW",
    "WITH",
    "ZAP",
    "ZOOM"
  ],
  "SQL_KEYWORDS": [
    "SELECT",
    "FROM",
    "WHERE",
    "GROUP BY",
    "ORDER BY",
    "HAVING",
    "INNER JOIN",
    "LEFT JOIN",
    "LEFT OUTER JOIN",
    "RIGHT JOIN",
    "RIGHT OUTER JOIN",
    "FULL JOIN",
    "JOIN",
    "UNION",
    "ALL",
    "DISTINCT",
    "INTO",
    "CURSOR",
    "TABLE",
    "ARRAY",
    "AS",
    "BETWEEN",
    "LIKE",
    "EXISTS",
    "INSERT INTO",
    "DELETE FROM",
    "UPDATE",
    "SET",
    "VALUES",
    "NULL",
    "IS",
    "AND",
    "OR",
    "NOT",
    "IN",
    "TOP",
    "CAST",
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
    "INTO CURSOR",
    "INTO TABLE",
    "INTO ARRAY"
  ],
  "COMMANDS": [
    {
      "name": "ACCEPT",
      "sig": ""
    },
    {
      "name": "ACTIVATE",
      "sig": ""
    },
    {
      "name": "ADD",
      "sig": ""
    },
    {
      "name": "ADD OBJECT",
      "sig": ""
    },
    {
      "name": "ADDPROPERTY",
      "sig": ""
    },
    {
      "name": "ALTER",
      "sig": ""
    },
    {
      "name": "ALTER TABLE",
      "sig": "ALTER TABLE TableName1 ADD | ALTER [COLUMN] FieldName1 FieldType [(nFieldWidth [, nPrecision])] [NULL | NOT NULL] [CHECK lExpression1 [ERROR cMessageText1]] [AUTOINC [NEXTVALUE nValue [STEP nValue]]] [DEFAULT eExpression"
    },
    {
      "name": "APPEND",
      "sig": ""
    },
    {
      "name": "ASSERT",
      "sig": "ASSERT lExpression [MESSAGE cMessageText]"
    },
    {
      "name": "AVERAGE",
      "sig": "AVERAGE [ExpressionList] [Scope] [FOR lExpression1] [WHILE lExpression2] [TO VarList | TO ARRAY ArrayName] [NOOPTIMIZE]"
    },
    {
      "name": "BEGIN",
      "sig": ""
    },
    {
      "name": "BEGIN TRANSACTION",
      "sig": ""
    },
    {
      "name": "BLANK",
      "sig": "BLANK [FIELDS FieldList] [DEFAULT [AUTOINC]] [Scope] [FOR lExpression1] [WHILE lExpression2] [NOOPTIMIZE] [IN nWorkArea | cTableAlias]"
    },
    {
      "name": "BROWSE",
      "sig": "BROWSE [FIELDS FieldList] [FONT cFontName [, nFontSize [, nFontCharSet]]] [STYLE cFontStyle] [FOR lExpression1 [REST]] [FORMAT] [FREEZE FieldName] [KEY eExpression1 [, eExpression2]] [LAST | NOINIT] [LOCK nNumberOfFields"
    },
    {
      "name": "BUILD",
      "sig": ""
    },
    {
      "name": "CALCULATE",
      "sig": "CALCULATE eExpressionList [Scope] [FOR lExpression1] [WHILE lExpression2] [TO VarList | TO ARRAY ArrayName] [NOOPTIMIZE] [IN nWorkArea | cTableAlias] eExpressionList:: AVG(nExpression) CNT() MAX(eExpression) MIN(eExpress"
    },
    {
      "name": "CALL",
      "sig": ""
    },
    {
      "name": "CANCEL",
      "sig": ""
    },
    {
      "name": "CASE",
      "sig": ""
    },
    {
      "name": "CATCH",
      "sig": "TRY [ tryCommands ] [ CATCH [ TO VarName ] [ WHEN lExpression ] [ catchCommands ]] [ FINALLY [ finallyCommands ]] ENDTRY"
    },
    {
      "name": "CD",
      "sig": ""
    },
    {
      "name": "CHANGE",
      "sig": "CHANGE [FIELDS FieldList] [Scope] [FOR lExpression1] [WHILE lExpression2] [FONT cFontName [, nFontSize [, nFontCharSet]]] [STYLE cFontStyle] [FREEZE FieldName] [KEY eExpression1 [, eExpression2]] [LAST | NOINIT] [LPARTIT"
    },
    {
      "name": "CHDIR",
      "sig": ""
    },
    {
      "name": "CLEAR",
      "sig": ""
    },
    {
      "name": "CLOSE",
      "sig": ""
    },
    {
      "name": "COMPILE",
      "sig": "COMPILE [DATABASE | FORM | CLASSLIB | LABEL | REPORT] FileName | FileSkeleton [?] COMPILE FileName | FileSkeleton | ? [ENCRYPT] [NODEBUG] [AS nCodePage]"
    },
    {
      "name": "CONTINUE",
      "sig": ""
    },
    {
      "name": "COPY",
      "sig": ""
    },
    {
      "name": "COUNT",
      "sig": "COUNT [Scope] [FOR lExpression1] [WHILE lExpression2] [TO VarName] [NOOPTIMIZE]"
    },
    {
      "name": "CREATE",
      "sig": ""
    },
    {
      "name": "DEACTIVATE",
      "sig": ""
    },
    {
      "name": "DEBUG",
      "sig": ""
    },
    {
      "name": "DEBUGOUT",
      "sig": "DEBUGOUT eExpression1 [, eExpression2] "
    },
    {
      "name": "DECLARE",
      "sig": "DECLARE [cFunctionType] FunctionName IN WIN32API | LibraryName [AS AliasName] [cParamType1 [@] ParamName1, cParamType2 [@] ParamName2, ...]"
    },
    {
      "name": "DEFINE",
      "sig": ""
    },
    {
      "name": "DEFINE CLASS",
      "sig": ""
    },
    {
      "name": "DELETE",
      "sig": ""
    },
    {
      "name": "DIMENSION",
      "sig": "DIMENSION ArrayName1(nRows1 [, nColumns1]) [AS cType] [, ArrayName2(nRows2 [, nColumns2])] ..."
    },
    {
      "name": "DIR",
      "sig": "DIR | DIRECTORY [ON Drive] [[LIKE] [Path] [FileSkeleton]] [TO PRINTER [PROMPT] | TO FILE FileName [ADDITIVE]]"
    },
    {
      "name": "DISPLAY",
      "sig": ""
    },
    {
      "name": "DO",
      "sig": ""
    },
    {
      "name": "DO CASE",
      "sig": ""
    },
    {
      "name": "DO WHILE",
      "sig": ""
    },
    {
      "name": "DOCK",
      "sig": "DOCK WINDOW WindowName | NAME ObjectName POSITION nPosition [ WINDOW WindowName | NAME ObjectName ] Position: 0 Top 1 Left 2 Right 3 Bottom 4 Tabbed -1 Undock Window -2 Undock Outer Container -3 Undock Inner Container"
    },
    {
      "name": "DOEVENTS",
      "sig": "DOEVENTS [FORCE]"
    },
    {
      "name": "DROP",
      "sig": ""
    },
    {
      "name": "ECHO",
      "sig": ""
    },
    {
      "name": "EDIT",
      "sig": "EDIT [FIELDS FieldList] [Scope] [FOR lExpression1] [WHILE lExpression2] [FONT cFontName [, nFontSize [, nFontCharSet]]] [STYLE cFontStyle] [FREEZE FieldName] [KEY eExpression1 [, eExpression2]] [LAST | NOINIT] [LPARTITIO"
    },
    {
      "name": "EJECT",
      "sig": "EJECT PAGE"
    },
    {
      "name": "ELSE",
      "sig": ""
    },
    {
      "name": "END TRANSACTION",
      "sig": ""
    },
    {
      "name": "ENDCASE",
      "sig": ""
    },
    {
      "name": "ENDDEFINE",
      "sig": ""
    },
    {
      "name": "ENDDO",
      "sig": ""
    },
    {
      "name": "ENDFOR",
      "sig": ""
    },
    {
      "name": "ENDFUNC",
      "sig": ""
    },
    {
      "name": "ENDIF",
      "sig": ""
    },
    {
      "name": "ENDMENU",
      "sig": ""
    },
    {
      "name": "ENDPRINTJOB",
      "sig": ""
    },
    {
      "name": "ENDPROC",
      "sig": ""
    },
    {
      "name": "ENDSCAN",
      "sig": ""
    },
    {
      "name": "ENDTEXT",
      "sig": ""
    },
    {
      "name": "ENDTRY",
      "sig": ""
    },
    {
      "name": "ENDWITH",
      "sig": ""
    },
    {
      "name": "ERASE",
      "sig": "ERASE FileName | ?[RECYCLE]"
    },
    {
      "name": "ERROR",
      "sig": "ERROR nErrorNumber | nErrorNumber, cMessageText1 | [cMessageText2]"
    },
    {
      "name": "EXIT",
      "sig": ""
    },
    {
      "name": "EXPORT",
      "sig": "EXPORT TO FileName [TYPE] DIF | MOD | SYLK | WK1 | WKS | WR1 | WRK | XLS | XL5 [FIELDS FieldList] [Scope] [FOR lExpression1] [WHILE lExpression2] [NOOPTIMIZE] [AS nCodePage]"
    },
    {
      "name": "EXTERNAL",
      "sig": "EXTERNAL FILE FileList | ARRAY ArrayList| CLASS | FORM | LABEL | LIBRARY | MENU | PROCEDURE | QUERY | REPORT | SCREEN | TABLE"
    },
    {
      "name": "FILER",
      "sig": ""
    },
    {
      "name": "FINALLY",
      "sig": "TRY [ tryCommands ] [ CATCH [ TO VarName ] [ WHEN lExpression ] [ catchCommands ]] [ FINALLY [ finallyCommands ]] ENDTRY"
    },
    {
      "name": "FIND",
      "sig": ""
    },
    {
      "name": "FLUSH",
      "sig": "[(IN <nWorkArea> | <cTableAlias>) | <cFileSpec> ] [FORCE]"
    },
    {
      "name": "FOR",
      "sig": "FOR Var = nInitialValue TO nFinalValue [STEP nIncrement] Commands [EXIT] [LOOP] ENDFOR | NEXT FOR EACH Var [AS type [OF class library]] IN Group [FOXOBJECT] Commands [EXIT] [LOOP] ENDFOR | NEXT [Var]"
    },
    {
      "name": "FREE TABLE",
      "sig": "FREE TABLE TableName"
    },
    {
      "name": "FUNCTION",
      "sig": "FUNCTION FunctionName [LPARAMETERS parameter1 [,parameter2, ...] Commands [RETURN [eExpression]] ENDFUNC"
    },
    {
      "name": "GATHER",
      "sig": "GATHER FROM ArrayName | NAME ObjectName | MEMVAR [FIELDS FieldList | FIELDS LIKE Skeleton | FIELDS EXCEPT Skeleton] [MEMO]"
    },
    {
      "name": "GETEXPR",
      "sig": "GETEXPR [cCaptionText] TO MemVarName [TYPE cExpressionType [; cErrorMessageText]] [DEFAULT cDefaultExpression]"
    },
    {
      "name": "GO",
      "sig": "GO TOP | BOTTOM | [RECORD] nRecordNumber [IN nWorkArea | IN cTableAlias]"
    },
    {
      "name": "GOTO",
      "sig": "GOTO TOP | BOTTOM | [RECORD] nRecordNumber [IN nWorkArea | IN cTableAlias]"
    },
    {
      "name": "HELP",
      "sig": "HELP [Topic | ID nContextID] [IN [WINDOW] WindowName | IN [WINDOW] SCREEN| IN [WINDOW] [NOWAIT]"
    },
    {
      "name": "HIDDEN",
      "sig": "HIDDEN [PROCEDURE | FUNCTION] MemberName"
    },
    {
      "name": "HIDE",
      "sig": ""
    },
    {
      "name": "IF",
      "sig": "IF lExpression [THEN] Commands [ELSE Commands] ENDIF"
    },
    {
      "name": "IMPLEMENTS",
      "sig": "IMPLEMENTS cInterfaceName [EXCLUDE] IN TypeLib | TypeLibGUID | ProgID"
    },
    {
      "name": "IMPORT",
      "sig": ""
    },
    {
      "name": "IMPORT FROM",
      "sig": "IMPORT FROM FileName [DATABASE DatabaseName [NAME LongTableName]] [TYPE] FW2 | MOD | PDOX | RPD | WK1| WK3 | WKS | WR1 | WRK | XLS| XL5 [SHEET cSheetName] | XL8 [SHEET cSheetName] [AS nCodePage]"
    },
    {
      "name": "INDEX",
      "sig": ""
    },
    {
      "name": "INDEX ON",
      "sig": "INDEX ON eExpression TO IDXFileName | TAG TagName [BINARY] [COLLATE cCollateSequence] [OF CDXFileName] [FOR lExpression] [COMPACT] [ASCENDING | DESCENDING] [UNIQUE | CANDIDATE] [ADDITIVE]"
    },
    {
      "name": "INPUT",
      "sig": ""
    },
    {
      "name": "INSERT",
      "sig": "INSERT INTO dbf_name [(fname1 [, fname2, ...])] VALUES (eExpression1 [, eExpression2, ...]) INSERT INTO dbf_name FROM ARRAY ArrayName | FROM MEMVAR | FROM NAME ObjectName INSERT INTO dbf_name [(fname1 [, fname2, ...])] S"
    },
    {
      "name": "JOIN",
      "sig": ""
    },
    {
      "name": "KEYBOARD",
      "sig": "KEYBOARD cKeyboardValue [PLAIN] [CLEAR]"
    },
    {
      "name": "LABEL",
      "sig": ""
    },
    {
      "name": "LABEL FORM",
      "sig": "LABEL [FORM FileName1 | FORM ?] [ENVIRONMENT] [Scope][FOR lExpression1] [WHILE lExpression2] [NOCONSOLE] [NOOPTIMIZE] [PDSETUP] [PREVIEW [NOWAIT]] [NAME ObjectName] [TO PRINTER [PROMPT] | TO FILE FileName2]"
    },
    {
      "name": "LIST",
      "sig": ""
    },
    {
      "name": "LOAD",
      "sig": ""
    },
    {
      "name": "LOCAL",
      "sig": "LOCAL cVariable1 [AS cType [OF cClassLib]], cVariable2, ..., cVariableN LOCAL [ARRAY] ArrayName1(nRows1 [, nColumns1]) [, ArrayName2(nRows2 [, nColumns2])] ..."
    },
    {
      "name": "LOCATE",
      "sig": "LOCATE FOR lExpression1 [Scope] [WHILE] [NOOPTIMIZE]"
    },
    {
      "name": "LOOP",
      "sig": ""
    },
    {
      "name": "LPARAMETERS",
      "sig": "LPARAMETERS ParameterList"
    },
    {
      "name": "MD",
      "sig": "MD cPath | MKDIR cPath"
    },
    {
      "name": "MENU",
      "sig": ""
    },
    {
      "name": "MKDIR",
      "sig": "MD cPath | MKDIR cPath"
    },
    {
      "name": "MODIFY",
      "sig": ""
    },
    {
      "name": "MOUSE",
      "sig": "MOUSE [CLICK | DBLCLICK] [AT nRow1, nColumn1] | DRAG TO nRow2, nColumn2, nRow3, nColumn3 ...] [PIXELS] [WINDOW cWindowName] [LEFT | MIDDLE | RIGHT] [SHIFT] [CONTROL] [ALT]"
    },
    {
      "name": "MOVE",
      "sig": ""
    },
    {
      "name": "NEXT",
      "sig": ""
    },
    {
      "name": "NODEFAULT",
      "sig": ""
    },
    {
      "name": "NOTE",
      "sig": "NOTE [Comments]"
    },
    {
      "name": "OBJECT",
      "sig": ""
    },
    {
      "name": "OLEPUBLIC",
      "sig": ""
    },
    {
      "name": "ON",
      "sig": ""
    },
    {
      "name": "OPEN",
      "sig": ""
    },
    {
      "name": "OPEN DATABASE",
      "sig": ""
    },
    {
      "name": "OTHERWISE",
      "sig": ""
    },
    {
      "name": "PACK",
      "sig": "PACK [MEMO | DBF] [Tablename] [IN nWorkarea | cTableAlias] PACK DATABASE"
    },
    {
      "name": "PARAMETERS",
      "sig": "PARAMETERS ParameterList"
    },
    {
      "name": "PLAY",
      "sig": ""
    },
    {
      "name": "PLAY MACRO",
      "sig": "PLAY MACRO MacroName [TIME nDelay]"
    },
    {
      "name": "POP",
      "sig": ""
    },
    {
      "name": "PRINTJOB",
      "sig": "PRINTJOB Commands"
    },
    {
      "name": "PRIVATE",
      "sig": "PRIVATE VarList PRIVATE ALL [LIKE Skeleton | EXCEPT Skeleton]"
    },
    {
      "name": "PROCEDURE",
      "sig": "PROCEDURE ProcedureName [LPARAMETERS parameter1 [,parameter2, ...] Commands [RETURN [eExpression]] ENDPROC"
    },
    {
      "name": "PROTECTED",
      "sig": "PROTECTED [PROCEDURE | FUNCTION] MemberName"
    },
    {
      "name": "PUBLIC",
      "sig": "PUBLIC cVariable1 [AS cType [OF cClassLib]], cVariable2, ..., cVariableN PUBLIC [ARRAY] ArrayName1(nRows1 [, nColumns1]) [, ArrayName2(nRows2 [, nColumns2])] ..."
    },
    {
      "name": "PUSH",
      "sig": ""
    },
    {
      "name": "QUIT",
      "sig": ""
    },
    {
      "name": "RD",
      "sig": "RD cPath | RMDIR cPath"
    },
    {
      "name": "READ",
      "sig": "READ EVENTS"
    },
    {
      "name": "RECALL",
      "sig": "RECALL [Scope] [FOR lExpression1] [WHILE lExpression2] [NOOPTIMIZE] [IN nWorkArea | cTableAlias]"
    },
    {
      "name": "REGIONAL",
      "sig": ""
    },
    {
      "name": "REINDEX",
      "sig": "REINDEX [COMPACT]"
    },
    {
      "name": "RELEASE",
      "sig": ""
    },
    {
      "name": "REMOVE",
      "sig": ""
    },
    {
      "name": "RENAME",
      "sig": "RENAME File1 TO File2"
    },
    {
      "name": "REPLACE",
      "sig": ""
    },
    {
      "name": "REPORT",
      "sig": ""
    },
    {
      "name": "REPORT FORM",
      "sig": "REPORT FORM FileName1 | ? [ENVIRONMENT] [Scope] [FOR lExpression1] [WHILE lExpression2] [HEADING cHeadingText] [NOCONSOLE] [NOOPTIMIZE] [PLAIN] [RANGE nStartPage [, nEndPage]] [PREVIEW [[IN] WINDOW WindowName | IN SCREEN"
    },
    {
      "name": "RESTORE",
      "sig": ""
    },
    {
      "name": "RESUME",
      "sig": ""
    },
    {
      "name": "RETRY",
      "sig": ""
    },
    {
      "name": "RETURN",
      "sig": "RETURN [eExpression | TO MASTER | TO ProcedureName]"
    },
    {
      "name": "RMDIR",
      "sig": "RD cPath | RMDIR cPath"
    },
    {
      "name": "ROLLBACK",
      "sig": ""
    },
    {
      "name": "RUN",
      "sig": "RUN [/N]"
    },
    {
      "name": "SAVE",
      "sig": ""
    },
    {
      "name": "SCAN",
      "sig": "SCAN [NOOPTIMIZE] [Scope] [FOR lExpression1] [WHILE lExpression2] [Commands] [LOOP] [EXIT] ENDSCAN"
    },
    {
      "name": "SCATTER",
      "sig": "SCATTER [FIELDS FieldNameList | FIELDS LIKE Skeleton | FIELDS EXCEPT Skeleton] [MEMO] [BLANK] TO ArrayName | MEMVAR | NAME ObjectName [ADDITIVE]"
    },
    {
      "name": "SCROLL",
      "sig": ""
    },
    {
      "name": "SEEK",
      "sig": "SEEK eExpression [ORDER nIndexNumber | IDXIndexFileName| [TAG] TagName [OF CDXFileName][ASCENDING | DESCENDING]] [IN nWorkArea | cTableAlias]"
    },
    {
      "name": "SELECT",
      "sig": "SELECT [ALL | DISTINCT] [TOP nExpr [PERCENT]] Select_List_Item [, ...] FROM [FORCE] Table_List_Item [, ...] [WITH (BUFFERING = lExpr)] [[JoinType] JOIN DatabaseName!]Table [[AS] Local_Alias] [ON JoinCondition [AND | OR ["
    },
    {
      "name": "SET",
      "sig": ""
    },
    {
      "name": "SHOW",
      "sig": ""
    },
    {
      "name": "SIZE",
      "sig": ""
    },
    {
      "name": "SKIP",
      "sig": "SKIP [nRecords] [IN nWorkArea | cTableAlias]"
    },
    {
      "name": "SORT",
      "sig": "SORT TO TableName ON FieldName1 [/A | /D] [/C] [, FieldName2 [/A | /D] [/C] ...] [ASCENDING | DESCENDING] [Scope] [FOR lExpression1] [WHILE lExpression2] [FIELDS FieldNameList | FIELDS LIKE Skeleton | FIELDS EXCEPT Skele"
    },
    {
      "name": "STEP",
      "sig": ""
    },
    {
      "name": "STORE",
      "sig": "STORE eExpression TO VarNameList | ArrayNameList"
    },
    {
      "name": "SUM",
      "sig": "SUM [eExpressionList] [Scope] [FOR lExpression1] [WHILE lExpression2] [TO MemVarNameList | TO ARRAY ArrayName] [NOOPTIMIZE]"
    },
    {
      "name": "SUSPEND",
      "sig": ""
    },
    {
      "name": "TEXT",
      "sig": "TEXT [TO VarName [ADDITIVE] [TEXTMERGE] [NOSHOW] [FLAGS nValue] [PRETEXT eValue]] ENDTEXT Special FLAGS Values (additive): 1 - suppress output to _TEXT file 2 - preserve blank lines preceding any text Special PRETEXT Val"
    },
    {
      "name": "THEN",
      "sig": ""
    },
    {
      "name": "THROW",
      "sig": "THROW [ <eUserExpression> ]"
    },
    {
      "name": "TO",
      "sig": ""
    },
    {
      "name": "TOTAL",
      "sig": "TOTAL TO TableName ON FieldName [FIELDS FieldNameList] [Scope] [FOR lExpression1] [WHILE lExpression2] [NOOPTIMIZE]"
    },
    {
      "name": "TRY",
      "sig": "TRY [ tryCommands ] [ CATCH [ TO VarName ] [ WHEN lExpression ] [ catchCommands ]] [ FINALLY [ finallyCommands ]] ENDTRY"
    },
    {
      "name": "TYPE",
      "sig": "TYPE FileName1 [AUTO] [WRAP] [TO PRINTER [PROMPT] | TO FILE FileName2] [NUMBER]"
    },
    {
      "name": "UNLOCK",
      "sig": "UNLOCK[RECORD nRecordNumber] [IN nWorkArea | cTableAlias] [ALL]"
    },
    {
      "name": "UPDATE",
      "sig": "UPDATE [DatabaseName1!]TableName1 SET Column_Name1 = eExpression1 [, Column_Name2 = eExpression2 ...] WHERE FilterCondition1 [AND | OR FilterCondition2 ...]]"
    },
    {
      "name": "USE",
      "sig": ""
    },
    {
      "name": "VALIDATE DATABASE",
      "sig": "VALIDATE DATABASE [RECOVER] [NOCONSOLE] [TO PRINTER [PROMPT] | TO FILE FileName]"
    },
    {
      "name": "WAIT",
      "sig": "WAIT [eMessageText] [TO VarName] [WINDOW [AT nRow, nColumn]] [NOWAIT] [CLEAR | NOCLEAR] [TIMEOUT nSeconds]"
    },
    {
      "name": "WITH",
      "sig": ""
    },
    {
      "name": "ZAP",
      "sig": "ZAP [IN nWorkArea | cTableAlias]"
    },
    {
      "name": "ZOOM WINDOW",
      "sig": "ZOOM WINDOW WindowName MIN | MAX | NORM [AT nRow1, nColumn1 | FROM AT nRow1, nColumn1 [SIZE AT nRow2, nColumn2 | TO nRow2, nColumn2]]"
    }
  ],
  "FUNCTIONS": [
    {
      "name": "ABS",
      "sig": "ABS(nExpression)",
      "doc": ""
    },
    {
      "name": "ACLASS",
      "sig": "ACLASS(ArrayName, oExpression)",
      "doc": ""
    },
    {
      "name": "ACOPY",
      "sig": "ACOPY(SourceArrayName, DestinationArrayName [, nFirstSourceElement [, nNumberElements [, nFirstDestElement]]])",
      "doc": ""
    },
    {
      "name": "ACOS",
      "sig": "ACOS(nExpression)",
      "doc": ""
    },
    {
      "name": "ADATABASES",
      "sig": "ADATABASES(ArrayName)",
      "doc": ""
    },
    {
      "name": "ADBOBJECTS",
      "sig": "ADBOBJECTS(ArrayName, cSetting)",
      "doc": ""
    },
    {
      "name": "ADDBS",
      "sig": "ADDBS(cPath)",
      "doc": ""
    },
    {
      "name": "ADDPROPERTY",
      "sig": "ADDPROPERTY(oObjectName, cPropertyName [,eValue])",
      "doc": ""
    },
    {
      "name": "ADEL",
      "sig": "ADEL(ArrayName, nElementNumber [, 2])",
      "doc": ""
    },
    {
      "name": "ADIR",
      "sig": "ADIR(ArrayName [, cFileSkeleton [, cAttribute [, nFlags]]])",
      "doc": ""
    },
    {
      "name": "ADLLS",
      "sig": "ADLLS(ArrayName)",
      "doc": ""
    },
    {
      "name": "ADOCKSTATE",
      "sig": "ADOCKSTATE(ArrayName [, nType [, nExtended]])",
      "doc": ""
    },
    {
      "name": "AELEMENT",
      "sig": "AELEMENT(ArrayName, nRowSubscript [, nColumnSubscript])",
      "doc": ""
    },
    {
      "name": "AERROR",
      "sig": "AERROR(ArrayName)",
      "doc": ""
    },
    {
      "name": "AEVENTS",
      "sig": "AEVENTS(arrayname, [0 | 1 | oEventObject])",
      "doc": ""
    },
    {
      "name": "AFIELDS",
      "sig": "AFIELDS(ArrayName [, nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "AFONT",
      "sig": "AFONT(ArrayName [, cFontName [, nFontSize | nFontCharSet [, nFlags]]])",
      "doc": ""
    },
    {
      "name": "AGETCLASS",
      "sig": "AGETCLASS(ArrayName [, cLibraryName [, cClassName [, cTitleText [, cFileNameCaption [, cButtonCaption]]]]])",
      "doc": ""
    },
    {
      "name": "AGETFILEVERSION",
      "sig": "AGETFILEVERSION(ArrayName, cFileName)",
      "doc": ""
    },
    {
      "name": "AINS",
      "sig": "AINS(ArrayName, nElementNumber [, 2])",
      "doc": ""
    },
    {
      "name": "AINSTANCE",
      "sig": "AINSTANCE(ArrayName, cClassName)",
      "doc": ""
    },
    {
      "name": "ALANGUAGE",
      "sig": "ALANGUAGE(ArrayName, nType)",
      "doc": ""
    },
    {
      "name": "ALEN",
      "sig": "ALEN(ArrayName [, nDimension])",
      "doc": "Numero de elementos, linhas ou colunas de um array."
    },
    {
      "name": "ALIAS",
      "sig": "ALIAS([nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "ALINES",
      "sig": "ALINES(ArrayName, cExpression [, nFlags][, cParseChar])",
      "doc": ""
    },
    {
      "name": "ALLTRIM",
      "sig": "ALLTRIM(cExpression)",
      "doc": "Remove espacos a esquerda e a direita."
    },
    {
      "name": "AMEMBERS",
      "sig": "AMEMBERS(ArrayName, ObjectName | cClassName [, nArrayContentsID [, cFlags]])",
      "doc": ""
    },
    {
      "name": "AMOUSEOBJ",
      "sig": "AMOUSEOBJ(ArrayName [, 1])",
      "doc": ""
    },
    {
      "name": "ANETRESOURCES",
      "sig": "ANETRESOURCES(ArrayName, cNetworkName, nResourceType)",
      "doc": ""
    },
    {
      "name": "APRINTERS",
      "sig": "APRINTERS(ArrayName [,1])",
      "doc": ""
    },
    {
      "name": "APROCINFO",
      "sig": "APROCINFO(ArrayName, cProgramName [, nType])",
      "doc": ""
    },
    {
      "name": "ASC",
      "sig": "ASC(cExpression)",
      "doc": "Codigo ANSI do primeiro caractere."
    },
    {
      "name": "ASCAN",
      "sig": "ASCAN(ArrayName, eExpression [, nStartElement [, nElementsSearched]])",
      "doc": "Procura um valor no array e devolve o indice."
    },
    {
      "name": "ASELOBJ",
      "sig": "ASELOBJ(ArrayName [, 1 | 2 | 3])",
      "doc": ""
    },
    {
      "name": "ASESSIONS",
      "sig": "ASESSIONS(ArrayName)",
      "doc": ""
    },
    {
      "name": "ASIN",
      "sig": "ASIN(nExpression)",
      "doc": ""
    },
    {
      "name": "ASORT",
      "sig": "ASORT(ArrayName [, nStartElement [, nNumberSorted [, nSortOrder [, nFlags]]]])",
      "doc": ""
    },
    {
      "name": "ASQLHANDLES",
      "sig": "ASQLHANDLES(ArrayName [, nStatementHandle])",
      "doc": ""
    },
    {
      "name": "ASTACKINFO",
      "sig": "ASTACKINFO(ArrayName)",
      "doc": ""
    },
    {
      "name": "ASUBSCRIPT",
      "sig": "ASUBSCRIPT(ArrayName, nElementNumber, nSubscript)",
      "doc": ""
    },
    {
      "name": "AT",
      "sig": "AT(cSearchExpression, cExpressionSearched [, nOccurrence])",
      "doc": "Posicao de uma substring."
    },
    {
      "name": "AT_C",
      "sig": "AT_C(cSearchExpression, cExpressionSearched [, nOccurrence])",
      "doc": ""
    },
    {
      "name": "ATAGINFO",
      "sig": "ATAGINFO(ArrayName [, cCDXName [, nWorkArea | cTableAlias]])",
      "doc": ""
    },
    {
      "name": "ATAN",
      "sig": "ATAN(nExpression)",
      "doc": ""
    },
    {
      "name": "ATC",
      "sig": "ATC(cSearchExpression, cExpressionSearched [, nOccurrence])",
      "doc": ""
    },
    {
      "name": "ATCC",
      "sig": "ATCC(cSearchExpression, cExpressionSearched [, nOccurrence])",
      "doc": ""
    },
    {
      "name": "ATCLINE",
      "sig": "ATCLINE(cSearchExpression, cExpressionSearched)",
      "doc": ""
    },
    {
      "name": "ATLINE",
      "sig": "ATLINE(cSearchExpression, cExpressionSearched)",
      "doc": ""
    },
    {
      "name": "ATN2",
      "sig": "ATN2(nYCoordinate, nXCoordinate)",
      "doc": ""
    },
    {
      "name": "AUSED",
      "sig": "AUSED(ArrayName [, nDataSessionNumber [, cTableName]])",
      "doc": ""
    },
    {
      "name": "AVCXCLASSES",
      "sig": "AVCXCLASSES(ArrayName, cLibraryName)",
      "doc": ""
    },
    {
      "name": "AVG",
      "sig": "AVG(eExpression)",
      "doc": ""
    },
    {
      "name": "BAR",
      "sig": "BAR()",
      "doc": ""
    },
    {
      "name": "BETWEEN",
      "sig": "BETWEEN(eTestValue, eLowValue, eHighValue)",
      "doc": "Testa se o valor esta no intervalo (inclusive)."
    },
    {
      "name": "BINDEVENT",
      "sig": "BINDEVENT(oEventSource | hWnd | 0, eEvent | nMessage, oEventHandler, cDelegate [, nFlags])",
      "doc": ""
    },
    {
      "name": "BINTOC",
      "sig": "BINTOC(nExpression [, eFlags])",
      "doc": ""
    },
    {
      "name": "BITAND",
      "sig": "BITAND(nExpression1, nExpression2, ..., nExpressionN)",
      "doc": ""
    },
    {
      "name": "BITCLEAR",
      "sig": "BITCLEAR(nExpression1, nExpression2)",
      "doc": ""
    },
    {
      "name": "BITLSHIFT",
      "sig": "BITLSHIFT(nExpression1, nExpression2)",
      "doc": ""
    },
    {
      "name": "BITNOT",
      "sig": "BITNOT(nExpression)",
      "doc": ""
    },
    {
      "name": "BITOR",
      "sig": "BITOR(nExpression1, nExpression2, ..., nExpressionN)",
      "doc": ""
    },
    {
      "name": "BITRSHIFT",
      "sig": "BITRSHIFT(nExpression1, nExpression2)",
      "doc": ""
    },
    {
      "name": "BITSET",
      "sig": "BITSET(nExpression1, nExpression2)",
      "doc": ""
    },
    {
      "name": "BITTEST",
      "sig": "BITTEST(nExpression1, nExpression2)",
      "doc": ""
    },
    {
      "name": "BITXOR",
      "sig": "BITXOR(nExpression1, nExpression2, ..., nExpressionN)",
      "doc": ""
    },
    {
      "name": "BOF",
      "sig": "BOF([nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "CANDIDATE",
      "sig": "CANDIDATE([nIndexNumber [, nWorkArea | cTableAlias]])",
      "doc": ""
    },
    {
      "name": "CAPSLOCK",
      "sig": "CAPSLOCK([lExpression])",
      "doc": ""
    },
    {
      "name": "CAST",
      "sig": "CAST(eExpression AS cDataType [(nFieldWidth [, nPrecision])] [NULL | NOT NULL])",
      "doc": ""
    },
    {
      "name": "CDOW",
      "sig": "CDOW(dExpression | tExpression)",
      "doc": "Nome do dia da semana."
    },
    {
      "name": "CDX",
      "sig": "CDX(nIndexNumber [, nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "CEILING",
      "sig": "CEILING(nExpression)",
      "doc": "Arredonda para cima."
    },
    {
      "name": "CHR",
      "sig": "CHR(nANSICode)",
      "doc": "Caractere correspondente ao codigo."
    },
    {
      "name": "CHRSAW",
      "sig": "CHRSAW([nSeconds])",
      "doc": ""
    },
    {
      "name": "CHRTRAN",
      "sig": "CHRTRAN(cSearchedExpression, cSearchExpression, cReplacementExpression)",
      "doc": ""
    },
    {
      "name": "CHRTRANC",
      "sig": "CHRTRANC(cSearchedExpression, cSearchExpression, cReplacementExpression)",
      "doc": ""
    },
    {
      "name": "CLEARRESULTSET",
      "sig": "CLEARRESULTSET()",
      "doc": ""
    },
    {
      "name": "CMONTH",
      "sig": "CMONTH(dExpression | tExpression)",
      "doc": "Nome do mes."
    },
    {
      "name": "CNT",
      "sig": "CNT(eExpression)",
      "doc": ""
    },
    {
      "name": "CNTBAR",
      "sig": "CNTBAR(cMenuName)",
      "doc": ""
    },
    {
      "name": "CNTPAD",
      "sig": "CNTPAD(cMenuBarName)",
      "doc": ""
    },
    {
      "name": "COMARRAY",
      "sig": "COMARRAY(oObject [, nFlags])",
      "doc": ""
    },
    {
      "name": "COMCLASSINFO",
      "sig": "COMCLASSINFO(oObject [, nInfoType])",
      "doc": ""
    },
    {
      "name": "COMPOBJ",
      "sig": "COMPOBJ(oExpression1, oExpression2)",
      "doc": ""
    },
    {
      "name": "COMPROP",
      "sig": "COMPROP(oCOMObject, cProperty [, eValue])",
      "doc": ""
    },
    {
      "name": "COMRETURNERROR",
      "sig": "COMRETURNERROR(cExceptionSource, cExceptionText)",
      "doc": ""
    },
    {
      "name": "COS",
      "sig": "COS(nExpression)",
      "doc": ""
    },
    {
      "name": "COUNT",
      "sig": "COUNT(eExpression)",
      "doc": ""
    },
    {
      "name": "CPCONVERT",
      "sig": "CPCONVERT(nCurrentCodePage, nNewCodePage, cExpression)",
      "doc": ""
    },
    {
      "name": "CPCURRENT",
      "sig": "CPCURRENT([1 | 2])",
      "doc": "Codigo de pagina atual do sistema ou da tabela."
    },
    {
      "name": "CPDBF",
      "sig": "CPDBF([nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "CREATEBINARY",
      "sig": "CREATEBINARY(cExpression)",
      "doc": ""
    },
    {
      "name": "CREATEOBJECT",
      "sig": "CREATEOBJECT(cClassName [, eParameter1, ...])",
      "doc": "Cria uma instancia de classe (VFP ou COM)."
    },
    {
      "name": "CREATEOBJECTEX",
      "sig": "CREATEOBJECTEX(cCLSID | cPROGID, cComputerName [, cIID])",
      "doc": ""
    },
    {
      "name": "CREATEOFFLINE",
      "sig": "CREATEOFFLINE(ViewName [, cPath])",
      "doc": ""
    },
    {
      "name": "CTOBIN",
      "sig": "CTOBIN(cExpression [, cFlags])",
      "doc": ""
    },
    {
      "name": "CTOD",
      "sig": "CTOD(cExpression)",
      "doc": ""
    },
    {
      "name": "CTOT",
      "sig": "CTOT(cCharacterExpression)",
      "doc": ""
    },
    {
      "name": "CURDIR",
      "sig": "CURDIR([cExpression])",
      "doc": ""
    },
    {
      "name": "CURSORGETPROP",
      "sig": "CURSORGETPROP(cProperty [, nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "CURSORSETPROP",
      "sig": "CURSORSETPROP(cProperty [, eExpression [, cTableAlias | nWorkArea]])",
      "doc": ""
    },
    {
      "name": "CURSORTOXML",
      "sig": "CURSORTOXML(nWorkArea | cTableAlias, cXMLFile, nOutputFormat, ...)",
      "doc": "Converte cursor/tabela em XML."
    },
    {
      "name": "CURVAL",
      "sig": "CURVAL(cExpression [, cTableAlias | nWorkArea])",
      "doc": "Valor atual do registro no servidor."
    },
    {
      "name": "DATE",
      "sig": "DATE([nYear, nMonth, nDay])",
      "doc": "Data atual ou especificada."
    },
    {
      "name": "DATETIME",
      "sig": "DATETIME([nYear, nMonth, nDay [, nHours [, nMinutes [, nSeconds]]]])",
      "doc": "Data e hora como DateTime."
    },
    {
      "name": "DAY",
      "sig": "DAY(dExpression | tExpression)",
      "doc": ""
    },
    {
      "name": "DBALIAS",
      "sig": "DBALIAS()",
      "doc": ""
    },
    {
      "name": "DBC",
      "sig": "DBC()",
      "doc": ""
    },
    {
      "name": "DBF",
      "sig": "DBF([cTableAlias | nWorkArea])",
      "doc": "Nome do arquivo da area de trabalho."
    },
    {
      "name": "DBGETPROP",
      "sig": "DBGETPROP(cName, cType, cProperty)",
      "doc": ""
    },
    {
      "name": "DBSETPROP",
      "sig": "DBSETPROP(cName, cType, cProperty, ePropertyValue)",
      "doc": ""
    },
    {
      "name": "DBUSED",
      "sig": "DBUSED(cDatabaseName)",
      "doc": "Indica se o banco de dados esta aberto."
    },
    {
      "name": "DDEABORTTRANS",
      "sig": "DDEABORTTRANS(nTransactionNumber)",
      "doc": ""
    },
    {
      "name": "DDEADVISE",
      "sig": "DDEADVISE(nChannelNumber, cItemName, cUDFName, nLinkType)",
      "doc": ""
    },
    {
      "name": "DDEENABLED",
      "sig": "DDEENABLED([lExpression1 | nChannelNumber [, lExpression2]])",
      "doc": ""
    },
    {
      "name": "DDEEXECUTE",
      "sig": "DDEEXECUTE(nChannelNumber, cCommand [, cUDFName])",
      "doc": ""
    },
    {
      "name": "DDEINITIATE",
      "sig": "DDEINITIATE(cServiceName, cTopicName)",
      "doc": ""
    },
    {
      "name": "DDELASTERROR",
      "sig": "DDELASTERROR()",
      "doc": ""
    },
    {
      "name": "DDEPOKE",
      "sig": "DDEPOKE(nChannelNumber, cItemName, cDataSent [, cDataFormat [, cUDFName]])",
      "doc": ""
    },
    {
      "name": "DDEREQUEST",
      "sig": "DDEREQUEST(nChannelNumber, cItemName [, cDataFormat [, cUDFName]])",
      "doc": ""
    },
    {
      "name": "DDESETOPTION",
      "sig": "DDESETOPTION(cOption [, nTimeoutValue | lExpression])",
      "doc": ""
    },
    {
      "name": "DDESETSERVICE",
      "sig": "DDESETSERVICE(cServiceName, cOption [, cDataFormat | lExpression])",
      "doc": ""
    },
    {
      "name": "DDESETTOPIC",
      "sig": "DDESETTOPIC(cServiceName, cTopicName [, cUDFName])",
      "doc": ""
    },
    {
      "name": "DDETERMINATE",
      "sig": "DDETERMINATE(nChannelNumber | cServiceName)",
      "doc": ""
    },
    {
      "name": "DEFAULTEXT",
      "sig": "DEFAULTEXT(cFileName, cDefault)",
      "doc": ""
    },
    {
      "name": "DELETED",
      "sig": "DELETED([cTableAlias | nWorkArea])",
      "doc": "Testa se o registro atual esta marcado para exclusao."
    },
    {
      "name": "DESCENDING",
      "sig": "DESCENDING([CDXFileName [, nIndexNumber [, nWorkArea | cTableAlias]]])",
      "doc": ""
    },
    {
      "name": "DIFFERENCE",
      "sig": "DIFFERENCE(cExpression1, cExpression2)",
      "doc": ""
    },
    {
      "name": "DIRECTORY",
      "sig": "DIRECTORY(cDirectoryName [, nFlags])",
      "doc": ""
    },
    {
      "name": "DISKSPACE",
      "sig": "DISKSPACE([cVolumeName [, nDiskInfo]])",
      "doc": ""
    },
    {
      "name": "DISPLAYPATH",
      "sig": "DISPLAYPATH(cFileName, nMaxLength)",
      "doc": ""
    },
    {
      "name": "DMY",
      "sig": "DMY(dExpression | tExpression)",
      "doc": ""
    },
    {
      "name": "DODEFAULT",
      "sig": "DODEFAULT([eParameter1, ...])",
      "doc": "Executa o metodo da classe pai."
    },
    {
      "name": "DOW",
      "sig": "DOW(dExpression | tExpression [, nFirstDayOfWeek])",
      "doc": ""
    },
    {
      "name": "DRIVETYPE",
      "sig": "DRIVETYPE(cDrive)",
      "doc": ""
    },
    {
      "name": "DROPOFFLINE",
      "sig": "DROPOFFLINE(cViewName)",
      "doc": ""
    },
    {
      "name": "DTOC",
      "sig": "DTOC(dExpression | tExpression [, 1])",
      "doc": ""
    },
    {
      "name": "DTOR",
      "sig": "DTOR(nExpression)",
      "doc": ""
    },
    {
      "name": "DTOS",
      "sig": "DTOS(dExpression | tExpression)",
      "doc": ""
    },
    {
      "name": "DTOT",
      "sig": "DTOT(dDateExpression)",
      "doc": ""
    },
    {
      "name": "EDITSOURCE",
      "sig": "EDITSOURCE(nShortcutId | cFileName [, nLineno [, cClassName [, cProcName]]])",
      "doc": ""
    },
    {
      "name": "EMPTY",
      "sig": "EMPTY(eExpression)",
      "doc": "Testa se a expressao esta vazia (0, \"\", .F., .NULL.)."
    },
    {
      "name": "EOF",
      "sig": "EOF([cTableAlias | nWorkArea])",
      "doc": "Fim do arquivo atingido."
    },
    {
      "name": "ERROR",
      "sig": "ERROR()",
      "doc": ""
    },
    {
      "name": "EVALUATE",
      "sig": "EVALUATE(cExpression)",
      "doc": "Avalia uma expressao em tempo de execucao."
    },
    {
      "name": "EVENTHANDLER",
      "sig": "EVENTHANDLER(oCOMObject, oVFPObject [, lUnbind])",
      "doc": ""
    },
    {
      "name": "EVL",
      "sig": "EVL(eExpression1, eExpression2)",
      "doc": ""
    },
    {
      "name": "EXECSCRIPT",
      "sig": "EXECSCRIPT(cExpression [, eParameter1, eParameter2, ...])",
      "doc": "cExpression [, eParameter1, eParameter2, ...]"
    },
    {
      "name": "EXP",
      "sig": "EXP(nExpression)",
      "doc": ""
    },
    {
      "name": "FCHSIZE",
      "sig": "FCHSIZE(nFileHandle, nNewFileSize)",
      "doc": ""
    },
    {
      "name": "FCLOSE",
      "sig": "FCLOSE(nFileHandle)",
      "doc": ""
    },
    {
      "name": "FCOUNT",
      "sig": "FCOUNT([cTableAlias | nWorkArea])",
      "doc": "Numero de campos da tabela."
    },
    {
      "name": "FCREATE",
      "sig": "FCREATE(cFileName [, nFileAttribute])",
      "doc": ""
    },
    {
      "name": "FDATE",
      "sig": "FDATE(cFileName [, nType])",
      "doc": ""
    },
    {
      "name": "FEOF",
      "sig": "FEOF(nFileHandle)",
      "doc": ""
    },
    {
      "name": "FERROR",
      "sig": "FERROR()",
      "doc": ""
    },
    {
      "name": "FFLUSH",
      "sig": "FFLUSH(nFileHandle [, lForce])",
      "doc": ""
    },
    {
      "name": "FGETS",
      "sig": "FGETS(nFileHandle [, nBytes])",
      "doc": ""
    },
    {
      "name": "FIELD",
      "sig": "FIELD(nFieldNumber [, cTableAlias | nWorkArea])",
      "doc": "Nome do campo pela posicao."
    },
    {
      "name": "FILE",
      "sig": "FILE(cFileName)",
      "doc": "Testa a existencia de um arquivo."
    },
    {
      "name": "FILETOSTR",
      "sig": "FILETOSTR(cFileName)",
      "doc": "Le o conteudo de um arquivo como texto."
    },
    {
      "name": "FILTER",
      "sig": "FILTER([nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "FKLABEL",
      "sig": "FKLABEL(nFunctionKeyNumber)",
      "doc": ""
    },
    {
      "name": "FKMAX",
      "sig": "FKMAX()",
      "doc": ""
    },
    {
      "name": "FLOCK",
      "sig": "FLOCK([nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "FLOOR",
      "sig": "FLOOR(nExpression)",
      "doc": ""
    },
    {
      "name": "FONTMETRIC",
      "sig": "FONTMETRIC(nAttribute [, cFontName, nFontSize [, cFontStyle]])",
      "doc": ""
    },
    {
      "name": "FOPEN",
      "sig": "FOPEN(cFileName [, nAttribute])",
      "doc": ""
    },
    {
      "name": "FOR",
      "sig": "FOR([nIndexNumber [, nWorkArea | cTableAlias]])",
      "doc": ""
    },
    {
      "name": "FORCEEXT",
      "sig": "FORCEEXT(cFileName, cExtension)",
      "doc": ""
    },
    {
      "name": "FORCEPATH",
      "sig": "FORCEPATH(cFileName, cPath)",
      "doc": ""
    },
    {
      "name": "FOUND",
      "sig": "FOUND([cTableAlias | nWorkArea])",
      "doc": "Resultado do ultimo SEEK, LOCATE ou CONTINUE."
    },
    {
      "name": "FPUTS",
      "sig": "FPUTS(nFileHandle, cExpression [, nCharactersWritten])",
      "doc": ""
    },
    {
      "name": "FREAD",
      "sig": "FREAD(nFileHandle, nBytes)",
      "doc": ""
    },
    {
      "name": "FSEEK",
      "sig": "FSEEK(nFileHandle, nBytesMoved [, nRelativePosition])",
      "doc": ""
    },
    {
      "name": "FSIZE",
      "sig": "FSIZE(cFieldName [, nWorkArea | cTableAlias] | cFileName)",
      "doc": ""
    },
    {
      "name": "FTIME",
      "sig": "FTIME(cFileName)",
      "doc": ""
    },
    {
      "name": "FULLPATH",
      "sig": "FULLPATH(cFileName1 [, nMSDOSPath | cFileName2])",
      "doc": ""
    },
    {
      "name": "FV",
      "sig": "FV(nPayment, nInterestRate, nPeriods)",
      "doc": ""
    },
    {
      "name": "FWRITE",
      "sig": "FWRITE(nFileHandle, cExpression [, nCharactersWritten])",
      "doc": ""
    },
    {
      "name": "GETAUTOINCVALUE",
      "sig": "GETAUTOINCVALUE([nDataSessionNumber | 0])",
      "doc": ""
    },
    {
      "name": "GETBAR",
      "sig": "GETBAR(MenuItemName, nMenuPosition)",
      "doc": ""
    },
    {
      "name": "GETCOLOR",
      "sig": "GETCOLOR([nDefaultColorNumber])",
      "doc": ""
    },
    {
      "name": "GETCP",
      "sig": "GETCP([nCodePage [, cText [, cDialogTitle]]])",
      "doc": ""
    },
    {
      "name": "GETCURSORADAPTER",
      "sig": "GETCURSORADAPTER([ cAlias ])",
      "doc": ""
    },
    {
      "name": "GETDIR",
      "sig": "GETDIR([cDirectory [, cText [, cCaption [, nFlags [, lRootOnly]]]]])",
      "doc": ""
    },
    {
      "name": "GETENV",
      "sig": "GETENV(cVariableName)",
      "doc": ""
    },
    {
      "name": "GETFILE",
      "sig": "GETFILE([cFileExtensions] [, cDialogCaption] [, cOpenButtonCaption])",
      "doc": "Caixa de dialogo para abrir arquivo."
    },
    {
      "name": "GETFLDSTATE",
      "sig": "GETFLDSTATE(cFieldName | nFieldNumber [, cTableAlias | nWorkArea])",
      "doc": ""
    },
    {
      "name": "GETFONT",
      "sig": "GETFONT([cFontName [, nFontSize [, cFontStyle [, nFontCharSet]]]])",
      "doc": ""
    },
    {
      "name": "GETHOST",
      "sig": "GETHOST()",
      "doc": ""
    },
    {
      "name": "GETINTERFACE",
      "sig": "GETINTERFACE(oObject [, cIID | cInterface [, cTypelib | cProgID]])",
      "doc": ""
    },
    {
      "name": "GETNEXTMODIFIED",
      "sig": "GETNEXTMODIFIED(nRecordNumber [, cTableAlias | nWorkArea [, lNoFire]])",
      "doc": ""
    },
    {
      "name": "GETOBJECT",
      "sig": "GETOBJECT(FileName | Moniker [, ClassName])",
      "doc": ""
    },
    {
      "name": "GETPAD",
      "sig": "GETPAD(cMenuBarName, nMenuBarPosition)",
      "doc": ""
    },
    {
      "name": "GETPEM",
      "sig": "GETPEM(oObjectName | cClassName, cProperty | cEvent | cMethod)",
      "doc": ""
    },
    {
      "name": "GETPICT",
      "sig": "GETPICT([cFileExtensions [, cFileNameCaption [, cOpenButtonCaption]]])",
      "doc": ""
    },
    {
      "name": "GETPRINTER",
      "sig": "GETPRINTER()",
      "doc": ""
    },
    {
      "name": "GETRESULTSET",
      "sig": "GETRESULTSET()",
      "doc": ""
    },
    {
      "name": "GETWORDCOUNT",
      "sig": "GETWORDCOUNT(cString [, cDelimiter])",
      "doc": ""
    },
    {
      "name": "GETWORDNUM",
      "sig": "GETWORDNUM(cString, nIndex [, cDelimiters])",
      "doc": "Devolve a n-esima palavra da string."
    },
    {
      "name": "GOMONTH",
      "sig": "GOMONTH(dExpression | tExpression, nNumberOfMonths)",
      "doc": ""
    },
    {
      "name": "HEADER",
      "sig": "HEADER([nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "HOME",
      "sig": "HOME([nLocation])",
      "doc": ""
    },
    {
      "name": "HOUR",
      "sig": "HOUR(tExpression)",
      "doc": ""
    },
    {
      "name": "ICASE",
      "sig": "ICASE(lCondition1, eResult1 [, lCondition2, eResult2 ] . [, eOtherwiseResult])",
      "doc": ""
    },
    {
      "name": "ID",
      "sig": "ID()",
      "doc": ""
    },
    {
      "name": "IDXCOLLATE",
      "sig": "IDXCOLLATE([cCDXFileName [, nIndexNumber [, nWorkArea | cTableAlias]]])",
      "doc": ""
    },
    {
      "name": "IIF",
      "sig": "IIF(lExpression, eExpression1, eExpression2)",
      "doc": "Retorna um valor conforme a condicao."
    },
    {
      "name": "IMESTATUS",
      "sig": "IMESTATUS([nExpression])",
      "doc": ""
    },
    {
      "name": "INDBC",
      "sig": "INDBC(cDatabaseObjectName, cType)",
      "doc": ""
    },
    {
      "name": "INDEXSEEK",
      "sig": "INDEXSEEK(eExpression [, lMovePointer [, nWorkArea | cTableAlias [, nIndexNumber | cIDXIndexFileName | cTagName]]])",
      "doc": ""
    },
    {
      "name": "INKEY",
      "sig": "INKEY([nSeconds] [, cHideCursor])",
      "doc": "Codigo da tecla pressionada; cede tempo ao Windows."
    },
    {
      "name": "INLIST",
      "sig": "INLIST(eExpression1, eExpression2 [, eExpression3 ...])",
      "doc": "Testa se o valor esta em uma lista."
    },
    {
      "name": "INPUTBOX",
      "sig": "INPUTBOX(cPrompt [, cTitle] [, cDefault] [, nTimeout])",
      "doc": "Solicita uma entrada do usuario."
    },
    {
      "name": "INSMODE",
      "sig": "INSMODE([lExpression])",
      "doc": ""
    },
    {
      "name": "INT",
      "sig": "INT(nExpression)",
      "doc": ""
    },
    {
      "name": "ISALPHA",
      "sig": "ISALPHA(cExpression)",
      "doc": ""
    },
    {
      "name": "ISBLANK",
      "sig": "ISBLANK(eExpression)",
      "doc": ""
    },
    {
      "name": "ISCOLOR",
      "sig": "ISCOLOR()",
      "doc": ""
    },
    {
      "name": "ISDIGIT",
      "sig": "ISDIGIT(cExpression)",
      "doc": ""
    },
    {
      "name": "ISEXCLUSIVE",
      "sig": "ISEXCLUSIVE([cTableAlias | nWorkArea | cDatabaseName [, nType]])",
      "doc": ""
    },
    {
      "name": "ISFLOCKED",
      "sig": "ISFLOCKED([nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "ISHOSTED",
      "sig": "ISHOSTED()",
      "doc": ""
    },
    {
      "name": "ISLEADBYTE",
      "sig": "ISLEADBYTE(cExpression)",
      "doc": ""
    },
    {
      "name": "ISLOWER",
      "sig": "ISLOWER(cExpression)",
      "doc": ""
    },
    {
      "name": "ISMEMOFETCHED",
      "sig": "ISMEMOFETCHED(cFieldName | nFieldNumber [, nWorkArea | cTableAlias ])",
      "doc": ""
    },
    {
      "name": "ISMOUSE",
      "sig": "ISMOUSE()",
      "doc": ""
    },
    {
      "name": "ISNULL",
      "sig": "ISNULL(eExpression)",
      "doc": "Testa se o resultado e .NULL."
    },
    {
      "name": "ISPEN",
      "sig": "ISPEN()",
      "doc": ""
    },
    {
      "name": "ISREADONLY",
      "sig": "ISREADONLY([nWorkArea | cTableAlias | 0])",
      "doc": ""
    },
    {
      "name": "ISRLOCKED",
      "sig": "ISRLOCKED([nRecordNumber [, nWorkArea | cTableAlias]])",
      "doc": ""
    },
    {
      "name": "ISTRANSACTABLE",
      "sig": "ISTRANSACTABLE([nWorkArea | cAlias])",
      "doc": ""
    },
    {
      "name": "ISUPPER",
      "sig": "ISUPPER(cExpression)",
      "doc": ""
    },
    {
      "name": "JUSTDRIVE",
      "sig": "JUSTDRIVE(cPath)",
      "doc": ""
    },
    {
      "name": "JUSTEXT",
      "sig": "JUSTEXT(cPath)",
      "doc": ""
    },
    {
      "name": "JUSTFNAME",
      "sig": "JUSTFNAME(cFileName)",
      "doc": ""
    },
    {
      "name": "JUSTPATH",
      "sig": "JUSTPATH(cFileName)",
      "doc": ""
    },
    {
      "name": "JUSTSTEM",
      "sig": "JUSTSTEM(cFileName)",
      "doc": ""
    },
    {
      "name": "KEY",
      "sig": "KEY([CDXFileName [, nIndexNumber [, nWorkArea | cTableAlias]]])",
      "doc": ""
    },
    {
      "name": "KEYMATCH",
      "sig": "KEYMATCH(eIndexKey [, nIndexNumber [, nWorkArea | cTableAlias]])",
      "doc": ""
    },
    {
      "name": "LASTKEY",
      "sig": "LASTKEY()",
      "doc": ""
    },
    {
      "name": "LASTREC",
      "sig": "LASTREC([cTableAlias | nWorkArea])",
      "doc": "Numero de registros da tabela."
    },
    {
      "name": "LEFT",
      "sig": "LEFT(cExpression, nExpression)",
      "doc": "Os n caracteres mais a esquerda."
    },
    {
      "name": "LEFTC",
      "sig": "LEFTC(cExpression, nExpression)",
      "doc": ""
    },
    {
      "name": "LEN",
      "sig": "LEN(cExpression)",
      "doc": "Tamanho da string."
    },
    {
      "name": "LENC",
      "sig": "LENC(cExpression)",
      "doc": ""
    },
    {
      "name": "LIKE",
      "sig": "LIKE(cExpression1, cExpression2)",
      "doc": "Comparacao com curingas * e ?."
    },
    {
      "name": "LIKEC",
      "sig": "LIKEC(cExpression1, cExpression2)",
      "doc": ""
    },
    {
      "name": "LINENO",
      "sig": "LINENO([1])",
      "doc": ""
    },
    {
      "name": "LOADPICTURE",
      "sig": "LOADPICTURE([cFileName])",
      "doc": ""
    },
    {
      "name": "LOCFILE",
      "sig": "LOCFILE(cFileName [, cFileExtensions] [, cDialogCaption])",
      "doc": "Localiza um arquivo."
    },
    {
      "name": "LOCK",
      "sig": "LOCK([nWorkArea | cTableAlias] | [cRecordNumberList, nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "LOG",
      "sig": "LOG(nExpression)",
      "doc": ""
    },
    {
      "name": "LOG10",
      "sig": "LOG10(nExpression)",
      "doc": ""
    },
    {
      "name": "LOOKUP",
      "sig": "LOOKUP(ReturnField, eSearchExpression, SearchedField [, cTagName])",
      "doc": ""
    },
    {
      "name": "LOWER",
      "sig": "LOWER(cExpression)",
      "doc": "Converte para minusculas."
    },
    {
      "name": "LTRIM",
      "sig": "LTRIM(cExpression)",
      "doc": "Remove espacos a esquerda."
    },
    {
      "name": "LUPDATE",
      "sig": "LUPDATE([nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "MAKETRANSACTABLE",
      "sig": "MAKETRANSACTABLE([nWorkArea | cAlias])",
      "doc": ""
    },
    {
      "name": "MAX",
      "sig": "MAX(eExpression1, eExpression2 [, ...])",
      "doc": "Maior valor."
    },
    {
      "name": "MCOL",
      "sig": "MCOL([cClassName])",
      "doc": "Numeros de propriedades, eventos e metodos de uma classe."
    },
    {
      "name": "MDOWN",
      "sig": "MDOWN()",
      "doc": ""
    },
    {
      "name": "MDX",
      "sig": "MDX(nIndexNumber [, nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "MDY",
      "sig": "MDY(dExpression | tExpression)",
      "doc": ""
    },
    {
      "name": "MEMLINES",
      "sig": "MEMLINES(MemoFieldName)",
      "doc": ""
    },
    {
      "name": "MEMORY",
      "sig": "MEMORY()",
      "doc": ""
    },
    {
      "name": "MENU",
      "sig": "MENU()",
      "doc": ""
    },
    {
      "name": "MESSAGE",
      "sig": "MESSAGE([1])",
      "doc": "Mensagem do erro atual (ou pilha de chamada com 1)."
    },
    {
      "name": "MESSAGEBOX",
      "sig": "MESSAGEBOX(cMessageText [, nDialogBoxType [, cTitleBarText]])",
      "doc": "Caixa de mensagem modal."
    },
    {
      "name": "MIN",
      "sig": "MIN(eExpression1, eExpression2 [, ...])",
      "doc": "Menor valor."
    },
    {
      "name": "MINUTE",
      "sig": "MINUTE(tExpression)",
      "doc": ""
    },
    {
      "name": "MLINE",
      "sig": "MLINE(MemoFieldName, nLineNumber [, nNumberOfCharacters])",
      "doc": ""
    },
    {
      "name": "MOD",
      "sig": "MOD(nDividend, nDivisor)",
      "doc": "Resto da divisao."
    },
    {
      "name": "MONTH",
      "sig": "MONTH(dExpression | tExpression)",
      "doc": "Numero do mes."
    },
    {
      "name": "MRKBAR",
      "sig": "MRKBAR(cMenuName, nMenuItemNumber | cSystemMenuItemName)",
      "doc": ""
    },
    {
      "name": "MRKPAD",
      "sig": "MRKPAD(cMenuBarName, cMenuTitleName)",
      "doc": ""
    },
    {
      "name": "MROW",
      "sig": "MROW([cWindowName [, nScaleMode]])",
      "doc": ""
    },
    {
      "name": "MTON",
      "sig": "MTON(mExpression)",
      "doc": ""
    },
    {
      "name": "MWINDOW",
      "sig": "MWINDOW([cWindowName])",
      "doc": ""
    },
    {
      "name": "NDX",
      "sig": "NDX(nIndexNumber [, nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "NEWOBJECT",
      "sig": "NEWOBJECT(cClassName [, cModule [, cInApplication [, eParameter1, ...]]])",
      "doc": "Cria objeto por classe, com suporte a parametros."
    },
    {
      "name": "NORMALIZE",
      "sig": "NORMALIZE(cExpression)",
      "doc": ""
    },
    {
      "name": "NTOM",
      "sig": "NTOM(nExpression)",
      "doc": ""
    },
    {
      "name": "NUMLOCK",
      "sig": "NUMLOCK([lExpression])",
      "doc": ""
    },
    {
      "name": "NVL",
      "sig": "NVL(eExpression1, eExpression2)",
      "doc": ""
    },
    {
      "name": "OBJTOCLIENT",
      "sig": "OBJTOCLIENT(ObjectName, nPosition)",
      "doc": ""
    },
    {
      "name": "OCCURS",
      "sig": "OCCURS(cSearchExpression, cExpressionSearched)",
      "doc": "Numero de ocorrencias de uma substring."
    },
    {
      "name": "OLDVAL",
      "sig": "OLDVAL(cExpression [, cTableAlias | nWorkArea])",
      "doc": ""
    },
    {
      "name": "ON",
      "sig": "ON(cONCommand [, KeyLabelName])",
      "doc": ""
    },
    {
      "name": "ORDER",
      "sig": "ORDER([nWorkArea | cTableAlias [, nPath]])",
      "doc": ""
    },
    {
      "name": "OS",
      "sig": "OS([nOSInfo])",
      "doc": ""
    },
    {
      "name": "PAD",
      "sig": "PAD([cMenuTitle [, cMenuBarName]])",
      "doc": ""
    },
    {
      "name": "PADC",
      "sig": "PADC(eExpression, nResultSize [, cPadCharacter])",
      "doc": ""
    },
    {
      "name": "PADL",
      "sig": "PADL(eExpression, nResultSize [, cPadCharacter])",
      "doc": "Preenche a esquerda."
    },
    {
      "name": "PADR",
      "sig": "PADR(eExpression, nResultSize [, cPadCharacter])",
      "doc": "Preenche a direita."
    },
    {
      "name": "PADSTR",
      "sig": "PADSTR(cExpression, nLength [, cPadCharacter])",
      "doc": "Ajusta o tamanho da string."
    },
    {
      "name": "PARAMETERS",
      "sig": "PARAMETERS ParameterList",
      "doc": "Declara parametros recebidos."
    },
    {
      "name": "PAYMENT",
      "sig": "PAYMENT(nPrincipal, nInterestRate, nPayments)",
      "doc": ""
    },
    {
      "name": "PCOL",
      "sig": "PCOL()",
      "doc": ""
    },
    {
      "name": "PCOUNT",
      "sig": "PCOUNT()",
      "doc": "Numero de parametros recebidos."
    },
    {
      "name": "PEMSTATUS",
      "sig": "PEMSTATUS(oObjectName | cClassName, cProperty | cEvent | cMethod | cObject, nAttribute)",
      "doc": ""
    },
    {
      "name": "PI",
      "sig": "PI()",
      "doc": ""
    },
    {
      "name": "POPUP",
      "sig": "POPUP([cMenuName])",
      "doc": ""
    },
    {
      "name": "PRIMARY",
      "sig": "PRIMARY([nIndexNumber] [, cTableAlias | nWorkArea])",
      "doc": "Indice primario da tabela."
    },
    {
      "name": "PRINTSTATUS",
      "sig": "PRINTSTATUS()",
      "doc": ""
    },
    {
      "name": "PRMBAR",
      "sig": "PRMBAR(cMenuName, nMenuItemNumber)",
      "doc": ""
    },
    {
      "name": "PRMPAD",
      "sig": "PRMPAD(cMenuBarName, cMenuTitleName)",
      "doc": ""
    },
    {
      "name": "PROGRAM",
      "sig": "PROGRAM([nLevel])",
      "doc": "Nome do programa em execucao."
    },
    {
      "name": "PROMPT",
      "sig": "PROMPT()",
      "doc": ""
    },
    {
      "name": "PROPER",
      "sig": "PROPER(cExpression)",
      "doc": "Capitaliza cada palavra."
    },
    {
      "name": "PROW",
      "sig": "PROW()",
      "doc": ""
    },
    {
      "name": "PRTINFO",
      "sig": "PRTINFO(nPrinterSetting [, cPrinterName])",
      "doc": ""
    },
    {
      "name": "PUTFILE",
      "sig": "PUTFILE([cCustomText [, cFileName [, cFileExtensions]]])",
      "doc": ""
    },
    {
      "name": "PV",
      "sig": "PV(nPayment, nInterestRate, nTotalPayments)",
      "doc": ""
    },
    {
      "name": "QUARTER",
      "sig": "QUARTER(dExpression | tExpression [, nMonth])",
      "doc": ""
    },
    {
      "name": "RAISEEVENT",
      "sig": "RAISEEVENT(oEventSource, cEvent [, eParm1,...])",
      "doc": ""
    },
    {
      "name": "RAND",
      "sig": "RAND([nSeedValue])",
      "doc": ""
    },
    {
      "name": "RAT",
      "sig": "RAT(cSearchExpression, cExpressionSearched [, nOccurrence])",
      "doc": "Posicao da substring a partir do fim."
    },
    {
      "name": "RATC",
      "sig": "RATC(cSearchExpression, cExpressionSearched [, nOccurrence])",
      "doc": ""
    },
    {
      "name": "RATLINE",
      "sig": "RATLINE(cSearchExpression, cExpressionSearched)",
      "doc": ""
    },
    {
      "name": "RECCOUNT",
      "sig": "RECCOUNT([cTableAlias | nWorkArea])",
      "doc": "Numero de registros."
    },
    {
      "name": "RECNO",
      "sig": "RECNO([cTableAlias | nWorkArea])",
      "doc": "Numero do registro atual."
    },
    {
      "name": "RECSIZE",
      "sig": "RECSIZE([cTableAlias | nWorkArea])",
      "doc": "Tamanho do registro."
    },
    {
      "name": "REFRESH",
      "sig": "REFRESH([nRecords [, nRecordOffset]] [, cTableAlias | nWorkArea])",
      "doc": ""
    },
    {
      "name": "RELATION",
      "sig": "RELATION(nRelationNumber [, nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "REMOVEPROPERTY",
      "sig": "REMOVEPROPERTY(oObjectName, cPropertyName)",
      "doc": ""
    },
    {
      "name": "REPLICATE",
      "sig": "REPLICATE(cExpression, nTimes)",
      "doc": "Repete a string n vezes."
    },
    {
      "name": "REQUERY",
      "sig": "REQUERY([nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "RGB",
      "sig": "RGB(nRedValue, nGreenValue, nBlueValue)",
      "doc": "Compoe uma cor de 24 bits."
    },
    {
      "name": "RGBSCHEME",
      "sig": "RGBSCHEME(nColorSchemeNumber [, nColorPairPosition])",
      "doc": ""
    },
    {
      "name": "RIGHT",
      "sig": "RIGHT(cExpression, nCharacters)",
      "doc": ""
    },
    {
      "name": "RIGHTC",
      "sig": "RIGHTC(cExpression, nCharacters)",
      "doc": ""
    },
    {
      "name": "RLOCK",
      "sig": "RLOCK([cTableAlias | nWorkArea] [, cRecordNumberList])",
      "doc": "Bloqueia registros."
    },
    {
      "name": "ROUND",
      "sig": "ROUND(nExpression, nDecimalPlaces)",
      "doc": "Arredonda para n casas decimais."
    },
    {
      "name": "ROW",
      "sig": "ROW()",
      "doc": "Posicao da linha do cursor na tela."
    },
    {
      "name": "RTOD",
      "sig": "RTOD(nExpression)",
      "doc": ""
    },
    {
      "name": "RTRIM",
      "sig": "RTRIM(cExpression)",
      "doc": "Remove espacos a direita."
    },
    {
      "name": "SAVEPICTURE",
      "sig": "SAVEPICTURE(oObjectReference, cFileName)",
      "doc": ""
    },
    {
      "name": "SCHEME",
      "sig": "SCHEME(nSchemeNumber [, nColorPairNumber])",
      "doc": ""
    },
    {
      "name": "SCOLS",
      "sig": "SCOLS()",
      "doc": ""
    },
    {
      "name": "SEC",
      "sig": "SEC(tExpression)",
      "doc": ""
    },
    {
      "name": "SECONDS",
      "sig": "SECONDS()",
      "doc": ""
    },
    {
      "name": "SEEK",
      "sig": "SEEK(eExpression [, cTableAlias | nWorkArea] [, cOrderName])",
      "doc": "Procura por indice."
    },
    {
      "name": "SELECT",
      "sig": "SELECT(nWorkArea | cTableAlias)",
      "doc": "Seleciona a area de trabalho."
    },
    {
      "name": "SET",
      "sig": "SET(cSETCommand [, 1 | 2])",
      "doc": "Devolve o valor de um SET."
    },
    {
      "name": "SETFLDSTATE",
      "sig": "SETFLDSTATE(cFieldName | nFieldNumber, nFieldState [, cTableAlias | nWorkArea])",
      "doc": ""
    },
    {
      "name": "SETRESULTSET",
      "sig": "SETRESULTSET(<nWorkArea> | <cTableAlias>)",
      "doc": ""
    },
    {
      "name": "SIGN",
      "sig": "SIGN(nExpression)",
      "doc": ""
    },
    {
      "name": "SIN",
      "sig": "SIN(nExpression)",
      "doc": ""
    },
    {
      "name": "SKPBAR",
      "sig": "SKPBAR(cMenuName, MenuItemNumber)",
      "doc": ""
    },
    {
      "name": "SKPPAD",
      "sig": "SKPPAD(cMenuBarName, cMenuTitleName)",
      "doc": ""
    },
    {
      "name": "SOUNDEX",
      "sig": "SOUNDEX(cExpression)",
      "doc": ""
    },
    {
      "name": "SPACE",
      "sig": "SPACE(nSpaces)",
      "doc": "String com n espacos."
    },
    {
      "name": "SQLCANCEL",
      "sig": "SQLCANCEL(nConnectionHandle)",
      "doc": ""
    },
    {
      "name": "SQLCOLUMNS",
      "sig": "SQLCOLUMNS(nConnectionHandle, cTableName [, \"FOXPRO\" | \"NATIVE\" [, cCursorName]])",
      "doc": ""
    },
    {
      "name": "SQLCOMMIT",
      "sig": "SQLCOMMIT(nConnectionHandle)",
      "doc": ""
    },
    {
      "name": "SQLCONNECT",
      "sig": "SQLCONNECT([nStatementHandle | [cConnectionName | cDataSourcename [, cUserID[, cPassword]][, lSharable]]])",
      "doc": ""
    },
    {
      "name": "SQLDISCONNECT",
      "sig": "SQLDISCONNECT(nConnectionHandle)",
      "doc": ""
    },
    {
      "name": "SQLEXEC",
      "sig": "SQLEXEC(nConnectionHandle [, cSQLCommand [, cCursorName [, aCountInfo]]])",
      "doc": ""
    },
    {
      "name": "SQLGETPROP",
      "sig": "SQLGETPROP(nConnectionHandle, cSetting)",
      "doc": ""
    },
    {
      "name": "SQLIDLEDISCONNECT",
      "sig": "SQLIDLEDISCONNECT(nConnectionHandle)",
      "doc": ""
    },
    {
      "name": "SQLMORERESULTS",
      "sig": "SQLMORERESULTS(nConnectionHandle [, cCursorName [, aCountInfo]])",
      "doc": ""
    },
    {
      "name": "SQLPREPARE",
      "sig": "SQLPREPARE(nConnectionHandle, cSQLCommand [, cCursorName])",
      "doc": ""
    },
    {
      "name": "SQLROLLBACK",
      "sig": "SQLROLLBACK(nConnectionHandle)",
      "doc": ""
    },
    {
      "name": "SQLSETPROP",
      "sig": "SQLSETPROP(nConnectionHandle, cSetting [, eExpression])",
      "doc": ""
    },
    {
      "name": "SQLSTRINGCONNECT",
      "sig": "SQLSTRINGCONNECT(lShared | cConnectString [, lSharable])",
      "doc": ""
    },
    {
      "name": "SQLTABLES",
      "sig": "SQLTABLES(nConnectionHandle [, cTableTypes [, cCursorName]])",
      "doc": ""
    },
    {
      "name": "SQRT",
      "sig": "SQRT(nExpression)",
      "doc": "Raiz quadrada."
    },
    {
      "name": "SROWS",
      "sig": "SROWS()",
      "doc": ""
    },
    {
      "name": "STR",
      "sig": "STR(nExpression [, nLength [, nDecimalPlaces]])",
      "doc": "Converte numero em string."
    },
    {
      "name": "STRCONV",
      "sig": "STRCONV(cExpression, nConversionSetting [, nRegionalIdentifier [, nRegionalIDType]])",
      "doc": ""
    },
    {
      "name": "STREXTRACT",
      "sig": "STREXTRACT(cSearchExpression, cBeginDelim [, cEndDelim [, nOccurrence [, nFlags]]])",
      "doc": ""
    },
    {
      "name": "STRTOFILE",
      "sig": "STRTOFILE(cExpression, cFileName [, lAdditive | nFlag])",
      "doc": "Grava uma string em arquivo."
    },
    {
      "name": "STRTRAN",
      "sig": "STRTRAN(cSearched, cSearchFor [, cReplacementWith] [, nStartOccurrence] [, nNumberOfOccurrences])",
      "doc": "Substitui trechos de uma string."
    },
    {
      "name": "STUFF",
      "sig": "STUFF(cExpression, nStartReplacement, nCharactersReplaced, cReplacement)",
      "doc": ""
    },
    {
      "name": "STUFFC",
      "sig": "STUFFC(cExpression, nStartReplacement, nCharactersReplaced, cReplacement)",
      "doc": ""
    },
    {
      "name": "SUBSTR",
      "sig": "SUBSTR(cExpression, nStartPosition [, nCharactersReturned])",
      "doc": "Extrai parte da string."
    },
    {
      "name": "SUBSTRC",
      "sig": "SUBSTRC(cExpression, nStartPosition [, nCharactersReturned])",
      "doc": ""
    },
    {
      "name": "SUM",
      "sig": "SUM(eExpression)",
      "doc": ""
    },
    {
      "name": "SYS",
      "sig": "SYS(nCodeNumber [, ...])",
      "doc": "Informacoes do sistema (SYS(5)=unidade, SYS(2003)=pasta, SYS(2015)=nome unico)."
    },
    {
      "name": "SYSMETRIC",
      "sig": "SYSMETRIC(nScreenElement)",
      "doc": ""
    },
    {
      "name": "TABLEREVERT",
      "sig": "TABLEREVERT([lAllRows] [, cTableAlias | nWorkArea])",
      "doc": "Descarta alteracoes pendentes (buffering)."
    },
    {
      "name": "TABLEUPDATE",
      "sig": "TABLEUPDATE([nRows] [, lForce] [, cTableAlias | nWorkArea])",
      "doc": "Confirma alteracoes pendentes (buffering)."
    },
    {
      "name": "TAG",
      "sig": "TAG([CDXFileName [, nTagNumber [, nWorkArea | cTableAlias]]])",
      "doc": ""
    },
    {
      "name": "TAGCOUNT",
      "sig": "TAGCOUNT([CDXFileName [, nWorkArea | cTableAlias]])",
      "doc": ""
    },
    {
      "name": "TAGNO",
      "sig": "TAGNO([IndexName [, CDXFileName [, nExpression | cExpression]]])",
      "doc": ""
    },
    {
      "name": "TAN",
      "sig": "TAN(nExpression)",
      "doc": ""
    },
    {
      "name": "TARGET",
      "sig": "TARGET(nRelationshipNumber [, nWorkArea | cTableAlias])",
      "doc": ""
    },
    {
      "name": "TEXTMERGE",
      "sig": "TEXTMERGE(cExpression [, lRecursive [, cLeftDelim [, cRightDelim]]])",
      "doc": ""
    },
    {
      "name": "TIME",
      "sig": "TIME([nExpression])",
      "doc": ""
    },
    {
      "name": "TRANSFORM",
      "sig": "TRANSFORM(eExpression [, cFormatCodes])",
      "doc": "Formata um valor para exibicao."
    },
    {
      "name": "TRIM",
      "sig": "TRIM(cExpression [, nFlags][, cParseChar])",
      "doc": ""
    },
    {
      "name": "TTOC",
      "sig": "TTOC(tExpression [, 1 | 2 | 3])",
      "doc": ""
    },
    {
      "name": "TTOD",
      "sig": "TTOD(tExpression)",
      "doc": ""
    },
    {
      "name": "TXNLEVEL",
      "sig": "TXNLEVEL()",
      "doc": ""
    },
    {
      "name": "TXTWIDTH",
      "sig": "TXTWIDTH(cExpression [, cFontName, nFontSize [, cFontStyle]])",
      "doc": ""
    },
    {
      "name": "TYPE",
      "sig": "TYPE(cExpression)",
      "doc": "Devolve o tipo do resultado da expressao (C, N, L, D, M, O, U...)."
    },
    {
      "name": "UNBINDEVENTS",
      "sig": "UNBINDEVENTS(oEventObject | hWnd | [oEventSource | hWnd, cEvent | nMessage, oEventHandler, cDelegate])",
      "doc": ""
    },
    {
      "name": "UPPER",
      "sig": "UPPER(cExpression)",
      "doc": "Converte para maiusculas."
    },
    {
      "name": "USED",
      "sig": "USED([cTableAlias | nWorkArea])",
      "doc": "Testa se a area esta em uso."
    },
    {
      "name": "VAL",
      "sig": "VAL(cExpression)",
      "doc": "Converte string em numero."
    },
    {
      "name": "VARTYPE",
      "sig": "VARTYPE(eExpression [, lNullDataType])",
      "doc": "Tipo da expressao, como TYPE() mas sem executar duas vezes."
    },
    {
      "name": "VERSION",
      "sig": "VERSION([nInfoType])",
      "doc": "Versao do Visual FoxPro."
    },
    {
      "name": "WBORDER",
      "sig": "WBORDER([WindowName])",
      "doc": ""
    },
    {
      "name": "WCHILD",
      "sig": "WCHILD([WindowName] [nChildWindow])",
      "doc": ""
    },
    {
      "name": "WCOLS",
      "sig": "WCOLS([WindowName])",
      "doc": ""
    },
    {
      "name": "WDOCKABLE",
      "sig": "WDOCKABLE(WindowName [, .T. | .F.])",
      "doc": ""
    },
    {
      "name": "WEEK",
      "sig": "WEEK(dExpression | tExpression [, nFirstWeek [, nFirstDayOfWeek]])",
      "doc": ""
    },
    {
      "name": "WEXIST",
      "sig": "WEXIST(WindowName)",
      "doc": ""
    },
    {
      "name": "WFONT",
      "sig": "WFONT(nFontAttribute [, WindowName])",
      "doc": ""
    },
    {
      "name": "WLAST",
      "sig": "WLAST([WindowName])",
      "doc": ""
    },
    {
      "name": "WLCOL",
      "sig": "WLCOL([WindowName])",
      "doc": ""
    },
    {
      "name": "WLROW",
      "sig": "WLROW([WindowName])",
      "doc": ""
    },
    {
      "name": "WMAXIMUM",
      "sig": "WMAXIMUM([WindowName])",
      "doc": ""
    },
    {
      "name": "WMINIMUM",
      "sig": "WMINIMUM([WindowName])",
      "doc": ""
    },
    {
      "name": "WONTOP",
      "sig": "WONTOP([WindowName])",
      "doc": ""
    },
    {
      "name": "WOUTPUT",
      "sig": "WOUTPUT([WindowName])",
      "doc": ""
    },
    {
      "name": "WPARENT",
      "sig": "WPARENT([WindowName])",
      "doc": ""
    },
    {
      "name": "WROWS",
      "sig": "WROWS([WindowName])",
      "doc": ""
    },
    {
      "name": "WTITLE",
      "sig": "WTITLE([WindowName])",
      "doc": ""
    },
    {
      "name": "WVISIBLE",
      "sig": "WVISIBLE(WindowName)",
      "doc": ""
    },
    {
      "name": "XMLTOCURSOR",
      "sig": "XMLTOCURSOR(cXMLFile | cXMLString, cCursorName, nFlags)",
      "doc": "Converte XML em cursor."
    },
    {
      "name": "XMLUPDATEGRAM",
      "sig": "XMLUPDATEGRAM([cAliasList [, nFlags [, cSchemaLocation]]])",
      "doc": ""
    },
    {
      "name": "YEAR",
      "sig": "YEAR(dExpression | tExpression)",
      "doc": ""
    }
  ],
  "CONSTANTS": [
    "TRUE",
    "FALSE",
    "NULL",
    "UNKNOWN"
  ],
  "SYSTEM_VARS": [
    "_ALIGNMENT",
    "_BOX",
    "_BROWSER",
    "_BUILDER",
    "_CLIPTEXT",
    "_CONVERTER",
    "_COVERAGE",
    "_CUROBJ",
    "_DBLCLICK",
    "_DIARYDATE",
    "_DOS",
    "_FOXDOC",
    "_GALLERY",
    "_GENGRAPH",
    "_GENMENU",
    "_GENPD",
    "_GENSCRN",
    "_GENXTAB",
    "_INDENT",
    "_INCLUDE",
    "_INTELLISENSE",
    "_LASTKEY",
    "_MAC",
    "_MLINE",
    "_OBJNUM",
    "_PADVANCE",
    "_PAGENO",
    "_PBPAGE",
    "_PCOLNO",
    "_PCOPIES",
    "_PDRIVER",
    "_PDSETUP",
    "_PECODE",
    "_PEJECT",
    "_PEPAGE",
    "_PLENGTH",
    "_PLINENO",
    "_PLOFFSET",
    "_PPITCH",
    "_PQUALITY",
    "_PRETEXT",
    "_PSCODE",
    "_PSPACING",
    "_PWAIT",
    "_RMARGIN",
    "_SCREEN",
    "_SPELLCHK",
    "_STARTUP",
    "_TABS",
    "_TALLY",
    "_TEXT",
    "_THROTTLE",
    "_TRANSPORT",
    "_TRIGGER",
    "_UNIX",
    "_VFP",
    "_WINDOWS",
    "_WRAP"
  ],
  "COMMON_PEM": {
    "properties": [
      "BackColor",
      "BaseClass",
      "BorderColor",
      "Class",
      "ClassLibrary",
      "Comment",
      "DisabledBackColor",
      "DisabledForeColor",
      "DisabledItemBackColor",
      "DisabledItemForeColor",
      "DragIcon",
      "FillColor",
      "FontCharSet",
      "FontName",
      "FontSize",
      "ForeColor",
      "GridLineColor",
      "Icon",
      "ItemBackColor",
      "ItemForeColor",
      "MemberClassLibrary",
      "MouseIcon",
      "Name",
      "OLEDragPicture",
      "Parent",
      "Picture",
      "SelectedBackColor",
      "SelectedForeColor",
      "SelectedItemBackColor",
      "SelectedItemForeColor",
      "Tag"
    ],
    "events": [
      "Init",
      "Destroy",
      "Error",
      "Load"
    ],
    "methods": [
      "AddProperty",
      "RemoveProperty",
      "WriteExpression",
      "ReadExpression",
      "ResetToDefault",
      "SaveAsClass"
    ]
  },
  "BASE_CLASSES": {
    "form": {
      "properties": [
        "AlwaysOnTop",
        "AutoCenter",
        "BackColor",
        "BorderStyle",
        "Caption",
        "Closable",
        "ClipControls",
        "ControlBox",
        "Desktop",
        "Height",
        "Icon",
        "KeyPreview",
        "LockScreen",
        "MaxButton",
        "MaxHeight",
        "MaxWidth",
        "MinButton",
        "MinHeight",
        "MinWidth",
        "Movable",
        "Picture",
        "ScrollBars",
        "ShowWindow",
        "ShowInTaskbar",
        "TitleBar",
        "Width",
        "WindowState",
        "WindowType",
        "Left",
        "Top",
        "Visible",
        "Enabled",
        "ForeColor",
        "FontName",
        "FontSize",
        "FontBold",
        "ScaleMode",
        "DataSession"
      ],
      "events": [
        "Init",
        "Destroy",
        "Load",
        "Unload",
        "Activate",
        "Deactivate",
        "Click",
        "DblClick",
        "RightClick",
        "KeyPress",
        "MouseDown",
        "MouseMove",
        "MouseUp",
        "QueryUnload",
        "Resize",
        "Paint",
        "GotFocus",
        "LostFocus",
        "Error",
        "BeforeOpenTables",
        "AfterCloseTables",
        "Run",
        "InteractiveChange"
      ],
      "methods": [
        "AddObject",
        "RemoveObject",
        "Release",
        "Show",
        "Hide",
        "Refresh",
        "SetFocus",
        "SetAll",
        "Box",
        "Circle",
        "CLine",
        "Draw",
        "Line",
        "Move",
        "Print",
        "PSet",
        "TextHeight",
        "TextWidth"
      ]
    },
    "commandbutton": {
      "properties": [
        "Caption",
        "Cancel",
        "Default",
        "Enabled",
        "FontName",
        "FontSize",
        "Height",
        "Left",
        "Top",
        "Width",
        "Picture",
        "SpecialEffect",
        "TabIndex",
        "TabStop",
        "ToolTipText",
        "Visible",
        "DownPicture",
        "DisabledPicture"
      ],
      "events": [
        "Click",
        "DblClick",
        "GotFocus",
        "LostFocus",
        "KeyPress",
        "MouseDown",
        "MouseMove",
        "MouseUp",
        "RightClick",
        "When",
        "Valid",
        "Error",
        "Message"
      ],
      "methods": [
        "SetFocus",
        "Refresh",
        "Move",
        "ZOrder",
        "SetAll"
      ]
    },
    "textbox": {
      "properties": [
        "Alignment",
        "ControlSource",
        "Enabled",
        "Format",
        "InputMask",
        "Height",
        "Left",
        "Top",
        "Width",
        "MaxLength",
        "ReadOnly",
        "SelectOnEntry",
        "SelLength",
        "SelStart",
        "SelText",
        "TabIndex",
        "TabStop",
        "Value",
        "PasswordChar",
        "SpecialEffect",
        "BorderStyle",
        "DisableBackColor",
        "DisableForeColor",
        "Visible"
      ],
      "events": [
        "InteractiveChange",
        "GotFocus",
        "LostFocus",
        "KeyPress",
        "Valid",
        "When",
        "ProgrammaticChange",
        "RangeHigh",
        "RangeLow",
        "Message",
        "Error",
        "Click",
        "DblClick"
      ],
      "methods": [
        "SetFocus",
        "Refresh",
        "SelectAll",
        "Move",
        "ZOrder",
        "SetAll"
      ]
    },
    "editbox": {
      "properties": [
        "ControlSource",
        "Enabled",
        "Height",
        "Left",
        "Top",
        "Width",
        "MaxLength",
        "ReadOnly",
        "ScrollBars",
        "SelLength",
        "SelStart",
        "SelText",
        "Value",
        "AllowTabs",
        "TabStop",
        "HideSelection",
        "Visible"
      ],
      "events": [
        "InteractiveChange",
        "GotFocus",
        "LostFocus",
        "KeyPress",
        "Valid",
        "When",
        "ProgrammaticChange",
        "Error"
      ],
      "methods": [
        "SetFocus",
        "Refresh",
        "SelectAll",
        "Move",
        "ZOrder",
        "SetAll"
      ]
    },
    "label": {
      "properties": [
        "AutoSize",
        "BackStyle",
        "Caption",
        "FontName",
        "FontSize",
        "FontBold",
        "ForeColor",
        "Height",
        "Left",
        "Top",
        "Width",
        "WordWrap",
        "Visible",
        "Enabled",
        "Alignment",
        "BackColor"
      ],
      "events": [
        "Click",
        "DblClick",
        "RightClick",
        "MouseMove",
        "MouseDown",
        "MouseUp"
      ],
      "methods": [
        "Move",
        "Refresh",
        "ZOrder",
        "SetAll"
      ]
    },
    "checkbox": {
      "properties": [
        "Alignment",
        "AutoSize",
        "Caption",
        "ControlSource",
        "Enabled",
        "Height",
        "Left",
        "Top",
        "Width",
        "ReadOnly",
        "Style",
        "Value",
        "TabIndex",
        "TabStop",
        "Picture",
        "Visible",
        "DisabledPicture"
      ],
      "events": [
        "Click",
        "InteractiveChange",
        "GotFocus",
        "LostFocus",
        "Valid",
        "When",
        "Error",
        "RightClick"
      ],
      "methods": [
        "SetFocus",
        "Refresh",
        "Move",
        "ZOrder",
        "SetAll"
      ]
    },
    "optiongroup": {
      "properties": [
        "ButtonCount",
        "Buttons",
        "ControlSource",
        "Enabled",
        "Height",
        "Left",
        "Top",
        "Width",
        "Value",
        "BackStyle",
        "BorderStyle",
        "TabIndex",
        "Visible",
        "SpecialEffect"
      ],
      "events": [
        "Click",
        "InteractiveChange",
        "GotFocus",
        "LostFocus",
        "Valid",
        "When",
        "Error",
        "RightClick"
      ],
      "methods": [
        "SetFocus",
        "Refresh",
        "Move",
        "ZOrder",
        "SetAll",
        "AddObject",
        "RemoveObject"
      ]
    },
    "optionbutton": {
      "properties": [
        "Caption",
        "Enabled",
        "Height",
        "Left",
        "Top",
        "Width",
        "Value",
        "AutoSize",
        "TabIndex",
        "TabStop",
        "Visible",
        "Picture",
        "Style"
      ],
      "events": [
        "Click",
        "GotFocus",
        "LostFocus",
        "InteractiveChange",
        "Valid",
        "When",
        "Error",
        "RightClick"
      ],
      "methods": [
        "SetFocus",
        "Refresh",
        "Move",
        "ZOrder",
        "SetAll"
      ]
    },
    "combobox": {
      "properties": [
        "BoundColumn",
        "BoundTo",
        "ColumnCount",
        "ColumnLines",
        "ColumnWidths",
        "ControlSource",
        "DisplayCount",
        "Enabled",
        "Height",
        "Left",
        "Top",
        "Width",
        "IncrementalSearch",
        "ListCount",
        "ListIndex",
        "ListItem",
        "ListItemID",
        "RowSource",
        "RowSourceType",
        "Selected",
        "SelectedID",
        "Sorted",
        "Style",
        "Value",
        "TabIndex",
        "Visible"
      ],
      "events": [
        "Click",
        "DblClick",
        "DropDown",
        "GotFocus",
        "InteractiveChange",
        "LostFocus",
        "Message",
        "Valid",
        "When",
        "Error"
      ],
      "methods": [
        "AddItem",
        "AddListItem",
        "Clear",
        "IndexOf",
        "RemoveItem",
        "RemoveListItem",
        "Requery",
        "SetFocus",
        "Refresh",
        "Move",
        "SetAll"
      ]
    },
    "listbox": {
      "properties": [
        "ColumnCount",
        "ColumnLines",
        "ColumnWidths",
        "ControlSource",
        "Enabled",
        "Height",
        "Left",
        "Top",
        "Width",
        "ListCount",
        "ListIndex",
        "ListItem",
        "ListItemID",
        "MultiSelect",
        "RowSource",
        "RowSourceType",
        "Selected",
        "SelectedID",
        "Sorted",
        "Value",
        "TabIndex",
        "Visible",
        "BoundColumn"
      ],
      "events": [
        "Click",
        "DblClick",
        "GotFocus",
        "InteractiveChange",
        "LostFocus",
        "Message",
        "Valid",
        "When",
        "Error",
        "RangeHigh",
        "RangeLow"
      ],
      "methods": [
        "AddItem",
        "AddListItem",
        "Clear",
        "IndexOf",
        "RemoveItem",
        "RemoveListItem",
        "Requery",
        "SetFocus",
        "Refresh",
        "Move",
        "SetAll"
      ]
    },
    "grid": {
      "properties": [
        "ColumnCount",
        "Columns",
        "AllowAddNew",
        "AllowDelete",
        "AllowRowSizing",
        "AllowHeaderSizing",
        "DeleteMark",
        "GridLines",
        "GridLineColor",
        "Height",
        "Left",
        "Top",
        "Width",
        "HeaderHeight",
        "RecordMark",
        "RecordSource",
        "RecordSourceType",
        "ReadOnly",
        "RowHeight",
        "ScrollBars",
        "SplitBar",
        "Visible",
        "Panel",
        "LinkMaster",
        "ChildOrder",
        "RelationalExpr",
        "SetAll"
      ],
      "events": [
        "AfterRowColChange",
        "BeforeRowColChange",
        "Click",
        "DblClick",
        "Deleted",
        "GotFocus",
        "LostFocus",
        "Message",
        "Valid",
        "When",
        "Error",
        "Scrolled",
        "Resize",
        "Init"
      ],
      "methods": [
        "ActivateCell",
        "AddColumn",
        "DeleteColumn",
        "SetAll",
        "SetFocus",
        "Refresh",
        "Move",
        "DoScroll",
        "Requery"
      ]
    },
    "column": {
      "properties": [
        "Alignment",
        "Bound",
        "ControlSource",
        "DynamicAlignment",
        "DynamicBackColor",
        "DynamicFontBold",
        "DynamicForeColor",
        "Enabled",
        "FontName",
        "FontSize",
        "Header1",
        "InputMask",
        "Movable",
        "ReadOnly",
        "Resizable",
        "SelectOnEntry",
        "Sparse",
        "Width",
        "Visible",
        "ControlCount",
        "Controls",
        "CurrentControl"
      ],
      "events": [
        "Init",
        "Destroy",
        "Error",
        "MouseMove"
      ],
      "methods": [
        "AddObject",
        "RemoveObject",
        "SetAll",
        "Refresh"
      ]
    },
    "pageframe": {
      "properties": [
        "ActivePage",
        "PageCount",
        "Pages",
        "Height",
        "Left",
        "Top",
        "Width",
        "TabIndex",
        "TabStyle",
        "Tabs",
        "TabStretch",
        "BorderStyle",
        "Visible",
        "SpecialEffect"
      ],
      "events": [
        "Init",
        "Destroy",
        "Click",
        "Resize",
        "Error"
      ],
      "methods": [
        "AddObject",
        "RemoveObject",
        "SetAll",
        "Refresh",
        "Move",
        "ZOrder"
      ]
    },
    "page": {
      "properties": [
        "ActiveControl",
        "BackColor",
        "Caption",
        "Enabled",
        "FontName",
        "FontSize",
        "ForeColor",
        "Height",
        "Left",
        "Top",
        "Width",
        "Picture",
        "TabIndex",
        "Visible",
        "ControlCount",
        "Controls"
      ],
      "events": [
        "Activate",
        "Deactivate",
        "Click",
        "Init",
        "Destroy",
        "Resize",
        "Error"
      ],
      "methods": [
        "AddObject",
        "RemoveObject",
        "SetAll",
        "Refresh",
        "Move",
        "ZOrder"
      ]
    },
    "container": {
      "properties": [
        "BackColor",
        "BackStyle",
        "BorderColor",
        "BorderStyle",
        "BorderWidth",
        "Enabled",
        "Height",
        "Left",
        "Top",
        "Width",
        "SpecialEffect",
        "Visible",
        "ControlCount",
        "Controls",
        "Picture"
      ],
      "events": [
        "Init",
        "Destroy",
        "Click",
        "DblClick",
        "Resize",
        "GotFocus",
        "LostFocus",
        "Error",
        "RightClick"
      ],
      "methods": [
        "AddObject",
        "RemoveObject",
        "SetAll",
        "Refresh",
        "Move",
        "ZOrder",
        "Show",
        "Hide"
      ]
    },
    "commandgroup": {
      "properties": [
        "ButtonCount",
        "Buttons",
        "Enabled",
        "Height",
        "Left",
        "Top",
        "Width",
        "BackStyle",
        "BorderStyle",
        "Visible",
        "TabIndex"
      ],
      "events": [
        "Click",
        "Init",
        "Destroy",
        "Error",
        "RightClick",
        "Valid"
      ],
      "methods": [
        "AddObject",
        "RemoveObject",
        "SetAll",
        "Refresh",
        "Move",
        "ZOrder"
      ]
    },
    "spinner": {
      "properties": [
        "ControlSource",
        "Enabled",
        "Height",
        "Left",
        "Top",
        "Width",
        "Increment",
        "KeyboardHighValue",
        "KeyboardLowValue",
        "SpinnerHighValue",
        "SpinnerLowValue",
        "Value",
        "ReadOnly",
        "TabIndex",
        "Visible"
      ],
      "events": [
        "DownClick",
        "UpClick",
        "InteractiveChange",
        "GotFocus",
        "LostFocus",
        "Valid",
        "When",
        "Error",
        "RangeHigh",
        "RangeLow"
      ],
      "methods": [
        "SetFocus",
        "Refresh",
        "Move",
        "ZOrder",
        "SetAll"
      ]
    },
    "timer": {
      "properties": [
        "Enabled",
        "Interval",
        "Height",
        "Left",
        "Top",
        "Width",
        "Name"
      ],
      "events": [
        "Timer",
        "Error",
        "Init",
        "Destroy"
      ],
      "methods": [
        "Reset",
        "SetAll"
      ]
    },
    "image": {
      "properties": [
        "BackStyle",
        "BorderColor",
        "BorderStyle",
        "Height",
        "Left",
        "Top",
        "Width",
        "Picture",
        "Stretch",
        "Visible",
        "Enabled"
      ],
      "events": [
        "Click",
        "DblClick",
        "Error",
        "Init",
        "Destroy",
        "MouseDown",
        "MouseMove",
        "MouseUp"
      ],
      "methods": [
        "Move",
        "Refresh",
        "ZOrder",
        "SetAll"
      ]
    },
    "shape": {
      "properties": [
        "BackColor",
        "BackStyle",
        "BorderColor",
        "BorderStyle",
        "BorderWidth",
        "Curvature",
        "FillColor",
        "FillStyle",
        "Height",
        "Left",
        "Top",
        "Width",
        "Visible",
        "SpecialEffect"
      ],
      "events": [
        "Click",
        "DblClick",
        "Error",
        "Init",
        "Destroy",
        "MouseDown",
        "MouseMove",
        "MouseUp"
      ],
      "methods": [
        "Move",
        "Refresh",
        "ZOrder",
        "SetAll"
      ]
    },
    "line": {
      "properties": [
        "BorderColor",
        "BorderStyle",
        "BorderWidth",
        "Height",
        "Left",
        "Top",
        "Width",
        "LineSlant",
        "Visible"
      ],
      "events": [
        "Click",
        "Error",
        "Init",
        "Destroy",
        "MouseDown",
        "MouseMove",
        "MouseUp"
      ],
      "methods": [
        "Move",
        "Refresh",
        "ZOrder",
        "SetAll"
      ]
    },
    "toolbar": {
      "properties": [
        "Caption",
        "Docked",
        "DockPosition",
        "Enabled",
        "Height",
        "Width",
        "Movable",
        "Visible",
        "ScaleMode",
        "ShowTips"
      ],
      "events": [
        "Activate",
        "Deactivate",
        "Click",
        "MouseDown",
        "MouseMove",
        "MouseUp",
        "BeforeDock",
        "AfterDock",
        "Init",
        "Destroy",
        "Error"
      ],
      "methods": [
        "AddObject",
        "RemoveObject",
        "Hide",
        "Show",
        "Refresh",
        "SetAll"
      ]
    },
    "dataenvironment": {
      "properties": [
        "AutoCloseTables",
        "AutoOpenTables",
        "InitialSelectedAlias",
        "OpenTables",
        "CloseTables",
        "Objects",
        "Name"
      ],
      "events": [
        "BeforeOpenTables",
        "AfterCloseTables",
        "Init",
        "Destroy",
        "Error"
      ],
      "methods": [
        "AddObject",
        "RemoveObject",
        "SetAll",
        "OpenTables",
        "CloseTables",
        "BeforeOpenTables",
        "AfterCloseTables"
      ]
    },
    "cursor": {
      "properties": [
        "Alias",
        "Database",
        "BufferModeOverride",
        "CursorSource",
        "Order",
        "Filter",
        "ReadOnly",
        "Exclusive",
        "NoData",
        "Name"
      ],
      "events": [
        "Init",
        "Destroy",
        "Error"
      ],
      "methods": [
        "SetAll",
        "AddProperty"
      ]
    },
    "olecontrol": {
      "properties": [
        "AutoActivate",
        "AutoSize",
        "AutoVerbMenu",
        "BackColor",
        "Enabled",
        "Height",
        "Left",
        "Top",
        "Width",
        "Object",
        "OLEClass",
        "OLETypeAllowed",
        "Visible",
        "Name"
      ],
      "events": [
        "Init",
        "Destroy",
        "Error",
        "GotFocus",
        "LostFocus",
        "DoVerb",
        "Resize",
        "Click"
      ],
      "methods": [
        "DoVerb",
        "SetFocus",
        "Refresh",
        "Move",
        "SetAll",
        "SaveAsClass"
      ]
    },
    "control": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "custom": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "formset": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "hyperlink": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "projecthook": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "relation": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "separator": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "session": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "byte": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "boolean": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "integer": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "long": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "currency": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "single": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "double": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "decimal": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "date": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "string": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "object": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "variant": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "void": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "short": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "datetime": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "number": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "character": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "header": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "collection": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "exception": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "cursoradapter": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "logical": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "xmladapter": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "xmltable": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "xmlfield": {
      "properties": [],
      "events": [],
      "methods": []
    },
    "reportlistener": {
      "properties": [],
      "events": [],
      "methods": []
    }
  },
  "BASE_CLASS_NAMES": [
    "boolean",
    "byte",
    "character",
    "checkbox",
    "collection",
    "column",
    "combobox",
    "commandbutton",
    "commandgroup",
    "container",
    "control",
    "currency",
    "cursor",
    "cursoradapter",
    "custom",
    "dataenvironment",
    "date",
    "datetime",
    "decimal",
    "double",
    "editbox",
    "exception",
    "form",
    "formset",
    "grid",
    "header",
    "hyperlink",
    "image",
    "integer",
    "label",
    "line",
    "listbox",
    "logical",
    "long",
    "number",
    "object",
    "olecontrol",
    "optionbutton",
    "optiongroup",
    "page",
    "pageframe",
    "projecthook",
    "relation",
    "reportlistener",
    "separator",
    "session",
    "shape",
    "short",
    "single",
    "spinner",
    "string",
    "textbox",
    "timer",
    "toolbar",
    "variant",
    "void",
    "xmladapter",
    "xmlfield",
    "xmltable"
  ],
  "BASE_CLASS_DISPLAY": {
    "checkbox": "CheckBox",
    "column": "Column",
    "combobox": "ComboBox",
    "commandbutton": "CommandButton",
    "commandgroup": "CommandGroup",
    "container": "Container",
    "control": "Control",
    "cursor": "Cursor",
    "custom": "Custom",
    "dataenvironment": "DataEnvironment",
    "editbox": "EditBox",
    "form": "Form",
    "formset": "FormSet",
    "grid": "Grid",
    "hyperlink": "HyperLink",
    "image": "Image",
    "label": "Label",
    "line": "Line",
    "listbox": "ListBox",
    "optionbutton": "OptionButton",
    "optiongroup": "OptionGroup",
    "page": "Page",
    "pageframe": "PageFrame",
    "projecthook": "ProjectHook",
    "relation": "Relation",
    "separator": "Separator",
    "session": "Session",
    "shape": "Shape",
    "spinner": "Spinner",
    "textbox": "TextBox",
    "timer": "Timer",
    "toolbar": "Toolbar",
    "byte": "Byte",
    "boolean": "Boolean",
    "integer": "Integer",
    "long": "Long",
    "currency": "Currency",
    "single": "Single",
    "double": "Double",
    "decimal": "Decimal",
    "date": "Date",
    "string": "String",
    "object": "Object",
    "variant": "Variant",
    "void": "VOID",
    "short": "Short",
    "datetime": "Datetime",
    "number": "Number",
    "character": "Character",
    "header": "Header",
    "collection": "Collection",
    "exception": "Exception",
    "cursoradapter": "CursorAdapter",
    "logical": "Logical",
    "xmladapter": "XMLAdapter",
    "xmltable": "XMLTable",
    "xmlfield": "XMLField",
    "reportlistener": "ReportListener",
    "olecontrol": "Olecontrol"
  }
};

  const byBase = DATA.BASE_CLASSES;
  const common = DATA.COMMON_PEM;

  function unique(list) {
    return Array.from(new Set(list));
  }

  function pemsFor(baseClass) {
    const key = String(baseClass || '').toLowerCase();
    const spec = byBase[key];
    if (!spec) {
      return {
        properties: unique(common.properties),
        events: unique(common.events),
        methods: unique(common.methods),
      };
    }
    return {
      properties: unique([...(spec.properties || []), ...common.properties]),
      events: unique([...(spec.events || []), ...common.events]),
      methods: unique([...(spec.methods || []), ...common.methods]),
    };
  }

  function pemsAll() {
    const properties = [...common.properties];
    const events = [...common.events];
    const methods = [...common.methods];
    for (const spec of Object.values(byBase)) {
      properties.push(...(spec.properties || []));
      events.push(...(spec.events || []));
      methods.push(...(spec.methods || []));
    }
    return {
      properties: unique(properties).sort(),
      events: unique(events).sort(),
      methods: unique(methods).sort(),
    };
  }

  root.VFP_LANGUAGE = {
    KEYWORDS: DATA.KEYWORDS,
    SQL_KEYWORDS: DATA.SQL_KEYWORDS,
    COMMANDS: DATA.COMMANDS,
    FUNCTIONS: DATA.FUNCTIONS,
    CONSTANTS: DATA.CONSTANTS,
    SYSTEM_VARS: DATA.SYSTEM_VARS,
    COMMON_PEM: DATA.COMMON_PEM,
    BASE_CLASSES: DATA.BASE_CLASSES,
    BASE_CLASS_NAMES: DATA.BASE_CLASS_NAMES,
    BASE_CLASS_DISPLAY: DATA.BASE_CLASS_DISPLAY,
    pemsFor,
    pemsAll,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.VFP_LANGUAGE;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
