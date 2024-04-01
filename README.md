## Active Filtering

This repo provides an example of how to use the active filtering mechanism to restrict drag targets. The Active filtering plugin provides a way to filter connection targets when a drag begins. When an `activeFiltering` plugin is set on a Surface and a beforeConnect function is supplied to the Toolkit's constructor, that function is called before a new connection is dragged, for every possible target for the current source. Whenever the beforeConnect method returns false, the corresponding target object (a Node, Group or Port) is disabled, and the user will not be able to drop the connection onto it. 


In this demonstration, each node contains a set of entries which each contain the name of two types of animal:
 
 
```javascript
[
    {
        id:"someNode",
        items:[
            {
                id:"89898",
                entries:["PIG", "CAT" ]
            },
            {
                id:"98656",
                entries:["DOG", "CAT" ]
            }    
        ]
    },
    {
        id:"someOtherNode",
        items:[
            {
                id:"85898",
                entries:["COW", "CAT" ]
            },
            {
                id:"98652",
                entries:["HORSE", "PIG" ]
            }    
        ]
    }
    
]
```
 
Entries are deemed connectable if one or more animals from the source entry are matched in a given target, which is a decision made in the `beforeConnect` method we pass to JsPlumb:

```javascript

import { newInstance, isPort } from '@jsplumbtoolkit/browser-ui";

const toolkit = newInstance({
    portDataProperty:"items",
    beforeConnect:(source, target) => {
        // ignore node->node connections; our UI is not configured to produce them. we could catch it and
        // return false, though, which would ensure that nodes could not be connected programmatically.
        if (isPort(source) && isPort(target)) {

            // cannot create loopback connections
            if (source === target) {
                return false
            }

            // cannot connect to Ports on the same Node as the Edge source
            if (source.getParent() === target.getParent()) {
                return false
            }

            const sourceData = source.data.entries,
                targetData = target.data.entries

            // attempt to match animals
            for (let i = 0; i < sourceData.length; i++) {
                if (targetData.indexOf(sourceData[i]) !== -1) {
                    return true
                }
            }
            return false
        }
    }
});
```


    
    
### Live demo

[https://jsplumbtoolkit.com/demonstrations/active-filtering](https://jsplumbtoolkit.com/demonstrations/active-filtering)
