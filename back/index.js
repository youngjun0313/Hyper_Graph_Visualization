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

app.get('/api/vertices', (req, res) => {
  let vertices = []
  connection.query('SELECT * from vertex', (error, results) => {
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

app.get('/api/hyperedges', (req, res) => {
  let hyperedges = []
  let pseudo_vertices = []
  let edges = []
  connection.query('SELECT * from hyperedge', (error, results) => {
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
    });

    edges.push({
      data: { 
          id: "hyperedge" + element.hyperedge_id + "->" + "pseudo_vertex" + element.hyperedge_id,
          source: "hyperedge" + element.hyperedge_id,
          target: "pseudo_vertex" + element.hyperedge_id
      },
      classes: ["arrow_edge"]
    })

    console.log([...hyperedges, ...pseudo_vertices, ...edges]);
    
    res.send([...hyperedges, ...pseudo_vertices, ...edges])
  });
});