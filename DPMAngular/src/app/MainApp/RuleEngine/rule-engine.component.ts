import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component } from '@angular/core'
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import * as xlsx from 'xlsx'
import * as moment from 'moment';
import { Chart } from 'chart.js'
import { from } from 'rxjs';
import { groupBy, mergeMap, toArray } from 'rxjs/internal/operators';
import * as Highcharts from 'highcharts/highcharts.src';
import highcharts3D from 'highcharts/highcharts-3d.src';
highcharts3D(Highcharts);


@Component({
    templateUrl: './rule-engine.component.html',
    animations: [trigger('fade', [
        state('void', style({ opacity: 0 })),
        transition(':enter,:leave', [
            animate(250)
        ])
    ])]
})
export class RuleEngineComponent {
    hcharts = Highcharts;
    public RuleEngineData: any = [];
    public columns: any = [];
    public nCluster: number = 0;
    public maxIterate: number = 0;
    public tolerance: number = 0;
    public randomState: number = 0;
    public file: File;
    public fileName: string = "";
    public Loading: boolean = false;
    public currentPage: number = 0;
    public endPage: number = 0;
    public totalRecordSize: number = 0;
    public itemPerPage: number = 0;
    public itemPerPageSelected: string = "";
    public perPages: any = [{ pageSize: 5 }, { pageSize: 10 }, { pageSize: 15 }];
    public totalRecord: any = [];
    public RuleEngineColumns: any = [];
    public modalChart: boolean = false;
    public ChartData: any;
    public histogramData: any = [];
    public labelData: any = [];
    public scatterData: any = [];
    public scatterClusterData: any = [];
    public scatterDatasets: any = [];
    public backgroundColor = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];

    public scaleLabelX: string = "";
    public scaleLabelY: string = "";
    public Series: any = [];
    public scatterTrainData: any = [{
        name: 'Data',
        colorByPoint: true,
        accessibility: {
            exposeAsGroupOnly: true
        },
        data: [
            [1, 6, 5], [8, 7, 9], [1, 3, 4], [4, 6, 8], [5, 7, 7], [6, 9, 6],
            [7, 0, 5], [2, 3, 3], [3, 9, 8], [3, 6, 5], [4, 9, 4], [2, 3, 3],
            [6, 9, 9], [0, 7, 0], [7, 7, 9], [7, 2, 9], [0, 6, 2], [4, 6, 7],
            [3, 7, 7], [0, 1, 7], [2, 8, 6], [2, 3, 7], [6, 4, 8], [3, 5, 9],
            [7, 9, 5], [3, 1, 7], [4, 4, 2], [3, 6, 2], [3, 1, 6], [6, 8, 5],
            [6, 6, 7], [4, 1, 1], [7, 2, 7], [7, 7, 0], [8, 8, 9], [9, 4, 1],
            [8, 3, 4], [9, 8, 9], [3, 5, 3], [0, 2, 4], [6, 0, 2], [2, 1, 3],
            [5, 8, 9], [2, 1, 1], [9, 7, 6], [3, 0, 2], [9, 9, 0], [3, 4, 8],
            [2, 6, 1], [8, 9, 2], [7, 6, 5], [6, 3, 1], [9, 3, 1], [8, 9, 3],
            [9, 1, 0], [3, 8, 7], [8, 0, 0], [4, 9, 7], [8, 6, 2], [4, 3, 0],
            [2, 3, 5], [9, 1, 4], [1, 1, 4], [6, 0, 2], [6, 1, 6], [3, 8, 8],
            [8, 8, 7], [5, 5, 0], [3, 9, 6], [5, 4, 3], [6, 8, 3], [0, 1, 5],
            [6, 7, 3], [8, 3, 2], [3, 8, 3], [2, 1, 6], [4, 6, 7], [8, 9, 9],
            [5, 4, 2], [6, 1, 3], [6, 9, 5], [4, 8, 2], [9, 7, 4], [5, 4, 2],
            [9, 6, 1], [2, 7, 3], [4, 5, 4], [6, 8, 1], [3, 4, 0], [2, 2, 6],
            [5, 1, 2], [9, 9, 7], [6, 9, 9], [8, 4, 3], [4, 1, 7], [6, 2, 5],
            [0, 4, 9], [3, 5, 9], [6, 9, 1], [1, 9, 2]]
    }];
    public scatterTrainChart: any;
    chart;
    updateFromInput = false;

    chartConstructor = "chart";
    chartCallback;
    public showScatter3D: boolean = false;
    public chartOptions: any;


    constructor(public title: Title,
        public http: HttpClient,
        public changeDetectorRef: ChangeDetectorRef) {
        this.title.setTitle("Admin | Dynamic Preventative Maintenance")
        this.itemPerPageSelected = this.perPages[1].pageSize;
        const self = this;
        this.chartCallback = chart => {
            self.chart = chart;
            self.addChartRotation();
        };


    }
    addChartRotation() {
        const chart = this.chart;
        const H = this.hcharts;

        function dragStart(eStart) {
            eStart = chart.pointer.normalize(eStart);

            var posX = eStart.chartX,
                posY = eStart.chartY,
                alpha = chart.options.chart.options3d.alpha,
                beta = chart.options.chart.options3d.beta,
                sensitivity = 5, // lower is more sensitive
                handlers = [];

            function drag(e) {
                // Get e.chartX and e.chartY
                e = chart.pointer.normalize(e);

                chart.update(
                    {
                        chart: {
                            options3d: {
                                alpha: alpha + (e.chartY - posY) / sensitivity,
                                beta: beta + (posX - e.chartX) / sensitivity
                            }
                        }
                    },
                    undefined,
                    undefined,
                    false
                );
            }

            function unbindAll() {
                handlers.forEach(function (unbind) {
                    if (unbind) {
                        unbind();
                    }
                });
                handlers.length = 0;
            }

            handlers.push(H.addEvent(document, "mousemove", drag));
            handlers.push(H.addEvent(document, "touchmove", drag));

            handlers.push(H.addEvent(document, "mouseup", unbindAll));
            handlers.push(H.addEvent(document, "touchend", unbindAll));
        }

        H.addEvent(chart.container, "mousedown", dragStart);
        H.addEvent(chart.container, "touchstart", dragStart);
    }

    fileTestChange(event) {
        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            this.file = fileList[0];
            this.fileName = this.file.name;
            // this.Submit();
        }
    }



    Submit() {

        if (this.file != undefined) {
            let formData = new FormData();
            formData.append('ruleEngine', this.file);
            this.Loading = true;
            this.RuleEngineColumns = [];
            this.totalRecord = [];
            this.Series = [];
            this.http.post('/RuleEngine', formData, { responseType: 'json' })
                .subscribe((res: any) => {
                    this.RuleEngineColumns = res[0];
                    this.totalRecord = res[1];
                    this.histogramData = [];
                    this.labelData = [];
                    let count = 0;
                    const source = from(res[1])
                        .pipe(
                            groupBy((a: any) => a.Classifications),
                            mergeMap(group => group.pipe(toArray())))
                        .subscribe(val => {
                            this.histogramData.push(val.length);
                            this.labelData.push(val[0].Classifications);
                            this.Series.push(Object.assign({ 'name': val[0].Classifications }, { 'data': [] }))
                            val.forEach(row => {
                                this.Series[count].data.push([
                                    row[this.RuleEngineColumns[0]],
                                    row[this.RuleEngineColumns[1]],
                                    row[this.RuleEngineColumns[2]]
                                ])

                            });
                            count++;
                        })

                    this.Loading = false;

                })
        } else {
            alert("Kindly select Rule Engine File.");
        }

    }
    AdminSelectRecords(event) {
        this.RuleEngineData = event;
        this.changeDetectorRef.detectChanges();
    }
    exportCSV() {
        if (this.RuleEngineData.length > 0) {
            var content = '';
            content +=
                '<tr>'
            this.RuleEngineColumns.forEach(header => {
                content += '<th style="font-weight:bold;">' + header + '</th>'
            });
            content += '</tr>';
            this.totalRecord.forEach(data => {
                content += '<tr>'
                this.RuleEngineColumns.forEach(col => {
                    content += '<td>' + data[col] + '</td>'
                });
                content += '</tr>'
            });

            var s = document.createElement("table");
            s.innerHTML = content;

            const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(s);

            const wb: xlsx.WorkBook = xlsx.utils.book_new();

            xlsx.utils.book_append_sheet(wb, ws, 'Train_Data');
            xlsx.writeFile(wb, 'Train_Data' + moment().format('DD-MMM-YYYY') + '.csv');

        } else {
            alert("you haven't selected the train file.")
        }
    }

    public lineChartLabels: any = ['28-06-2016 12:00', '30-06-2016 12:00', '14-07-2016 12:00', '16-07-2016 12:00', '31-07-2016 12:00', '01-08-2016 12:00', '02-08-2016 12:00', '09-08-2016 12:20', '09-08-2016 14:00', '10-08-2016 08:15', '10-08-2016 14:00', '21-08-2016 08:30', '21-08-2016 13:30']
    public lineChartData: any = [
        {
            label: 'Td1-Ts1',
            data: [162.31, 164.22, 147.15, 167.33, 173.55, 168.2, 180.24, 147.18, 159.43, 150.77, 157.11, 156.04, 156.46],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 1
        },
        {
            label: 'Pd1x100',
            data: [260, 270, 260, 270, 280, 290, 290, 230, 220, 230, 230, 230, 230],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderWidth: 1
        },
        {
            label: 'Pd2x25',
            data: [207.5, 212.5, 210, 205, 207.5, 207.5, 210, 195, 205, 212.5, 212.5, 207.5, 210],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderWidth: 1
        }


    ]
    public myChartData: any;
    //   public lineChartLabels: any = ['Td1-Ts1', 'Pd1x100', 'Pd2x25']
    showLineChart() {
        this.modalChart = true;
        if (this.myChartData != undefined) {
            this.myChartData.destroy();
        }
        this.changeDetectorRef.detectChanges();
        this.myChartData = new Chart('myChart', {
            type: 'line',
            data: {
                labels: this.lineChartLabels,
                datasets: this.lineChartData
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
    showBarChart() {
        this.modalChart = true;
        this.changeDetectorRef.detectChanges();
        if (this.myChartData != undefined) {
            this.myChartData.destroy();
        }
        this.myChartData = new Chart('myChart', {
            options: {
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Classifications",
                            fontColor: 'black',
                            fontSize: 30,
                        },
                        gridLines: {
                            drawBorder: false,
                        },
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Number of Test Dataset',
                            fontColor: 'black',
                            fontSize: 30,
                        },
                        gridLines: {
                            drawBorder: false,
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }]

                },
                legend: {
                    display: false
                }
            },
            type: 'bar',
            data: {
                labels: this.labelData,
                // datasets: this.histogramData
                datasets: [{
                    label: 'Test Dataset ',
                    data: this.histogramData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },


        });
    }
    showScatterChart() {

        this.showScatter3D = true;

        this.chartOptions = {
            chart: {
                renderTo: "container",
                margin: 100,
                type: "scatter3d",
                animation: false,
                options3d: {
                    enabled: true,
                    alpha: 10,
                    beta: 30,
                    depth: 250,
                    viewDistance: 5,
                    fitToPlot: false,
                    frame: {
                        bottom: {
                            size: 1,
                            color: "rgba(0,0,0,0.02)"
                        },
                        back: {
                            size: 1,
                            color: "rgba(0,0,0,0.04)"
                        },
                        side: {
                            size: 1,
                            color: "rgba(0,0,0,0.06)"
                        }
                    }
                }
            },
            title: {
                text: ""
            },
            subtitle: {
                text: ""
            },
            plotOptions: {
                scatter: {
                    width: 10,
                    height: 10,
                    depth: 10
                }
            },
            yAxis: {
                title: this.RuleEngineColumns[1]
            },
            xAxis: {
                title: this.RuleEngineColumns[0],
                gridLineWidth: 1
            },
            zAxis: {
                title: this.RuleEngineColumns[2],
                showFirstLabel: false
            },
            legend: {
                enabled: true
            },
            series: this.Series,
            credits: {
                enabled: false
            },
            //  [
            //     {
            //         name: 'Normal State',
            //         data: [
            //             [162.31, 260, 207.5], [147.15, 260, 210], [147.18, 230, 195], [159.43, 220, 205],
            //             [150.77, 230, 212.5], [157.11, 230, 212.5],
            //             [156.04, 230, 207.5], [156.46, 230, 210]]
            //     },
            //     {
            //         name: 'Watch',
            //         data: [
            //             [164.22, 270, 212.5], [169, 230, 209], [165.7, 280, 212]]
            //     },
            //     {
            //         name: 'Abnormal State',
            //         data: [
            //             [167.33, 270, 205], [173.55, 280, 207.5], [168.2, 290, 207.5],
            //             [180.24, 290, 210], [165.4, 280.4, 209]]
            //     }
            // ]
        };
        // this.myChartData = new Chart('myChart', {
        //     type: "scatter",
        //     options: {
        //         scales: {
        //             xAxes: [{
        //                 scaleLabel: {
        //                     display: true,
        //                     labelString: this.scaleLabelX
        //                 },
        //                 gridLines: {
        //                     drawBorder: false,
        //                 },
        //             }],
        //             yAxes: [{
        //                 scaleLabel: {
        //                     display: true,
        //                     labelString: this.scaleLabelY
        //                 },
        //                 gridLines: {
        //                     drawBorder: false,
        //                 },
        //             }]

        //         },
        //         legend: {
        //             display: false
        //         }
        //     },
        //     data: {
        //         labels: this.lineChartLabels,
        //         datasets: this.scatterDatasets
        //     }
        // });
    }
    showChart() {

        this.modalChart = true;
        this.changeDetectorRef.detectChanges();
        var lineChart = new Chart('myChart', {
            type: 'line',
            data: {
                labels: this.lineChartLabels,
                datasets: this.lineChartData
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
                }
            }
        });
        // let myChart = new Chart('myChart', {
        //     type: "scatter",
        //     options: {
        //         scales: {
        //             xAxes: [{
        //                 scaleLabel: {
        //                     display: true,
        //                     labelString: this.scaleLabelX
        //                 },
        //                 gridLines: {
        //                     drawBorder: false,
        //                 },
        //             }],
        //             yAxes: [{
        //                 scaleLabel: {
        //                     display: true,
        //                     labelString: this.scaleLabelY
        //                 },
        //                 gridLines: {
        //                     drawBorder: false,
        //                 },
        //             }]

        //         },
        //         legend: {
        //             display: false
        //         }
        //     },
        //     data: {
        //         labels: [],
        //         datasets: this.scatterDatasets
        //     }
        //     // type: 'bar',
        //     // data: {
        //     //     labels: this.labelData,
        //     //     datasets: [{
        //     //         label: 'Train Data ',
        //     //         data: this.histogramData,
        //     //         backgroundColor: [
        //     //             'rgba(255, 99, 132, 0.2)',
        //     //             'rgba(54, 162, 235, 0.2)',
        //     //             'rgba(255, 206, 86, 0.2)',
        //     //             'rgba(75, 192, 192, 0.2)',
        //     //             'rgba(153, 102, 255, 0.2)',
        //     //             'rgba(255, 159, 64, 0.2)',
        //     //             'rgba(255, 99, 132, 0.2)',
        //     //             'rgba(54, 162, 235, 0.2)',
        //     //             'rgba(255, 206, 86, 0.2)',
        //     //             'rgba(75, 192, 192, 0.2)',
        //     //             'rgba(153, 102, 255, 0.2)',
        //     //             'rgba(255, 159, 64, 0.2)'
        //     //         ],
        //     //         borderColor: [
        //     //             'rgba(255,99,132,1)',
        //     //             'rgba(54, 162, 235, 1)',
        //     //             'rgba(255, 206, 86, 1)',
        //     //             'rgba(75, 192, 192, 1)',
        //     //             'rgba(153, 102, 255, 1)',
        //     //             'rgba(255, 159, 64, 1)',
        //     //             'rgba(255,99,132,1)',
        //     //             'rgba(54, 162, 235, 1)',
        //     //             'rgba(255, 206, 86, 1)',
        //     //             'rgba(75, 192, 192, 1)',
        //     //             'rgba(153, 102, 255, 1)',
        //     //             'rgba(255, 159, 64, 1)'
        //     //         ],
        //     //         borderWidth: 1
        //     //     }]
        //     // },


        // });
    }

}