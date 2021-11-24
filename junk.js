/**
 * Custom selection handler that selects points and cancels the default zoom behaviour
 */
 async function selectPointsByDrag(e) {

	e.preventDefault();

	// Select points
	let count = 0
	let globalTimeOut = 0



	this.series.forEach((series) => {

		// Highcharts.each(series.points, function (point) {

		series.points.forEach(point => {
			if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max) {
				count++
			}
		})

		if (count < 2) return

		series.points.forEach(point => {
			// && point.y >= e.yAxis[0].min && point.y <= e.yAxis[0].max

			if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max) {

				if (point.selected) {
					point.select(false, true);
					point.color = '#2f7ed8'
					console.log("deselecting point: \n", point);
				} else {
					point.select(true, true)
					// set the color of this point to #ff8300
					point.color = '#ff8300';
					console.log("selecting point: \n", point);
				}

			}
		});
	});


	if (count < 2) {
		return
	}

	const setTimeoutPromise = timeout => new Promise(resolve => {
		setTimeout(resolve, timeout);
	});




	const allSelectedPointInChart = this.getSelectedPoints();

	let extremesOfCurrentSelection = allSelectedPointInChart.filter(point => {

			if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max) {
				return point
			}
		})
		.map(point => point.x)
		.filter((value, index, self) => {
			if (index === 0 || index === self.length - 1) {
				return value
			}
		})


	console.log("_selectedPoints ", allSelectedPointInChart);
	console.log("_selectedPointsArray ", extremesOfCurrentSelection);


	/**
	 * BUON INIZIO
	 */

	//   // check if globalSelectionArray is empty
	//     if (globalSelectedRangePoints.length === 0) {
	//         globalSelectedRangePoints.push(extremesOfCurrentSelection)
	//     } else {


	//         const firstPoint = extremesOfCurrentSelection[0]
	//         const lastPoint = extremesOfCurrentSelection[1]


	//         // sort globalSelectedRangePoints array in ascending order
	//         globalSelectedRangePoints.sort((a, b) => a[0] - b[0])

	//         if (firstPoint < globalSelectedRangePoints[0][0] && lastPoint < globalSelectedRangePoints[0][0]) { // entrambi i valori sono minori del più piccolo del globale
	//             globalSelectedRangePoints.unshift([firstPoint, lastPoint])
	//         } else if (firstPoint > globalSelectedRangePoints[globalSelectedRangePoints.length - 1][1] && lastPoint > globalSelectedRangePoints[globalSelectedRangePoints.length - 1][1]) { // entrambi i valori sono maggiori del più grande del globale
	//             globalSelectedRangePoints.push([firstPoint, lastPoint])
	//         } else if ()

	//         console.log("globalSelectedRangePoints after: ", globalSelectedRangePoints);

	//     }

	// globalSelectedRangePoints = []


	extremesOfCurrentSelection.forEach(point => {
		// check if point is present in globalSelectedRangePoints
		if (globalSelectedRangePoints.indexOf(point) === -1) {
			globalSelectedRangePoints.push(point)
		} else {
			// remove point from globalSelectedRangePoints
			globalSelectedRangePoints.splice(globalSelectedRangePoints.indexOf(point), 1)
		}
	})


	// globalSelectedRangePoints.push(...extremesOfCurrentSelection)

	// check if globalSelectedRangePoints does not contain both the values inside extremesOfCurrentSelection


	if (globalSelectedRangePoints.indexOf(extremesOfCurrentSelection[0]) === -1 && globalSelectedRangePoints.indexOf(extremesOfCurrentSelection[1]) === -1) {
		globalSelectedRangePoints = [...globalSelectedRangePoints, ...extremesOfCurrentSelection]
	}

	globalSelectedRangePoints.sort((a, b) => a - b)




	console.log("globalSelectedRangePoints after: ", globalSelectedRangePoints);


	let _zones = globalSelectedRangePoints.map((value, index, self) => {
		if ((index + 1) % 2 === 0) {
			return {
				value: value,
				color: "#ff8300"
			}
		} else {
			return {
				value: value,
				color: "#2f7ed8"
			}
		}
	})


	// _zones.push({
	//     // color: "#ff8300"
	//     color: "#2f7ed8"

	// })

	console.log("_zones ", _zones);

	// show _zones as an interactable json into debug element
	debug.innerHTML = JSON.stringify(_zones, null, 4);

	// debug.innerHTML = JSON.stringify(_zones);

	this.update({
		plotOptions: {
			series: {
				zones: _zones
			}
		}
	}, false, false, false)

	this.redraw(false);

	// console.log("pointsToColor ", pointsToColor);
	// console.log("globalSelectionArray ", globalSelectionArray);

	// create a function that separate an array of integers into multiple arrays of all the adjacent values in the array and find how many there is of it
	// function findAdjacent(array) {
	//     var result = [];
	//     var temp = [];
	//     for (let _i = 0; _i < array.length; _i++) {
	//         if (array[_i] === array[_i + 1] - 1) {
	//             temp.push(array[_i]);
	//             result.push(temp);
	//             temp = [];
	//         } else {
	//             temp.push(array[_i]);
	//         }
	//     }
	//     return result;
	// }

	// console.log(findAdjacent(pointsToColor));



	// update chart chart zone and set it from 0 to 3 

	//   chart.update({
	//       series: {
	//           zones: [
	//               {
	//                 value: 0,
	//                 color: '#2f7ed8' // arancione
	//               },
	//               {
	//                 value: 5,
	//                 color: '#ff8300'
	//               }
	//           ]
	//       }
	//   })



	//   Fire a custom event
	// Highcharts.fireEvent(chart, 'selectedpoints', { points: chart.getSelectedPoints() });
	//   return false; // Don't zoom
}

let globalSelectedRangePoints = [];

/**
 * On click, unselect all points
 */
 function unselectByClick(e) {
	e.preventDefault();
	// var points = this.getSelectedPoints();
	// if (points.length > 0) {
	// 	Highcharts.each(points, function (point) {
	// 		point.select(false);
	// 	});
	// }
}





const cbNoBoost = (e) => {
	const { value } = e.target;

	document.querySelector("#input-value").innerHTML = value;


	for (let [index, point] of sourceChart.series[0].data.entries()) {
	// chart.series[0].data.forEach((point, index) => {
		if (point.y < value) {
			point.select(true, true);
			point.update({
				color: '#ff8300'
			}, false, false, false);

		} else {
			point.select(false, true);
			// point.color = '#2f7ed8';
			point.update({
				color: '#2f7ed8'
			}, false, false, false);
		}
	}
	// )

	sourceChart.redraw(true)

	document.querySelector('#selected-points').innerHTML = printUnselectedPointsChart();
	document.querySelector('#unselected-points').innerHTML = printSelectedPointChart();

	defineZonesNoBoost()

	let std = calculateOnValidPoints()
	document.querySelector('#result-txt').innerHTML = `resultin std: ${std}`

}

function printUnselectedPointsChart() {
	const dataNotSelected = sourceChart.series[0].data.filter(point => !point.selected)
	const length = dataNotSelected.length

	updateResultChart(dataNotSelected.map(point => [point.x, point.y]))

	return `${length} points remained unselected and will be used`
}

function calculateOnValidPoints() {
	const selectedPoints = sourceChart.series[0].data.filter(point => !point.selected);
	return standardDeviation(selectedPoints.map(point => point.y))
}