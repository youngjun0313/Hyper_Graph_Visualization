const express = require('express');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hypergraph_prev',
    ssl: true
});

const simpleVertexColor = "black";
const pseudoVertexColor = "red";
const predicateColor = "white";

const app = express();

app.set('port', 7777);

app.listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
  });

app.get('/', (req, res) => {
  res.send('Root');
});

// vertices(noun vertex)
app.get('/api/vertices', (req, res) => {
  let vertices = []
  connection.query('SELECT * FROM vertex', (error, results) => {
    if (error) 
      throw error;

    results.forEach(element => {
      vertices.push( {
        data: { 
          id: "vertex" + element.vertex_id,
          label: element.noun_phrase,
          backgroundColor: simpleVertexColor,
        },
        classes: ["noun_vertex"]
      })
    });

    console.log(vertices);
    
    res.send(vertices)
  });
});

// hyperedges (perdicate vertex)
app.get('/api/hyperedges', (req, res) => {
  let hyperedges = []
  let pseudo_vertices = []
  let edges = []
  connection.query('SELECT * FROM hyperedge', (error, results) => {
    if (error) 
      throw error;

    results.forEach(element => {
      hyperedges.push({
        data: { 
          id: "hyperedge" + element.hyperedge_id,
          label: element.predicate_phrase,
          backgroundColor: predicateColor
        },
        classes: ["predicate_vertex"]
      })

      pseudo_vertices.push({
        data: {
          id: "pseudo_vertex" + element.hyperedge_id,
          label: "",
          backgroundColor: pseudoVertexColor
        },
        classes: ["pseudo_vertex"]
      })

      edges.push({
        data: { 
            id: "hyperedge" + element.hyperedge_id + "->" + "pseudo_vertex" + element.hyperedge_id,
            source: "hyperedge" + element.hyperedge_id,
            target: "pseudo_vertex" + element.hyperedge_id
        },
        classes: ["arrow_edge"]
      })
    });

    console.log([...hyperedges, ...pseudo_vertices, ...edges]);
    
    res.send([...hyperedges, ...pseudo_vertices, ...edges])
  });
});

// edges
app.get('/api/edges', (req, res) => {
  let edges = []
  connection.query('SELECT vertex_id, hyperedge_id FROM hyperedge_vertex', (error, results) => {
    if (error) 
      throw error;

    results.forEach(element => {
      edges.push({
        data: { 
            id: "vertex" + element.vertex_id + "->" + "hyperedge" + element.hyperedge_id,
            source: "vertex" + element.vertex_id,
            target: "hyperedge" + element.hyperedge_id
        },
        classes: ["flat_edge"]
      })
    });
    
    res.send(edges)
  });
});

// pseudo_edges (pseudo vertex -> hyperedge)
app.get('/api/pseudoEdges', (req, res) => {
  let edges = []
  connection.query('SELECT pseudovertex_id, hyperedge_id FROM hyperedge_pseudovertex', (error, results) => {
    if (error) 
      throw error;

    results.forEach(element => {
      edges.push({
        data: { 
            id: "pseudo_vertex" + element.pseudovertex_id + "->" + "hyperedge" + element.hyperedge_id,
            source: "pseudo_vertex" + element.pseudovertex_id,
            target: "hyperedge" + element.hyperedge_id
        },
        classes: ["flat_edge"]
      })
    });
    
    res.send(edges)
  });
});