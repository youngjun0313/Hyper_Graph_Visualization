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
  database: 'hypergraph_orm',
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
        id: "vertex" + element.id,
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
        id: "hyperedge" + element.id,
        label: element.predicate_phrase,
        backgroundColor: predicateColor
      },
      classes: ["predicate_vertex"]
    })

    pseudo_vertices.push({
      data: {
        id: "pseudo_vertex" + element.id,
        label: "",
        backgroundColor: pseudoVertexColor
      },
      classes: ["pseudo_vertex"]
    })

    edges.push({
      data: { 
          id: "hyperedge" + element.id + "->" + "pseudo_vertex" + element.id,
          source: "hyperedge" + element.id,
          target: "pseudo_vertex" + element.id
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

  if(typeof request.vertex === "undefined" && request.hyperedge !== null) {
    graph = find_nodes_from_hyperedge(request.hyperedge, request.hop, [], []);
  } else if(typeof request.hyperedge === "undefined" && request.vertex !== null) {
    graph = find_nodes_from_vertex(request.vertex, request.hop, [], []);
  }

  res.send(graph);
});

const find_nodes_from_hyperedge = (root_vertex, left_hop, complete_graph, node_list) => {
  if(left_hop <= 0)
    return complete_graph;
  // root vertex가 pseudo vertex인 경우
  
  // 기준이 되는 node 설정
  const results = connection.query(`SELECT * FROM hyperedge WHERE predicate_phrase = "${root_vertex}"`);

  const selectedHyperedge = results[0].id;

  // 먼저 hyperedge -> pseudoVertex 완성
  complete_graph.push({
    data: { 
      id: "hyperedge" + selectedHyperedge,
      label: results[0].predicate_phrase,
      backgroundColor: predicateColor
    },
    classes: ["predicate_vertex"]
  })
  node_list.push("hyperedge" + results[0].id);

  complete_graph.push({
    data: {
      id: "pseudo_vertex" + results[0].id,
      label: "",
      backgroundColor: pseudoVertexColor
    },
    classes: ["pseudo_vertex"]
  })
  node_list.push("pseudo_vertex" + results[0].id);

  complete_graph.push({
    data: { 
        id: "hyperedge" + results[0].id + "->" + "pseudo_vertex" + results[0].id,
        source: "hyperedge" + results[0].id,
        target: "pseudo_vertex" + results[0].id
    },
    classes: ["arrow_edge"]
  })
  node_list.push("hyperedge" + results[0].id + "->" + "pseudo_vertex" + results[0].id);

  // hyperedge(predicate vertex)와 연결된 다른 pseudo vertex 찾기 incoming direction
  const results2 = connection.query(`SELECT * FROM hyperedge_pseudovertex NATURAL JOIN hyperedge WHERE hyperedge_id = "${selectedHyperedge}" AND hyperedge_id = id`);

  results2.forEach((element) => {
    if(node_list.indexOf(element.pseudovertex_id) === -1) {
      // selected hyperedge와 연결된 pseudo vertex들 합치기
      complete_graph.push({
        data: { 
            id: "pseudo_vertex" + element.pseudovertex_id + "->" + "hyperedge" + element.hyperedge_id,
            source: "pseudo_vertex" + element.pseudovertex_id,
            target: "hyperedge" + element.hyperedge_id
        },
        classes: ["flat_edge"]
      })
      node_list.push("pseudo_vertex" + element.pseudovertex_id + "->" + "hyperedge" + element.hyperedge_id);

      const results3 = connection.query(`SELECT * FROM hyperedge WHERE id = "${element.pseudovertex_id}"`);

      // pseudo vertex와 hyperedge 합치기
      results3.forEach((element) => {
        // 해당 pseudo vertex와 hyperedge 추가
        complete_graph.push({
          data: { 
            id: "hyperedge" + element.id,
            label: element.predicate_phrase,
            backgroundColor: predicateColor
          },
          classes: ["predicate_vertex"]
        })
        node_list.push("hyperedge" + element.id);
      
        complete_graph.push({
          data: {
            id: "pseudo_vertex" + element.id,
            label: "",
            backgroundColor: pseudoVertexColor
          },
          classes: ["pseudo_vertex"]
        })
        node_list.push("pseudo_vertex" + element.id);
      
        complete_graph.push({
          data: { 
              id: "hyperedge" + element.id + "->" + "pseudo_vertex" + element.id,
              source: "hyperedge" + element.id,
              target: "pseudo_vertex" + element.id
          },
          classes: ["arrow_edge"]
        })
        node_list.push("hyperedge" + element.id + "->" + "pseudo_vertex" + element.id);

        complete_graph.concat(find_nodes_from_hyperedge(element.predicate_phrase, left_hop-1, complete_graph, node_list));
        // 중복제거
        complete_graph.filter((item, pos) => complete_graph.indexOf(item) === pos);
      });
    }
  });

  // hyperedge(predicate vertex)와 연결된 다른 pseudo vertex 찾기 outgoing direction direction
  const results4 = connection.query(`SELECT * FROM hyperedge_pseudovertex NATURAL JOIN hyperedge WHERE pseudovertex_id = "${selectedHyperedge}" AND id = hyperedge_id`);

  results4.forEach((element) => {
    if(node_list.indexOf(element.pseudovertex_id) === -1) {
      // selected hyperedge와 연결된 pseudo vertex들 합치기
      complete_graph.push({
        data: { 
            id: "pseudo_vertex" + element.pseudovertex_id + "->" + "hyperedge" + element.hyperedge_id,
            source: "pseudo_vertex" + element.pseudovertex_id,
            target: "hyperedge" + element.hyperedge_id
        },
        classes: ["flat_edge"]
      })
      node_list.push("pseudo_vertex" + element.pseudovertex_id + "->" + "hyperedge" + element.hyperedge_id);

      // 해당 pseudo vertex와 hyperedge 추가
      complete_graph.push({
        data: { 
          id: "hyperedge" + element.hyperedge_id,
          label: element.predicate_phrase,
          backgroundColor: predicateColor
        },
        classes: ["predicate_vertex"]
      })
      node_list.push("hyperedge" + element.hyperedge_id);
    
      complete_graph.push({
        data: {
          id: "pseudo_vertex" + element.hyperedge_id,
          label: "",
          backgroundColor: pseudoVertexColor
        },
        classes: ["pseudo_vertex"]
      })
      node_list.push("pseudo_vertex" + element.hyperedge_id);
    
      complete_graph.push({
        data: { 
            id: "hyperedge" + element.hyperedge_id + "->" + "pseudo_vertex" + element.hyperedge_id,
            source: "hyperedge" + element.hyperedge_id,
            target: "pseudo_vertex" + element.hyperedge_id
        },
        classes: ["arrow_edge"]
      })
      node_list.push("hyperedge" + element.hyperedge_id + "->" + "pseudo_vertex" + element.hyperedge_id);

      complete_graph.concat(find_nodes_from_hyperedge(element.predicate_phrase, left_hop-1, complete_graph, node_list));
      complete_graph.filter((item, pos) => complete_graph.indexOf(item) === pos);
    }
  });

  // selected hyperedged와 연결된 noun vertex 고르기
  const results5 = connection.query(`SELECT * FROM hyperedge_vertex NATURAL JOIN vertex WHERE hyperedge_id = "${selectedHyperedge}" AND vertex_id = id`);
    
  results5.forEach(element => {
    if(node_list.indexOf(element.vertex_id) === -1) {
      complete_graph.push({
        data: { 
            id: "vertex" + element.vertex_id + "->" + "hyperedge" + element.hyperedge_id,
            source: "vertex" + element.vertex_id,
            target: "hyperedge" + element.hyperedge_id
        },
        classes: ["flat_edge"]
      })
      node_list.push("vertex" + element.vertex_id + "->" + "hyperedge" + element.hyperedge_id)
      
      complete_graph.push({
        data: { 
          id: "vertex" + element.vertex_id,
          label: element.noun_phrase,
          backgroundColor: simpleVertexColor,
        },
        classes: ["noun_vertex"]
      })
      node_list.push("vertex" + element.vertex_id);

      complete_graph.concat(find_nodes_from_vertex(element.noun_phrase, left_hop-1, complete_graph, node_list));
      complete_graph.filter((item, pos) => complete_graph.indexOf(item) === pos);
    }
  });
  return complete_graph;
}

// root vertex가 noun vertex인 경우
const find_nodes_from_vertex = (root_vertex, left_hop, complete_graph, node_list) => {
  if(left_hop <= 0)
    return complete_graph;
  
  // 기준이 되는 node 설정
  const results = connection.query(`SELECT * FROM vertex WHERE noun_phrase = "${root_vertex}"`);

  const selectedvertex = results[0].id;

  // vertex와 연결된 다른 pseudo vertex 찾기
  const results2 = connection.query(`SELECT * FROM hyperedge_vertex NATURAL JOIN hyperedge WHERE vertex_id = "${selectedvertex}" AND id = hyperedge_id`);

  complete_graph.push({
    data: { 
      id: "vertex" + selectedvertex,
      label: root_vertex,
      backgroundColor: simpleVertexColor,
    },
    classes: ["noun_vertex"]
  })

  node_list.push("vertex" + selectedvertex);

  // selected vertex와 연결된 pseudo vertex들 합치기
  results2.forEach((element) => {
    // 이미 들어간 node들은 중복 하지 않는다.
    if(node_list.indexOf(element.hyperedge_id) === -1) {
      complete_graph.push({
        data: { 
            id: "vertex" + selectedvertex + "->" + "hyperedge" + element.hyperedge_id,
            source: "vertex" + selectedvertex,
            target: "hyperedge" + element.hyperedge_id
        },
        classes: ["flat_edge"]
      })
      node_list.push("vertex" + selectedvertex + "->" + "hyperedge" + element.hyperedge_id);

      // 해당 pseudo vertex와 hyperedge 추가
      complete_graph.push({
        data: { 
          id: "hyperedge" + element.hyperedge_id,
          label: element.predicate_phrase,
          backgroundColor: predicateColor
        },
        classes: ["predicate_vertex"]
      })
      node_list.push("hyperedge" + element.hyperedge_id);
    
      complete_graph.push({
        data: {
          id: "pseudo_vertex" + element.hyperedge_id,
          label: "",
          backgroundColor: pseudoVertexColor
        },
        classes: ["pseudo_vertex"]
      })
      node_list.push("pseudo_vertex" + element.hyperedge_id);
    
      complete_graph.push({
        data: { 
            id: "hyperedge" + element.hyperedge_id + "->" + "pseudo_vertex" + element.hyperedge_id,
            source: "hyperedge" + element.hyperedge_id,
            target: "pseudo_vertex" + element.hyperedge_id
        },
        classes: ["arrow_edge"]
      })
      node_list.push("hyperedge" + element.hyperedge_id + "->" + "pseudo_vertex" + element.hyperedge_id);
  
      complete_graph.concat(find_nodes_from_hyperedge(element.predicate_phrase, left_hop-1, complete_graph, node_list));
      complete_graph.filter((item, pos) => complete_graph.indexOf(item) === pos);
    }
  });

  return complete_graph;
}