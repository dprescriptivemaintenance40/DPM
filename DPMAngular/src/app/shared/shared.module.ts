import {NgModule} from '@angular/core'
import {PaginationComponent} from './Pagination/pagination.component'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import {DragModalDirective} from './draggable.directive'
@NgModule({
    declarations:[PaginationComponent,DragModalDirective],
    imports:[FormsModule,CommonModule],
    exports:[PaginationComponent,DragModalDirective]

})
export class SharedModule{

}