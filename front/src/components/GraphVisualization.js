import React from "react";
import Cytoscape from "cytoscape";
import ReactCytoscape from "react-cytoscapejs";
import COSEBilkent from "cytoscape-cose-bilkent";
import nodeSVG from "../assets/node.svg";
import { company, companyEdges, tradingPartners } from "./api";
import { sampleData } from "./sampleData";
import popper from 'cytoscape-popper';

const styleSheet = [
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
  {
    selector: ".simple_vertex",
    style: {
      "background-color": "data(backgroundColor)",
    }
  },
  {
    selector: "edge",
    style: {
      "width": 3,
      "curve-style": "bezier",
      "source-arrow-shape": "triangle",
      "source-arrow-color": "#0",
      "target-arrow-shape": "triangle",
      "target-arrow-color": "#0",
      label: "EDGE"
    }
  }
];

Cytoscape.use(COSEBilkent);
Cytoscape.use(popper);

export default function CytoscapeScreen() {
  const elements = [];
  const companyElement = {
    data: {
      id: company.altana_canon_id,
      label: company.company_name
    }
  };

  const tradingPartnerElements = tradingPartners.companies.reduce(
    (acc, company) => {
      acc.push({
        data: {
          id: company.altana_canon_id,
          label: company.company_name
        }
      });
      return acc;
    },
    []
  );

  const edgeElements = companyEdges.edges.reduce((acc, edge) => {
    acc.push({
      data: {
        id: edge.edge_canon_id,
        source: edge.exporter_company_canon_id,
        target: edge.importer_company_canon_id
      }
    });
    return acc;
  }, []);

  const compoundNodes = [
    {
      data: {
        id: "low-risk",
        label: "Low Risk"
      }
    },
    {
      data: {
        id: "low-risk-link",
        source: companyElement.data.id,
        target: "low-risk"
      }
    },
    {
      data: {
        id: "low-risk-1",
        parent: "low-risk",
        label: "One"
      }
    },
    {
      data: {
        id: "low-risk-2",
        parent: "low-risk",
        label: "Two"
      }
    },
    {
      data: {
        id: "low-risk-3",
        parent: "low-risk",
        label: "Three"
      }
    },
    {
      data: {
        id: "low-risk-4",
        parent: "low-risk",
        label: "Four"
      }
    },
    {
      data: {
        id: "low-risk-5",
        parent: "low-risk",
        label: "Five"
      }
    },
    
  ];

  elements.push(companyElement);
  elements.push(...tradingPartnerElements);
  elements.push(...edgeElements);
  elements.push(...compoundNodes);
  // elements.push(sampleData);

  return (
    <ReactCytoscape
      elements={sampleData}
      layout={{
        name: "cose-bilkent",
        nodeDimensionsIncludeLabels: true,
        idealEdgeLength: 100
      }}
      style={{ width: "100%", height: "100%" }}
      stylesheet={styleSheet}
      maxZoom = {3}
      minZoom = {0.3}
      wheelSensitivity = {0.1}
      cy={
        (cy) => {
          cy.elements().bind("mouseover", (event) => {
            let tooltipId = `popper-target-${event.target.id()}`;
            let existingTarget = document.getElementById(tooltipId);
            if (existingTarget && existingTarget.length !== 0) {
              existingTarget.remove();
            }
            event.target.popperRefObj = event.target.popper({
            content: () => {
              let tooltip = document.createElement("div");
              tooltip.classList.add("popper-div");
              let table = document.createElement('table');
              tooltip.append(table);
              let targetData = event.target.data();


              for (let prop in targetData) {
                if(prop == "backgroundColor")
                  continue;

                if (!targetData.hasOwnProperty(prop)) continue;
      
                let targetValue = targetData[prop];

                if (typeof targetValue === "object") continue;
      
                let tr = table.insertRow();
      
                let tdTitle = tr.insertCell();
                let tdValue = tr.insertCell();
      
                tdTitle.innerText = prop;
                tdValue.innerText = targetValue;
              }
              document.body.appendChild(tooltip);
              return tooltip;
            },
          })
          cy.elements().unbind("mouseout");
          cy.elements().bind("mouseout", (event) => {
            if (event.target.popper) {
              event.target.popperRefObj.state.elements.popper.remove();
              event.target.popperRefObj.destroy();
            }
          });
          
        })
      }}
    />
  );
}
