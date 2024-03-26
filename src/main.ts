import { EditorView, highlightSpecialChars } from "@codemirror/view";
import {
  autocompletion,
  closeBrackets,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { history } from "@codemirror/commands";
import {
  HighlightStyle,
  LanguageSupport,
  syntaxHighlighting,
  syntaxTree,
} from "@codemirror/language";
import { AmiTemplateLanguage } from "./langauge.js";
import { tags } from "@lezer/highlight";
import { linter } from "@codemirror/lint";

export interface IAmiTemplateStringEditorParams {
  /**
   * Node in which to render editor
   */
  targetNode: HTMLElement;
  initialText: string;
}

/**
 * Editor there, not same as code highlighting
 */
let AmiTheme = EditorView.baseTheme({
  ".cm-content": {
    fontFamily: "Roboto,Helvetica Neue,sans-serif",
  },
  ".cm-tooltip": {
    fontFamily: "Roboto,Helvetica Neue,sans-serif",
  },
  ".ami-var-use": {
    border: "1px solid #badbcc",
    color: "#0f5132",
    backgroundColor: "#d1e7dd",
    borderRadius: "3px",
    margin: "-1px",
  },
  ".cm-lintRange-error .ami-var-use": {
    backgroundColor: "#f8d7da",
    color: "#842029",
    borderColor: "#f5c2c7",
  },
  ".cm-lintRange-error": {
    border: "1px solid #badbcc",
    backgroundColor: "#f8d7da",
    color: "#842029",
    borderColor: "#f5c2c7",
    borderRadius: "3px",
    margin: "-1px",
    backgroundImage: "none!important",
  },
});

/**
 * Code highlighting, not same as editor theme
 */
let AmiHighlighting = HighlightStyle.define([
  {
    tag: tags.variableName,
    class: "ami-var-use",
  },
  {
    tag: tags.literal,
    class: "ami-text",
  },
]);

/**
 * Describes the variable available for the usage in the template string
 */
export interface IAmiTemplateStringVariableDescriptor {
  /**
   * Name of the variable for the template without curly braces
   */
  name: string;
  /**
   * Will appear in the tooltip in autocompletion popup
   */
  explanation: string;
}

export class AmiTemplateStringEditor {
  /**
   * Flag shows if input has errors. Error is unclosed bracket or usage of the variable which is not in the list of allowed ones
   */
  public hasErrors: boolean = false;

  private _cachedText: string = "";

  private _linter = linter(
    (view) => {
      const state = view.state;
      const tree = syntaxTree(state);
      // Don't validate empty doc
      if (this.text.length === 0) {
        return [];
      }
      if (tree.length === state.doc.length) {
        /**
         * Validation will stop at the syntax error and will treat everything till the end of the document as error
         */
        let hasSyntaxError = false;
        let errors: {
          text: string;
          from: number;
          to: number;
        }[] = [];
        let errorPos: number | null = null;
        tree.iterate({
          enter: (syntaxNodeRef) => {
            if (hasSyntaxError) {
              return;
            }
            const treeNode = syntaxNodeRef.node;
            if (treeNode.type.name === "VariableUse") {
              const variableUse = this.text.slice(treeNode.from, treeNode.to);
              if (!this.isVariableUseValid(variableUse)) {
                errors.push({
                  from: treeNode.node.from,
                  to: treeNode.node.to,
                  text: `Variable "${this.getVariableNameFromTheUse(variableUse)}" does not exist`,
                });
              }
            } else if (syntaxNodeRef.type.isError) {
              errorPos = syntaxNodeRef.from;
              errors.push({
                from: errorPos,
                to: state.doc.length,
                text: "Syntax error",
              });
              hasSyntaxError = true;
            }
          },
        });
        const lintingSuggestions = errors.map((err) => {
          return {
            from: err.from,
            to: err.to,
            severity: "error",
            message: err.text,
          } as any; // I have to use any in order to overcome types incompatibility, as needed simple type of the Severity is not exported
        });
        return lintingSuggestions;
      }
      return [];
    },
    {
      delay: 0,
    },
  );

  public get text(): string {
    return this._cachedText;
  }

  public set text(newText: string) {
    this.editorView.dispatch(
      this.editorView.state.update({
        changes: {
          from: 0,
          to: this.editorView.state.doc.length,
          insert: newText,
        },
      }),
    );
  }

  /**
   * Returns all known completions
   */
  public get vars(): IAmiTemplateStringVariableDescriptor[] {
    return this.currentVars;
  }

  /**
   * Replaces all vars with ones assigned to the property
   * @param vars
   */
  public set vars(vars: IAmiTemplateStringVariableDescriptor[]) {
    this.currentVars = vars;
    this.forceLinting();
  }

  public onTextChange(callback: (str: string) => void) {
    // First callback added, then add callback to the editor
    this.textChangeCallbacks.push(callback);
  }

  /**
   * Unsubscribe even listener by reference
   * @param callback
   */
  public offTextChange(callback: Function) {
    this.textChangeCallbacks = this.textChangeCallbacks.filter((cb) => {
      return cb !== callback;
    });
  }

  public destroy() {
    this.editorView.destroy();
    this.textChangeCallbacks = [];
  }

  private isVariableUseValid(variableUseStr: string): boolean {
    const variableName = this.getVariableNameFromTheUse(variableUseStr);
    return this.vars.some((v) => {
      return v.name === variableName;
    });
  }

  private getVariableNameFromTheUse(variableUse: string): string {
    return variableUse.replace("}", "").replace("{", "").trim();
  }

  private editorView: EditorView;
  /**
   * List of completions which editor will use for autocompleting
   */
  private currentVars: IAmiTemplateStringVariableDescriptor[] = [];

  private textChangeCallbacks: Array<(str: string) => void> = [
    () => {
      this._cachedText = this.editorView.state.doc.toString();
    },
  ];

  /**
   * Holds logic for showing autocompletion options and applying them to the editor
   */
  private getAutocompleteOptions(
    context: CompletionContext,
  ): CompletionResult | null {
    const autocompleteMatch = context.matchBefore(/\{\s*\S*/);
    if (autocompleteMatch) {
      const nextBracketIndex = this.text.indexOf("}", autocompleteMatch.from);
      return {
        from: autocompleteMatch.from + 1,
        to: nextBracketIndex === -1 ? undefined : nextBracketIndex,
        options: this.currentVars.map((varDescriptor) => {
          return {
            label: varDescriptor.name,
            info: varDescriptor.explanation,
          };
        }),
      };
    } else {
      return null;
    }
  }

  private getLinter() {
    return;
  }

  private forceLinting() {
    this.text = this.text;
  }

  constructor(params: IAmiTemplateStringEditorParams) {
    const initialText = params.initialText || "";
    this._cachedText = initialText;
    this.editorView = new EditorView({
      doc: initialText,
      extensions: [
        history(),
        new LanguageSupport(AmiTemplateLanguage),
        highlightSpecialChars(),
        AmiTheme,
        this._linter,
        syntaxHighlighting(AmiHighlighting, { fallback: true }),
        autocompletion({
          override: [this.getAutocompleteOptions.bind(this)],
          activateOnTyping: true,
        }),
        EditorView.updateListener.of((viewUpdate) => {
          if (viewUpdate.docChanged) {
            const currentNewText = this.text;
            for (let i = 0; i < this.textChangeCallbacks.length; i += 1) {
              try {
                this.textChangeCallbacks[i](currentNewText);
              } catch (err) {
                console.log(
                  `Got error while processing callback registered with onTextChange`,
                );
                console.error(err);
              }
            }
          }
        }),
        closeBrackets(),
      ],
      parent: document.body,
    });
  }
}
