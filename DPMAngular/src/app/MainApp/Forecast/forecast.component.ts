import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from "@angular/core";
import { Title } from '@angular/platform-browser';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Chart } from 'chart.js'

@Component({
    templateUrl: './forecast.component.html',
    animations: [trigger('fade', [
        state('void', style({ opacity: 0 })),
        transition(':enter,:leave', [
            animate(250)
        ])
    ])]
})

export class ForecastComponent {
    public fileName: string = "";
    public Loading: boolean = false;
    public totalRecordCTF: any = [];
    public CTFColumns: any = [];
    public CTFData: any = [];
    public totalRecordForecast: any = [];
    public ForecastColumns: any = [];
    public ForecastData: any = [];
    public cumYeartolFile: any;
    public QuickCalculation: any = [];
    public showLineCharts: boolean = false;
    public Chart1: any;
    public Chart2: any;
    public Chart3: any;
    public Chart4: any;
    public LineChartsData: any = [];
    constructor(public title: Title, public http: HttpClient,
        public changeDetectorRef: ChangeDetectorRef) {
        this.title.setTitle("Weibull Analysis | Dynamic Preventative Maintenance");
    }
    CTFSelectedRecords(event) {
        this.CTFData = event;
        this.changeDetectorRef.detectChanges();
    }
    ForecastSelectedRecords(event) {
        this.ForecastData = event;
        this.changeDetectorRef.detectChanges();
    }
    exportCSV(type) {
        if (type == 'CTF') {
            if (this.totalRecordCTF.length > 0) {
                var content = '';
                content +=
                    '<tr>'
                this.CTFColumns.forEach(header => {
                    content += '<th>' + header + '</th>'
                });
                content += '</tr>';
                this.totalRecordCTF.forEach(data => {
                    content += '<tr>'
                    this.CTFColumns.forEach(col => {
                        content += '<td>' + data[col] + '</td>'
                    });
                    content += '</tr>'
                });

                var s = document.createElement("table");
                s.innerHTML = content;

                const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(s);
                const wb: xlsx.WorkBook = xlsx.utils.book_new();

                xlsx.utils.book_append_sheet(wb, ws, 'Mean_time_failure');
                xlsx.writeFile(wb, 'Cummulative_Time_Failure' + moment().format('DD-MMM-YYYY') + '.csv');

            } else {
                alert("you haven't selected the Cummulative Year Total file.")
            }
        } else {
            if (this.totalRecordForecast.length > 0) {
                var content = '';
                content +=
                    '<tr>'
                this.ForecastColumns.forEach(header => {
                    content += '<th>' + header + '</th>'
                });
                content += '</tr>';
                this.totalRecordForecast.forEach(data => {
                    content += '<tr>'
                    this.ForecastColumns.forEach(col => {
                        content += '<td>' + data[col] + '</td>'
                    });
                    content += '</tr>'
                });

                var s = document.createElement("table");
                s.innerHTML = content;

                const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(s);
                const wb: xlsx.WorkBook = xlsx.utils.book_new();

                xlsx.utils.book_append_sheet(wb, ws, 'Weibull_Analysis');
                xlsx.writeFile(wb, 'Forecast' + moment().format('DD-MMM-YYYY') + '.csv');

            } else {
                alert("you haven't selected the Cummulative Year Total file.")
            }
        }
    }

    fileTestChange(event) {
        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            this.cumYeartolFile = fileList[0];
            this.fileName = this.cumYeartolFile.name;
        }
    }
    Submit() {
        if (this.cumYeartolFile != undefined) {
            let formData = new FormData();
            console.log(JSON.stringify(this.cumYeartolFile));
            formData.append('cumYeartol', this.cumYeartolFile);
            this.http.post('/Forecast', formData, { responseType: 'json' })
                .subscribe((res: any) => {
                    console.log(res);
                    this.CTFColumns = res[0];
                    this.totalRecordCTF = res[1];
                    this.ForecastColumns = res[2];
                    this.totalRecordForecast = res[3];
                    this.QuickCalculation = res[4];
                    this.LineChartsData = res[5]
                    this.Loading = false;
                }, err => {
                    this.Loading = false;
                })
        } else {
            alert("you haven't selected the Cummulative Year Total file.")
        }
    }


    ShowCharts() {
        this.showLineCharts = true;
        if (this.Chart1 != undefined) {
            this.Chart1.destroy();
            this.Chart2.destroy();
            this.Chart3.destroy();
            this.Chart4.destroy();
        }
        this.changeDetectorRef.detectChanges();

        this.Chart1 = new Chart('chart1', {
            type: 'line',
            data: {
                labels: this.LineChartsData[0].AllLineChartX,
                datasets: [{
                    label:'All Cummulative Time Period',
                    backgroundColor:'#33FFFA', 
                    data: this.LineChartsData[0].AllLineChartY,                                       
                    fill:false
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 80,
                        fontColor: 'black',
                        usePointStyle: true
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            fontColor: 'black',
                            fontSize: 30,
                        },
                        gridLines: {
                            display: false
                        }
                    }]
                }
            }
        });

        this.Chart2 = new Chart('chart2', {
            type: 'line',
            data: {
                labels: this.LineChartsData[1].FirstHalfLineChartX,
                datasets: [{
                    label:'First Half Cummulative Time Period',
                    backgroundColor:'#33FFFA',
                    data: this.LineChartsData[1].FirstHalfLineChartY,                    
                    fill:false
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 80,
                        fontColor: 'black',
                        usePointStyle: true
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            fontColor: 'black',
                            fontSize: 30,
                        },
                        gridLines: {
                            display: false
                        }
                    }]
                }
            }
        });
        this.Chart3 = new Chart('chart3', {
            type: 'line',
            data: {
                labels: this.LineChartsData[2].SecondHalfLineChartX,
                datasets: [{
                    label:'Second Half Cummulative Time Period',
                    backgroundColor:'#33FFFA',
                    data: this.LineChartsData[2].SecondHalfLineChartY,                    
                    fill:false
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 80,
                        fontColor: 'black',
                        usePointStyle: true
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            fontColor: 'black',
                            fontSize: 30,
                        },
                        gridLines: {
                            display: false
                        }
                    }]
                }
            }
        });

        this.Chart4 = new Chart('chart4', {
            type: 'line',
            data: {
                labels: this.LineChartsData[3].ThirdHalfLineChartX,
                datasets: [{
                    label:'Third Half Cummulative Time Period',
                    backgroundColor:'#33FFFA',
                    data: this.LineChartsData[3].ThirdHalfLineChartY,                    
                    fill:false
                }]
            },
            options: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 80,
                        fontColor: 'black',
                        usePointStyle: true
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            fontColor: 'black',
                            fontSize: 30,
                        },
                        gridLines: {
                            display: false
                        }
                    }]
                }
            }
        });
    }
}