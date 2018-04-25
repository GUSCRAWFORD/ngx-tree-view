# Tree View
Yet another published reusable Angular tree-view component. (Hopefully the last)

## Install & Import to Your Main Module
`npm install ngx-tree-view`

**app.module.js**
```
import { TreeViewModule } from '@guscrawford/ngx-tree-view';
@NgModule({
  declarations: [
    AppComponent,
    //...
  ],
  imports: [
    //...
    TreeViewModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```
## Use in a Component

**app.component.html**

```
<tree-view [nodes]="data"></tree-view>
```

**app.component.ts**

```
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  data = [
    {
      name:'North America',
      children:[
        {
          name:'USA',
          children:[
            {name:'Alabama'},
            {name:'Wisconsin'}
          ]
        },
        {name:'Canada'},
        {name:'Mexico'}
      ]
    },
    {
      name:'Europe',
      children:[
        {name:'Germany'},
        {name:'France'}
      ]
    },
    {name:'Antarctica'}
  ];
}
```

## Customize the Options

**app.component.html**

```
<tree-view [nodes]="data" [options]="options" (selectionChange)="selections = $event"></tree-view>
```

**app.component.ts**

```
import { TREE_VIEW_GLYPH_CONFIGS } from '@guscrawford/ngx-tree-view';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  selections;
  data = [
    {
      name:'North America',
      children:[
        {
          name:'USA',
          children:[
            {name:'Alabama'},
            {name:'Wisconsin'}
          ]
        },
        {name:'Canada'},
        {name:'Mexico'}
      ]
    },
    {
      name:'Europe',
      children:[
        {name:'Germany'},
        {name:'France'}
      ]
    },
    {name:'Antarctica'}
  ];
  options =  {
    select:'leaves', // Only reflect selected childless nodes, ('all' selects any, null hides the checkbox)
    glyphs:TREE_VIEW_GLYPH_CONFIGS.fontAwesomeCarets // A default selection of font-awesome carets
    map: {
      children:'children',    // The property to enumerate children on
      value:'name',           // The property to reflect for readable data
      key:'id'                // The property to relfect for a datum's index
    },
    expanded:1                // By default open the tree-view <expanded> levels deep
  }
}
```

## Customize the Node Template

**app.component.html**

```
<tree-view [nodes]="data" [template]="myCustomTreeNode"></tree-view>
<ng-template #myCustomTreeNode>
  {{node[options.map.value]}}!!!
<ng-template>
```

**app.component.ts**

```
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  data = [
    {
      name:'North America',
      children:[
        {
          name:'USA',
          children:[
            {name:'Alabama'},
            {name:'Wisconsin'}
          ]
        },
        {name:'Canada'},
        {name:'Mexico'}
      ]
    },
    {
      name:'Europe',
      children:[
        {name:'Germany'},
        {name:'France'}
      ]
    },
    {name:'Antarctica'}
  ];
}
```

## Update Asynchronously

**app.component.html**

```
<tree-view [nodes]="data" (expansionChange)="onExpand($event)"></tree-view>
```

**app.component.ts**

```
import { TREE_VIEW_GLYPH_CONFIGS } from '@guscrawford/ngx-tree-view';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  data = [
    {
      name:'North America',
      children:[
        {
          name:'USA',
          children:[
            {name:'Alabama'},
            {name:'Wisconsin'}
          ]
        },
        {name:'Canada', children:[]},
        {name:'Mexico', children:[]}
      ]
    },
    {
      name:'Europe',
      children:[
        {name:'Germany'},
        {name:'France'}
      ]
    },
    {name:'Antarctica'}
  ];
  statesOrProvinces(country) {
    if (country === 'Canada')
      return Observable.of([
        {name:'Ontario'},
        {name:'Quebec'}
      ]);
    if (country === 'Mexico')
      return Observable.of([
          {name:'Chihuahua'},
          {name:'Durango'}
        ]);
    return Observable.onErrorResumeNext();
  }
  onExpand($event) {
    if($event.$expanded && !$event.children.length)
      this.statesOrProvinces($event.name).subscribe(statesOrProv=>{
        $event.children = statesOrProv;
      })
  }
}
```