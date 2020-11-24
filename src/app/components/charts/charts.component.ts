import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
})
export class ChartsComponent implements OnInit {
  @Input() data;
  @ViewChild('barChart', {static: true}) barChart;
  @Input() chartSubject: Subject<boolean> = new Subject<boolean>();
  bars: any;
  colorArray: any;

  constructor() {
    Chart.plugins.unregister(ChartDataLabels);
  }

  ngOnInit() {
    this.createBarChart();
    this.chartSubject.subscribe(response => {
      if (response) {
        this.createBarChart();
      }
    });
  }

  createBarChart() {
    this.bars = new Chart(this.barChart.nativeElement, {
      plugins: [ChartDataLabels],
      type: 'line',
      data: {
        labels: this.data.xAxis,
        datasets: [{
          data: this.data.data,
          backgroundColor: '#3880ff', // array should have same number of elements as number of dataset
          borderColor: '#3880ff', // array should have same number of elements as number of dataset
          borderWidth: 2,
          fill: false
        }]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            ticks: {
              display: false,
              //beginAtZero: true
              //suggestedMin: Math.min.apply(Math, this.data.data) - 5,
              max: Math.max.apply(Math, this.data.data) + 5
            }
          }],
          xAxes: [{
            ticks: {
              autoSkip: false,
              maxRotation: 90,
              minRotation: 45
            }
          }]
        },
        plugins: {
          datalabels: {
            color: '#000000',
            anchor: 'start',
            align: 'start',
            labels: {
              title: {
                font: {
                  weight: 'bold'
                }
              }
            }
          }
        }
      }
    });
  }

}
