var noteNames;
makeNoteNames();

function makeNoteNames(){
	noteNames = [];
	var chromatic = ['c', ' ', 'd', ' ', 'e', 'f', ' ', 'g', ' ', 'a', ' ', 'b'];
	var accidentals = ['cis', 'dis', 'fis', 'gis', 'ais']; // 5 sharp
	// var accidentals = ['cis', 'dis', 'fis', 'gis', 'bes']; // 4 sharp 1 flat
	// var accidentals = ['cis', 'ees', 'fis', 'gis', 'bes']; // 3 sharp 2 flat
	// var accidentals = ['cis', 'ees', 'fis', 'aes', 'bes']; // 2 sharp 3 flat
	// var accidentals = ['des', 'ees', 'fis', 'aes', 'bes']; // 1 sharp 4 flat
	// var accidentals = ['des', 'ees', 'ges', 'aes', 'bes']; // 5 flat
	var octaveMarks = [',,,,', ',,,', ',,', ',', '', '\'', '\'\'', '\'\'\'', '\'\'\'\''];

	for(var oct = 0; oct < 9; oct++){
		var blackKey = 0;
		for(var i = 0; i < 12; i++){
			var note;
			if(chromatic[i] == ' '){
				note = accidentals[blackKey];
				blackKey++;
			}
			else{
				note = chromatic[i]
			}
			note = note + octaveMarks[oct];
			noteNames.push(note);
		}
	}
}

// lodash

//////////////////////////////////////////////////////

var STANDARD_KEY_SIGNATURE = {'time': 0, 'key': 0, 'majorminor': 'major'};
var STANDARD_TIME_SIGNATURE =  {'time' :  0, 'numerator' : 4, 'denominator' : 4}
var STANDARD_TEMPO =  {'time' :  0, 'tempo' : 0} ;
var tempos = [];
var keySignatures = [];
var timeSignatures = [];

function ArrNoDupe(a) {
	var temp = {};
	for (var i = 0; i < a.length; i++)
		temp[a[i]] = true;
	var r = [];
	for (var k in temp)
		r.push(k);
	return r;
}

function getAllNoteOnBetweenTimes(lines, beginTime, endTime){
	var activeMIDIChannels = [];
	for(var i = 0; i < lines.length; i++){
		if(lines[i].length >= 6){
			activeMIDIChannels.push( lines[i][0] );
		}
	}
	// 
	activeMIDIChannels = ArrNoDupe( activeMIDIChannels );
	console.log(activeMIDIChannels);

	var noteOnEntries = {};
	for(var i = 0; i < activeMIDIChannels.length; i++){
		var voiceIDString = activeMIDIChannels[i];
		noteOnEntries[voiceIDString] = [];
	}
	for(var i = 0; i < lines.length; i++){
		if(lines[i].length >= 2){
			if(lines[i][1] >= beginTime && lines[i][1] < endTime){
				var noteString = lines[i][2].trim();
				if(noteString == 'Note_on_c' && lines[i][5] != 0)
					noteOnEntries[lines[i][0].trim()].push( lines[i] );
			}
		}
	}
	return noteOnEntries;
}

function getAllTempos(midiFileArray){
	tempos = [];
	for(var i = 0; i < midiFileArray.length; i++){
		if(midiFileArray[i].length >= 2){
			if(midiFileArray[i][2] == 'Tempo'){
				var time = Number(midiFileArray[i][1]);
				var tempo = Number(midiFileArray[i][3]);
				tempos.push( {'time' :  time, 'tempo' : tempo} );
			}
		}
	}
}


function getAllTimeSignatures(midiFileArray){
	timeSignatures = [];
	for(var i = 0; i < midiFileArray.length; i++){
		if(midiFileArray[i].length >= 2){
			if(midiFileArray[i][2] == 'Time_signature'){
				var time = Number(midiFileArray[i][1]);
				var numerator = Number(midiFileArray[i][3]);
				var denominator = Math.pow(2, midiFileArray[i][4]); // stored as power of two
				var click = Number(midiFileArray[i][5]); // number of MIDI clocks per metronome click
				var notesQ = Number(midiFileArray[i][6]); // number of 32nd notes in the nominal MIDI quarter note time of 24 clocks (8 for the default MIDI quarter note definition)
				timeSignatures.push( {'time' :  time, 'numerator' : numerator, 'denominator' : denominator, 'click' : click, 'notesQ' : notesQ} );
			}
		}
	}
}

function getAllKeySignatures(midiFileArray){
	keySignatures = [];
	for(var i = 0; i < midiFileArray.length; i++){
		if(midiFileArray[i].length >= 2){
			if(midiFileArray[i][2] == 'Key_signature'){
				var time = Number(midiFileArray[i][1]);
				var key = Number(midiFileArray[i][3]);
				var majorminor = midiFileArray[i][4].replace(/"/g,"");
				keySignatures.push( {'time' :  time, 'key' : key, 'majorminor' : majorminor} );
			}
		}
	}
}

function getKeySignatureAtTime(time){
	// make something up
	if(keySignatures.length < 1)
		return STANDARD_KEY_SIGNATURE;
	// easy, only one exists
	if(keySignatures.length == 1)
		return keySignatures[0];
	// find closest one
	var closestIndex = 0;
	for(var i = 1; i < keySignatures.length; i++){
		if(time > keySignatures[i]['time']){
			var difference1 = time - keySignatures[closestIndex]['time'];
			var difference2 = time - keySignatures[i]['time'];
			if(difference2 < difference1){
				closestIndex = i;
			}
		}
	}
	return keySignatures[closestIndex];
}


function getTimeSignatureAtTime(time){
	// make something up
	if(timeSignatures.length < 1)
		return STANDARD_TIME_SIGNATURE;
	// easy, only one exists
	if(timeSignatures.length == 1)
		return timeSignatures[0];
	// find closest one
	var closestIndex = 0;
	for(var i = 1; i < timeSignatures.length; i++){
		if(time > timeSignatures[i]['time']){
			var difference1 = time - timeSignatures[closestIndex]['time'];
			var difference2 = time - timeSignatures[i]['time'];
			if(difference2 < difference1){
				closestIndex = i;
			}
		}
	}
	return timeSignatures[closestIndex];
}

function getTempoAtTime(time){
	// make something up
	if(tempos.length < 1)
		return STANDARD_TEMPO;
	// easy, only one exists
	if(tempos.length == 1)
		return tempos[0];
	// find closest one
	var closestIndex = 0;
	for(var i = 1; i < tempos.length; i++){
		if(time > tempos[i]['time']){
			var difference1 = time - tempos[closestIndex]['time'];
			var difference2 = time - tempos[i]['time'];
			if(difference2 < difference1){
				closestIndex = i;
			}
		}
	}
	return tempos[closestIndex];
}

var measure_num = Math.floor(Math.random()*48)
// var measure_num = 5;

var MEASURE_LENGTH = 960;
// var trimBegin = 14400;
var trimBegin = 360 * measure_num;
var trimLength = 360 * 4;

var currentKey;
var currentTimeSignature;
var currentTempo;

function stringForCurrentKey(){
	// indices are -7 to +7, relating to number of flats / sharps
	var majorKeyArray = ['ces', 'ges', 'des', 'aes', 'ees', 'bes', 'f', 'c', 'g', 'd', 'a', 'e', 'b', 'fis', 'cis'];
	var minorKeyArray = ['aes', 'ees', 'bes', 'f', 'c', 'g', 'd', 'a', 'e', 'b', 'fis', 'cis', 'gis', 'dis', 'ais'];
	var majorminor = currentKey['majorminor'];
	var keyIndex = currentKey['key'];
	var keyString;
	if(majorminor == 'major')
		keyString = majorKeyArray[keyIndex+7];
	else
		keyString = minorKeyArray[keyIndex+7];
	return '\\key ' + keyString + ' \\' + majorminor;
}

function printNoteValues(noteOnEntries){
	var notes = []; 

	var returnString = '\\header {\ntagline = ""  % removed\n}\n\n\\score {\n\n\<\<\n';

	var keys = Object.keys(noteOnEntries);
	for(var v = 2; v < keys.length; v++){

		var clef = 'treble';
		if(v == 3) clef = 'bass';
		var timeSignatureString = '\\time ' + currentTimeSignature['numerator'] + '/' + currentTimeSignature['denominator'];

		var keyString = stringForCurrentKey();

		returnString += '\\new Staff {' + '\n' + 
		'\\clef "' + clef + '"' + '\n' + 
		stringForCurrentKey() + '\n' + 
		timeSignatureString + '\n';

		var voiceEntries = noteOnEntries[ keys[v] ];
		for(var i = 0; i < voiceEntries.length; i++){
			var length = MEASURE_LENGTH;
			if(i < voiceEntries.length - 1)
				length = (voiceEntries[i+1][1] - trimBegin) - (voiceEntries[i][1] - trimBegin);
			else
				length = (trimLength) - (voiceEntries[i][1] - trimBegin);

			console.log(MEASURE_LENGTH + ' '  + length);
			length = MEASURE_LENGTH/length;

			// console.log(noteNames[ voiceEntries[i][4] ] + ' ' + length);

			// TODO: remove this!!
			length = Math.floor(length);

			returnString += ' ' + noteNames[ voiceEntries[i][4] ] + length;

			// notes.push(new Vex.Flow.StaveNote({keys: [ noteNames[ voiceEntries[i][4] ] ], duration: length.toString() }) );
		}

		returnString += '\n}\n';

	}

	returnString += '\n\>\>\n}';
	return returnString;
}


function loadFile(filename){
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", filename, true);
	rawFile.onreadystatechange = function (){
		if(rawFile.readyState === 4){
			var allText = rawFile.responseText;
			var midiFileArray = csvToArray(allText);

			parseMIDIFileArray(midiFileArray);

			// console.log(midiFileArray);
			// document.getElementById("textSection").innerHTML = allText;
		}
	}
	rawFile.send();
}

module.exports = {

csvToArray: function(allText) {
	var allTextLines = allText.split(/\r\n|\n/);
	var headers = allTextLines[0].split(',');
	var lines = [];
	for (var i=0; i<allTextLines.length; i++) {
		var data = allTextLines[i].split(',');
		var tarr = [];
		for (var j=0; j<data.length; j++) {
			tarr.push( data[j].trim() );
		}
		lines.push(tarr);
	}
	return lines;
},

parseMIDIFileArray: function(midiFileArray){
	getAllTempos(midiFileArray);
	getAllKeySignatures(midiFileArray);
	getAllTimeSignatures(midiFileArray);

	currentKey = getKeySignatureAtTime(trimBegin);
	console.log('current key');
	console.log(currentKey);
	
	currentTimeSignature = getTimeSignatureAtTime(trimBegin);
	console.log('current time sig');
	console.log(currentTimeSignature);

	currentTempo = getTempoAtTime(trimBegin);
	console.log('current tempo');
	console.log(currentTempo);

	var noteOns = getAllNoteOnBetweenTimes(midiFileArray, trimBegin, trimBegin + trimLength);
	console.log('Note On Values');
	console.log(noteOns);

	return printNoteValues(noteOns);
}


};