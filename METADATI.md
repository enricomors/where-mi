# Struttura dei metadati

Il problema di includere nel proprio progetto le clip degli altri gruppi e' sostanzialmente la struttura dei metadati, che puo' differire da un gruppo all'altro. Qui di seguito vengono riportate le formattazioni della stringa di metadati che sono state trovate facendo delle ricerche, con il nome del canale su cui sono state caricate le clip con tale descrizione (la lista e' in aggiornamento):

```
channelTitle: "CerottoPerLaBua"
​description: "8FPH0000+:8FPHF800+:8FPHF8VP+7R:what:ita:art:elm:2."
```
In questo caso il problema e' che vengono usati i due punti anche per dividere i vari OLC, quindi il nostro codice prende come "purpose" il secondo OLC. Per capire quando abbiamo questa formattazione bisognerebbe controllare se `.split(':')[1]` contiene un numero.

Inoltre le clip non hanno una descrizione, quindi in questo caso
bisogna settare un testo tipo "Nessuna descrizione disponibile"

```
channelTitle: "HoormiCC"
description: "Here you learn when you can visit the Asinelli tower. 8FPHF8VW+MM:why:eng:pre:his:neu:15s 8FPHF8VW+MM:how:eng:26s 8FPHF8."
```

```
channelTitle: "Progetto TechWeb"
​​description: "8FPH0000+:8FPHF900+:8FPHF9X3+M3:why:ita:nat:gen:p1."
```
Stesso discorso di prima

```
channelTitle: "Nicholas"
​​description: "8FPH0000+-8FPHF900+-8FPHF9X4+-8FPHF9X4+9G-8FPHF9X4+9GH:what:ita:his."
```
```
channelTitle: "Where M I"
​​​description: "8FPHF9X4+9G:what:ita:none:Agen:P1."
```
```
channelTitle: "Arcangelo Massari"
​​​description: "8FPHF9X4+76:why:it:oth:gen:1%%%È un museo completo e molto interessante da un punto di vista storico, oppure se si è interessati alla chimica o appunto ..."
```


