import { AmiTemplateStringEditor } from "./main.js";
import { parser } from "./parser.js";
const te = new AmiTemplateStringEditor({
    initialText: "Advertisement of the",
    targetNode: document.getElementById("codemirror"),
});
te.vars = [
    {
        name: "merk",
        explanation: "Auto merk",
    },
    {
        name: "model",
        explanation: "Auto model",
    },
    {
        name: "modeljaar",
        explanation: "Model jaar",
    },
    {
        name: "modelversie",
        explanation: "Auto versie",
    },
    {
        name: "configuratie",
        explanation: "Auto configuratie",
    },
    {
        name: "uitvoering",
        explanation: "Auto grade",
    },
];
const t = parser.parse('{who} did {what}');
t.cursor().iterate((node) => {
    console.log('node:enter', node);
    console.log('node', node.node);
    console.log('name', node.name);
    console.log('type', node.type);
}, (node) => {
    console.log('node:leave', node);
});
