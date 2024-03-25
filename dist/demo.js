import { AmiTemplateStringEditor } from "./main.js";
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
