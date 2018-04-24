import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { TreeViewComponent } from './tree-view.component';


@NgModule({
  declarations: [
    TreeViewComponent
  ],
  imports: [BrowserModule],
  providers: [],
  exports:[TreeViewComponent]
})
export class TreeViewModule { }
export * from './tree-view.component';