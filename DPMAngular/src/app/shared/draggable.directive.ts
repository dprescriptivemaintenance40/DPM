import { Directive, ElementRef, Renderer2, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';

interface Point {x: number, y: number};

@Directive({
  selector: '.modal-header'
})
export class DragModalDirective implements AfterViewInit, OnDestroy  {

  constructor (
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  subscription: Subscription;

  start: Point;
  offset: Point = {x: 0, y: 0};

  ngAfterViewInit() {       

    setTimeout(() => {
      this.makeItDraggable();      
    });

  }  

  private makeItDraggable() {

    const modalDialogElement = this.el.nativeElement.closest(".modal-dialog");

    if (!modalDialogElement) {
      console.error('DragModalDirective cannot find the parent element with class modal-dialog')
      return;
    }

    this.renderer.setStyle(this.el.nativeElement, 'user-select', 'none');
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'move'); 

    this.renderer.setStyle(modalDialogElement, 'transition', 'none');

    const down$ = fromEvent(this.el.nativeElement, 'mousedown')
    const move$ = fromEvent(document, 'mousemove');
    const up$ = fromEvent(document, 'mouseup')

    const drag$ = down$.pipe(        
      tap(($event: MouseEvent) => {
        this.start = {
          x: $event.clientX - this.offset.x, 
          y: $event.clientY - this.offset.y
        };
      }),
      mergeMap(down => move$.pipe(
        takeUntil(up$)
      ))
    );

    this.subscription = drag$.subscribe(($event: MouseEvent) => {
      this.offset = {
        x: $event.clientX - this.start.x,
        y: $event.clientY - this.start.y
      }

     this.renderer.setStyle(modalDialogElement, 'transform', `translate(${this.offset.x}px, ${this.offset.y}px)`);
    }) 
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  } 
}