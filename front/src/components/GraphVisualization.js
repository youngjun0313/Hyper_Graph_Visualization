import React, { useEffect, useState } from "react";
import Cytoscape from "cytoscape";
import ReactCytoscape from "react-cytoscapejs";
import COSEBilkent from "cytoscape-cose-bilkent";
import dagre from 'cytoscape-dagre';
import popper from 'cytoscape-popper';
import axios from 'axios';
import { styleSheet } from "../assets/graphStyleSheet";

Cytoscape.use(COSEBilkent);
Cytoscape.use(dagre);
Cytoscape.use(popper);

export default function CytoscapeScreen({ vertices, setVertices }) {
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
      minZoom = {0.1}
      wheelSensitivity = {0.1}
      cy = {
        (cy) => {
          cy.layout({
            // name: "dagre",
            name: "cose-bilkent",
            // name: "elk",
            nodeDimensionsIncludeLabels: true,
            idealEdgeLength: 100
          }).run();
          
          cy.elements().unbind("mouseover");
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
            }
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