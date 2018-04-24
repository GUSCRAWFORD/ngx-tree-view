import {
  Component, OnInit,
  Input, Output,
  EventEmitter,
  ViewChild, TemplateRef, ViewChildren,
  ChangeDetectorRef
} from '@angular/core';
export class TreeViewDataMap {
  key?:string = 'id';
  children:string = 'children';
  value:string = 'value';
}
export class TreeViewGlyphConfig {
  fontLibrary: string;
  expandGlyph?: string;
  collapseGlyph?: string;
  childGlyph?: string;
}
export const TREE_VIEW_GLYPH_CONFIGS = {
  fontAwesomeSquareO: {
    fontLibrary:'fa',
    expandGlyph:'fa-plus-square-o',
    collapseGlyph:'fa-minus-square-o'
  },
  fontAwesomeCarets: {
    fontLibrary:'fa',
    expandGlyph:'fa-caret-right',
    collapseGlyph:'fa-caret-down'
  }
}
export class TreeViewOptions {
  select?:'leaves'|'all';
  glyphs:TreeViewGlyphConfig = TREE_VIEW_GLYPH_CONFIGS.fontAwesomeSquareO;
  map:TreeViewDataMap = {
    children:'children',
    value:'name'
  };
  expanded?:number = 0;
}
export enum GroupSelection {
  None,
  All,
  Some
}
@Component({
  selector: 'tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css']
})
export class TreeViewComponent implements OnInit {

  constructor(
    private cd: ChangeDetectorRef
  ) { }

  GroupSelection = GroupSelection;

  @Input()
  nodes = [];
  @ViewChildren('checkbox')
  checkboxes:any;
  @Output()
  selectionChange = new EventEmitter<any[]>();
  @Output()
  change = new EventEmitter<any[]>();
  @Output()
  expansionChange = new EventEmitter<any[]>();
  @Input()
  options: TreeViewOptions = new TreeViewOptions();

  @Input()
  depth: number = 0;

  selectAll(nodes, val = true) {
    if (!nodes) nodes = this.nodes;
    nodes.forEach(node=>{
      if (!node[this.options.map.children] || this.options.select === 'all') node.$selected = val;
      if (node && node[this.options.map.children] && node[this.options.map.children].length)
        this.selectAll(node[this.options.map.children], val);
    });
  }
  filterSelections(nodes=null) {
    var selections = [];
    if (!nodes) nodes = this.nodes;
    nodes.forEach(node=>{
      if (node.$selected) selections.push(node);
      if (node[this.options.map.children] && node[this.options.map.children].length)
        Array.prototype.push.apply(selections, this.filterSelections(node[this.options.map.children]));
    });
    return selections;
  }
  groupIsSelected(node) : GroupSelection {
    var goingGroupResult = -1, childrenNodesAreSelected;
    if (!node) return GroupSelection.None;
    if (node && node[this.options.map.children] && node[this.options.map.children].length) {
      node[this.options.map.children].forEach(child=>{
        childrenNodesAreSelected = this.groupIsSelected(child);
        if (goingGroupResult === -1) goingGroupResult = childrenNodesAreSelected;
        switch (childrenNodesAreSelected) {
          case GroupSelection.All:
            if (goingGroupResult !== GroupSelection.All)
            goingGroupResult = GroupSelection.Some;
            break;
          case GroupSelection.Some:
            goingGroupResult = GroupSelection.Some;
            break;
          case GroupSelection.None:
            if (goingGroupResult !== GroupSelection.None)
            goingGroupResult = GroupSelection.Some;
            break;
        }
      });
    }
    else {
      if (node.$selected) goingGroupResult =  GroupSelection.All;
      else goingGroupResult =  GroupSelection.None;
    }
    return goingGroupResult;
  }
  select(node, $event) {
    if (!node[this.options.map.children] || this.options.select==='all')
      node.$selected = !node.$selected;
    var selections = this.filterSelections();
    this.selectionChange.emit(selections);
  }
  expand(node, $event) {
    if (node[this.options.map.children]) {
      node.$expanded = !node.$expanded;
      this.expansionChange.emit(node);
      return true;
    } return false;
  }
  onChildrenExpanded(node) {
    this.expansionChange.emit(node);
  }
  onChildrenSelected(selections) {
    this.selectionChange.emit(this.filterSelections());
  }
  nodeClick(node, $event) {
    if (!this.expand(node, $event))
      this.select(node, $event);
    $event.cancelBubble = true;
  }

  checkboxClick(node, index, $event) {
    $event.cancelBubble = true;
    if (node[this.options.map.children] && this.options.select==='leaves') {
      this.selectAll(node[this.options.map.children], this.groupIsSelected(node)!==GroupSelection.All);
    }
    this.select(node, $event);
  }

  ngOnInit() {
    if (!this.options.map) this.options.map = {
      children:'children',
      value:'name'
    }
    if (this.options.expanded && this.depth < this.options.expanded) {
      this.nodes.forEach(node=>{
        node.$expanded = true;
      })
    }
  }
}
