/**
 * GLOBAL CONSTANTS
 */

const CONSTANTS = {
	DATA: 10000
}

/* *************************** */

const debug = document.getElementById('debug');

// generate 20 unix timestamp between today and a week ago
const unixTimestamps = Array.from({
	length: CONSTANTS.DATA
}, (v, k) => {
	return Math.round(new Date().getTime()) - (86400 * 7 * k)
})

unixTimestamps.sort()

/**
 * Generating 2 arrays of points, one with timestamps associated and one without
 */
var timedData = [];
var genericData = [];
for (var i = 0; i < CONSTANTS.DATA; i++) {
	timedData.push([ unixTimestamps[i], Math.round(Math.random() * 200) + 190])
	genericData.push(Math.round(Math.random() * 200) + 190)
}
// dataWithTimestamps.sort((a, b) => a[0] - b[0])
genericData.sort((a, b) => a - b)

const baseOptions = {
	chart: {
		type: 'line',

		zoomType: 'x'
	},
	xAxis: {
		type: 'datetime',
	},
	plotOptions: {
		series: {
			step: true,
			lineWidth: 1,
			boostThreshold: 1,
			turboThreshold: 0,
			cropThreshold: 0,
			allowPointSelect: true,
			marker: {
				  enabled: false,
				states: {
					select: {
						enabled: false
					}
				}
			}
		}
	}
}

/**
 * Source chart
 */
let sourceChart = Highcharts.chart('container', {
	...baseOptions,
	title: {
		text: 'Select points by click-drag'
	},
	series: [{
		data: timedData,
		// data: dataWithoutTimestamps,
		showInLegend: true,
	},
	{
		data: [],
		color: '#ff0059',
		step: true,
		showInLegend: false,
}
]
});

/**
 * Result chart
 */
let resultChart = Highcharts.chart('result-chart', {
	...baseOptions,
	title: {
		text: 'Result'
	},
	series: [{
		data: timedData,
		// data: dataWithoutTimestamps,
		showInLegend: false,
		zoneAxis: 'x' // serve per abilitare la separazione delle zone considerando l'asse x anziché y
	}]
});

/**
 * Listener callbacks that contains the main logic for now
 */

const cbBoost = (e) => {
	const { value: userValueCondition } = e.target;
	document.querySelector("#input-value").innerHTML = userValueCondition;

	/**
	 * I punti considerati "selezionati" sono quelli che NON devono essere compresi nei calcoli
	 */
	let taggedPoints = []
	let validPoints = []

	for (let [index, pointValue] of sourceChart.series[0].processedYData.entries()) {
		
		// la condizione dovrebbe cambiare in base alla selezione dell'utente
		if (pointValue < userValueCondition) {
			// point needs to be 'tagged' and not used in the calculations
			// taggedPoints.push({
			// 	x: sourceChart.series[0].processedXData[index],
			// 	y: pointValue,
			// 	index
			// })
			taggedPoints.push([sourceChart.series[0].processedXData[index], pointValue])
		} else {
			// validPoints.push({
			// 	x: sourceChart.series[0].processedXData[index],
			// 	y: pointValue,
			// 	index
			// })

			validPoints.push([sourceChart.series[0].processedXData[index],pointValue])
		}
	}

	// * aggiorna il grafico sorgente con la nuova serie che indica i punti taggati

	// * inserisci i validPoints nel grafico result

	updateResultChart(validPoints)



	defineZonesBoost(taggedPoints)

}

/**
 * Listeners
 * 
 * To enable the boost logic, pass [cbBoost] as a callback, then enable the 'datetime' on xAxis on both the charts
 * use [dataWithTimestamps] as a source of data and uncomment the second series on the chart
 * 
 */

// document.querySelector('#input-formula').addEventListener('change', cbNoBoost )
document.querySelector('#input-formula').addEventListener('change', cbBoost )



/**
 * UTILS
 */


// create a function that calculated the standard deviation of an array of numbers
function standardDeviation(values) {

	// calculate the mean
	const average = values => values.reduce((a, b) => a + b) / values.length;

	var avg = average(values);

	var squareDiffs = values.map(function (value) {
		var diff = value - avg;
		var sqrDiff = diff * diff;
		return sqrDiff;
	});

	var avgSquareDiff = average(squareDiffs);

	var stdDev = Math.sqrt(avgSquareDiff);
	return stdDev;
}

function defineZonesBoost(taggedPoints) {

	const taggedSeries = timedData.map(point => {
		
		let found = binarySearch(taggedPoints, point[0])
		if (found !== -1) { // not found

		// if (taggedPoints.find(value => value[0] === point[0])) { // ! LENTO
			return point
		} else {
			return [point[0], null]
		}
	})

	sourceChart.update({
		series: [{
			data: timedData
		}, {
			data: taggedSeries
		}]
	}, false, false, false);

	sourceChart.redraw(false)
}

function updateResultChart(data) {
	resultChart.update({
		series: [{data: data}]}
		,false, false, false)
	resultChart.redraw(true);
}

function binarySearch(list, value) {
	let low = 0, high = list.length - 1;
	let iteration = 0
	while (low <= high) {
		iteration++
		let mid = Math.floor((low + high) / 2);
		let element = list[mid][0];
		if (element < value) {
			low = mid + 1;
		} else if (element > value) {
			high = mid - 1;
		} else {
			console.log('iterations: ', iteration);
			return mid;
		}
	}
	console.log('iterations: ', iteration);
	return -1;
}