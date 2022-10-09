import { useState, useEffect } from 'react';
import ExampleTheme from "./themes/ExampleTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

function Placeholder() {
    return <div className="editor-placeholder"></div>;
}

const editorConfig = {
    // The editor theme
    theme: ExampleTheme,
    // Handling of errors during update
    onError(error) {
        throw error;
    },
    // Any custom nodes go here
    nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode
    ]
};

const emptyStateContent = `{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`;

const ContentLoaderPlugin = ({ rawContent }) => {
    const [ editor ] = useLexicalComposerContext();
    useEffect(() =>  editor.setEditorState(editor.parseEditorState(rawContent || emptyStateContent)),  [rawContent]);
    return null;
};

const isEditorEmpty = (editorState) => {
    let jsonState = editorState.toJSON();
    return jsonState.root.children.length === 1 && jsonState.root.children[0].children.length === 0;
}

const ContentEditor = ({ id, readOnly = false, rawContent, onChange }) => {

    const [ currentEditorState, setCurrentEditorState ] = useState(null);

    const onContentChange = (editorState) => {
        const currentContent = currentEditorState ? currentEditorState.toJSON() : null;
        const newContent = editorState.toJSON();
        if(currentContent && JSON.stringify(currentContent) !== JSON.stringify(newContent)){
            setCurrentEditorState(editorState);
            if(onChange) onChange(JSON.stringify(!isEditorEmpty(editorState) ? editorState.toJSON() : undefined));
        }
        if(!currentContent){
            setCurrentEditorState(editorState);
        }
    }

    return (
        <LexicalComposer initialConfig={{
            ...editorConfig,
            editable: !readOnly
        }}>
            <div className="editor-container">
                {!readOnly && (
                    <ToolbarPlugin />
                )}
                <div className="editor-inner">
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-input" />}
                        placeholder={<Placeholder />}
                    />
                    {!readOnly && (
                        <>
                        <HistoryPlugin />
                        <AutoFocusPlugin />
                        <CodeHighlightPlugin />
                        <ListPlugin />
                        <LinkPlugin />
                        <AutoLinkPlugin />
                        <OnChangePlugin ignoreInitialChange ignoreSelectionChange onChange={onContentChange} />
                        <ListMaxIndentLevelPlugin maxDepth={7} />
                        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                        </>
                    )}
                    <ContentLoaderPlugin readOnly={readOnly} id={id} rawContent={rawContent} />
                </div>
            </div>
        </LexicalComposer>
    )
}

export default ContentEditor;