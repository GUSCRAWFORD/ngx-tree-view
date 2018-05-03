import {
  Component, OnChanges,
  Input, Output,
  EventEmitter,
  ViewChild, TemplateRef, ViewChildren,
  ChangeDetectorRef
} from '@angular/core';

@Component({
  selector: 'tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css']
})
export class TreeViewComponent implements OnChanges {

  constructor(
    private cd: ChangeDetectorRef
  ) { }

  GroupSelection = GroupSelection;

  @Input()
  metadata;
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
  template:TemplateRef<any>;
  @Input()
  depth: number = 0;
  @Input()
  root = true;
  @Input()
  disabled = false;
  selectAll(nodes, val = true) {
    if (!nodes) nodes = this.nodes;
    nodes.forEach(node=>{
      node.$treenode.$selected = val;
      if (node && node[this.options.map.children] && node[this.options.map.children].length && this.options.select!=='all')
        this.selectAll(node[this.options.map.children], val);
    });
  }
  checked (node) {
    if (node[this.options.map.children] && this.options.select==='leaves')
      return this.groupIsSelected(node)===GroupSelection.All;
    else
      return node && !!node.$treenode.$selected;
  }
  indeterminate (node) {
    if (node[this.options.map.children])
      return this.options.select==='leaves'?this.groupIsSelected(node)===GroupSelection.Some:null;
    return null;
  }
  filterSelections(nodes=null) {
    var selections = [];
    if (!nodes) nodes = this.nodes;
    nodes.forEach(node=>{
      if (!node.$treenode) node.$treenode = {};
      if (node.$treenode.$selected && (this.options.select==='all' || this.options.select==='all-cascading' || !node[this.options.map.children])) selections.push(node);
      if (node[this.options.map.children] && node[this.options.map.children].length)
        Array.prototype.push.apply(selections, this.filterSelections(node[this.options.map.children]));
    });
    return selections;
  }
  groupIsSelected(node) : GroupSelection {
    var goingGroupResult = -1, childrenNodesAreSelected;
    if (!node) return GroupSelection.Empty;
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
      if (node[this.options.map.children]) {
        if (!node[this.options.map.children].length)
          goingGroupResult = GroupSelection.Empty
      }
      else if (node.$treenode.$selected)
        goingGroupResult =  GroupSelection.All;
      else goingGroupResult =  GroupSelection.None;
    }
    return goingGroupResult;
  }
  select(node) {
    if (node[this.options.map.children] && (this.options.select==='leaves' || this.options.select==='all-cascading')) {
      this.selectAll(node[this.options.map.children], this.options.select==='leaves'?this.groupIsSelected(node)!==GroupSelection.All:!node.$treenode.$selected);
    }
    //var selections = this.filterSelections();

    node.$treenode.$selected = !node.$treenode.$selected;
    this.selectionChange.emit(this.root?this.filterSelections():[node]);
  }
  expand(node) {
    if (node[this.options.map.children]) {
      node.$treenode.$expanded = !node.$treenode.$expanded;
      this.onChildrenSelected([node])
      this.expansionChange.emit(node);
      return true;
    } return false;
  }
  onChildrenExpanded(node) {
    this.expansionChange.emit(node);
  }
  onChildrenSelected(nodes) {
    var node = nodes[0];
    if (node && this.options.select==='all-cascading') {
      var parentNode = this.nodes.find(n=>n.children&&n.children.find(cn=>cn===node));
      if (parentNode) {
        parentNode.$treenode.$selected = this.groupIsSelected(parentNode) > GroupSelection.None;
        nodes.unshift(parentNode);
      }
    }
    return this.selectionChange.emit(this.root?this.filterSelections():nodes)
  }
  handleClick(node, $event) {
    if (!this.expand(node))
      this.select(node);
    $event.cancelBubble = true;
  }

  checkboxClick(node, $event, checkbox) {
    $event.cancelBubble = true;
    this.select(node);
  }

  ngOnChanges() {
    if (!this.options.map) this.options.map = {
      children:'children',
      value:'name'
    }
    if (this.options.expanded && this.depth < this.options.expanded) {
      this.nodes.forEach(node=>{
        node.$treenode.$expanded = true;
      });
    }
    this.nodes.forEach(n=>this.setMetadata(n, {}));
    //this.scaffoldMetadata();
  }
  setMetadata(node, metadata) {
    if (metadata)
      node.$treenode = metadata;
    else delete node.$treenode;
    if (node[this.options.map.children] instanceof Array)
      node[this.options.map.children].forEach(n=>{
        this.setMetadata(n, JSON.parse(JSON.stringify(metadata)));
      });
  }
  scaffoldMetadata() {
    if (this.root) {
      this.metadata = {};
      var scaffoldMetadata = (node, metadataNode, index, depth)=>{
        metadataNode[depth+'.'+index] = {};
        if (node[this.options.map.children]) {
          node[this.options.map.children].forEach((childNode, i)=>{
            scaffoldMetadata(childNode, metadataNode, i, depth+1);
          });
        }
      };
      this.nodes.forEach((node, i)=>{
        scaffoldMetadata(node, this.metadata, i, this.depth);
      });
    }
  }
}
export class TreeViewDataMap {
  key?:string = 'id';
  children:string = 'children';
  value:string = 'value';
}
export class TreeViewPagingConfig {
  perPage:number = 25;
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
  },
  glpyhIconsPlusMinus: {
    fontLibrary:'glyphicon',
    expandGlyph:'glyphicon-plus',
    collapseGlyph:'glyphicon-minus'
  },
  glpyhIconsCarets: {
    fontLibrary:'glyphicon',
    expandGlyph:'glyphicon-triangle-right',
    collapseGlyph:'glyphicon-triangle-bottom'
  }
}
export class TreeViewOptions {
  select?:'leaves'|'all'|'all-cascading'='all-cascading';
  checkbox?:boolean=true;
  glyphs:TreeViewGlyphConfig = TREE_VIEW_GLYPH_CONFIGS.fontAwesomeCarets;
  map:TreeViewDataMap = {
    children:'children',
    value:'name'
  };
  expanded?:number = 0;
  paging?:TreeViewPagingConfig = null;
}
export enum GroupSelection {
  None,
  All,
  Some,
  Empty
}