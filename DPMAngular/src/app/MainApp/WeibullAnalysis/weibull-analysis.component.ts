
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from "@angular/core";
import { Title } from '@angular/platform-browser';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Chart } from 'chart.js'

@Component({
    templateUrl: './weibull-analysis.component.html',
    animations: [trigger('fade', [
        state('void', style({ opacity: 0 })),
        transition(':enter,:leave', [
            animate(250)
        ])
    ])]
})
export class WeibullAnalysis {
    public fileName: string = "";
    public Loading: boolean = false;
    public daysFile: any;
    public MeanTimeFailureColumn: any = [];
    public MeanTimeFailureData: any = [];
    public totalRecordMTF: any = [];
    public WeibullColumn: any = [];
    public WeibullData: any = [];
    public totalRecordWeibull: any = [];
    public QuickCalculation: any = [];
    public showLineCharts: boolean = false;
    public Chart1: any;
    public LineChart1: any = [];
    public Chart2: any;
    public LineChart2: any = [];
    public Chart3: any;
    public LineChart3: any = [];
    public Chart4: any;
    public LineChart4: any = [];
    public lineChartLabels: any = [1,
        5,
        10,
        15,
        25,
        50,
        75,
        100,
        125,
        150,
        175,
        200,
        225,
        250,
        275,
        300,
        325,
        350,
        375,
        400,
        425,
        450,
        475,
        500,
        525,
        550,
        575,
        600,
        625,
        650,
        675,
        700,
        725,
        750,
        775,
        800,
        825,
        850,
        875,
        900,
        925,
        950,
        975,
        1000,
        1800]

    constructor(public title: Title, public http: HttpClient,
        public changeDetectorRef: ChangeDetectorRef) {
        this.title.setTitle("Weibull Analysis | Dynamic Preventative Maintenance");
    }

    exportCSV(type) {
        if (type == 'days') {
            if (this.totalRecordMTF.length > 0) {
                var content = '';
                content +=
                    '<tr>'
                this.MeanTimeFailureColumn.forEach(header => {
                    content += '<th>' + header + '</th>'
                });
                content += '</tr>';
                this.totalRecordMTF.forEach(data => {
                    content += '<tr>'
                    this.MeanTimeFailureColumn.forEach(col => {
                        content += '<td>' + data[col] + '</td>'
                    });
                    content += '</tr>'
                });

                var s = document.createElement("table");
                s.innerHTML = content;

                const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(s);
                const wb: xlsx.WorkBook = xlsx.utils.book_new();

                xlsx.utils.book_append_sheet(wb, ws, 'Mean_time_failure');
                xlsx.writeFile(wb, 'Mean_time_failure' + moment().format('DD-MMM-YYYY') + '.csv');

            } else {
                alert("you haven't selected the test file.")
            }
        } else {
            if (this.totalRecordWeibull.length > 0) {
                var content = '';
                content +=
                    '<tr>'
                this.WeibullColumn.forEach(header => {
                    content += '<th>' + header + '</th>'
                });
                content += '</tr>';
                this.totalRecordWeibull.forEach(data => {
                    content += '<tr>'
                    this.WeibullColumn.forEach(col => {
                        content += '<td>' + data[col] + '</td>'
                    });
                    content += '</tr>'
                });

                var s = document.createElement("table");
                s.innerHTML = content;

                const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(s);
                const wb: xlsx.WorkBook = xlsx.utils.book_new();

                xlsx.utils.book_append_sheet(wb, ws, 'Weibull_Analysis');
                xlsx.writeFile(wb, 'Weibull_Analysis' + moment().format('DD-MMM-YYYY') + '.csv');

            } else {
                alert("you haven't selected the test file.")
            }
        }
    }

    fileTestChange(event) {
        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            this.daysFile = fileList[0];
            this.fileName = this.daysFile.name;
        }
    }
    Submit() {
        if (this.daysFile != undefined) {
            let formData = new FormData();
            console.log(JSON.stringify(this.daysFile));
            formData.append('daysFile', this.daysFile);
            this.Loading = true;
            this.LineChart1 = [];
            this.LineChart2 = [];
            this.LineChart3 = [];
            this.LineChart4 = [];

            this.http.post('/WeibullAnalysis', formData, { responseType: 'json' })
                .subscribe((res: any) => {
                    this.MeanTimeFailureColumn = res[0];
                    this.totalRecordMTF = res[1];
                    this.WeibullColumn = res[2];
                    this.totalRecordWeibull = res[3];
                    var objLine1LN = new Object();
                    objLine1LN["label"] = "LN(Days)";
                    objLine1LN["data"] = [];
                    objLine1LN["backgroundColor"] = '#33FFFA';
                    objLine1LN["fill"] = false;
                    var objLine1LNLN = new Object();
                    objLine1LNLN["label"] = "LN(LN(1/R(T)))";
                    objLine1LNLN["data"] = [];
                    objLine1LNLN["backgroundColor"] = '#33FFFA';
                    objLine1LNLN["fill"] = false;
                    var objLine2Hazard = new Object();
                   objLine2Hazard["label"] = "HazardRate";
                   objLine2Hazard["data"] = [];
                   objLine2Hazard["backgroundColor"] = '#33FFFA';
                   objLine2Hazard["fill"] = false;
                   var objLine3CDF = new Object();
                   objLine3CDF["label"] = "CDF";
                   objLine3CDF["data"] = [];
                   objLine3CDF["backgroundColor"] = '#714F06';
                   objLine3CDF["fill"] = false;
                   var objLine3Reliability = new Object();
                   objLine3Reliability["label"] = "Reliability";
                   objLine3Reliability["data"] = [];
                   objLine3Reliability["backgroundColor"] = '#33FFFA';
                   objLine3Reliability["fill"] = false;
                   var objLine4PDF = new Object();
                   objLine4PDF["label"] = "PDF";
                   objLine4PDF["data"] = [];
                   objLine4PDF["backgroundColor"] = '#33FFFA';
                   objLine4PDF["fill"] = false;
                    res[3].forEach((row, index) => {
                        objLine1LN["data"].push(row["LN(Days)"]);
                        objLine1LNLN["data"].push(row["LN(LN(1/R(T)))"]);
                        objLine2Hazard["data"].push(row["HazardRate"]);
                        objLine3CDF["data"].push(row["CDF"]);
                        objLine3Reliability["data"].push(row["Reliability"]);
                        objLine4PDF["data"].push(row["PDF"]);
                    });
                    this.LineChart1.push(objLine1LN);
                    this.LineChart1.push(objLine1LNLN);
                    this.LineChart2.push(objLine2Hazard);
                    this.LineChart3.push(objLine3CDF);
                    this.LineChart3.push(objLine3Reliability);
                    this.LineChart4.push(objLine4PDF);
                    this.QuickCalculation = res[4];
                    this.Loading = false;
                }, err => {
                    this.Loading = false;
                })
        }
    }

    MTFSelectedRecords(event) {
        this.MeanTimeFailureData = event;
        this.changeDetectorRef.detectChanges();
    }
    WeibullSelectedRecords(event) {
        this.WeibullData = event;
        this.changeDetectorRef.detectChanges();
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
                labels: this.lineChartLabels,
                datasets: this.LineChart1,              
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
                labels: this.lineChartLabels,
                datasets: this.LineChart2,              
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
                labels: this.lineChartLabels,
                datasets: this.LineChart3,              
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
                labels: this.lineChartLabels,
                datasets: this.LineChart4,              
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