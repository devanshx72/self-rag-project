// Layout configuration for the Self-RAG React Flow Graph
import { Node, Edge, MarkerType } from "reactflow";
import { NodeStatus } from "@/types";

export interface GraphNodeDefinition {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
}

export const INITIAL_NODES: Node[] = [
  {
    id: "decide_retrieval",
    type: "customNode",
    position: { x: 350, y: 50 },
    data: { label: "Need Retrieval?", nodeId: "decide_retrieval", status: "waiting" },
  },
  {
    id: "generate_direct",
    type: "customNode",
    position: { x: 80, y: 230 },
    data: { label: "Generate Direct Answer", nodeId: "generate_direct", status: "waiting" },
  },
  {
    id: "retrieve",
    type: "customNode",
    position: { x: 620, y: 230 },
    data: { label: "Retrieve Documents", nodeId: "retrieve", status: "waiting" },
  },
  {
    id: "grade_documents",
    type: "customNode",
    position: { x: 620, y: 410 },
    data: { label: "Grade Documents", nodeId: "grade_documents", status: "waiting" },
  },
  {
    id: "no_answer",
    type: "customNode",
    position: { x: 350, y: 590 },
    data: { label: "No Answer Found", nodeId: "no_answer", status: "waiting" },
  },
  {
    id: "generate_from_context",
    type: "customNode",
    position: { x: 620, y: 590 },
    data: { label: "Generate Answer", nodeId: "generate_from_context", status: "waiting" },
  },
  {
    id: "verify_groundedness",
    type: "customNode",
    position: { x: 620, y: 770 },
    data: { label: "Grounded?", nodeId: "verify_groundedness", status: "waiting" },
  },
  {
    id: "revise_answer",
    type: "customNode",
    position: { x: 1060, y: 770 },
    data: { label: "Revise Answer", nodeId: "revise_answer", status: "waiting" },
  },
  {
    id: "verify_usefulness",
    type: "customNode",
    position: { x: 620, y: 950 },
    data: { label: "Useful?", nodeId: "verify_usefulness", status: "waiting" },
  },
];

const arrow = (color: string) => ({
  type: MarkerType.ArrowClosed,
  color,
  width: 16,
  height: 16,
});

const labelStyle = (color: string, offsetY?: number) => ({
  labelStyle: {
    fill: color,
    fontWeight: 600,
    fontSize: 11,
    fontFamily: "monospace",
    transform: offsetY ? `translateY(${offsetY}px)` : undefined,
  },
  labelBgStyle: {
    fill: "#121518",
    fillOpacity: 0.95,
    stroke: "#1e242b",
    transform: offsetY ? `translateY(${offsetY}px)` : undefined,
  },
  labelBgPadding: [6, 4] as [number, number],
  labelBgBorderRadius: 6,
});

export const INITIAL_EDGES: Edge[] = [
  {
    id: "e-decide-direct",
    source: "decide_retrieval",
    target: "generate_direct",
    sourceHandle: "left-source",
    targetHandle: "top-target",
    type: "smoothstep",
    pathOptions: { borderRadius: 8 },
    label: "No",
    markerEnd: arrow("#94a3b8"),
    style: { stroke: "#334155", strokeWidth: 1.5 },
    ...labelStyle("#94a3b8"),
  },
  {
    id: "e-decide-retrieve",
    source: "decide_retrieval",
    target: "retrieve",
    sourceHandle: "right-source",
    targetHandle: "top-target",
    type: "smoothstep",
    pathOptions: { borderRadius: 8 },
    label: "Yes",
    markerEnd: arrow("#00e599"),
    style: { stroke: "#00e599", strokeWidth: 1.5 },
    ...labelStyle("#00e599"),
  },
  {
    id: "e-retrieve-grade",
    source: "retrieve",
    target: "grade_documents",
    sourceHandle: "bottom-source",
    targetHandle: "top-target",
    type: "smoothstep",
    pathOptions: { borderRadius: 8 },
    markerEnd: arrow("#00e599"),
    style: { stroke: "#00e599", strokeWidth: 1.5 },
  },
  {
    id: "e-grade-noanswer",
    source: "grade_documents",
    target: "no_answer",
    sourceHandle: "bottom-source",
    targetHandle: "top-target",
    type: "smoothstep",
    pathOptions: { borderRadius: 8 },
    label: "No relevant docs",
    markerEnd: arrow("#f43f5e"),
    style: { stroke: "#f43f5e", strokeWidth: 1.5 },
    ...labelStyle("#f43f5e"),
  },
  {
    id: "e-grade-generate",
    source: "grade_documents",
    target: "generate_from_context",
    sourceHandle: "bottom-source",
    targetHandle: "top-target",
    type: "smoothstep",
    pathOptions: { borderRadius: 8 },
    label: "Has relevant docs",
    markerEnd: arrow("#00e599"),
    style: { stroke: "#00e599", strokeWidth: 1.5 },
    ...labelStyle("#00e599"),
  },
  {
    id: "e-generate-grounded",
    source: "generate_from_context",
    target: "verify_groundedness",
    sourceHandle: "bottom-source",
    targetHandle: "top-target",
    type: "smoothstep",
    pathOptions: { borderRadius: 8 },
    markerEnd: arrow("#00e599"),
    style: { stroke: "#00e599", strokeWidth: 1.5 },
  },
  {
    // horizontal, upper lane (top: 35%)
    id: "e-grounded-revise",
    source: "verify_groundedness",
    target: "revise_answer",
    sourceHandle: "right-source",
    targetHandle: "left-target",
    type: "smoothstep",
    pathOptions: { borderRadius: 8 },
    label: "Not supported",
    markerEnd: arrow("#f43f5e"),
    style: { stroke: "#f43f5e", strokeWidth: 1.5 },
    ...labelStyle("#f43f5e", -8),
  },
  {
    // horizontal, lower lane (top: 65%) — offset from the edge above so it doesn't overlap
    id: "e-revise-grounded",
    source: "revise_answer",
    target: "verify_groundedness",
    sourceHandle: "left-source",
    targetHandle: "right-target",
    type: "smoothstep",
    pathOptions: { borderRadius: 8 },
    label: "Retry",
    markerEnd: arrow("#f59e0b"),
    style: { stroke: "#f59e0b", strokeWidth: 1.5 },
    ...labelStyle("#f59e0b", 8),
  },
  {
    id: "e-grounded-useful",
    source: "verify_groundedness",
    target: "verify_usefulness",
    sourceHandle: "bottom-source",
    targetHandle: "top-target",
    type: "smoothstep",
    pathOptions: { borderRadius: 8 },
    label: "Supported",
    markerEnd: arrow("#00e599"),
    style: { stroke: "#00e599", strokeWidth: 1.5 },
    ...labelStyle("#00e599"),
  },
  {
    id: "e-useful-noanswer",
    source: "verify_usefulness",
    target: "no_answer",
    sourceHandle: "left-source",
    targetHandle: "bottom-target",
    type: "smoothstep",
    pathOptions: { borderRadius: 12 },
    label: "Not useful",
    markerEnd: arrow("#f43f5e"),
    style: { stroke: "#f43f5e", strokeWidth: 1.5 },
    ...labelStyle("#f43f5e"),
  },
];
