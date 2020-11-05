import { Component, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import * as xlsx from 'xlsx'
import * as moment from 'moment';
import { Chart } from 'chart.js'
import { trigger, state, transition, animate, style } from '@angular/animations';
import * as Highcharts from 'highcharts/highcharts.src';
import highcharts3D from 'highcharts/highcharts-3d.src';
import { from } from 'rxjs';
import { groupBy, mergeMap, toArray } from 'rxjs/internal/operators';
highcharts3D(Highcharts);

@Component({
    templateUrl: './admin.component.html',
    animations: [trigger('fade', [
        state('void', style({ opacity: 0 })),
        transition(':enter,:leave', [
            animate(250)
        ])
    ])]
})
export class AdminComponent {
    hcharts = Highcharts;
    public centroids: any = [];
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
    public CentroidColumns: any = [];
    public modalChart: boolean = false;
    // @ViewChild('histogram', { static: true }) public chartRef: ElementRef<any>;
    @ViewChild('mychart') mychart;
    canvas: any;
    ctx: any;
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
    public scatterTrainData: any = [];
    public scatterTrainChart: any = [{
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
    chart;
    updateFromInput = false;

    chartConstructor = "chart";
    chartCallback;
    public showScatter3D: boolean = false;
    public chartOptions: any;
    public Series: any = [];
    constructor(public title: Title,
        public http: HttpClient,
        public changeDetectorRef: ChangeDetectorRef,
        public elementRef: ElementRef) {
        this.title.setTitle("Admin | Dynamic Preventative Maintenance")
        this.itemPerPageSelected = this.perPages[0].pageSize;
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


    fileChange(event) {
        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            this.file = fileList[0];
            this.fileName = this.file.name;
            // this.Submit();
        }
    }

    Submit() {
        if (this.file != undefined && this.nCluster != 0 && this.maxIterate != 0) {
            let formData = new FormData();
            formData.append('uploadFile', this.file);
            console.log(this.file);
            let obj = new Object();
            obj['lastModified'] = this.file.lastModified;
            obj['name'] = this.file.name;
            obj['size'] = this.file.size;
            obj['type'] = this.file.type;

            localStorage.setItem("train_file", JSON.stringify(obj));
            localStorage.setItem("nCluster", this.nCluster.toString());
            localStorage.setItem("maxIterate", this.maxIterate.toString());
            localStorage.setItem("tolerance", this.tolerance.toString());
            localStorage.setItem("randomState", this.randomState.toString());
            this.Loading = true;
            this.CentroidColumns = [];
            this.totalRecord = [];
            this.scatterDatasets = [];
            this.Series = [];
            this.http.post('/Centroids?n_clusters=' + this.nCluster + '&iterate=' + this.maxIterate + '&tolerance=' + this.tolerance + '&random_state=' + this.randomState, formData, { responseType: 'json' })
                .subscribe((res: any) => {
                    console.log(res);
                    this.CentroidColumns = res[0];
                    this.scaleLabelX = this.CentroidColumns[0];
                    this.scaleLabelY = this.CentroidColumns[1];
                    this.histogramData = [];
                    this.labelData = [];
                    this.scatterClusterData = res[4];
                    let objScatter = new Object();
                    objScatter['pointBackgroundColor'] = 'black';
                    objScatter['pointBorderColor'] = 'black';
                    objScatter['pointRadius'] = '10';
                    objScatter['data'] = this.scatterClusterData;
                    objScatter['pointStyle'] = 'star';
                    objScatter['borderWidth'] = 3;
                    this.scatterDatasets.push(objScatter);
                    let obj1 = new Object();
                    obj1['name'] = 'Clusters';
                    obj1['data'] = this.scatterClusterData;
                    this.scatterTrainData.push(obj1)
                    res[1].forEach((i, index) => {
                        let data = [];
                        res[3].forEach(j => {
                            if (j.label == i.label) {
                                data.push(j);
                            }
                        });
                        let objScatter = new Object();
                        objScatter['pointBackgroundColor'] = this.backgroundColor[index];
                        objScatter['pointBorderColor'] = this.backgroundColor[index];
                        objScatter['pointRadius'] = '10';
                        objScatter['data'] = data;
                        this.scatterDatasets.push(objScatter);
                        let obj1 = new Object();
                        obj1['name'] = i.name;
                        obj1['data'] = data;
                        this.scatterTrainData.push(obj1)
                    });
                    res[2].forEach(a => {
                        this.histogramData.push(a.value)
                        this.labelData.push(a.name)

                    });
                    this.totalRecord = res[1];
                    this.scatterData = res[3];
                    let count = 0;      
                    this.Series.push(Object.assign({ 'name': 'Centroid' }, { 'data': [] },{'pointStyle':'star'},{'borderWidth':3}))     
                    res[1].forEach(row => {
                        this.Series[count].data.push([
                            row[this.CentroidColumns[0]],
                            row[this.CentroidColumns[1]],
                            row[this.CentroidColumns[2]]
                        ])
                    });    
                    count = 1     
                    const source = from(res[5])
                        .pipe(
                            groupBy((a: any) => a.Classifications),
                            mergeMap(group => group.pipe(toArray())))
                        .subscribe(val => {
                            this.Series.push(Object.assign({ 'name': val[0].Classifications }, { 'data': [] },{'borderWidth':3}))
                            val.forEach(row => {
                                this.Series[count].data.push([
                                    row[this.CentroidColumns[0]],
                                    row[this.CentroidColumns[1]],
                                    row[this.CentroidColumns[2]]
                                ])

                            });
                            count++;
                        })


                    this.Loading = false;
                }, err => {
                    this.Loading = false;
                    console.log(err.error.text);
                    // alert(err.error.text);
                })
        } else {
            alert("Kindly Select Cluster, Iterate and File");
        }
    }
    AdminSelectRecords(event) {
        this.centroids = event;
        this.changeDetectorRef.detectChanges();
    }
    exportCSV() {
        if (this.centroids.length > 0) {
            var content = '';
            content +=
                '<tr>'
            this.CentroidColumns.forEach(header => {
                content += '<th style="font-weight:bold;">' + header + '</th>'
            });
            content += '</tr>';
            this.totalRecord.forEach(data => {
                content += '<tr>'
                this.CentroidColumns.forEach(col => {
                    content += '<td>' + data[col] + '</td>'
                });
                content += '</tr>'
            });

            var s = document.createElement("table");
            s.innerHTML = content;

            const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(s);
            // ws.eachCell((cell, number) => {
            //     cell.fill = {
            //       type: 'pattern',
            //       pattern: 'solid',
            //       fgColor: { argb: 'FFFFFF00' },
            //       bgColor: { argb: 'FF0000FF' }
            //     }
            //     cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
            //   })
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
                            labelString: "Cluster Counts",
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
                            labelString: 'Number of Dataset',
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
                    label: 'Train Data ',
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
        if (this.CentroidColumns.length == 4) {
            this.modalChart = true;
            if (this.myChartData != undefined) {
                this.myChartData.destroy();
            }
            this.changeDetectorRef.detectChanges();
            this.myChartData = new Chart('myChart', {
                type: "scatter",
                options: {
                    scales: {
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: this.scaleLabelX
                            },
                            gridLines: {
                                drawBorder: false,
                            },
                        }],
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: this.scaleLabelY
                            },
                            gridLines: {
                                drawBorder: false,
                            },
                        }]

                    },
                    legend: {
                        display: false
                    }
                },
                data: {
                    labels: this.lineChartLabels,
                    datasets: this.scatterDatasets
                }
            });
        } else {
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
                    title: this.CentroidColumns[1]
                },
                xAxis: {
                    title: this.CentroidColumns[0],
                    gridLineWidth: 1
                },
                zAxis: {
                    title: this.CentroidColumns[2],
                    showFirstLabel: false
                },
                legend: {
                    enabled: true
                },
                series: this.Series,
                credits: {
                    enabled: false
                }

            };
        }
    }
    showChart() {

        this.modalChart = true;
        this.changeDetectorRef.detectChanges();
        this.canvas = this.mychart.nativeElement;
        this.ctx = this.canvas.getContext('3d');
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