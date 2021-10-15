export const styleSheet = [
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
      color: "black",
      height: 45,
      width: 45,
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
