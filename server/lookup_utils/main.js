var timesort = require('timsort');
var fs = require("fs");

fs.readFile('in.txt', function(err, data) {
    if (err) throw err;
    var array = data.toString().split("\n");
    array = mergeSort(array);
    //   console.log(array);
    generateLookUp(array);
    //lookup("a", "english");
});



/*
 * Sorting logic :- Merge Sort
 *
 */
function mergeSort(arr) {
    if (arr.length < 2) return arr;

    var mid = Math.floor(arr.length / 2);
    var subLeft = mergeSort(arr.slice(0, mid));
    var subRight = mergeSort(arr.slice(mid));

    return merge(subLeft, subRight);
}

function merge(a, b) {
    var result = [];
    while (a.length > 0 && b.length > 0)
        result.push(a[0] < b[0] ? a.shift() : b.shift());
    return result.concat(a.length ? a : b);
}


/*
 * to design look up
 *
 */

function generateLookUp(dataArray) {

    var baseNumber = "0000000000";
    var maxDepth = 8;
    var index = baseNumber;
    var indexFile = "english.index";
    var lookup = "english.data";

    var indexFileContent = '';
    var dataFileContent = '';

    dataArray.forEach(function(data, no) {


        var valueLength;
        var key = data;
        var keylength = data.toString().length;
        keylength = baseToNumber(keylength);


        var value = '';
        for (i = no + 1; i < dataArray.length; i++) {
            if (dataArray[i].indexOf(data) !== -1) {
                value += dataArray[i] + ',';
            } else {
                break;
            }
        }


        //console.log(indexFileContent);
        //console.log(index);

        valueLength = baseToNumber(value.length);

        //data file content
        value = value.replace(/,\s*$/, "");
        var content = `${keylength} ${key} ${valueLength} ${value}`;
        console.log("Content length : " + content.length);

        //indexing content

        index = baseToNumber(index);
        indexFileContent += index + '\n';
        index = parseInt(index) + content.length;


        dataFileContent += content + '\n';

    });

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
    })
    console.log(indexFileContent);
}


function baseToNumber(number) {
    //console.log(number);
    var base = "0000000000";
    var numberChar = number.toString().length;
    return base.slice(0, base.length - numberChar) + number;
}

function lookup(query, fileName) {
    var indexFile = fileName + ".index";
    var dataFile = fileName + ".data";



    //fs.stats to get filesize 
    const stats = fs.statSync("./english.index");
    const fileSizeInBytes = stats.size
    console.log(fileSizeInBytes);
    const entries = parseInt((fileSizeInBytes) / 11);
    console.log("Entries : " + entries);

    //logics to build for binary
    var lower_one = 0;
    var higher_one = entries;
    var middle_one = (entries + lower_one) / 2;
    const indexDes = fs.openSync(indexFile, 'r');
    const dataDes = fs.openSync(dataFile, 'r');
    searchingIntoLookUp(indexDes, dataDes, lower_one, entries);


}


/// Binary Searching 
function searchingIntoLookUp(indexfileDes, datafileDes, lower_one, higher_one) {
    if (lower_one < higher_one) {
        var middle_one = Math.round((higher_one + lower_one) / 2);
        console.log(higher_one);
        console.log(middle_one)
        var seekToIndex = (middle_one * 11);
        console.log(seekToIndex);


        const chunkSize = 11;
        const fd = fs.openSync("english.data", 'r');
        const buffer = new Buffer(chunkSize);

        // get middle_one position data from index file
        fs.readSync(indexfileDes, buffer, 0, chunkSize, seekToIndex);
        const seekToData = buffer.toString();
        console.log(seekToData);

        //get Data from data file at seekToData position
        fs.readSync(datafileDes, buffer, 0, chunkSize, parseInt(seekToData));
        console.log(buffer.toString());


    }
}
