
import {
    SurfaceViewOptions,
    EVENT_CANVAS_CLICK,
    DEFAULT,
    AnchorLocations,
    DotEndpoint,
    ready,
    newInstance,
    BrowserUI,
    Surface,
    isPort,
    Vertex,
    uuid,
    ObjectData,
    ForceDirectedLayout,
    MiniviewPlugin,
    ActiveFilteringPlugin,
    LassoPlugin,
    ControlsComponent,
    CONNECTOR_TYPE_SMOOTH
} from "@jsplumbtoolkit/browser-ui"

const CLASS_HIGHLIGHT = "hl"

ready(() =>{

    const toolkit:BrowserUI = newInstance({
        portDataProperty:"items",
        beforeConnect:(source:Vertex, target:Vertex) => {
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

    const mainElement = document.querySelector("#jtk-demo-connectivity"),
        canvasElement = mainElement.querySelector(".jtk-demo-canvas"),
        miniviewElement = mainElement.querySelector(".miniview")

// ----------------------- this code is the random node generator. it's just for this demo --------------------------------------

    const words = [ "CAT", "DOG", "COW", "HORSE", "DUCK", "HEN" ]

    const randomPort = (index:number) => {
        const out:Array<string> = [], map = {}
        function _one():string {
            let a, done = false
            while (!done) {
                a = words[Math.floor(Math.random() * words.length)]
                done = map[a] !== true
                map[a] = true
            }
            return a
        }
        out.push(_one())
        out.push(_one())
        return { entries:out, index:index, id:uuid() }
    };

    const newNode = () => {
        const groupCount = Math.floor(Math.random() * 3) + 1,
            data:any = {
                id:uuid(),
                items:[]
            }

        for (let i = 0; i < groupCount; i++) {
            data.items.push(randomPort(i))
        }

        return toolkit.addNode(data)
    }

// ---------------------------- / end random node generator ---------------------------------------------

    // initial dataset consists of 5 random nodes.
    const nodeCount = 5;
    for (let i = 0; i < nodeCount;i++) {
        newNode()
    }

    const view:SurfaceViewOptions = {
        nodes: {
            [DEFAULT]: {
                templateId: "tmplNode"
            }
        }
    };

    const renderer:Surface = toolkit.render(canvasElement, {
        zoomToFit: true,
        view: view,
        layout: {
            type: ForceDirectedLayout.type
        },
        plugins:[
            {
                type:MiniviewPlugin.type,
                options:{
                    container:miniviewElement
                }
            },
            ActiveFilteringPlugin.type,
            {
                type:LassoPlugin.type,
                options:{lassoFilter: ".controls, .controls *, .miniview, .miniview *"}
            }
        ],
        events: {
            [EVENT_CANVAS_CLICK]: (e:Event) => {
                toolkit.clearSelection()
            }
        },
        consumeRightClick:false,
        templateMacros:{
            id:(data:ObjectData) => data.id.substring(0, 5),
            entryNames:(data:ObjectData) => data.entries.join(' ')
        },
        defaults:{
            edgesAvoidVertices:true,
            connector:CONNECTOR_TYPE_SMOOTH,
            endpoint: { type:DotEndpoint.type, options:{ radius: 10 } },
            anchor:[AnchorLocations.Left, AnchorLocations.Right]
        },
        magnetize:{
            constant:true,
            trackback:true
        }
    })


    new ControlsComponent(document.getElementById("controls"), renderer, {
        buttons:[
            {
                id:"add",
                class:"add-new",
                title:"Add New Element",
                handler:(e:MouseEvent, id:string) => {
                    const node = newNode()
                    renderer.zoomToFit()
                    flash(renderer.getRenderedElement(node))
                    renderer.repaintEverything()
                }
            }
        ]
    })

    //
    // assign a class to a new node which brings the user's attention to it. then a little while later,
    // take it off.
    //
    function flash(el:Element) {
        el.classList.add(CLASS_HIGHLIGHT)
        setTimeout(function() {
            el.classList.remove(CLASS_HIGHLIGHT)
        }, 1950)
    }
})
