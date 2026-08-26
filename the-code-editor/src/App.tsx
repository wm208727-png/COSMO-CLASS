/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Code2, 
  Download, 
  Search,
  Trash2,
  Monitor,
  Check,
  Globe,
  FileCode,
  Menu,
  X,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Comprehensive list of languages supported by Monaco (approx 150+)
const ALL_LANGUAGES = [
  "abap", "apex", "azcli", "bat", "bicep", "cameligo", "clojure", "coffeescript", "c", "cpp", "csharp", "csp", "css", "cypher", "dart", "dockerfile", "ecl", "elixir", "flow9", "fsharp", "freemarker2", "freemarker2.tag-angle.interpolation-dollar", "freemarker2.tag-bracket.interpolation-dollar", "freemarker2.tag-angle.interpolation-bracket", "freemarker2.tag-bracket.interpolation-bracket", "go", "graphql", "handlebars", "hcl", "html", "ini", "java", "javascript", "julia", "kotlin", "less", "lexon", "lua", "liquid", "m3", "markdown", "mips", "msdax", "mysql", "objective-c", "pascal", "pascaligo", "perl", "pgsql", "php", "pla", "postiats", "powerquery", "powershell", "proto", "pug", "python", "qsharp", "r", "razor", "redis", "redshift", "restructuredtext", "ruby", "rust", "sb", "scala", "scheme", "scss", "shell", "sol", "aes", "sparql", "sql", "st", "swift", "systemverilog", "verilog", "tcl", "twig", "typescript", "vb", "xml", "yaml", "json"
].sort();

export default function App() {
  const [code, setCode] = useState(() => {
    return localStorage.getItem('editor_code') || '// Welcome to The Code Editor\nconsole.log("Hello World");';
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('editor_lang') || 'javascript';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('editor_code', code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem('editor_lang', language);
  }, [language]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `file.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const clearEditor = () => {
    if (window.confirm('Are you sure you want to clear the editor?')) {
      setCode('');
    }
  };

  const filteredLanguages = ALL_LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-base tracking-tight text-slate-800">The Code Editor</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden p-2 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 mb-2 block">
            Languages ({filteredLanguages.length})
          </label>
          <div className="grid grid-cols-1 gap-1">
            {filteredLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-md text-xs font-medium transition-all flex items-center justify-between group ${
                  language === lang 
                    ? 'bg-pink-50 text-pink-600 border border-pink-100 shadow-sm' 
                    : 'text-slate-600 hover:bg-white hover:shadow-sm border border-transparent'
                }`}
              >
                <span className="capitalize">{lang}</span>
                {language === lang && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-2 shrink-0">
          <button
            onClick={handlePreview}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <Monitor className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={downloadCode}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={clearEditor}
            className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-white text-slate-900 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-slate-200 flex-col shrink-0">
        {SidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-50 md:hidden shadow-2xl"
            >
              {SidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Header */}
        <header className="h-14 md:h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-pink-50 text-pink-600 rounded-full border border-pink-100">
              <FileCode className="w-3.5 h-3.5" />
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider">
                {language}
              </span>
            </div>
            <div className="hidden sm:block h-4 w-[1px] bg-slate-200" />
            <span className="hidden sm:block text-[10px] text-slate-400 font-medium uppercase tracking-tight">Sync Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] md:text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button 
              onClick={handlePreview}
              className="md:hidden p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 active:scale-95"
              title="Preview"
            >
              <Monitor className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 relative overflow-hidden bg-white">
          <Editor
            height="100%"
            language={language}
            theme="light"
            value={code}
            onChange={(val) => setCode(val || '')}
            onMount={handleEditorDidMount}
            options={{
              fontSize: window.innerWidth < 768 ? 12 : 14,
              fontFamily: "'JetBrains Mono', monospace",
              minimap: { enabled: window.innerWidth >= 768 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 15, bottom: 15 },
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              contextmenu: true,
              wordWrap: 'on',
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8
              }
            }}
          />
        </div>

        {/* Status Bar */}
        <footer className="h-7 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-4 text-[9px] md:text-[10px] font-medium text-slate-400 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="hidden xs:inline">SYSTEM READY</span>
              <span className="xs:hidden">READY</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              PREVIEW READY
            </span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <span>Spaces: 2</span>
            <span className="hidden xs:inline">UTF-8</span>
          </div>
        </footer>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        @media (max-width: 400px) {
          .xs\\:hidden { display: none; }
          .xs\\:inline { display: inline; }
        }
      `}} />
    </div>
  );
}
