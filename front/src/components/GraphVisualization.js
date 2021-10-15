import React, { useEffect, useState } from "react";
import Cytoscape from "cytoscape";
import ReactCytoscape from "react-cytoscapejs";
import COSEBilkent from "cytoscape-cose-bilkent";
import { sampleData } from "./sampleData";
import popper from 'cytoscape-popper';
import axios from 'axios';

const styleSheet = [
  // default node style
  {
    selector: "node",
    style: {
      height: 60,
      width: 60,
      label: "data(label)",
      "color": "white",
      "background-color": "data(backgroundColor)",
      "text-halign": "center",
      "text-valign": "center",
      "font-size": 8,
      "text-wrap": "wrap",
      "text-max-width": 50
    }
  },
  // noun_vertex class
  {
    selector: ".noun_vertex",
    style: {
      "background-color": "data(backgroundColor)",
    }
  },
  // predicate_vertex class
  {
    selector: ".predicate_vertex",
    style: {
      "background-color": "data(backgroundColor)",
      color: "black"
    }
  },
  // pseudo_vertex class
  {
    selector: ".pseudo_vertex",
    style: {
      "background-color": "data(backgroundColor)",
      height: 15,
      width: 15,
    }
  },
  // default edge style
  {
    selector: "edge",
    style: {
      width: 3,
    }
  },
  // flat_edge class
  {
    selector: ".flat_edge",
    style: {
      "width": 3,
      "line-color": "#ccc",
    }
  },
  // arrow_edge class
  {
    selector: ".arrow_edge",
    style: {
      width: 3,
      "curve-style": "bezier",
      "line-color": "#ccc",
      "target-arrow-shape": "triangle",
      "target-arrow-color": "#0",
    }
  },
];

Cytoscape.use(COSEBilkent);
Cytoscape.use(popper);

export default function CytoscapeScreen() {
  const [vertices, setVertices] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    // noun vertices
    axios.get("/api/vertices").then((response) => {
      var temp = [...vertices, ...response.data];
        // hyperedges and pseudo vertices
      axios.get("/api/hyperedges").then((response) => {
        // edges
        temp = [...temp, ...response.data];
        axios.get("/api/edges").then((response) => {
          // pseudo edges (pseudo vertex -> hyperedge)
          temp = [...temp, ...response.data];
          axios.get("/api/pseudoEdges").then((response) => {
            temp = [...temp, ...response.data];
            setVertices(temp);
          })
        })
      })
      console.log(temp);
    });
  }, []);

  return (
    <ReactCytoscape
      elements={vertices}
      style={{ width: "100%", height: "100%" }}
      stylesheet={styleSheet}
      maxZoom = {2}
      minZoom = {0.5}
      wheelSensitivity = {0.1}
      cy={
        (cy) => {
          cy.layout({
            name: "cose-bilkent",
            nodeDimensionsIncludeLabels: true,
            idealEdgeLength: 100
          }).run();
          
          cy.elements().bind("mouseover", (event) => {
            let tooltipId = `popper-target-${event.target.id()}`;
            let existingTarget = document.getElementById(tooltipId);
            if (existingTarget && existingTarget.length !== 0) {
              existingTarget.remove();
            }
            event.target.popperRefObj = event.target.popper({
            content: () => {
              let tooltip = document.createElement("div");
              if(event.target.data().id.indexOf("-") === -1) {
              tooltip.classList.add("popper-div");
              let table = document.createElement('table');
              tooltip.append(table);
              let targetData = event.target.data();

              // if(event.target.data().id.indexOf("-") === -1) {
                for (let prop in targetData) {
                  if(prop === "backgroundColor") continue;
  
                  if(!targetData.hasOwnProperty(prop)) continue;
        
                  let targetValue = targetData[prop];
                  // let targetValue = targetData.id
  
                  if(typeof targetValue === "object") continue;
        
                  let tr = table.insertRow();
        
                  let tdTitle = tr.insertCell();
                  let tdValue = tr.insertCell();
        
                  tdTitle.innerText = prop;
                  tdValue.innerText = targetValue;
                }
              }
              document.body.appendChild(tooltip);
              return tooltip;
            },
          })
        })
        cy.elements().unbind("mouseout");
        cy.elements().bind("mouseout", (event) => {
          if (event.target.popper) {
            event.target.popperRefObj.state.elements.popper.remove();
            event.target.popperRefObj.destroy();
          }
        });
      }}
    />
  );
}
