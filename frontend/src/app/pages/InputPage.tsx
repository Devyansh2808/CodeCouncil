import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload } from 'lucide-react';

type Tab = 'write' | 'upload';

interface InputPageProps {
  onSubmit: (code: string) => void;
  onBack: () => void;
}

export function InputPage({ onSubmit, onBack }: InputPageProps) {
  const [tab, setTab]           = useState<Tab>('write');
  const [code, setCode]         = useState('');
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setCode((e.target?.result as string) ?? '');
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl space-y-7"
      >
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <button
              onClick={onBack}
              className="text-[#A7A7A7] hover:text-white text-xs font-medium mb-3 cursor-pointer transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold tracking-[-0.03em]">
              Code<span className="text-[#1DB954]">Council</span>
            </h1>
            <p className="text-[#A7A7A7] text-sm mt-1">Submit your code for review</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-[#1A1A1A] border border-[#3E3E3E] rounded-lg p-1 w-fit">
          {(['write', 'upload'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                tab === t
                  ? 'bg-[#282828] text-white'
                  : 'text-[#A7A7A7] hover:text-white'
              }`}
            >
              {t === 'write' ? '✏️  Write Code' : '📁  Upload File'}
            </button>
          ))}
        </div>

        {/* Write tab */}
        {tab === 'write' && (
          <motion.div
            key="write"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste or type your code here..."
              spellCheck={false}
              className="w-full h-80 bg-[#1A1A1A] border border-[#3E3E3E] focus:border-[#1DB954] rounded-xl text-sm font-mono text-white placeholder:text-[#A7A7A7] p-5 resize-none outline-none transition-colors duration-200"
            />
          </motion.div>
        )}

        {/* Upload tab */}
        {tab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`w-full h-80 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 ${
              dragging
                ? 'border-[#1DB954] bg-[#1DB954]/5'
                : fileName
                ? 'border-[#1DB954]/50 bg-[#1DB954]/5'
                : 'border-[#3E3E3E] hover:border-[#A7A7A7]'
            }`}
          >
            <Upload
              className="size-10"
              style={{ color: fileName ? '#1DB954' : '#A7A7A7' }}
            />
            {fileName ? (
              <div className="text-center space-y-1">
                <p className="text-white font-semibold">{fileName}</p>
                <p className="text-[#1DB954] text-sm">File loaded — ready to submit</p>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <p className="text-white font-medium">Drop your file here or click to browse</p>
                <p className="text-[#A7A7A7] text-sm">.js · .ts · .py · .go · .rs · .java · .cpp and more</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </motion.div>
        )}

        {/* Submit row */}
        <div className="flex items-center justify-between">
          <p className="text-[#A7A7A7] text-xs">
            {code.trim()
              ? `${code.trim().split('\n').length} lines ready`
              : 'No code yet'}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSubmit(code)}
            disabled={!code.trim()}
            className="bg-[#1DB954] hover:bg-[#1ED760] disabled:opacity-35 disabled:cursor-not-allowed text-black font-bold text-sm px-8 py-3 rounded-full transition-all duration-150 cursor-pointer"
          >
            Submit for Review →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
