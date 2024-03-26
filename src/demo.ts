import {AmiTemplateStringEditor, IAmiTemplateStringVariableDescriptor} from "./main.js";

const dutchVars: IAmiTemplateStringVariableDescriptor[] = [
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

const englishVars: IAmiTemplateStringVariableDescriptor[] = [
  {
    name: "brand",
    explanation: "Car brand",
  },
  {
    name: "model",
    explanation: "Car model",
  },
  {
    name: "modelyear",
    explanation: "Carmodel year, a number",
  },
  {
    name: "modelversion",
    explanation: "Carmodel version",
  },
  {
    name: "configuration",
    explanation: "Car configuration",
  },
  {
    name: "grade",
    explanation: "Car grade",
  },
];

const te = new AmiTemplateStringEditor({
  initialText: "This is carstock of {type} with feature { catstock feature}",
  targetNode: document.getElementById("codemirror")!,
});

te.vars = dutchVars;
// @ts-ignore
window["te"] = te;


document.getElementById("nl")!.addEventListener("click", () => {
  te.vars = dutchVars;
});

document.getElementById("en")!.addEventListener("click", () => {
  te.vars = englishVars;
});

// const t = parser.parse('{who} did {what}')
// t.cursor().iterate((node) => {
//     console.log('node:enter', node)
//     console.log('node', node.node)
//     console.log('name', node.name)
//     console.log('type', node.type)
// }, (node) => {
//     console.log('node:leave', node)
// })
