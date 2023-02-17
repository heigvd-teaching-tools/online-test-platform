import InlineMonacoEditor from "./InlineMonacoEditor";

const ContentEditor = ({ readOnly = false, language = "markdown", rawContent, onChange }) =>
        <InlineMonacoEditor
            code={rawContent}
            language={language}
            readOnly={readOnly}
            onChange={onChange}
        />

export default ContentEditor;
