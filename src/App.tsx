import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Trash2,
  History,
  Key,
  Settings,
  Image as ImageIcon,
  Monitor,
  Check,
  Plus,
  BookOpen,
  X,
  Cpu
} from 'lucide-react';
import { 
  TextModelType,
  ImageModelType,
  DEFAULT_SYSTEM_INSTRUCTION,
  DEFAULT_ASSET_EXTRACTION_INSTRUCTION,
  DEFAULT_ASSET_PROMPT_INSTRUCTION
} from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ChapterView from './components/ChapterView';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Chapter {
  id: string;
  name: string;
}

export default function App() {
  const [chapters, setChapters] = useState<Chapter[]>([{ id: 'default', name: '章节 1' }]);
  const [activeChapterId, setActiveChapterId] = useState('default');
  
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [systemInstruction, setSystemInstruction] = useState(DEFAULT_SYSTEM_INSTRUCTION);
  const [assetExtractionInstruction, setAssetExtractionInstruction] = useState(DEFAULT_ASSET_EXTRACTION_INSTRUCTION);
  const [assetPromptInstruction, setAssetPromptInstruction] = useState(DEFAULT_ASSET_PROMPT_INSTRUCTION);
  const [isLoaded, setIsLoaded] = useState(false);

  // Model & API Key State
  const [textModel, setTextModel] = useState<TextModelType>('deepseek');
  const [imageModel, setImageModel] = useState<ImageModelType>('nano-banana-fast');
  const [geminiKey, setGeminiKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('sk-356c3d66038a448e81fd74896493d26d');
  const [claudeKey, setClaudeKey] = useState('');
  const [nanoBananaKey, setNanoBananaKey] = useState('sk-af0937efac1941398ab55b88566573ea');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [showKeys, setShowKeys] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const keyBoxRef = useRef<HTMLDivElement>(null);
  const modelBoxRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedChapters = localStorage.getItem('seedance_chapters');
      const savedActiveChapterId = localStorage.getItem('seedance_activeChapterId');
      const savedGeminiKey = localStorage.getItem('seedance_geminiKey');
      const savedDeepseekKey = localStorage.getItem('seedance_deepseekKey');
      const savedClaudeKey = localStorage.getItem('seedance_claudeKey');
      const savedNanoBananaKey = localStorage.getItem('seedance_nanoBananaKey');
      const savedTextModel = localStorage.getItem('seedance_textModel');
      const savedImageModel = localStorage.getItem('seedance_imageModel');
      const savedAspectRatio = localStorage.getItem('seedance_aspectRatio');
      const savedImageSize = localStorage.getItem('seedance_imageSize');
      const savedSystemInstruction = localStorage.getItem('seedance_systemInstruction');
      const savedAssetExtractionInstruction = localStorage.getItem('seedance_assetExtractionInstruction');
      const savedAssetPromptInstruction = localStorage.getItem('seedance_assetPromptInstruction');

      if (savedChapters) setChapters(JSON.parse(savedChapters));
      if (savedActiveChapterId) setActiveChapterId(savedActiveChapterId);
      if (savedGeminiKey) setGeminiKey(savedGeminiKey);
      if (savedDeepseekKey) setDeepseekKey(savedDeepseekKey);
      if (savedClaudeKey) setClaudeKey(savedClaudeKey);
      if (savedNanoBananaKey) setNanoBananaKey(savedNanoBananaKey);
      if (savedTextModel) setTextModel(savedTextModel as TextModelType);
      if (savedImageModel) setImageModel(savedImageModel as ImageModelType);
      if (savedAspectRatio) setAspectRatio(savedAspectRatio);
      if (savedImageSize) setImageSize(savedImageSize);
      if (savedSystemInstruction) {
        if (savedSystemInstruction.includes('15秒') || !savedSystemInstruction.includes('眼神交互') || !savedSystemInstruction.includes('符号标记') || !savedSystemInstruction.includes('严禁出现任何形式的字幕') || !savedSystemInstruction.includes('实体名称统一性') || !savedSystemInstruction.includes('每个片段里面只加第一个')) {
          setSystemInstruction(DEFAULT_SYSTEM_INSTRUCTION);
          localStorage.setItem('seedance_systemInstruction', DEFAULT_SYSTEM_INSTRUCTION);
        } else {
          setSystemInstruction(savedSystemInstruction);
        }
      }
      if (savedAssetExtractionInstruction) setAssetExtractionInstruction(savedAssetExtractionInstruction);
      if (savedAssetPromptInstruction) setAssetPromptInstruction(savedAssetPromptInstruction);
      
      setIsLoaded(true);
    } catch (e) {
      console.error('Failed to load from localStorage', e);
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_chapters', JSON.stringify(chapters)); }, [chapters, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_activeChapterId', activeChapterId); }, [activeChapterId, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_geminiKey', geminiKey); }, [geminiKey, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_deepseekKey', deepseekKey); }, [deepseekKey, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_claudeKey', claudeKey); }, [claudeKey, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_nanoBananaKey', nanoBananaKey); }, [nanoBananaKey, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_textModel', textModel); }, [textModel, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_imageModel', imageModel); }, [imageModel, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_aspectRatio', aspectRatio); }, [aspectRatio, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_imageSize', imageSize); }, [imageSize, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_systemInstruction', systemInstruction); }, [systemInstruction, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_assetExtractionInstruction', assetExtractionInstruction); }, [assetExtractionInstruction, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('seedance_assetPromptInstruction', assetPromptInstruction); }, [assetPromptInstruction, isLoaded]);

  // Close key box on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (keyBoxRef.current && !keyBoxRef.current.contains(event.target as Node)) {
        setShowKeys(false);
      }
      if (modelBoxRef.current && !modelBoxRef.current.contains(event.target as Node)) {
        setShowModels(false);
      }
    }
    if (showKeys || showModels) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showKeys, showModels]);

  const addChapter = () => {
    const newId = `chapter_${Date.now()}`;
    const newName = `章节 ${chapters.length + 1}`;
    setChapters([...chapters, { id: newId, name: newName }]);
    setActiveChapterId(newId);
  };

  const removeChapter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chapters.length === 1) return; // Don't remove the last chapter
    
    const newChapters = chapters.filter(c => c.id !== id);
    setChapters(newChapters);
    
    if (activeChapterId === id) {
      setActiveChapterId(newChapters[0].id);
    }
    
    // Cleanup local storage for this chapter
    localStorage.removeItem(`seedance_input_${id}`);
    localStorage.removeItem(`seedance_output_${id}`);
    localStorage.removeItem(`seedance_assetNames_${id}`);
    localStorage.removeItem(`seedance_assetPrompts_${id}`);
    localStorage.removeItem(`seedance_assetImages_${id}`);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-hidden">
      {/* Header */}
      <header className="flex-none border-b border-white/5 bg-black/40 backdrop-blur-md z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">仙侠短剧分镜生成器</h1>
              <p className="text-xs text-zinc-500">适配 Seedance 2.0 · 多模型支持</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative" ref={modelBoxRef}>
              <button 
                onClick={() => setShowModels(!showModels)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all border",
                  showModels ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white"
                )}
              >
                <Cpu className="w-4 h-4" />
                模型配置
              </button>
              
              {showModels && (
                <div className="absolute top-full mt-2 right-0 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-4 z-[100] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-zinc-300">模型与生成配置</h3>
                    <button 
                      onClick={() => setShowModels(false)}
                      className="p-1 hover:bg-white/5 rounded-md text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">文本分析模型</label>
                    <select 
                      value={textModel}
                      onChange={(e) => setTextModel(e.target.value as TextModelType)}
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="gemini">Gemini 3.1 Pro</option>
                      <option value="deepseek">DeepSeek V3</option>
                      <option value="claude">Claude 3.5 Sonnet</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">图像生成模型</label>
                    <select 
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value as ImageModelType)}
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="gemini">Gemini Flash Image</option>
                      <option value="nano-banana-fast">Nano Banana Fast</option>
                      <option value="nano-banana-pro">Nano Banana Pro</option>
                      <option value="nano-banana-ultra">Nano Banana Ultra</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">图像比例</label>
                    <select 
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="1:1">1:1 (正方形)</option>
                      <option value="16:9">16:9 (横屏)</option>
                      <option value="9:16">9:16 (竖屏)</option>
                      <option value="4:3">4:3</option>
                      <option value="3:4">3:4</option>
                      <option value="auto">Auto (自动)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">图像画质</label>
                    <select 
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="1K">1K (标准)</option>
                      <option value="2K">2K (高清)</option>
                      <option value="4K">4K (超清)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={keyBoxRef}>
              <button 
                onClick={() => setShowKeys(!showKeys)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all border",
                  showKeys ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white"
                )}
              >
                <Key className="w-4 h-4" />
                API 密钥配置
              </button>
              
              {showKeys && (
                <div className="absolute top-full mt-2 right-0 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-4 z-[100] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-zinc-300">API 密钥配置</h3>
                    <button 
                      onClick={() => setShowKeys(false)}
                      className="p-1 hover:bg-white/5 rounded-md text-zinc-500 hover:text-zinc-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Gemini API Key</label>
                    <input 
                      type="password" 
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="留空则使用环境变量"
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">DeepSeek API Key</label>
                    <input 
                      type="password" 
                      value={deepseekKey}
                      onChange={(e) => setDeepseekKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Claude API Key</label>
                    <input 
                      type="password" 
                      value={claudeKey}
                      onChange={(e) => setClaudeKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold">Nano Banana API Key</label>
                    <input 
                      type="password" 
                      value={nanoBananaKey}
                      onChange={(e) => setNanoBananaKey(e.target.value)}
                      placeholder="apikey"
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <button 
                    onClick={() => setShowKeys(false)}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    保存并关闭
                  </button>
                </div>
              )}
            </div>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white">
              <History className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Chapter Sidebar */}
        <aside className="w-48 flex-none border-r border-white/5 bg-black/40 flex flex-col z-20">
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              剧本章节
            </h2>
            <button 
              onClick={addChapter}
              className="p-1 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
              title="添加章节"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chapters.map(chapter => (
              <div
                key={chapter.id}
                onClick={() => setActiveChapterId(chapter.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group cursor-pointer border",
                  activeChapterId === chapter.id 
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                    : "bg-transparent border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-300"
                )}
              >
                <span className="truncate pr-2">{chapter.name}</span>
                {chapters.length > 1 && (
                  <button
                    onClick={(e) => removeChapter(chapter.id, e)}
                    className={cn(
                      "p-1 rounded-md hover:bg-white/10 transition-colors",
                      activeChapterId === chapter.id ? "text-emerald-400/70 hover:text-emerald-400" : "opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-300"
                    )}
                    title="删除章节"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/5">
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Settings className="w-4 h-4" />
              指令配置
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 relative bg-[#0a0a0a]">
          {chapters.map(chapter => (
            <ChapterView
              key={chapter.id}
              chapterId={chapter.id}
              textModel={textModel}
              imageModel={imageModel}
              geminiKey={geminiKey}
              deepseekKey={deepseekKey}
              claudeKey={claudeKey}
              nanoBananaKey={nanoBananaKey}
              aspectRatio={aspectRatio}
              imageSize={imageSize}
              systemInstruction={systemInstruction}
              assetExtractionInstruction={assetExtractionInstruction}
              assetPromptInstruction={assetPromptInstruction}
              isActive={activeChapterId === chapter.id}
            />
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIsConfigOpen(false)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="w-6 h-6 text-emerald-400" />
                系统指令配置
              </h2>
              <button onClick={() => setIsConfigOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-300">分镜生成系统指令</label>
                    <button 
                      onClick={() => setSystemInstruction(DEFAULT_SYSTEM_INSTRUCTION)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      恢复默认
                    </button>
                  </div>
                  <textarea
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    className="w-full h-[300px] bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 font-mono focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-300">资产库提取指令</label>
                    <button 
                      onClick={() => setAssetExtractionInstruction(DEFAULT_ASSET_EXTRACTION_INSTRUCTION)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      恢复默认
                    </button>
                  </div>
                  <textarea
                    value={assetExtractionInstruction}
                    onChange={(e) => setAssetExtractionInstruction(e.target.value)}
                    className="w-full h-[200px] bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 font-mono focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-300">资产提示词生成指令</label>
                    <button 
                      onClick={() => setAssetPromptInstruction(DEFAULT_ASSET_PROMPT_INSTRUCTION)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      恢复默认
                    </button>
                  </div>
                  <textarea
                    value={assetPromptInstruction}
                    onChange={(e) => setAssetPromptInstruction(e.target.value)}
                    className="w-full h-[200px] bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 font-mono focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                保存并关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
