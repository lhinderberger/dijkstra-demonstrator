async function init_demonstrator() {
  await init_graph_viewer();

  var templates = await preload_templates(["dijkstra-demonstrator", "dijkstra-table-row"])

  Vue.component('dijkstra-table-row', {
    template: templates["dijkstra-table-row"],
    props: ["distances", "step", "current_vertex"]
  })

  Vue.component("dijkstra-demonstrator", {
    template: templates["dijkstra-demonstrator"],
    data() { return {
      dijkstra_status: null,
      dijkstra_timeout: 1000,
      graph: lhs_graph()
    } },
    computed: {
      vertex_keys() {
        var result = []
        for (var key in this.graph.vertices) {
          if (this.graph.vertices.hasOwnProperty(key))
            result.push(key)
        }
        return result
      }
    },
    methods: {
      build_dijkstra_status(start_vertex) {
        var status = {
          visited: [],
          distances: {},
          history: [],
          start_vertex: start_vertex,
          current_vertex: null
        }

        for (var i = 0; i < this.vertex_keys.length; i++) {
          var key = this.vertex_keys[i]
          status.distances[key] = {
            distance: (key == start_vertex) ? 0 : Infinity,
            previous: null
          }
        }

        return status
      },
      clear_graph_highlights() {
        for (var key in this.graph.vertices) {
          if (this.graph.vertices.hasOwnProperty(key))
            this.graph.vertices[key].class = ""
        }
        for (var i = 0; i < this.graph.edges.length; i++)
          this.graph.edges[i].class = ""
      },
      dijkstra() {
        // Find closest vertex
        var closestVertex = null
        var closestDistance = Infinity
        for (var i = 0; i < this.vertex_keys.length; i++) {
          var key = this.vertex_keys[i]

          if (this.is_vertex_visited(key))
            continue;

          var distance = this.dijkstra_status.distances[key].distance

          if (distance < closestDistance) {
            closestVertex = key
            closestDistance = distance
          }
        }

        if (closestDistance == Infinity)
          return;

        // Push current distances into history
        this.dijkstra_status.history.push({ distances: this.dijkstra_status.distances, current_vertex: this.dijkstra_status.current_vertex })
        this.dijkstra_status.distances = Object.assign({}, this.dijkstra_status.distances)

        // Mark current vertex as current and visited
        this.dijkstra_status.current_vertex = closestVertex
        this.dijkstra_status.visited.push(closestVertex)

        // Highlight current vertex as selected
        this.graph.vertices[closestVertex]["class"] = "selected"

        setTimeout(() => {
          // Look at outgoing edges
          var outgoing = this.outgoing_edges(closestVertex)
          var processEdge = (i) => {
            if (i >= outgoing.length) {
              // Highlight current vertex as visited
              this.graph.vertices[closestVertex]["class"] = "visited"
              setTimeout(() => { this.dijkstra() }, this.dijkstra_timeout);
              return
            }

            var edge = outgoing[i]

            this.graph.edges[edge.idx].class = "highlighted" // Highlight edge

            setTimeout(() => {
              if (this.is_vertex_visited(edge.to)) {
                this.graph.edges[edge.idx].class = "" // Remove highlight
                setTimeout(() => { processEdge(i+1) })
                return
              }

              var newDistance = closestDistance + edge.weight
              if (newDistance < this.dijkstra_status.distances[edge.to].distance) {
                this.dijkstra_status.distances[edge.to] = {
                  distance: newDistance,
                  previous: (closestVertex == this.dijkstra_status.start_vertex) ? null : closestVertex
                }
              }

              this.graph.edges[edge.idx].class = "" // Remove highlight
              setTimeout(() => { processEdge(i+1) })
            }, this.dijkstra_timeout)
          }

          processEdge(0)
        }, this.dijkstra_timeout)
      },
      init_dijkstra(start_vertex) {
        this.dijkstra_status = this.build_dijkstra_status(start_vertex)
      },
      is_vertex_visited(vertex) {
        return this.dijkstra_status.visited.includes(vertex)
      },
      outgoing_edges(vertex) {
        var outgoing = []

        for (var i = 0; i < this.graph.edges.length; i++) {
          var edge = Object.assign({}, this.graph.edges[i])
          edge.idx = i
          if (edge.from == vertex)
            outgoing.push(edge)
        }

        if (this.graph.directed == false) {
          for (var i = 0; i < this.graph.edges.length; i++) {
            var edge = Object.assign({}, this.graph.edges[i])
            edge.idx = i
            if (edge.to == vertex) {
              edge.to = edge.from
              edge.from = vertex
              outgoing.push(edge)
            }
          }
        }

        return outgoing
      },
      vertex_clicked(vertex) {
        this.clear_graph_highlights()
        this.init_dijkstra(vertex)
        this.dijkstra()
      }
    }
  })
}