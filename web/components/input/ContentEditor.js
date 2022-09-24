import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const Editor = dynamic(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor), 
    { ssr: false }
);

const ContentEditor = ({ readOnly = false, rawContent, onChange }) => {
    const [ editorState, setEditorState ] = useState(EditorState.createEmpty());
    
    useEffect(() => {        
        let currentRawContent = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        if(rawContent !== currentRawContent){
            setEditorState(
                EditorState.createWithContent(
                    rawContent ? convertFromRaw(JSON.parse(rawContent)) : EditorState.createEmpty().getCurrentContent()
                )
            );
        }
    }, [rawContent]);

    const onEditorStateChange = (newEditorState) => {
        setEditorState(newEditorState);
        let newContent = newEditorState.getCurrentContent();
        if (editorState.getCurrentContent() !== newContent) {
            onChange(newContent.hasText() ? JSON.stringify(convertToRaw(newContent)) : undefined);
        }
    }

    return (
        <Editor
            readOnly={readOnly}
            editorState={editorState}
            onEditorStateChange={onEditorStateChange}
        />
    )
}

export default ContentEditor;