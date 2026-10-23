# FoxBin2Prg (vendor)

- Projeto: https://github.com/fdbozzo/foxbin2prg
- Versão empacotada: **1.21.05**
- Licença: MIT (arquivo `license` nesta pasta)
- Autor original: Fernando D. Bozzo; manutenção atual: Lutz Scheffler.

O Fox2Txt usa o FoxBin2Prg como motor bidirecional para `.scx`/`.sct` ↔ `.sc2`.
Os arquivos desta pasta são copiados para `%TEMP%\fox2txt\foxbin2prg` na primeira
execução; o Fox2Txt **não altera** os arquivos originais do projeto do usuário.

## Ajuste de compatibilidade

O FoxBin2Prg oficial exige VFP 9 SP1 (build 3504 ou superior). O Fox2Txt
funciona também no VFP 9 RTM (build 2412, usado em várias instalações) e, por
isso, aplica **uma única alteração** na cópia temporária do `foxbin2prg.prg`:

```foxpro
* original
Case lnVFPVersion = 900 And Int( Val( Substr( Version(4), Rat('.', Version(4)) + 1 ) ) ) < 3504
* cópia temporária do Fox2Txt
Case lnVFPVersion = 900 And Int( Val( Substr( Version(4), Rat('.', Version(4)) + 1 ) ) ) < 0
```

A alteração apenas desabilita a checagem de build; nenhuma outra linha é
modificada. O round-trip é validado pelo próprio Fox2Txt depois da conversão.
O arquivo `foxbin2prg.prg` desta pasta permanece exatamente como distribuído
pelo projeto original.

## Arquivos incluídos

- `foxbin2prg.prg` — motor principal
- `props_*.txt` — metadados de propriedades por classe
- `foxbin2prg_keywords.dbf/.cdx/.db2` — base de palavras-chave usada pelo motor
- `filename_caps.exe/.cfg` — preservação de maiúsculas/minúsculas em nomes
- `license`, `readme.md` — licença e documentação originais
