const labels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
];

const data = {
  labels: labels,
  datasets: [{
    label: 'My First dataset',
    backgroundColor: 'rgb(255, 99, 132)',
    borderColor: 'rgb(255, 99, 132)',
    data: [0, 10, 5, 2, 20, 30, 45],
  }]
};

const config = {
  type: 'line',
  data: data,
  options: {}
};


//var chartsElement = document.getElementsByName('chart-default');
var chartsElement = document.getElementsByClassName('chart-default');
var charts = new Array();
for (let i = 0; i < chartsElement.length; i++) {
  new Chart(
    chartsElement[i],
    config
  );
}

window.addEventListener('afterprint', () => {
  for (let elem in charts) {
    elem.resize();
  }
});