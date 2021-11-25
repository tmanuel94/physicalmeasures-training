/* ***** GLOBAL CONSTANTS ***** */

const CONSTANTS = {
	DATA: 1000
}

const FORMULAS = {
	"ABOVE": "above",
	"BELOW": "below",
	"BETWEEN": "between",
	"OUTSIDE_OF": "not-between"
}

/* ******* FINE GLOBAL ******* */

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
for (var i = 0; i < CONSTANTS.DATA; i++) {
	timedData.push([unixTimestamps[i], Math.floor(Math.random() * (2000 - 100 + 1)) + 100])
}



/**
 * Custom Events
 */

let selections = []

const selectionEvent = (e) => {
	
	if (e.resetSelection) return true
	let { ctrlKey, shiftKey } = e.originalEvent
	
	let { min, max } = e.xAxis[0]
	
	min = Math.floor(min)
	max = Math.floor(max)
	
	if (shiftKey) {
		e.preventDefault()

		// format min and max to DD/MM/YYYY using moment

		let minDate = moment(min).format('DD/MM/YYYY hh:mm:ss')
		let maxDate = moment(max).format('DD/MM/YYYY hh:mm:ss')

		toastr.info(`Selection: <br>${minDate} : FROM <br>${maxDate} : TO`)

		selections.push([min, max])

	
		sourceChart.update({
			xAxis: {
				plotBands: generatePlotBands(selections)
			}
		}, false, false, false)
	
		sourceChart.redraw(false)

	}

		
		// e.originalevent.ctrlKey/shiftKey
		// e.xAxis[0].min/max (Math.floor()) => update plotbands if shiftKey is pressed
}


const baseOptions = {
	chart: {
		type: 'line',
		zoomType: 'x',
		events: {
			selection: selectionEvent
		}
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
	},
	exporting: {
		enabled: false
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
		showInLegend: true,
	},
{
		data: [],
		color: '#ff0059',
		step: true,
		showInLegend: false,
	}]
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
		showInLegend: false,
		zoneAxis: 'x' // serve per abilitare la separazione delle zone considerando l'asse x anziché y
	}]
});


/**
 * Funzioni per logiche di filtro
 */

const tagBelow = () => {
	let taggedPoints = []
	let validPoints = []

	let val = document.querySelector('#input-formula-min').value

	// check if val is not empty
	if (val === '') {
		toastr.error('Please insert a value')
		return
	}

	for (let [index, pointValue] of sourceChart.series[0].processedYData.entries()) {

		// condizione tmp per verificare che il dato sia compreso tra tutte le selezioni temporali

		let xPoint = sourceChart.series[0].processedXData[index]

		let isBetween = checkIfPointIsInBetween(xPoint, selections)

		// la condizione dovrebbe cambiare in base alla selezione dell'utente
		if (pointValue < val || !isBetween) {
			taggedPoints.push([xPoint, pointValue])
			continue
		}

		validPoints.push([xPoint,pointValue])
	}

	return {
		taggedPoints,
		validPoints
	}
}

const tagAbove = () =>{
	let taggedPoints = []
	let validPoints = []

	let val = document.querySelector('#input-formula-min').value

		// check if val is not empty
		if (val === '') {
			toastr.error('Please insert a value')
			return
		}

	for (let [index, pointValue] of sourceChart.series[0].processedYData.entries()) {
		
		let xPoint = sourceChart.series[0].processedXData[index]

		let isBetween = checkIfPointIsInBetween(xPoint, selections)

		// la condizione dovrebbe cambiare in base alla selezione dell'utente
		if (pointValue > val || !isBetween) {
			taggedPoints.push([xPoint, pointValue])
			continue
		} 

		validPoints.push([xPoint,pointValue])
	}

	return {
		taggedPoints,
		validPoints
	}
}

const tagBetween = () => {
	let taggedPoints = []
	let validPoints = []

	let min = document.querySelector('#input-formula-min').value
	let max = document.querySelector('#input-formula-max').value

	// check if val is not empty
	if (min === '' || max === '') {
		toastr.error('Please insert a value')
		return
	}

	for (let [index, pointValue] of sourceChart.series[0].processedYData.entries()) {

		let xPoint = sourceChart.series[0].processedXData[index]

		let isBetween = checkIfPointIsInBetween(xPoint, selections)

		
		// la condizione dovrebbe cambiare in base alla selezione dell'utente
		if (pointValue >= min && pointValue <= max || !isBetween) {
			taggedPoints.push([xPoint, pointValue])
			continue
		} 
		validPoints.push([xPoint,pointValue])
	}

	return {
		taggedPoints,
		validPoints
	}
}

const tagOutsideOf = () => {
	let taggedPoints = []
	let validPoints = []

	let min = document.querySelector('#input-formula-min').value
	let max = document.querySelector('#input-formula-max').value

	// check if val is not empty
	if (min === '' || max === '') {
		toastr.error('Please insert a value')
		return
	}

	for (let [index, pointValue] of sourceChart.series[0].processedYData.entries()) {
		
		let xPoint = sourceChart.series[0].processedXData[index]

		let isBetween = checkIfPointIsInBetween(xPoint, selections)

		// la condizione dovrebbe cambiare in base alla selezione dell'utente
		if (pointValue <= min || pointValue >= max || !isBetween) {
			taggedPoints.push([xPoint, pointValue])
			continue
		}

		validPoints.push([xPoint,pointValue])
	}

	return {
		taggedPoints,
		validPoints
	}
}

/**
 * Listener callbacks that contains the main logic for now
 */

const cbCalculateButton = (e) => {
	const formula = document.querySelector("#select-formula").value

	let result = {}

	switch (formula) {
		case FORMULAS.BELOW:
			result = tagBelow()
			break;

		case FORMULAS.ABOVE:
			result = tagAbove()
			break;
		case FORMULAS.BETWEEN:
			result = tagBetween()
			break;
		case FORMULAS.OUTSIDE_OF:
			result = tagOutsideOf()
			break;

		default:
			break;
	}
	/**
	 * I punti considerati "selezionati" sono quelli che NON devono essere compresi nei calcoli
	 */

	printAll(result.validPoints, result.taggedPoints)

	updateResultChart(result.validPoints)
	updateSourceChart(result.taggedPoints)

}

function printAll(validPoints, taggedPoints) {

	document.querySelector('#tagged-points').innerHTML = `${taggedPoints.length} points have been tagged and won't be used`
	document.querySelector('#valid-points').innerHTML = `${validPoints.length} valid points will be used`

	let std = standardDeviation(validPoints)

	document.querySelector('#result-txt').innerHTML = `resultin std: ${std}`
}

/**
 * Listeners
 * 
 * To enable the boost logic, pass [cbBoost] as a callback, then enable the 'datetime' on xAxis on both the charts
 * use [dataWithTimestamps] as a source of data and uncomment the second series on the chart
 * 
 */

// document.querySelector('#input-formula').addEventListener('change', cbBoost )

document.querySelector('#calculate-button').addEventListener('click', cbCalculateButton )

function updateSourceChart(taggedPoints) {

	const taggedSeries = timedData.map(point => {
		
		let found = binarySearch(taggedPoints, point[0])
		if (found !== -1) { // not found
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

/**
 * UTILS
 */

// create a function that calculated the standard deviation of an array of numbers
function standardDeviation(val) {

	let values = val.map(point => point[1])
	
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
	return stdDev.toFixed(2);
}

function binarySearch(list, value) {
	let low = 0, high = list.length - 1;
	while (low <= high) {
		let mid = Math.floor((low + high) / 2);
		let element = list[mid][0];
		if (element < value) {
			low = mid + 1;
		} else if (element > value) {
			high = mid - 1;
		} else {
			return mid;
		}
	}
	return -1;
}

function generatePlotBands(selections) {
	return selections.map(selection => {
		return {
			from: selection[0],
			to: selection[1],
			color: 'rgba(68, 170, 213, 0.2)',
			label: {
				text: `${selection[0]} - ${selection[1]}`,
				style: {
					color: '#606060'
				}
			}
		}
	})
}

function checkIfPointIsInBetween(point, selections) {
	let isBetween = true
	if (selections.length > 0) {
		for (let selection of selections) {
			if (point >= selection[0] && point <= selection[1]) {
				isBetween = true
				break
			}
			isBetween = false
		}
	}
	return isBetween
}

/**
 * DATERANGEPICKER
 */
/**
 * DA VALUTARE SE USARE QUESTA SOLUZIONE O INTERAGIRE COMPLETAMENTE SU HIGHCHARTS IN MANIERA GRAFICA PER QUANTO RIGUARDA
 * LA SELEZIONE DEI LASSI TEMPORALI DI INTERESSE
 */
$('input[name="daterangepicker"]').daterangepicker({
	"opens": "center",
	"locale": {
		"format": "DD/MM/YYYY",
		"separator": " - ",
		"applyLabel": "Apply",
		"cancelLabel": "Cancel",
		"fromLabel": "From",
		"toLabel": "To",
		"customRangeLabel": "Custom",
		"weekLabel": "W",
		"daysOfWeek": [
			"Mo",
			"Tu",
			"We",
			"Th",
			"Fr",
			"Sa",
			"Su"	
		],
		"monthNames": [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December"
		],
		"firstDay": 1
	},
	"startDate": unixTimestamps[0],
	"endDate": unixTimestamps[unixTimestamps.length - 1],
	"minDate": moment(unixTimestamps[0]),
	"maxDate": moment(unixTimestamps[unixTimestamps.length - 1])
}, function (start, end, label) {

	sourceChart.update({
		xAxis: {
			plotBands: [{
				from: start.unix() * 1000,
				to: end.unix() * 1000,
				color: 'rgba(68, 170, 213, .2)',
				id: 'plot-band-1',
				events: {
					click: function (e) {
						console.log(e)
						// e.target.id
					}
				}
			}],
		}
	}, false, false, false);

	sourceChart.redraw(false)
});

