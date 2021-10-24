const express = require('express');
const mysql = require('sync-mysql');
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'hypergraph_prev',
//     ssl: true
// });

const connection = new mysql({
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
  const results = connection.query("SELECT * FROM vertex");

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
    
  res.send(vertices)
});

// hyperedges (perdicate vertex)
app.get('/api/hyperedges', (req, res) => {
  let hyperedges = []
  let pseudo_vertices = []
  let edges = []
  const results = connection.query('SELECT * FROM hyperedge');

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
  
  res.send([...hyperedges, ...pseudo_vertices, ...edges])
});

// edges (noun verex -> hyper edge)
app.get('/api/edges', (req, res) => {
  let edges = []
  const results = connection.query('SELECT vertex_id, hyperedge_id FROM hyperedge_vertex');

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
  
  res.send(edges);
});

// pseudo_edges (pseudo vertex -> hyperedge)
app.get('/api/pseudoEdges', (req, res) => {
  let edges = []
  const results = connection.query('SELECT pseudovertex_id, hyperedge_id FROM hyperedge_pseudovertex');

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
  
  res.send(edges);
});

// Sql input 
app.get('/api/sqlInput', (req, res) => {
  const request = req.query;

  let graph = []
  
  // input vertex가 pseudo vertex인 경우

  // 먼저 pseudo - pseudo간의 연결 찾기

  // 기준이 되는 node 설정
  const results = connection.query(`SELECT * FROM hyperedge WHERE predicate_phrase = "${request.vertex}"`);

  const selectedHyperedge = results[0].hyperedge_id;

  console.log("selected hyperedge is : " + selectedHyperedge);

  results.forEach(element => {
    graph.push({
      data: { 
        id: "hyperedge" + element.hyperedge_id,
        label: element.predicate_phrase,
        backgroundColor: predicateColor
      },
      classes: ["predicate_vertex"]
    })

    graph.push({
      data: {
        id: "pseudo_vertex" + element.hyperedge_id,
        label: "",
        backgroundColor: pseudoVertexColor
      },
      classes: ["pseudo_vertex"]
    })

    graph.push({
      data: { 
          id: "hyperedge" + element.hyperedge_id + "->" + "pseudo_vertex" + element.hyperedge_id,
          source: "hyperedge" + element.hyperedge_id,
          target: "pseudo_vertex" + element.hyperedge_id
      },
      classes: ["arrow_edge"]
    })
  });

  // hyperedge(predicate vertex)와 연결된 다른 pseudo vertex 찾기 incoming direction
  const results2 = connection.query(`SELECT pseudovertex_id, hyperedge_id FROM hyperedge_pseudovertex WHERE hyperedge_id = "${selectedHyperedge}"`);

  results2.forEach((element) => {
    // selected hyperedge와 연결된 pseudo vertex들 합치기
    graph.push({
      data: { 
          id: "pseudo_vertex" + element.pseudovertex_id + "->" + "hyperedge" + element.hyperedge_id,
          source: "pseudo_vertex" + element.pseudovertex_id,
          target: "hyperedge" + element.hyperedge_id
      },
      classes: ["flat_edge"]
    })

    const results3 = connection.query(`SELECT * FROM hyperedge WHERE hyperedge_id = "${element.pseudovertex_id}"`);

    // pseudo vertex와 hyperedge 합치기
    results3.forEach((element) => {
      graph.push({
        data: { 
          id: "hyperedge" + element.hyperedge_id,
          label: element.predicate_phrase,
          backgroundColor: predicateColor
        },
        classes: ["predicate_vertex"]
      })

      graph.push({
        data: {
          id: "pseudo_vertex" + element.hyperedge_id,
          label: "",
          backgroundColor: pseudoVertexColor
        },
        classes: ["pseudo_vertex"]
      })

      graph.push({
        data: { 
            id: "hyperedge" + element.hyperedge_id + "->" + "pseudo_vertex" + element.hyperedge_id,
            source: "hyperedge" + element.hyperedge_id,
            target: "pseudo_vertex" + element.hyperedge_id
        },
        classes: ["arrow_edge"]
      })
    });
  });

  // hyperedge(predicate vertex)와 연결된 다른 pseudo vertex 찾기 outgoing direction direction
  const results4 = connection.query(`SELECT pseudovertex_id, hyperedge_id FROM hyperedge_pseudovertex WHERE pseudovertex_id = "${selectedHyperedge}"`);

  results4.forEach((element) => {
    // selected hyperedge와 연결된 pseudo vertex들 합치기
    graph.push({
      data: { 
          id: "pseudo_vertex" + element.pseudovertex_id + "->" + "hyperedge" + element.hyperedge_id,
          source: "pseudo_vertex" + element.pseudovertex_id,
          target: "hyperedge" + element.hyperedge_id
      },
      classes: ["flat_edge"]
    })

    // pseudo vertex와 hyperedge 합치기
    graph.push({
      data: { 
        id: "hyperedge" + element.hyperedge_id,
        label: element.predicate_phrase,
        backgroundColor: predicateColor
      },
      classes: ["predicate_vertex"]
    })

    graph.push({
      data: {
        id: "pseudo_vertex" + element.hyperedge_id,
        label: "",
        backgroundColor: pseudoVertexColor
      },
      classes: ["pseudo_vertex"]
    })

    graph.push({
      data: { 
          id: "hyperedge" + element.hyperedge_id + "->" + "pseudo_vertex" + element.hyperedge_id,
          source: "hyperedge" + element.hyperedge_id,
          target: "pseudo_vertex" + element.hyperedge_id
      },
      classes: ["arrow_edge"]
    })
  });

  // selected hyperedged와 연결된 noun vertex 고르기
  const results5 = connection.query(`SELECT * FROM hyperedge_vertex NATURAL JOIN vertex WHERE hyperedge_id = "${selectedHyperedge}"`);
    
  results5.forEach(element => {
    graph.push({
      data: { 
        id: "vertex" + element.vertex_id,
        label: element.noun_phrase,
        backgroundColor: simpleVertexColor,
      },
      classes: ["noun_vertex"]
    })
    console.log("noun phrsse: " + element.noun_phrase);

    graph.push({
      data: { 
          id: "vertex" + element.vertex_id + "->" + "hyperedge" + element.hyperedge_id,
          source: "vertex" + element.vertex_id,
          target: "hyperedge" + element.hyperedge_id
      },
      classes: ["flat_edge"]
    })
  });

  res.send(graph);
});