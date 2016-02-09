var fs = require('fs');
var mongo = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/trainSchedule';
mongo.connect(url, function(err, db) {
  if(err) {
    console.log("error");
  }
  db.createCollection("trainData", function(err, collection){
    fs.readFile('isl_wise_train_detail_03082015_v1.csv', 'utf8', function (err, data) {
      var array1=[];
      // var counter = 1;
      var lines = data.split("\n");
      for (var j = 0; j < lines.length; j++) {
        var x=lines[j];
        var array2 = [];
        array2[j] = x.split(",");
        db.collection('trainData').insert({
        "trainNo": array2[j][0],
        "trainName":array2[j][1],
        "islno":Number(array2[j][2]),
        "stationCode": array2[j][3],
        "stationName": array2[j][4],
        "arrivalTime":array2[j][5],
        "departureTime":array2[j][6],
        "distance": Number(array2[j][7]),
        "sourceStationCode": array2[j][8],
        "sourceStationName":array2[j][9] ,
        "destinationStationCode": array2[j][10],
        "destinationStationName":array2[j][11] ,
        "counter" : j
        });
      }
    });
  });
});
