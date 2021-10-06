const simpleVertexColor = "black";
const pseudoVertexColor = "red";
const predicateColor = "white";

export const sampleData = [
    // Simple vertex의 형태
    {
        data: {
            id: "node1",
            label: "국정조사",
            backgroundColor: simpleVertexColor
        },
        classes: ["noun_vertex"]
    },
    {
        data: {
            id: "node2",
            label: "4대강",
            backgroundColor: simpleVertexColor
        },
        classes: ["noun_vertex"]
    },
    // predicate vertex의 형태 (hyperedge)
    {
        data: {
            id: "node3",
            label: "대하",
            backgroundColor: predicateColor
        },
        classes: ["predicate_vertex"]
    },
    // pseudo vertex의 형태
    {
        data: {
            id: "node4",
            label: "",
            backgroundColor: pseudoVertexColor
        },
        classes: ["pseudo_vertex"]
    },
    // flat edge의 형태: predicate와 이을 때 사용
    {
        data: { 
            id: "edge_node1->node3", 
            source: "node1", 
            target: "node3" 
        },
        classes: ["flat_edge"]
    },
    {
        data: { 
            id: "node2->node3", 
            source: "node2", 
            target: "node3" 
        },
        classes: ["flat_edge"]
    },
    // arrow edge의 형태: pesudo vertex에 사용
    {
        data: { 
            id: "node3->node4", 
            source: "node3", 
            target: "node4" 
        },
        classes: ["arrow_edge"]
    },
    

]