import React, { useEffect, useRef } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import ACTIONS from '../../utils/socketAction';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;

        editor.onDidChangeModelContent((event) => {
            const code = editor.getValue();
            onCodeChange(code);

            const isLocalChange = !event.isFlush;
            if (isLocalChange && socketRef.current) {
                socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                    roomId,
                    code,
                });
            }
        });
    };

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null && editorRef.current) {
                    const currentCode = editorRef.current.getValue();
                    if (currentCode !== code) {
                        editorRef.current.setValue(code);
                    }
                }
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off(ACTIONS.CODE_CHANGE);
            }
        };
    }, [socketRef.current]);

    return (
        <MonacoEditor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// Start coding here..."
            theme="vs-dark"
            onMount={handleEditorDidMount}
            options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
            }}
        />
    );
};

export default Editor;
