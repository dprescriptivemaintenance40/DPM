import { Component, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import * as xlsx from 'xlsx'
import * as moment from 'moment';
import { Chart } from 'chart.js'
import { trigger, state, transition, animate, style } from '@angular/animations';
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
    constructor(public title: Title,
        public http: HttpClient,
        public changeDetectorRef: ChangeDetectorRef,
        public elementRef: ElementRef) {
        this.title.setTitle("Admin | Dynamic Preventative Maintenance")
        this.itemPerPageSelected = this.perPages[0].pageSize;
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
                    res[2].forEach((i, index) => {
                        let data = [];
                        res[3].forEach(j => {
                            if (j.label == i.name) {
                                data.push(j);
                            }
                        });
                        let objScatter = new Object();
                        objScatter['pointBackgroundColor'] = this.backgroundColor[index];
                        objScatter['pointBorderColor'] = this.backgroundColor[index];
                        objScatter['pointRadius'] = '10';
                        objScatter['data'] = data;
                        this.scatterDatasets.push(objScatter);
                    });
                    res[2].forEach(a => {
                        this.histogramData.push(a.value)
                        this.labelData.push(a.name)

                    });
                    this.totalRecord = res[1];
                    this.scatterData = res[3];
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
    showChart() {

        this.modalChart = true;
        this.changeDetectorRef.detectChanges();
        this.canvas = this.mychart.nativeElement;
        this.ctx = this.canvas.getContext('2d');

        let myChart = new Chart('myChart', {
            type: "scatter",
            options: {
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display:true,
                            labelString: this.scaleLabelX
                        },
                        gridLines: {
                            drawBorder: false,
                        },
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display:true,
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
                labels: [],
                datasets: this.scatterDatasets
            }
            // type: 'bar',
            // data: {
            //     labels: this.labelData,
            //     datasets: [{
            //         label: 'Train Data ',
            //         data: this.histogramData,
            //         backgroundColor: [
            //             'rgba(255, 99, 132, 0.2)',
            //             'rgba(54, 162, 235, 0.2)',
            //             'rgba(255, 206, 86, 0.2)',
            //             'rgba(75, 192, 192, 0.2)',
            //             'rgba(153, 102, 255, 0.2)',
            //             'rgba(255, 159, 64, 0.2)',
            //             'rgba(255, 99, 132, 0.2)',
            //             'rgba(54, 162, 235, 0.2)',
            //             'rgba(255, 206, 86, 0.2)',
            //             'rgba(75, 192, 192, 0.2)',
            //             'rgba(153, 102, 255, 0.2)',
            //             'rgba(255, 159, 64, 0.2)'
            //         ],
            //         borderColor: [
            //             'rgba(255,99,132,1)',
            //             'rgba(54, 162, 235, 1)',
            //             'rgba(255, 206, 86, 1)',
            //             'rgba(75, 192, 192, 1)',
            //             'rgba(153, 102, 255, 1)',
            //             'rgba(255, 159, 64, 1)',
            //             'rgba(255,99,132,1)',
            //             'rgba(54, 162, 235, 1)',
            //             'rgba(255, 206, 86, 1)',
            //             'rgba(75, 192, 192, 1)',
            //             'rgba(153, 102, 255, 1)',
            //             'rgba(255, 159, 64, 1)'
            //         ],
            //         borderWidth: 1
            //     }]
            // },


        });
    }

}