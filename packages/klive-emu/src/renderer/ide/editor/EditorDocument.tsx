import * as React from "react";
import { CSSProperties } from "styled-components";
import MonacoEditor from "react-monaco-editor";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import ReactResizeDetector from "react-resize-detector";
import { editorService } from "./editorService";
import {
  DocumentPanelDescriptorBase,
  IDocumentPanel,
} from "../document-area/DocumentFactory";
import { documentService } from "../document-area/DocumentService";
import { themeService } from "../../common-ui/themes/theme-service";
import { ideToEmuMessenger } from "../IdeToEmuMessenger";
import { FileOperationResponse } from "../../../shared/messaging/message-types";

// --- Wait 1000 ms before saving the document being edited
const SAVE_DEBOUNCE = 1000;

/**
 * Component properties
 */
interface Props {
  descriptor: IDocumentPanel;
  sourceCode: string;
  language: string;
}

/**
 * Component state
 */
interface State {
  width: string;
  height: string;
  show: boolean;
}

/**
 * A sample document
 */
export default class EditorDocument extends React.Component<Props, State> {
  private divHost = React.createRef<HTMLDivElement>();
  private _editor: monacoEditor.editor.IStandaloneCodeEditor;
  private _unsavedChangeCounter = 0;
  private _descriptorChanged: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      width: "100%",
      height: "100%",
      show: false,
    };
    this._descriptorChanged = () => this.descriptorChanged();
  }

  editorWillMount(monaco: typeof monacoEditor): void {
    if (
      !monaco.languages
        .getLanguages()
        .some(({ id }) => id === this.props.language)
    ) {
      const languageInfo = documentService.getCustomLanguage(
        this.props.language
      );
      if (languageInfo) {
        // --- Register a new language
        monaco.languages.register({ id: languageInfo.id });

        // --- Register a tokens provider for the language
        monaco.languages.setMonarchTokensProvider(
          languageInfo.id,
          languageInfo.languageDef
        );

        // --- Set the editing configuration for the language
        monaco.languages.setLanguageConfiguration(
          languageInfo.id,
          languageInfo.options
        );

        // --- Define light theme for the language
        if (languageInfo.lightTheme) {
          monaco.editor.defineTheme(`${languageInfo.id}-light`, {
            base: "vs",
            inherit: true,
            rules: languageInfo.lightTheme.rules,
            encodedTokensColors: languageInfo.lightTheme.encodedTokensColors,
            colors: languageInfo.lightTheme.colors,
          });
        }
        // --- Define dark theme for the language
        if (languageInfo.darkTheme) {
          monaco.editor.defineTheme(`${languageInfo.id}-dark`, {
            base: "vs-dark",
            inherit: true,
            rules: languageInfo.darkTheme.rules,
            encodedTokensColors: languageInfo.darkTheme.encodedTokensColors,
            colors: languageInfo.darkTheme.colors,
          });
        }
      }
    }
  }

  editorDidMount(
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) {
    monaco.languages.setMonarchTokensProvider;
    this._editor = editor;
    const state = editorService.loadState(this.props.descriptor.id);
    if (state) {
      this._editor.setValue(state.text);
      this._editor.restoreViewState(state.viewState);
    }
    if (this.props.descriptor.initialFocus) {
      window.requestAnimationFrame(() => this._editor.focus());
    }
  }

  async onChange(
    newValue: string,
    e: monacoEditor.editor.IModelContentChangedEvent
  ) {
    // --- Make the document permanent
    const currentDoc = documentService.getDocumentById(
      this.props.descriptor.id
    );
    if (currentDoc?.temporary) {
      // --- Make this document permanent
      currentDoc.temporary = false;
      documentService.registerDocument(currentDoc, true);
    }

    // --- Save document after the change
    this._unsavedChangeCounter++;
    await new Promise((r) => setTimeout(r, SAVE_DEBOUNCE));
    if (
      this._unsavedChangeCounter === 1 &&
      this._editor?.getModel()?.getValue()
    ) {
      await this.saveDocument(this._editor.getModel().getValue());
    }
    this._unsavedChangeCounter--;
  }

  componentDidMount(): void {
    this.setState({ show: true });
    this.props.descriptor.documentDescriptorChanged.on(this._descriptorChanged);
  }

  async componentWillUnmount(): Promise<void> {
    // --- Dispose event handler
    this.props.descriptor.documentDescriptorChanged.off(this._descriptorChanged);

    // --- Check if this document is still registered
    const docId = this.props.descriptor.id;
    const doc = documentService.getDocumentById(docId);
    if (doc) {
      const text = this._editor.getValue();
      editorService.saveState(this.props.descriptor.id, {
        text: this._editor.getValue(),
        viewState: this._editor.saveViewState(),
      });
      if (this._unsavedChangeCounter > 0) {
        await this.saveDocument(text);
      }
    }
  }

  /**
   * Make the editor focused when the descriptor changes to focused
   */
  descriptorChanged(): void {
    if (this.props.descriptor.initialFocus) {
      window.requestAnimationFrame(() => this._editor.focus());
    }
  }

  render() {
    const placeholderStyle: CSSProperties = {
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      flexShrink: 1,
      width: "100%",
      height: "100%",
      overflow: "hidden",
    };
    const options = {
      selectOnLineNumbers: true,
    };

    const tone = themeService.getActiveTheme().tone;
    const languageInfo = documentService.getCustomLanguage(this.props.language);
    let theme = tone === "light" ? "vs" : "vs-dark";
    if (
      (languageInfo?.lightTheme && tone === "light") ||
      (languageInfo?.darkTheme && tone === "dark")
    ) {
      theme = `${this.props.language}-${tone}`;
    }
    return (
      <>
        <div ref={this.divHost} style={placeholderStyle}>
          {this.state.show && (
            <MonacoEditor
              language={this.props.language}
              theme={theme}
              value={this.props.sourceCode}
              options={options}
              onChange={(value, e) => this.onChange(value, e)}
              editorWillMount={(editor) => this.editorWillMount(editor)}
              editorDidMount={(editor, monaco) =>
                this.editorDidMount(editor, monaco)
              }
            />
          )}
        </div>
        <ReactResizeDetector
          handleWidth
          handleHeight
          onResize={() => {
            this._editor.layout();
          }}
        />
      </>
    );
  }

  async saveDocument(documentText: string): Promise<void> {
    const result = await ideToEmuMessenger.sendMessage<FileOperationResponse>({
      type: "SaveFileContents",
      name: this.props.descriptor.id,
      contents: documentText,
    });
    if (result.error) {
      console.error(result.error);
    }
  }
}

/**
 * Descriptor for the sample side bar panel
 */
export class EditorDocumentPanelDescriptor extends DocumentPanelDescriptorBase {
  constructor(
    id: string,
    title: string,
    public readonly language: string,
    public readonly contents: string
  ) {
    super(id, title);
  }

  /**
   * Creates a node that represents the contents of a side bar panel
   */
  createContentElement(): React.ReactNode {
    return (
      <EditorDocument
        descriptor={this}
        sourceCode={this.contents}
        language={this.language}
      />
    );
  }
}
