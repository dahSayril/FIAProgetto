# Progetto FIA
Progetto per la prova d'esame di Fondamenti d'Intelligenza Artificiale svolto da [Angelo Afeltra](https://github.com/angeloafeltra), [Carmine Amendola](https://github.com/Alianoire), [Antonio Cacciapuoti](https://github.com/YantCaccia), [Antonio Cirillo](https://github.com/dahSayril).

## Obiettivo del progetto
L'obiettivo principale del progetto è quello di clusterizzare una intera libreria musicale dividendola in varie playlist, ciascuna contente brani "simili" in relazione alle [caratteristiche sonore attraverso le quali Spotify descrive i suoi brani](https://developer.spotify.com/documentation/web-api/reference/#object-audiofeaturesobject).

Per maggiori informazioni e dettagli sulle varie fasi del processo realizzativo si rimanda alla [relazione](./Documenti/Relazione.docx).

## Prerequisiti
Il progetto richiede l'installazione di [NodeJS](https://nodejs.org/it/) ed il package manager [npm](https://www.npmjs.com/)

Dopo aver installato NodeJS, recarsi nella root directory del progetto e dare il comando 

`npm install` 

per installare tutte le dipendenze.

## Utilizzo

E' possibile utilizzare il progetto in due modi diversi, per due scopi diversi:

### Dataset di default
Lanciando il progetto con il comando

`node app.js`

verrà utilizzato il dataset di default (ricordiamo che è possibile trovare maggiori informazioni nella relazione) per l'esecuzione su di esso dei processi di standardizzazione, analisi delle componenti e riduzione della dimensionalità, clustering. L'applicazione genererà tutti i grafici e li mostrerà nel browser. In questo modo abbiamo generato gli stessi grafici utilizzati proprio nella relazione.

### Libreria personale da Spotify
Lanciando il progetto con 

`node spotifyAPI.js`

l'applicazione eseguirà gli stessi passaggi precedentemente descritti ma utilizzando come fonte la libreria Spotify dell'utente (in particolare, verranno utilizzate le canzoni per le quali l'utente ha lasciato un ❤ mi piace). Al primo avvio l'applicazione aprirà il browser rimandando alla schermata di login di Spotify. Accedendo al profilo dell'utente, l'applicazione è in grado di ottenere la sua libreria e da essa generare un dataset del tutto simile (in features) a quello di default. I grafici non saranno generati, ma in compenso verranno create e pubblicate nel profilo dell'utente una playlist per ogni cluster individuato dall'algoritmo.