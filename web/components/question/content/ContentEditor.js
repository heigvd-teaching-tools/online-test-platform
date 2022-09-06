import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const Editor = dynamic(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor), 
    { ssr: false }
);

const ContentEditor = ({ content, onChange }) => {
    const [ editorState, setEditorState ] = useState();

    useEffect(() => {
        setEditorState(content ? EditorState.createWithContent(convertFromRaw(JSON.parse(content))) : EditorState.createEmpty());
    }, [content]);

    const onEditorStateChange = (newEditorState) => {
        setEditorState(newEditorState);
        onChange(JSON.stringify(convertToRaw(editorState.getCurrentContent())));
    }

    return (
        <Editor
            editorState={editorState}
            onEditorStateChange={onEditorStateChange}
        />
    )
}

export default ContentEditor;