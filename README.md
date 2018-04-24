# Tree View
Yet another published reusable angular tree-view component

## Install & Import to Your Main Module
`npm install ngx-tree-view`
app.module.js
```
import { TreeViewModule } from 'ngx-tree-view'
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
app.component.html
```
<tree-view [nodes]="data"></tree-view>
```
app.component.ts
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
            {name:'Wisconcin'}
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
```
options =  {
  select:'leaves', // Only reflect selected child notes, ('all' selects any, null hides the checkbox)
  glyphs:TREE_VIEW_GLYPH_CONFIGS.fontAwesomeCarets // A default selection of font-awesome carets
  map: {
    children:'children',    // The property to enumerate children on
    value:'name',           // The property to reflect for readable data
    key:'id'                // The property to relfect for a datum's index
  },
  expanded:1                // By default open the tree-view <expanded> levels deep
}
```