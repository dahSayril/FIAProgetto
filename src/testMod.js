var nodeplotlib = require('nodeplotlib');
var dataForge = require('data-forge');

function plotTest() {

    let dataToBePlotted = [];

    /* Datasource manipulation */

    let dataFrame = dataForge.readFileSync('./datasource/SpotifyFeatures.csv').parseCSV();
    dataFrame = dataFrame.parseFloats("popularity");
    dataFrame = dataFrame.parseFloats("danceability");

    let myArray = dataFrame.toArray();

    for (i = 0; i < 1000; i++) {

        let aSong = myArray[i];

        let title = aSong.track_name;
        let popularity = aSong.popularity;
        let danceability = aSong.danceability;

        let myObject = {
            x: [popularity],
            y: [danceability],
            // text: title,
            textposition: 'top center',
            mode: 'markers+text'
        }

        dataToBePlotted.push(myObject);

    }

    /* Plotting part*/

    /* Oggetto che contiene le configurazioni per il grafico */
    let layout = {
        xaxis: {
          title: {
            text: "Popolarita'",
          }
        },
        yaxis: {
          title: {
            text: "Danzabilita'",
          }
        }
      };
    
    
    /* Plot 'em */
    nodeplotlib.plot(dataToBePlotted, layout);

}

exports.plotTest = plotTest;