import React from "react";
import Cytoscape from "cytoscape";
import ReactCytoscape from "react-cytoscapejs";
import COSEBilkent from "cytoscape-cose-bilkent";
import nodeSVG from "../assets/node.svg";
import { company, companyEdges, tradingPartners } from "./api";
import { sampleData } from "./sampleData";

const styleSheet = [
  {
    selector: "node",
    style: {
      height: 60,
      width: 60,
      label: "data(label)",
      "color": "white",
      "background-color": "data(color)",
      "text-halign": "center",
      "text-valign": "center",
      "font-size": 8,
      "text-wrap": "wrap",
      "text-max-width": 50
    }
  },
  {
    selector: ".noun_vertex",
    style: {
      "background-color": "black"
    }
  },
  {
    selector: "node node",
    style: {
      "z-compound-depth": "top"
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
    />
  );
}
