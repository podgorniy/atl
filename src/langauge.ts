import { LRLanguage } from "@codemirror/language";
import { parser } from "./parser.js";
import { styleTags, tags } from "@lezer/highlight";

export const AmiTemplateLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        VariableUse: tags.operator,
        VariableName: tags.variableName,
      }),
    ],
  }),
  languageData: {},
});
