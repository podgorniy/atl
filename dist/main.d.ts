export interface IAmiTemplateStringEditorParams {
    /**
     * Node in which to render editor
     */
    targetNode: HTMLElement;
    initialText: string;
}
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
export declare class AmiTemplateStringEditor {
    get text(): string;
    set text(newText: string);
    /**
     * Returns all known completions
     */
    get vars(): IAmiTemplateStringVariableDescriptor[];
    /**
     * Replaces all vars with ones assigned to the property
     * @param vars
     */
    set vars(vars: IAmiTemplateStringVariableDescriptor[]);
    onTextChange(callback: (str: string) => void): void;
    /**
     * Unsubscribe even listener by reference
     * @param callback
     */
    offTextChange(callback: Function): void;
    destroy(): void;
    private editorView;
    /**
     * List of completions which editor will use for autocompleting
     */
    private currentVars;
    private textChangeCallbacks;
    /**
     * Holds logic for showing autocompletion options and applying them to the editor
     */
    private getAutocompleteOptions;
    private lint;
    constructor(params: IAmiTemplateStringEditorParams);
}
export declare const atl: import("@codemirror/language").LRLanguage;
//# sourceMappingURL=main.d.ts.map