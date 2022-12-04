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

const ContentLoaderPlugin = ({ id, rawContent }) => {
    const [ editor ] = useLexicalComposerContext();
    useEffect(() => {
        // compare raw content to editor state before update
        const editorState = JSON.stringify(editor.getEditorState().toJSON());
        if(editorState !== rawContent){
            let newEditorState = editor.parseEditorState(rawContent || emptyStateContent);
            editor.setEditorState(newEditorState)
        }
    } ,  [id, editor, rawContent]);
    return null;
};

const StrictOnChangePlugin = ({ id, onChange }) => {

    const [ editor ] = useLexicalComposerContext();

    const [ prevContent, setPrevContent ] = useState(null);
    const [ prevId, setPrevId ] = useState(null);

    useEffect(() => setPrevContent(null), [id, editor]);

    const onContentChange = (editorState) => {
        const newContent = editorState.toJSON();
        /* DEBUG
        console.log("DIFFERENT", JSON.stringify(prevContent) !== JSON.stringify(newContent));
        console.log("PREV",  JSON.stringify(prevContent), prevId);
        console.log("NEW",  JSON.stringify(newContent), id);
        */
        if(id === prevId && JSON.stringify(prevContent) !== JSON.stringify(newContent)){
            setPrevContent(newContent);
            if(onChange) onChange(JSON.stringify(!isEditorEmpty(editorState) ? editorState.toJSON() : undefined));
        }
        if(!prevContent){
            setPrevContent(newContent);
            setPrevId(id);
        }
    }

    return <OnChangePlugin ignoreInitialChange ignoreSelectionChange onChange={onContentChange} />;
}

const isEditorEmpty = (editorState) => {
    let jsonState = editorState.toJSON();
    return jsonState.root.children.length === 1 && jsonState.root.children[0].children.length === 0;
}

const ContentEditor = ({ id = "content-editor", readOnly = false, rawContent, onChange }) => {
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
                        <CodeHighlightPlugin />
                        <ListPlugin />
                        <LinkPlugin />
                        <AutoLinkPlugin />
                        <StrictOnChangePlugin id={id} onChange={onChange} />
                        <ListMaxIndentLevelPlugin maxDepth={7} />
                        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                        </>
                    )}
                    <ContentLoaderPlugin id={id} rawContent={rawContent} />
                </div>
            </div>
        </LexicalComposer>
    )
}

export default ContentEditor;