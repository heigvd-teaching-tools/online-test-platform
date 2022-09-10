import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useDebouncedCallback } from 'use-debounce';

const Editor = dynamic(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor), 
    { ssr: false }
);

const ContentEditor = ({ readOnly = false, content, onChange }) => {
    const [ editorState, setEditorState ] = useState();
    const [ lastNotifiedContent, setLastNotifiedContent ] = useState();

    useEffect(() => {
        if(!editorState){
            let initalState = content ? EditorState.createWithContent(convertFromRaw(JSON.parse(content))) : EditorState.createEmpty();
            setEditorState(initalState);
            setLastNotifiedContent(initalState.getCurrentContent());

        }
    }, [content, editorState]);

    const onEditorStateChange = (newEditorState) => {
        setEditorState(newEditorState);
        controlAndNotifyStateChange(newEditorState);
    }

    const controlAndNotifyStateChange = useDebouncedCallback(useCallback((newEditorState) => {
        /*  
            heavy operation that must be debounced to be done once 500ms after the typing ends
            the last notified content must be stored
        */
        const newContent = newEditorState.getCurrentContent();

        if (lastNotifiedContent !== newContent) {
            onChange(JSON.stringify(convertToRaw(newContent)));
            setLastNotifiedContent(newContent);
        }
    }, [lastNotifiedContent, onChange]), 500);

    return (
        <Editor
            readOnly={readOnly}
            editorState={editorState}
            onEditorStateChange={onEditorStateChange}
        />
    )
}

export default ContentEditor;