import { useState, useEffect, useCallback } from 'react';
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
        if(rawContent){
            let currentRawContent = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
            
            if(rawContent !== currentRawContent){
                console.log("New raw content");
                setEditorState(
                    EditorState.createWithContent(
                        convertFromRaw(JSON.parse(rawContent))
                    )
                );
            }
        }
    }, [rawContent]);

    const onEditorStateChange = (newEditorState) => {
        setEditorState(newEditorState);
        let newContent = newEditorState.getCurrentContent();
        if (editorState.getCurrentContent() !== newContent) {
            console.log("notified");
            onChange(JSON.stringify(convertToRaw(newContent)));
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