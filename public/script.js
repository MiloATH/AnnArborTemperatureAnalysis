var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var datasets = [];
var datasetsAdded = [];
var averages = [];
var monthlyAverages = [];
var interval;
var intervalTime = 450;

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

    console.log(monthlyAverages);
    //Fill line data
    for(var i = 0; i < data.length; i+=MONTHS.length){
      var line = {};
      line.label = data[i][2].substr(0, 4);
      line.data = [];
      for(var j = i; j < min(i + MONTHS.length, data.length); ++j){
        if(+data[j][2].substr(5) == (j-i+1)){
          line.data.push(+data[j][4] - monthlyAverages[j-i+1]);
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
    legend: {
      position:'bottom'
    },
    title:{
      display:true,
      text:'Ann Arbor Temperature'
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
          labelString: 'Each month\'s average temperature minus each month\'s average temperature over the entire century (in °F)',
          fontSize: 9
        }
      }]
    }
  }
};
var render = function() {
  var ctx = document.getElementById("canvas").getContext("2d");
  datasetsAdded.push(datasets[datasetsAdded.length]);
  window.myLine = new Chart(ctx, config);
  interval = setInterval(nextStep, intervalTime)
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
    datasetsAdded[i].borderWidth = 1;
    if(average(datasetsAdded[i].data) > max){
      max = average(datasetsAdded[i].data);
      maxIndex = i;
    }
  }
  datasetsAdded[maxIndex].backgroundColor = 'rgb(255,0,0)';//window.chartColors.red;
  datasetsAdded[maxIndex].borderColor = 'rgb(255,0,0)';//window.chartColors.red;
  datasetsAdded[maxIndex].borderWidth = 7;
  document.getElementById("max-temp").innerHTML = max.toFixed(3);
  var nextOne = datasets[datasetsAdded.length];
  nextOne.backgroundColor = window.chartColors.blue;
  nextOne.borderColor = window.chartColors.blue;
  datasetsAdded.unshift(nextOne);
  window.myLine.update();
}

function pause(){
  clearInterval(interval);
}

function play(){
  //nextStep();
  clearInterval(interval);
  interval = setInterval(nextStep, intervalTime);
}

function reset(){
  clearInterval(interval);
  var ctx = document.getElementById("canvas").getContext("2d");
  datasetsAdded.length = 0;
  datasetsAdded.push(datasets[datasetsAdded.length]);
  window.myLine.update();
  interval = setInterval(nextStep, intervalTime)
}
