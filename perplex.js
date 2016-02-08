/*TODO:
	skipline feature!
	ignore backspace
Done:
	+process text to remove carriage returns
	+replace tabs with spaces (how many?)
*/

var depth = 3;
var language;
var langExt;
var text = '';
var correct = 0;
var total = 0;
var perplexity = 'Unknown!';
var lastChar = "\n";

var codeArea = document.getElementById('CodeArea');
var score = document.getElementById('score');
codeArea.focus();

var digramPeekTable = document.getElementById('digram-table');
var digramTable = {}

//https://api.github.com/search/repositories?q=language:JavaScript&sort=stars

function keypressed(x){
    if (text.length > 0){
	//nextChar is the next character text
	var nextChar = text.slice(0,1);
	//removes the first character from text
	text = text.slice(1);
	
	var c = (x.charCode == nextChar.charCodeAt(0)) ? 'g' : 'r';
	
	if (nextChar=='\n'){
	    nextChar = '\u2936<BR>';
	    if (x.charCode == 13)
		c = 'g';
	}
	if (c=='g')
	    correct++
	
	var insert = '<span class='+c+'>'+nextChar+'</span>';
	codeArea.innerHTML = codeArea.innerHTML+insert;
	
	total++;
	perplexity = total/correct;
	score.innerHTML = perplexity.toFixed(3);
	
	console.log(x.charCode);
	digramPeekArray = digramTable[nextChar];
	lastChar = nextChar;
	update_table(lastChar, digramPeekArray);
    }
};

function processDoc(text){
	//remove carriage returns and replace tabs with spaces
	text = text.replace(/\r/, '');
	text = text.replace(/\t/, '    ');
	return text
}

function newLanguage(){
	codeArea.innerHTML = 'Loading, please wait...';
	language = document.getElementById("language").value;
	langExt = document.getElementById("extension").value;
	for (k in activeList){
		activeList[k].abort();
	}
	fileList = [];
	getFiles(language, langExt, depth);
	function temp(){
		if (Object.keys(activeList).length > 0 || (fileList.length < 1)){
			window.setTimeout(temp, 500);
		} else {
			getRandFile(function(t){
			    text = processDoc(t);
			    digramTable = populateDigramTable(text, {});
			    codeArea.innerHTML = 'Type Here!<BR>';
			});
		}
	}
    temp();
}

function populateDigramTable(text, digram_table) {
    var previous = text.slice(0,1);
    digram_table[previous] = {};
    for (index = 1; index <= text.slice(1).length; index++) {
	var character = text[index];
	if (previous in digram_table) {
	    if (character in digram_table[previous]) {
		digram_table[previous][character] += 1;
	    }
	    else {
		digram_table[previous][character] = 1;
	    }
	}
	else {
	    digram_table[previous] = {};
	    digram_table[previous][character] = 1;
	}
	previous = character;
    }
    var sorted_digram_table = {};
    for (item in digram_table) {
	var frequencies = []
	for (item2 in digram_table[item]) {
	    frequencies.push([item2, digram_table[item][item2]]);
	}
	frequencies.sort(compare);
	frequencies.reverse();
	sorted_digram_table[item] = frequencies;
    }
    return sorted_digram_table;
}

function compare(a, b) {
    if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
    return 0;
}

function update_table(last_char, digram_peek_array) {
    one = document.getElementById("digram-one");
    two = document.getElementById("digram-two");
    three = document.getElementById("digram-three");
    four = document.getElementById("digram-four");
    five = document.getElementById("digram-five");
    var sum = 0;
    for (index in digram_peek_array) {
	sum += digram_peek_array[index][1];
    }
    one.innerHTML = (last_char + digram_peek_array[0][0]
		     + ' ' + ((digram_peek_array[0][1] / sum) * 100).toFixed(3));
    two.innerHTML = (last_char + digram_peek_array[1][0]
		     + ' ' + ((digram_peek_array[1][1] / sum) * 100).toFixed(3));
    three.innerHTML = (last_char + digram_peek_array[2][0]
		     + ' ' + ((digram_peek_array[2][1] / sum) * 100).toFixed(3));
    four.innerHTML = (last_char + digram_peek_array[3][0]
		     + ' ' + ((digram_peek_array[3][1] / sum) * 100).toFixed(3));
    five.innerHTML = (last_char + digram_peek_array[4][0]
		     + ' ' + ((digram_peek_array[4][1] / sum) * 100).toFixed(3));
}
newLanguage();
codeArea.onkeypress = keypressed;
