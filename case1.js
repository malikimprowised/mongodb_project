var mongo = require('mongodb').MongoClient;
var table = require('./display.js');
var caseTask = process.argv[2];
var numberOfRecords = Number(process.argv[3]);
dfd
// -----sorting--------
var dynamicSort = function (property) {
	var sortOrder = 1;
	if(property[0] === '-') {
			sortOrder = -1;
			property = property.substr(1);
	}
	return function (a,b) {
			var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			return result * sortOrder;
	}
}

// --------convert hour to minutes--------
var uniqueTrainCounter =[];
var hourToMinute = function (results) {
	for(i = 0; i < results.length; i += 1 ) {
		// console.log(result)
		a = results[i].arrivalTime.slice(1,9);
		b = a.split(':');
		results[i].minutes = (+b[0]) * 60  + (+b[1])+ (+b[2]);
	}
	results.push(0);
	var sum = 0;
	var diff = [];
	var j = 0;
	var sum = 0;
	var k = 0;
	var uniqueTrainCounter = [];
	var	length = results.length;
		for (i = 0 ; i < length-1; i += 1) {
			if ((results[i].trainNo === results[i + 1].trainNo) && (results[i].minutes > results[i + 1].minutes)) {
				diff [j] = ((24 * 60) - results[i].minutes) + ( 0 + results[i + 1].minutes);
				j += 1;
			}
			else if ((results[i].trainNo === results[i + 1].trainNo) && (results[i].minutes < results[i + 1].minutes)) {
				diff[j] = results[i + 1].minutes - results[i].minutes;
				// console.log(diff[j]);
				j += 1;
			}
			else if (results[i].trainNo !== results[i+1].trainNo) {
				for (j = 0 ; j < diff.length ; j += 1) {
						sum = sum + (diff[j]);
				}
				uniqueTrainCounter[k] = {
					operation: sum,
					_id : results[i].trainNo,
					trainName : results[i].trainName,
					sourceStationCode : results[i].sourceStationCode,
					sourceStationName : results[i].sourceStationName,
					destinationStationCode : results[i].destinationStationCode,
					destinationStationName : results[i].destinationStationName
				};
				k += 1;
				j = 0;
				sum = 0;
				for (j = 0 ; j < diff.length ; j += 1) {

					diff[j] = 0;
				}
			}
		}
		return uniqueTrainCounter;
}

// -----------method to group the data and sort it.-------------
var aggregateFunction = function (train,groupBy,orderBy) {
	var trainGroupBy;
	if (groupBy === 'distance') {
		trainGroupBy =train.aggregate([
				{$group : {
					_id :'$trainNo',

					operation :
					{$max : '$distance' },
					'trainName' : {'$first' : '$trainName'},
					'sourceStationCode' : {'$first' : '$sourceStationCode'},
					'sourceStationName' : {'$first' : '$sourceStationName'},
					'destinationStationCode' : {'$first' : '$destinationStationCode'},
					'destinationStationName' : {'$first' : '$destinationStationName'}

					}
				}
		]);
	}

	else if (groupBy === 'numberOfStation') {
		trainGroupBy =train.aggregate([
				{$group : {
					_id :'$trainNo',

					operation :
					{$sum : 1 },
					'trainName' : {'$first' : '$trainName'},
					'sourceStationCode' : {'$first' : '$sourceStationCode'},
					'sourceStationName' : {'$first' : '$sourceStationName'},
					'destinationStationCode' : {'$first' : '$destinationStationCode'},
					'destinationStationName' : {'$first' : '$destinationStationName'}
					}
				}
		]);
	}

	else if (groupBy === 'visitedStation') {
		trainGroupBy =train.aggregate([
				{$group : {
					_id :'$stationName',

					operation :
					{$sum : 1 },
					'stationName' : {'$first' : '$stationName'}
					}
				}
		]);
	}

	else if (groupBy === 'trainNo') {
		trainGroupBy =train.aggregate([
			{$group : {
					_id :'$trainNo'
				}
			}
		]);
	}
	return trainGroupBy.sort({operation : orderBy}).limit(numberOfRecords);
}

// ---------------convert minute to hour----------------
var minutetohour = function(finalTrain) {
	for(i = 0 ; i < finalTrain.length ; i++) {
		m = (finalTrain[i].operation) % 60;
		h = (finalTrain[i].operation - m)/60;
		finalTrain[i].operation = h.toString() + ':' + (m < 10 ? '0' : '') + m.toString();
		// console.log(finalTrain[i]);
	}
	return finalTrain;
}

train = mongo.connect('mongodb://localhost:27017/trainSchedule', function(err, db) {
	train = db.collection('trainData');

	var finalTrain = [];
	switch (caseTask) {
		case '1' :
		// Find and print 10 longest routes in terms of distance.
		aggregateFunction(train,'distance', -1).toArray(function(error,docs) {
			table.displayData(docs,'distance');
		});
		break;

		case '2' :
		// Find and print 10 shortest routes in terms of distance.
		aggregateFunction(train,'distance', 1).toArray(function(error,docs) {
			table.displayData(docs, 'distance');
		});
		break;

		case '3':
		// Find and print 10 longest routes in terms of duration.
		var k =0;
		train.find().sort({counter : 1}).toArray(function(error,results) {
			trainWithDuration = hourToMinute(results).sort(dynamicSort('operation'));;
			for(i = trainWithDuration.length - 1; i >= trainWithDuration.length - numberOfRecords; i -= 1) {
				finalTrain[k] = trainWithDuration[i];
				k += 1;
			}
			finalTrain = minutetohour(finalTrain);
			table.displayData(finalTrain, 'duration');
		})
		break;

		case '4':
		// Find and print 10 shortest routes in terms of duration.

		train.find().sort({counter : 1}).toArray(function(error,results) {
			trainWithDuration = hourToMinute(results).sort(dynamicSort('operation'));
			for(i = 0; i < numberOfRecords; i += 1) {
				finalTrain[i] = trainWithDuration[i];
			}
			finalTrain = minutetohour(finalTrain);
			table.displayData(finalTrain, 'duration');
		})
		break;

		case '5':
		// Find and print 10 longest routes in terms of number of stations.
		aggregateFunction(train,'numberOfStation' ,-1).toArray(function(error,docs) {
			table.displayData(docs, 'number of station');
		});
		break;

		case '6':
		// Find and print 10 shortest routes in terms of number of stations.
		aggregateFunction(train,'numberOfStation' ,1).limit(numberOfRecords).toArray(function(error,docs) {
			table.displayData(docs, 'number of station');
		});
		break;

		case '7':
		// Find and print 10 most visited stations.
		aggregateFunction(train,'visitedStation',-1).toArray(function(error,docs) {
			table.displayData(docs, 'visited station');
		});
		break;

		case '8':
		// Find and print 10 least visited stations.
		aggregateFunction(train,'visitedStation',1).toArray(function(error,docs) {
			table.displayData(docs, 'visited station');
		});
		break;

		default :
		console.log('Find and print 10 longest routes in terms of distance.');
		console.log('Find and print 10 shortest routes in terms of distance.');
		console.log('Find and print 10 longest routes in terms of duration.');
		console.log('Find and print 10 shortest routes in terms of duration.');
		console.log('Find and print 10 longest routes in terms of number of stations.');
		console.log('Find and print 10 shortest routes in terms of number of stations.');
		console.log('Find and print 10 most visited stations.');
		console.log('Find and print 10 least visited stations.');

	}

 });
