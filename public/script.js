var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var datasets = [];
var datasetsAdded = [];
var averages = [];
var monthlyAverages = [];

function min(a,b){
  if(a > b){
    return b;
  }
  return a;
}

function average(arr){
  var sum = 0;
  for(var i = 0; i < arr.length; i++){
    sum += arr[i];
  }
  return sum/arr.length;
}

/*
{
label: "" ,
backgroundColor: window.chartColors.red,
borderColor: window.chartColors.red,
data: [
randomScalingFactor(),
randomScalingFactor(),
randomScalingFactor(),
randomScalingFactor(),
randomScalingFactor(),
randomScalingFactor(),
randomScalingFactor()
],
fill: false,
}
*/
Papa.parse("/public/temps.csv", {
  download: true,
  complete: function(results) {
    console.log(results);
    var data = results.data;
    //Compute monthly averages
    for(var i = 0; i < MONTHS.length+1; ++i){
      monthlyAverages.push(0);
    }
    for(var i = 0; i < data.length; ++i){
      var month = +data[i][2].substr(5);
      if(0 <= month && month <= MONTHS.length && +data[i][4]){
        monthlyAverages[month] += +data[i][4];
      }
    }
    for(var i = 0; i < monthlyAverages.length; ++i){
      monthlyAverages[i] /= (data.length/MONTHS.length);
    }
    console.log(monthlyAverages)
    for(var i = 0; i < data.length; i+=MONTHS.length){
      var line = {};
      line.label = data[i][2].substr(0, 4);
      line.data = [];
      for(var j = i; j < min(i + MONTHS.length, data.length); ++j){
        if(+data[j][2].substr(5) == (j-i+1)){
          line.data.push(+data[j][4] - monthlyAverages[j-i+1]);/*- +data[j][5]*/
        } else {
          console.log('line: ', data[j][2])
          console.log(+data[j][2].substr(5));
          console.log('neq',(j-i+1));
          console.log('------');
        }
      }
      averages.push(average(line.data));
      line.fill = "false";
      line.spanGaps = "true";
      datasets.push(line);
    }
    console.log('-------------');
    console.log(datasets);
    render();
    console.log(averages);
    console.log("AVERAGE:",average(averages));
  }
});

var config = {
  type: 'line',
  data: {
    labels: MONTHS,
    datasets: datasetsAdded
  },
  options: {
    responsive: true,
    title:{
      display:true,
      text:'Chart.js Line Chart'
    },
    tooltips: {
      mode: 'point',
      intersect: false,
    },
    hover: {
      mode: 'point',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Month'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Value'
        }
      }]
    }
  }
};
var render = function() {
  var ctx = document.getElementById("canvas").getContext("2d");
  datasetsAdded.push(datasets[datasetsAdded.length]);
  window.myLine = new Chart(ctx, config);
  setInterval(nextStep,300)
};

function nextStep(){
  if(datasets.length == datasetsAdded.length){
    return;
  }
  var max = average(datasetsAdded[0].data);
  var maxIndex = 0;
  for(var i = 0; i < datasetsAdded.length; ++i){
    datasetsAdded[i].backgroundColor = "";
    datasetsAdded[i].borderColor = "";//window.chartColors.grey;
    if(average(datasetsAdded[i].data) > max){
      max = average(datasetsAdded[i].data);
      maxIndex = i;
    }
  }
  datasetsAdded[maxIndex].backgroundColor = window.chartColors.red;
  datasetsAdded[maxIndex].borderColor = window.chartColors.red;
  var nextOne = datasets[datasetsAdded.length];
  nextOne.backgroundColor = window.chartColors.blue;
  nextOne.borderColor = window.chartColors.blue;
  datasetsAdded.unshift(nextOne);
  window.myLine.update();
}

document.getElementById('randomizeData').addEventListener('click', function() {
  config.data.datasets.forEach(function(dataset) {
    dataset.data = dataset.data.map(function() {
      return randomScalingFactor();
    });
  });
  window.myLine.update();
});
var colorNames = Object.keys(window.chartColors);
document.getElementById('addDataset').addEventListener('click', function() {
  var colorName = colorNames[config.data.datasets.length % colorNames.length];
  var newColor = window.chartColors[colorName];
  var newDataset = {
    label: 'Dataset ' + config.data.datasets.length,
    backgroundColor: newColor,
    borderColor: newColor,
    data: [],
    fill: false
  };
  for (var index = 0; index < config.data.labels.length; ++index) {
    newDataset.data.push(randomScalingFactor());
  }
  config.data.datasets.push(newDataset);
  window.myLine.update();
});
document.getElementById('addData').addEventListener('click', function() {
  if (config.data.datasets.length > 0) {
    var month = MONTHS[config.data.labels.length % MONTHS.length];
    config.data.labels.push(month);
    config.data.datasets.forEach(function(dataset) {
      dataset.data.push(randomScalingFactor());
    });
    window.myLine.update();
  }
});
document.getElementById('removeDataset').addEventListener('click', function() {
  config.data.datasets.splice(0, 1);
  window.myLine.update();
});
document.getElementById('removeData').addEventListener('click', function() {
  config.data.labels.splice(-1, 1); // remove the label first
  config.data.datasets.forEach(function(dataset, datasetIndex) {
    dataset.data.pop();
  });
  window.myLine.update();
});
