import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Chart} from "angular-highcharts";

@Component({
  selector: 'app-highcharts',
  templateUrl: './highcharts.component.html',
  styleUrls: ['./highcharts.component.scss'],
})
export class HighchartsComponent implements OnChanges {

  colors = ['#e8595b', '#43c5ae', '#e87d59', '#e859a3', '#435bc5', '#4ec543', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'];
  chart: any;
  options: any = {};
  @Input() type: any = '';
  @Input() data: any = [];
  @Input() title: any = [];
  @Input() xAxis: any = [];

  constructor() {
  }

  ngOnChanges()
  {

    if(this.type && this.data)
    {
      switch(this.type)
      {
        case 'semiCircle':
          this.createSemiCircleChart();
          break;

        case 'bar':
          this.createBarChart();
          break;

        case 'column':
          this.createColumnChart();
          break;

        case 'spline':
          this.createColumnSpline();
          break;
      }
    }
  }

  createSemiCircleChart()
  {
    this.options = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false
      },
      yAxis:{
        offset:100
      },
      colors: this.colors,
      credits: {
        enabled: false
      },
      title: {
        text: '',
        align: 'center',
        verticalAlign: 'middle',
        y: 0,
        style: {
          display: 'none'
        }
      },
      tooltip: {
        pointFormat: '${point.y:,.2f}'
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          },
          showInLegend: false,
          startAngle: 0,
          endAngle: 360,
          center: ['50%', '50%'],
          size: '80%'
        },
        series: {
          color: '#FF0000'
        }
      },
      series: [{
        type: 'pie',
        name: 'Pagos',
        innerSize: '50%',
        data: this.data
      }]
    };

    this.chart = new Chart(this.options);
  }

  createBarChart()
  {
    this.options = {
      chart: {
        type: 'bar'
      },
      credits: {
        enabled: false
      },
      title: {
        text: this.title
      },
      xAxis: {
        categories: ['Africa', 'America', 'Asia', 'Europe', 'Oceania'],
        title: {
          text: null
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Population (millions)',
          align: 'high'
        },
        labels: {
          overflow: 'justify'
        }
      },
      tooltip: {
        valueSuffix: ' millions'
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true
          }
        }
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -40,
        y: 80,
        floating: true,
        borderWidth: 1,
        shadow: true
      },
      //series: this.data
      series: [{
        name: 'Year 1800',
        data: [107, 31, 635, 203, 2]
      }, {
        name: 'Year 1900',
        data: [133, 156, 947, 408, 6]
      }, {
        name: 'Year 2000',
        data: [814, 841, 3714, 727, 31]
      }, {
        name: 'Year 2016',
        data: [1216, 1001, 4436, 738, 40]
      }]
    };

  }

  createColumnChart() {
    this.options = {
      chart: {
        type: 'column'
      },
      plotOptions: {
        column: {
          colorByPoint: true
        }
      },
      colors: this.colors,
      credits: {
        enabled: false
      },
      title: {
        text: '',
        style: {
          display: 'none'
        }
      },
      xAxis: {
        crosshair: true,
        type: 'category',
        labels: {
          rotation: -45,
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Ventas'
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        pointFormat: '<b>{point.y}</b>'
      },

      series: [{
        name: 'Ventas',
        data: this.data,
        dataLabels: {
          enabled: true,
          rotation: -90,
          color: '#FFFFFF',
          align: 'right',
          format: '{point.y}', // one decimal
          y: 10, // 10 pixels down from the top
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      }]
    };

    this.chart = new Chart(this.options);

  }

  createColumnSpline() {
    this.options = {
      chart: {
        type: 'spline'
      },
      plotOptions: {
        column: {
          colorByPoint: true
        }
      },
      colors: this.colors,
      credits: {
        enabled: false
      },
      title: {
        text: '',
        style: {
          display: 'none'
        }
      },
      xAxis: {
        crosshair: true,
        categories: this.xAxis,
        labels: {
          rotation: -45,
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: this.title
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        pointFormat: '<b>{point.y}</b>'
      },
      series: [{
        name: this.title,
        data: this.data,
        dataLabels: {
          enabled: true,
          rotation: 45,
          color: '#FFFFFF',
          align: 'right',
          format: '{point.y}', // one decimal
          y: 40, // 10 pixels down from the top
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      }],
      responsive: {
        rules: [{
          condition: {
            maxWidth: 300
          },
          chartOptions: {
            legend: {
              align: 'center',
              verticalAlign: 'bottom',
              layout: 'horizontal'
            },
            yAxis: {
              labels: {
                align: 'left',
                x: 0,
                y: -5
              },
              title: {
                text: null
              }
            },
            subtitle: {
              text: null
            },
            credits: {
              enabled: false
            }
          }
        }]
      }
    };

    this.chart = new Chart(this.options);
    this.chart.size = 300;

  }

}
