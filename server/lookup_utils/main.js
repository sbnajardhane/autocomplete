/*
 * Main file 
    - to genrate data and index file
    - to lookup for query
 *
*/

var fs = require("fs");
var sort = require("./sort.js");

//10 digit base number for indexing 
var baseNumber = "0000000000";
var indexFile = "english.index";
var lookup = "english.data";

/*
 * generateLookUps
 * @Algo
    - read complete file
    - do alphabetically sorting
    - design lookfile and indexfile content
    - write into files
 *
*/

function generateLookupFiles(queriesFilePath) {
    if (queriesFilePath == null || queriesFilePath == "") {
        console.log("Invalid queriesFilePath");
        return null;
    }
    readFile(queriesFilePath)
        .then(sort)
        .then(createLookUp)
        .then(writeIntoFiles)
        .catch((error) => {
            console.log(error);
            return null;
        });


}

/*
 * get Suggestion
 * @Algo
    - get dictonary (lookup and index files) name according to query
    - analyse index file stat (number of entries)
    - Binary search into data file
    - return suggestions
 *
*/

function getSuggestion(query) {
    if (query == null || query == "") {
        console.log("Invalid query");
        return null;
    }

    return new Promise((resolve, reject) => {
        getDictonary()
            .then(getLookUp)
            .then(([indexDes, dataDes, entries]) => {
                var lower_one = 0;
                var higher_one = entries;
                var data = searchingIntoLookUp(query, indexDes, dataDes, lower_one, higher_one);
                //console.log(data);
                resolve(data);
            }).catch((error) => {
                console.log("Error : " + error);
                reject(error);
            });
    });
}


//to read queryfile
function readFile(filepath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, function(err, data) {
            if (err) {
                return reject(err);
            }
            var array = data.toString().split("\n");
            resolve(array);

        });
    });
}





/*
 * to create look up
 *
 */

function createLookUp(dataArray) {

    return new Promise((resolve) => {
        var index = baseNumber;


        var indexFileContent = "";
        var dataFileContent = "";

        dataArray.forEach(function(data, no) {


            var valueLength;
            var key = data;
            var keylength = data.toString().length;
            keylength = baseToNumber(keylength);


            var value = "";
            for (var i = no + 1; i < dataArray.length; i++) {
                if (dataArray[i].indexOf(data) !== -1) {
                    value += dataArray[i] + ",";
                } else {
                    break;
                }
            }


            //console.log(indexFileContent);
            //console.log(index);
            value = value.trim();
            valueLength = baseToNumber(value.length);

            //data file content
            if (value.length > 0) {
                value = value.replace(/,\s*$/, "");
                var content = `${keylength} ${key} ${valueLength} ${value}`;
                console.log("Content : " + content);
                console.log("Content length : " + content.length);

                //indexing content

                index = baseToNumber(index);
                indexFileContent += index + "\n";
                index = parseInt(index) + content.length + 1;


                dataFileContent += content + "\n";
            }

        });
        resolve([indexFileContent, dataFileContent]);
    });
}

function writeIntoFiles([indexFileContent, dataFileContent]) {

    fs.writeFile(indexFile, indexFileContent, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Index file successfully created");
        }
    });

    fs.writeFile(lookup, dataFileContent, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Lookup data file successfully created");
        }
    });
    console.log(indexFileContent);
}


function baseToNumber(number) {
    //console.log(number);
    var base = "0000000000";
    var numberChar = number.toString().length;
    return base.slice(0, base.length - numberChar) + number;
}




/********** Auto Suggestion **********/


function getDictonary() {
    return new Promise((resolve) => {
        //static filename for now 
        var indexFile = "english.index";
        var dataFile = "english.data";
        resolve([indexFile, dataFile]);
    });

}

function getLookUp([indexFile, dataFile]) {

    return new Promise((resolve) => {

        //fs.stats to get filesize 
        const stats = fs.statSync("./english.index");
        const fileSizeInBytes = stats.size;
        //console.log(fileSizeInBytes);
        const entries = parseInt((fileSizeInBytes) / 11);
        //console.log("Entries : " + entries);

        //file descriptor 
        const indexDes = fs.openSync(indexFile, "r");
        const dataDes = fs.openSync(dataFile, "r");
        resolve([indexDes, dataDes, entries]);

    });

}


/// Binary Searching 
function searchingIntoLookUp(query, indexfileDes, datafileDes, lower_one, higher_one) {

    if (lower_one <= higher_one) {
        var middle_one = Math.round((higher_one + lower_one) / 2);
        //console.log(higher_one);
        //console.log(middle_one);
        var seekToIndex = (middle_one * 11);
        //console.log(seekToIndex);


        const chunkSize = 10;
        const buffer = new Buffer(chunkSize);

        // get middle_one position data from index file
        fs.readSync(indexfileDes, buffer, 0, chunkSize, seekToIndex);
        const seekToData = buffer.toString();
        // console.log("seek to data value : " + seekToData);

        //get Data from data file at seekToData position
        fs.readSync(datafileDes, buffer, 0, chunkSize, parseInt(seekToData));
        const keylength = parseInt(buffer.toString());


        //get key value form datafile
        //console.log("Key length : " + keylength);
        var seekToKey = parseInt(seekToData) + parseInt(chunkSize) + 1;
        const bufferb = new Buffer(50);
        fs.readSync(datafileDes, bufferb, 0, parseInt(keylength), seekToKey);
        var data = bufferb.slice(0, parseInt(keylength)).toString();

        //console.log("Key : " + data)


        if (data.trim() == query.trim()) {
            console.log("matched ... !!!");
            const seekToValueLength = seekToKey + keylength + 1;

            //get value length from data file at seekToValueLength position
            fs.readSync(datafileDes, buffer, 0, chunkSize, parseInt(seekToValueLength));
            const valueLength = parseInt(buffer.toString());


            //get key value form datafile
            //console.log("Key length : " + keylength);
            const seekToValue = parseInt(seekToValueLength) + parseInt(chunkSize) + 1;
            const bufferb = new Buffer(valueLength);
            fs.readSync(datafileDes, bufferb, 0, parseInt(valueLength), seekToValue);
            var suggestions = bufferb.toString();
            // console.log(suggestions);
            return suggestions;

        } else if (data > query) {
            higher_one = middle_one - 1;
            return searchingIntoLookUp(query, indexfileDes, datafileDes, lower_one, higher_one);
        } else if (data < query) {
            lower_one = middle_one + 1;
            return searchingIntoLookUp(query, indexfileDes, datafileDes, lower_one, higher_one);
        }

    } else {
        console.log("Not founded");
        return "";
    }
}

/*
 * MOdule Exports function 
 *
 */

module.exports.getSuggestion = getSuggestion;
module.exports.generateLookupFiles = generateLookupFiles;
