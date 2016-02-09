exports.displayData = function (docs, field) {

	var Table = require('cli-table');
	if (field === 'distance' || field === 'number of station' || field === 'duration') {
		var table = new Table({
				head: [
					'TRAIN NO',
					'TRAIN NAME',
					field,
					'SOURCESTATIONCODE',
					'SOURCE STATION NAME',
					'DESTINATION STATION CODE',
					'DESTINATION STATION NAME'

					],
				colWidths: [20,20,20,20,20,20,18]
		});
	 // docs.shift();
		docs.forEach(function(doc) {
			table.push(
					[
					doc._id,
					doc.trainName,
					doc.operation,
					doc.sourceStationCode,
					doc.sourceStationName,
					doc.destinationStationCode,
					doc.destinationStationName,
					]
			);
		})
	}

	else if (field === 'visited station') {
		var table = new Table({
				head: [
					'station',
					field,
					],
				colWidths: [20,20]
		});
	 // docs.shift();
		docs.forEach(function(doc) {
			table.push(
					[
					doc._id,
					doc.operation,
					]
			);
		})

	}

	console.log(table.toString());
}
