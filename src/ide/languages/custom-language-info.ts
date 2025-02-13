import { CustomLanguageInfo } from "@abstractions/document-service";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";

/**
 * Represents information about a custom language that uses the 
 * Monaco Editor type system
 */
export interface MonacoAwareCustomLanguageInfo extends CustomLanguageInfo {
  id: string;
  options?: monacoEditor.languages.LanguageConfiguration;
  languageDef?: monacoEditor.languages.IMonarchLanguage;
  lightTheme?: EditorThemeBody;
  darkTheme?: EditorThemeBody;
  supportsBreakpoints?: boolean;
};

/**
 * Describes the body of an code editor related theme
 */
type EditorThemeBody = {
  rules: monacoEditor.editor.ITokenThemeRule[];
  encodedTokensColors?: string[];
  colors: monacoEditor.editor.IColors;
};
