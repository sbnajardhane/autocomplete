/*
This module is for creation of directory
 */

// require all the modules here
const fs = require("fs");

var dictionary = module.exports = function(options) {
    this.dictionary = {};
    this.wordList = [];
    this.path = "dictionary.json";
    this.maxlength = 0;
    this.options = {
        verbose: 2,
        editDistanceMax: 1,
        debug: true
    };
    if (options) {
        for (let key in options) {
            this.options[key] = options[key];
        }
    }
    console.log("constructor of directory");
};

var DictionaryItem = (function() {
    function DictionaryItem() {
        this.suggestions = [];
        this.count = 0;
    }
    DictionaryItem.prototype.clear = function() {
        this.suggestions = [];
        this.count = 0;
    };
    return DictionaryItem;
}());

dictionary.prototype = {

    parseWords: function(text) {
        return text.toLowerCase().match(/([\w\d_](-[\w\d_])?('(t|d|s|m|ll|re|ve))?)+/g);
    },

    createDictionaryEntry: function(key, language) {
        var result = false;
        var value;
        var dictKey = language + key;
        var valueo = dictKey in this.dictionary ? this.dictionary[dictKey] : false;
        if (valueo !== false) {
            if (typeof valueo === "number") {
                var tmp = valueo;
                value = new DictionaryItem();
                value.suggestions.push(tmp);
                this.dictionary[dictKey] = value;
            } else {
                value = valueo;
            }
            if (value.count < Number.MAX_VALUE)
                value.count++;
        } else if (this.wordList.length < Number.MAX_VALUE) {
            value = new DictionaryItem();
            value.count++;
            this.dictionary[dictKey] = value;
            if (key.length > this.maxLength)
                this.maxLength = key.length;
        }
        if (value.count === 1) {
            var keyInt = this.wordList.length;
            this.wordList.push(key);
            result = true;
            // console.log('\n\n main key: ', key);
            //returns object where key and value == each delete
            var edits = this.edits(key, 0);
            for (var delItem in edits) {
                var delKey = language + delItem;
                var value2 = delKey in this.dictionary ? this.dictionary[delKey] : false;
                // console.log('\ndictionary entry', this.dictionary[delKey]);
                // console.log('delete key: ', delKey, 'value: ', value2);
                if (value2 !== false) {
                    if (typeof value2 === "number") {
                        var tmp_1 = value2;
                        var di = new DictionaryItem();
                        di.suggestions.push(tmp_1);
                        this.dictionary[delKey] = di;
                        //if suggestions does not contain keyInt
                        if (di.suggestions.indexOf(keyInt) === -1) {
                            this.addLowestDistance(di, key, keyInt, delItem);
                        }
                    } else if (value2.suggestions.indexOf(value2.suggestions.indexOf(keyInt) === -1)) {
                        this.addLowestDistance(value2, key, keyInt, delItem);
                    }
                } else {
                    this.dictionary[delKey] = keyInt;
                }
            }
        }
        return result;
    },

    createDictionary: function(corpus, language) {
        return new Promise( (fullfill, reject) => {
            var wordCount = 0;
            if (this.options.debug) {
                console.log("Creating dictionary...");
                var tStart = Date.now();
            }
            var words = this.parseWords(corpus);
            var self = this;
            words.forEach(function(word) {
                // console.log(`Word ${wordCount} - ${word}`);
                if (self.createDictionaryEntry(word, language)) {
                    wordCount++;
                }
            });
            if (this.options.debug) {
                var tEnd = Date.now();
                var tDiff = tEnd - tStart;
                console.log("Dictionary: " + wordCount + " words, " + Object.keys(this.dictionary).length + " entries, edit distance=" + this.options.editDistanceMax + " in " + tDiff + " ms");
                console.log("memory:", process.memoryUsage());
            }
            console.log(this.dictionary);
            let data = {
                dictionary: this.dictionary,
                wordList: this.wordList
            };
            data = JSON.stringify(data);

            
            fs.writeFile(this.path, data, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("Dictionary saved");
                    fullfill();
                }
            });
        });
    },

    addLowestDistance: function(item, suggestion, suggestionInt, delItem) {
        //remove all existing suggestions of higher distance, if verbose<2
        //index2word
        if (this.options.verbose < 2 &&
            item.suggestions.length > 0 &&
            this.wordList[item.suggestions[0]].length - delItem.length > suggestion.length - delItem.length) {
            item.clear();
        }
        //do not add suggestion of higher distance than existing, if verbose<2
        if (this.options.verbose == 2 ||
            item.suggestions.length == 0 ||
            this.wordList[item.suggestions[0]].length - delItem.length >= suggestion.length - delItem.length) {
            item.suggestions.push(suggestionInt);
        }
    },

    //inexpensive and language independent: only deletes, no transposes + replaces + inserts
    //replaces and inserts are expensive and language dependent (Chinese has 70,000 Unicode Han characters)
    //C# returned HashSet<string>
    //TS returns object with key and value == each delete
    edits: function(word, editDistance, deletes) {
        deletes = deletes || {};
        editDistance++;
        if (word.length > 1) {
            for (var i = 0; i < word.length; i++) {
                //emulate C#'s word.Remove(i, 1)
                var delItem = word.substring(0, i) + word.substring(i + 1);
                if (!(delItem in deletes)) {
                    deletes[delItem] = delItem;
                    if (editDistance < this.options.editDistanceMax) {
                        this.edits(delItem, editDistance, deletes);
                    }
                }
            }
        }
        return deletes;
    }

};

create();

function create() {
    var dir = new dictionary();
    console.log("dictionary function", dir);
    dir.createDictionary(fs.readFileSync("./dict.txt").toString(), "");
}