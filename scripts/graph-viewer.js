async function preload_templates(templatesToFetch) {
    var templates = {}
    for (var i = 0; i < templatesToFetch.length; i++) {
        var tplName = templatesToFetch[i]
        templates[tplName] = await fetch_template('templates/' + tplName + '.html')
    }
    return templates
}

async function init_graph_viewer() {
    var templates = await preload_templates(["graph-viewer", "svg-edge", "svg-graph", "svg-vertex"])
    
    Vue.component('svg-edge', {
        template: templates["svg-edge"],
        props: ["graph", "edge"],
        computed: {
            angle() { // Angle of the edge against the X axis
                var l = this.vLength
                return Math.atan(l.y / l.x)
            },
            color() {
                return propertyOrDefault(this.edge, "color", "black")
            },
            transform() {
                var p = this.vPosition
                return "translate(" + p.x + "," + p.y + ")";
            },
            vertexFrom() {
                return this.graph.vertices[this.edge["from"]]
            },
            vertexTo() {
                return this.graph.vertices[this.edge["to"]]
            },
            vLength() { // Length vector
                var from = this.vertexFrom
                var to = this.vertexTo
                return { x: to["x"]-from["x"], y: to["y"]-from["y"] }
            },
            vPosition() { // Position vector
                var from = this.vertexFrom
                return { x: from["x"], y: from["y"] }
            },
            vWeightOffset() {
                var distance = -1* propertyOrDefault(this.edge, "weightDistance", 10)
                return { x: distance * Math.sin(-this.angle), y: distance * Math.cos(-this.angle) }
            },
            weight() {
                return propertyOrDefault(this.edge, "weight", 0)
            },
            width() {
                return propertyOrDefault(this.edge, "width", 3)
            }
        }
    })

    Vue.component('svg-vertex', {
        template: templates["svg-vertex"],
        props: ["clickHandler", "vertex", "vertexKey"],
        computed: {
            label() {
                return (this.vertex.label != undefined) ? this.vertex.label : this.vertexKey
            },
            transform() {
                return "translate(" + this.vertex.x + "," + this.vertex.y + ")";
            }
        },
        methods: {
            clicked() {
                this.clickHandler(this.vertexKey)
            }
        }
    })

    Vue.component('svg-graph', {
        template: templates["svg-graph"],
        mounted() {
            if (this.graph.directed != false)
                alert("Warning: Directed graphs are not yet supported!");
        },
        props: {
            graph: { type: Object, required: true },
            clickHandler: { type: Function, default: function(vertex) { console.log("Vertex clicked: " + vertex) } }
        }
    })

    Vue.component('graph-viewer', {
        template: templates["graph-viewer"],
        props: {
            'width': { type: String, required: true },
            'height': { type: String, required: true },
            'graph': { type: Object, required: true }
        }
    })
}