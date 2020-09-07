import { Component, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
@Component({
    templateUrl: './user.component.html'
})
export class UserComponent {
    public nCluster: string = "0";
    public maxIterate: string = "0";
    public tolerance: string = "0";
    public randomState: string = "0";
    public trainFile: File;
    public testFile: File;
    public fileName: string = "";
    public Loading: boolean = false;
    public PredicatedData: any = [];
    public currentPage: number = 0;
    public endPage: number = 0;
    public totalRecordSize: number = 0;
    public itemPerPage: number = 0;
    public itemPerPageSelected: string = "";
    public perPages: any = [{ pageSize: 5 }, { pageSize: 10 }, { pageSize: 15 }];
    public totalRecord: any = [];
    public PredicatedColumns: any = [];
    constructor(public title: Title, public http: HttpClient,
        public changeDetectorRef: ChangeDetectorRef) {
        this.title.setTitle("User | Dynamic Preventative Maintenance");

        this.trainFile = JSON.parse(localStorage.getItem("train_file"));
        console.log(JSON.stringify(this.trainFile));
        this.nCluster = localStorage.getItem("nCluster");
        this.maxIterate = localStorage.getItem("maxIterate");
        this.tolerance = localStorage.getItem("tolerance");
        this.randomState = localStorage.getItem("randomState");
        this.itemPerPageSelected = this.perPages[0].pageSize;

    }
    fileTrainChange(event) {
        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            this.trainFile = fileList[0];
            this.fileName = this.trainFile.name;
            // this.Submit();
        }
    }
    fileTestChange(event) {
        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            this.testFile = fileList[0];
            this.fileName = this.testFile.name;
            // this.Submit();
        }
    }
    Submit() {
        if (this.testFile != undefined) {
            let formData = new FormData();
            console.log(JSON.stringify(this.trainFile));
            formData.append('trainFile', this.trainFile);
            formData.append('testFile', this.testFile);
            this.Loading = true;
            this.PredicatedColumns = [];
            this.totalRecord = [];
            this.http.post('/Predicted?n_clusters=' + this.nCluster + '&iterate=' + this.maxIterate + '&tolerance=' + this.tolerance + '&random_state=' + this.randomState, formData, { responseType: 'json' })
                .subscribe((res: any) => {
                    console.log(res);
                    this.PredicatedColumns = res[0];
                    this.totalRecord = res[1];
                    this.Loading = false;
                }, err => {
                    this.Loading = false;
                    alert("Something Failed");
                })
        } else {
            alert("Kindly Select Cluster, Iterate and File");
        }
    }

    UserSelectedRecords(event) {
        this.PredicatedData = event;
        this.changeDetectorRef.detectChanges();
    }


    exportCSV() {
        if (this.totalRecord.length > 0) {
            var content = '';
            content +=
                '<tr>'
            this.PredicatedColumns.forEach(header => {
                content += '<th>' + header + '</th>'
            });
            content += '</tr>';
            this.totalRecord.forEach(data => {
                content += '<tr>'
                this.PredicatedColumns.forEach(col => {
                    content += '<td>' + data[col] + '</td>'
                });
                content += '</tr>'
            });

            var s = document.createElement("table");
            s.innerHTML = content;

            const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(s);
            const wb: xlsx.WorkBook = xlsx.utils.book_new();

            xlsx.utils.book_append_sheet(wb, ws, 'Train_Data');
            xlsx.writeFile(wb, 'Predicted_Data' + moment().format('DD-MMM-YYYY') + '.csv');

        } else {
            alert("you haven't selected the test file.")
        }
    }

}