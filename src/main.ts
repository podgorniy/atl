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
} from "@codemirror/language";
import { AmiTemplateLanguage } from "./langauge.js";
import { tags } from "@lezer/highlight";

export interface IAmiTemplateStringEditorParams {
  /**
   * Node in which to render editor
   */
  targetNode: HTMLElement;
  initialText: string;
}

let AmiTheme = EditorView.baseTheme({
  ".cm-content": {
    fontFamily: "Roboto,Helvetica Neue,sans-serif",
  },
  ".ami-var-use": {
    border: "1px solid #b6effb",
    color: "#055160",
    backgroundColor: "#cff4fc",
    borderRadius: "3px",
    margin: "-1px",
  },
});

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
  public get text(): string {
    return this.editorView.state.doc.toString();
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

  private editorView: EditorView;
  /**
   * List of completions which editor will use for autocompleting
   */
  private currentVars: IAmiTemplateStringVariableDescriptor[] = [];

  private textChangeCallbacks: Array<(str: string) => void> = [];

  /**
   * Holds logic for showing autocompletion options and applying them to the editor
   */
  private async getAutocompleteOptions(
    context: CompletionContext,
  ): Promise<CompletionResult | null> {
    const autocompleteMatch = context.matchBefore(/\{\s*\S*/);
    if (autocompleteMatch) {
      return {
        from: autocompleteMatch.from + 1,
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

  constructor(params: IAmiTemplateStringEditorParams) {
    this.editorView = new EditorView({
      doc: params.initialText || "",
      extensions: [
        closeBrackets(),
        history(),
        new LanguageSupport(AmiTemplateLanguage),
        highlightSpecialChars(),
        AmiTheme,
        syntaxHighlighting(AmiHighlighting, { fallback: true }),
        autocompletion({
          override: [this.getAutocompleteOptions.bind(this)],
          activateOnTyping: true,
        }),
        /**
         * This will call externally-provided callback when text value of the editor changes
         */
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
      ],
      parent: document.body,
    });
  }
}

// debugging
export const atl = AmiTemplateLanguage;
