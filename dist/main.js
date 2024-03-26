var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EditorView, highlightActiveLine, highlightSpecialChars, } from "@codemirror/view";
import { autocompletion, closeBrackets, } from "@codemirror/autocomplete";
import { history } from "@codemirror/commands";
import { defaultHighlightStyle, LanguageSupport, syntaxHighlighting } from "@codemirror/language";
import { AmiTemplateLanguage } from "./langauge.js";
export class AmiTemplateStringEditor {
    get text() {
        return this.editorView.state.doc.toString();
    }
    set text(newText) {
        this.editorView.dispatch(this.editorView.state.update({
            changes: {
                from: 0,
                to: this.editorView.state.doc.length,
                insert: newText,
            },
        }));
    }
    /**
     * Returns all known completions
     */
    get vars() {
        return this.currentVars;
    }
    /**
     * Replaces all vars with ones assigned to the property
     * @param vars
     */
    set vars(vars) {
        this.currentVars = vars;
    }
    onTextChange(callback) {
        // First callback added, then add callback to the editor
        this.textChangeCallbacks.push(callback);
    }
    /**
     * Unsubscribe even listener by reference
     * @param callback
     */
    offTextChange(callback) {
        this.textChangeCallbacks = this.textChangeCallbacks.filter((cb) => {
            return cb !== callback;
        });
    }
    destroy() {
        this.editorView.destroy();
        this.textChangeCallbacks = [];
    }
    /**
     * Holds logic for showing autocompletion options and applying them to the editor
     */
    getAutocompleteOptions(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const autocompleteMatch = context.matchBefore(/\{\s*\S*/);
            if (autocompleteMatch) {
                const autocompleteStartPoint = autocompleteMatch.from;
                return {
                    from: autocompleteMatch.from + 1,
                    options: this.currentVars.map((varDescriptor) => {
                        return {
                            label: varDescriptor.name,
                            info: varDescriptor.explanation,
                        };
                    }),
                };
            }
            else {
                return null;
            }
        });
    }
    constructor(params) {
        /**
         * List of completions which editor will use for autocompleting
         */
        this.currentVars = [];
        this.textChangeCallbacks = [];
        this.editorView = new EditorView({
            doc: params.initialText || "",
            extensions: [
                closeBrackets(),
                history(),
                new LanguageSupport(AmiTemplateLanguage),
                highlightSpecialChars(),
                highlightActiveLine(),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
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
                            }
                            catch (err) {
                                console.log(`Got error while processing callback registered with onTextChange`);
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
