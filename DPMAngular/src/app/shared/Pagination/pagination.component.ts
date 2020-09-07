import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'pagination',
    templateUrl: './pagination.component.html'
})
export class PaginationComponent implements OnChanges {
    public currentPage: number = 0;
    public endPage: number = 0;
    public totalRecordSize: number = 0;
    public itemPerPage: number = 0;
    public itemPerPageSelected: string = "";

    @Input("perPages")
    public perPages: any = [];
    @Input("align")
    public align: string = "center";

    @Input("totalRecord")
    public totalRecord: any = [];

    @Output("selectedRecord")
    public selectedRecord: EventEmitter<any> = new EventEmitter<any>();
    constructor(public changeDetectorRef: ChangeDetectorRef) {

    }
    ngOnChanges() {
        this.endPage = 0;
        this.totalRecordSize = 0;
        this.itemPerPageSelected = this.perPages[0].pageSize;
        this.endPage = parseInt(this.itemPerPageSelected);
        this.totalRecordSize = this.totalRecord.length;
        this.selectedRecord.emit(this.totalRecord.slice(0, this.endPage));
    }

    SelectItemPer(value) {
        this.currentPage = 0;
        this.endPage = parseInt(value);
        this.selectedRecord.emit(this.totalRecord.slice(this.currentPage, this.endPage))
    }
    next() {
        this.currentPage = this.endPage;
        this.endPage += parseInt(this.itemPerPageSelected);
        let records = this.totalRecord.slice(this.currentPage, this.endPage);
        this.selectedRecord.emit(records)
    }

    previous() {
        this.currentPage -= parseInt(this.itemPerPageSelected);
        this.endPage -= parseInt(this.itemPerPageSelected);
        let records = this.totalRecord.slice(this.currentPage, this.endPage);
        this.selectedRecord.emit(records)
    }
}