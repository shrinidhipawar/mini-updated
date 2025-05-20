import { useEffect, useRef } from "react";

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  options?: object;
}

export default function MonacoEditor({ value, language, onChange, options = {} }: MonacoEditorProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);
  
  useEffect(() => {
    // Load Monaco editor
    if (!containerRef.current) return;
    
    const loadMonaco = async () => {
      // First, dynamically import monaco
      const monaco = await import('monaco-editor');
      monacoRef.current = monaco;
      
      // Then create the editor
      if (containerRef.current && !editorRef.current) {
        editorRef.current = monaco.editor.create(containerRef.current, {
          value,
          language,
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
          ...options
        });
        
        // Set up change event handler
        editorRef.current.onDidChangeModelContent(() => {
          const newValue = editorRef.current.getValue();
          if (newValue !== value) {
            onChange(newValue);
          }
        });
        
        // Disable copy-paste functionality
        const editorTextArea = containerRef.current.querySelector('textarea');
        if (editorTextArea) {
          editorTextArea.addEventListener('copy', e => {
            e.preventDefault();
            alert('Copying is disabled for this assignment.');
          });
          
          editorTextArea.addEventListener('paste', e => {
            e.preventDefault();
            alert('Pasting is disabled for this assignment.');
          });
        }
      }
    };
    
    loadMonaco();
    
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);
  
  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);
  
  // Update language when it changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      monacoRef.current.editor.setModelLanguage(model, language);
    }
  }, [language]);
  
  return <div ref={containerRef} className="h-full" />;
}
