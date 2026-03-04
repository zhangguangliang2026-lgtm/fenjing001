import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Copy, 
  Check, 
  FileText, 
  Sparkles, 
  Loader2, 
  Trash2,
  ChevronRight,
  Info,
  Users,
  Box,
  Map,
  LayoutGrid,
  Download,
  Zap,
  Image as ImageIcon,
  Save,
  X,
  ChevronDown
} from 'lucide-react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from 'motion/react';
import { 
  generatePrompts, 
  extractAssetNames, 
  generateSingleAssetPrompt, 
  generateImage,
  TextModelType,
  ImageModelType
} from '../services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AssetNames {
  characters: string[];
  props: string[];
  scenes: string[];
}

function highlightAssets(text: string, assetNames: AssetNames | null) {
  if (!assetNames || !text) return text;

  const allNames = Array.from(new Set([
    ...assetNames.characters,
    ...assetNames.props,
    ...assetNames.scenes
  ])).filter(name => name && name.length > 1);

  if (allNames.length === 0) return text;

  allNames.sort((a, b) => b.length - a.length);

  const segments = text.split(/(?=### 【片段)/);

  const processedSegments = segments.map(segment => {
    let processedSegment = segment;
    const occurrences: { index: number; length: number; name: string }[] = [];

    allNames.forEach(name => {
      const index = processedSegment.indexOf(name);
      if (index !== -1) {
        occurrences.push({ index, length: name.length, name });
      }
    });

    occurrences.sort((a, b) => a.index - b.index);

    const finalOccurrences: typeof occurrences = [];
    const occupiedIndices = new Set<number>();
    const namesUsed = new Set<string>();

    for (const occ of occurrences) {
      if (namesUsed.has(occ.name)) continue;

      let isOverlapping = false;
      for (let i = occ.index; i < occ.index + occ.length; i++) {
        if (occupiedIndices.has(i)) {
          isOverlapping = true;
          break;
        }
      }

      if (!isOverlapping) {
        finalOccurrences.push(occ);
        namesUsed.add(occ.name);
        for (let i = occ.index; i < occ.index + occ.length; i++) {
          occupiedIndices.add(i);
        }
      }
    }

    finalOccurrences.sort((a, b) => b.index - a.index);
    for (const occ of finalOccurrences) {
      const before = processedSegment.slice(0, occ.index);
      const after = processedSegment.slice(occ.index + occ.length);
      processedSegment = `${before}<span style="color: #ff4d4d; font-weight: bold;">${occ.name}</span>${after}`;
    }
    return processedSegment;
  });

  return processedSegments.join('');
}

interface ChapterViewProps {
  chapterId: string;
  textModel: TextModelType;
  imageModel: ImageModelType;
  geminiKey: string;
  deepseekKey: string;
  claudeKey: string;
  nanoBananaKey: string;
  aspectRatio: string;
  imageSize: string;
  systemInstruction: string;
  assetExtractionInstruction: string;
  assetPromptInstruction: string;
  isActive: boolean;
}

export default function ChapterView({
  chapterId,
  textModel,
  imageModel,
  geminiKey,
  deepseekKey,
  claudeKey,
  nanoBananaKey,
  aspectRatio,
  imageSize,
  systemInstruction,
  assetExtractionInstruction,
  assetPromptInstruction,
  isActive
}: ChapterViewProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [assetNames, setAssetNames] = useState<AssetNames | null>(null);
  const [assetPrompts, setAssetPrompts] = useState<{ [key: string]: string }>({});
  const [assetImages, setAssetImages] = useState<{ [key: string]: string }>({});
  const [generatingPrompts, setGeneratingPrompts] = useState<{ [key: string]: boolean }>({});
  const [generatingImages, setGeneratingImages] = useState<{ [key: string]: boolean }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAssetLibraryOpen, setIsAssetLibraryOpen] = useState(false);
  const [activeAssetTab, setActiveAssetTab] = useState<'character' | 'prop' | 'scene'>('character');
  const [copied, setCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string, name: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedInput = localStorage.getItem(`seedance_input_${chapterId}`);
      const savedOutput = localStorage.getItem(`seedance_output_${chapterId}`);
      const savedAssetNames = localStorage.getItem(`seedance_assetNames_${chapterId}`);
      const savedAssetPrompts = localStorage.getItem(`seedance_assetPrompts_${chapterId}`);
      const savedAssetImages = localStorage.getItem(`seedance_assetImages_${chapterId}`);

      if (savedInput) setInput(savedInput);
      if (savedOutput) setOutput(savedOutput);
      if (savedAssetNames) setAssetNames(JSON.parse(savedAssetNames));
      if (savedAssetPrompts) setAssetPrompts(JSON.parse(savedAssetPrompts));
      if (savedAssetImages) setAssetImages(JSON.parse(savedAssetImages));
      
      setIsLoaded(true);
    } catch (e) {
      console.error('Failed to load from localStorage', e);
      setIsLoaded(true);
    }
  }, [chapterId]);

  useEffect(() => { if (isLoaded) localStorage.setItem(`seedance_input_${chapterId}`, input); }, [input, isLoaded, chapterId]);
  useEffect(() => { if (isLoaded) localStorage.setItem(`seedance_output_${chapterId}`, output); }, [output, isLoaded, chapterId]);
  useEffect(() => { if (isLoaded) localStorage.setItem(`seedance_assetNames_${chapterId}`, JSON.stringify(assetNames)); }, [assetNames, isLoaded, chapterId]);
  useEffect(() => { if (isLoaded) localStorage.setItem(`seedance_assetPrompts_${chapterId}`, JSON.stringify(assetPrompts)); }, [assetPrompts, isLoaded, chapterId]);
  useEffect(() => { if (isLoaded) localStorage.setItem(`seedance_assetImages_${chapterId}`, JSON.stringify(assetImages)); }, [assetImages, isLoaded, chapterId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    setOutput('');
    try {
      const key = textModel === 'gemini' ? geminiKey : textModel === 'claude' ? claudeKey : deepseekKey;
      await generatePrompts(input, (text) => {
        setOutput(text);
      }, textModel, key, systemInstruction);
    } catch (error: any) {
      console.error('Generation failed:', error);
      setOutput(`生成失败: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExtractAssets = async () => {
    if (!input.trim() || !output.trim() || isExtracting) return;

    setIsExtracting(true);
    try {
      const key = textModel === 'gemini' ? geminiKey : textModel === 'claude' ? claudeKey : deepseekKey;
      const result = await extractAssetNames(input, output, textModel, key, assetExtractionInstruction);
      setAssetNames(result);
    } catch (error: any) {
      console.error('Extraction failed:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateAssetPrompt = async (name: string, type: 'character' | 'prop' | 'scene') => {
    if (generatingPrompts[name]) return;

    setGeneratingPrompts(prev => ({ ...prev, [name]: true }));
    try {
      const key = textModel === 'gemini' ? geminiKey : textModel === 'claude' ? claudeKey : deepseekKey;
      const prompt = await generateSingleAssetPrompt(name, type, input, textModel, key, assetPromptInstruction);
      setAssetPrompts(prev => ({ ...prev, [name]: prompt }));
    } catch (error: any) {
      console.error('Asset prompt generation failed:', error);
    } finally {
      setGeneratingPrompts(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleGenerateAssetImage = async (name: string) => {
    const prompt = assetPrompts[name];
    if (!prompt || generatingImages[name]) return;

    setGeneratingImages(prev => ({ ...prev, [name]: true }));
    try {
      const key = imageModel === 'gemini' ? geminiKey : nanoBananaKey;
      const imageUrl = await generateImage(prompt, imageModel, key, { aspectRatio, imageSize });
      console.log(`Generated image for ${name}:`, imageUrl);
      if (imageUrl) {
        setAssetImages(prev => ({ ...prev, [name]: imageUrl }));
      } else {
        throw new Error("生成的图片地址为空");
      }
    } catch (error: any) {
      console.error('Image generation failed:', error);
      alert(`图片生成失败: ${error.message}`);
    } finally {
      setGeneratingImages(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleExport = () => {
    if (!output && !assetNames) return;

    let content = "=== 仙侠短剧分镜提示词 ===\n\n";
    content += output + "\n\n";

    if (assetNames) {
      content += "=== 资产提示词 ===\n\n";
      content += "--- 角色资产 ---\n";
      assetNames.characters.forEach(name => {
        content += `${name}:\n${assetPrompts[name] || "未生成"}\n\n`;
      });
      content += "--- 道具资产 ---\n";
      assetNames.props.forEach(name => {
        content += `${name}:\n${assetPrompts[name] || "未生成"}\n\n`;
      });
      content += "--- 场景资产 ---\n";
      assetNames.scenes.forEach(name => {
        content += `${name}:\n${assetPrompts[name] || "未生成"}\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `仙侠短剧提示词_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setAssetNames(null);
    setAssetPrompts({});
    setAssetImages({});
  };

  const handleDownloadImage = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${name}_${new Date().getTime()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const scrollToSegment = (segmentId: string) => {
    const element = document.getElementById(`segment-${chapterId}-${segmentId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSegmentClick = (segmentId: string) => {
    scrollToSegment(segmentId);
    
    const segmentHeader = `### 【片段${segmentId}】`;
    const startIndex = output.indexOf(segmentHeader);
    if (startIndex !== -1) {
      let endIndex = output.indexOf('### 【片段', startIndex + segmentHeader.length);
      if (endIndex === -1) endIndex = output.length;
      const segmentContent = output.substring(startIndex, endIndex).trim();
      handleCopy(segmentContent);
    }
  };

  const segments = Array.from(output.matchAll(/### 【片段(\d+)】/g)).map(match => match[1]);

  useEffect(() => {
    if (outputRef.current && isGenerating) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, isGenerating]);

  return (
    <div className={cn(
      "absolute inset-0 flex overflow-hidden transition-opacity duration-300", 
      isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
    )}>
      {/* Left: Input (Compact & Professional) */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-[320px] flex-none flex flex-col border-r border-white/5 bg-zinc-950/40 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-none bg-black/20">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em]">
              剧本输入
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <label className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer group" title="导入TXT">
              <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
            </label>
            <button 
              onClick={handleClear}
              className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-all group"
              title="清空"
            >
              <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col p-4">
          <div className="flex-1 relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此粘贴您的仙侠短剧剧本..."
              className="w-full h-full bg-black/30 border border-white/5 rounded-xl p-5 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/20 focus:bg-black/50 resize-none text-[13px] leading-relaxed transition-all custom-scrollbar overflow-y-auto"
            />
            <div className="absolute bottom-3 right-3 text-[9px] text-zinc-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              {input.length} CHR
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 flex-none bg-black/40">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !input.trim()}
            className="w-full group relative overflow-hidden bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/10 active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm tracking-wide">解析中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span className="text-sm tracking-wide">生成分镜提示词</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Right: Output & Segment Nav (Cinematic Layout) */}
      <div className="flex-1 flex flex-col bg-[#030303] overflow-hidden">
        {/* Segment Nav (Header Style) */}
        <div className="flex-none border-b border-white/5 bg-black/80 backdrop-blur-xl z-30">
          <div className="px-6 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">片段快捷导航</h3>
                <p className="text-[9px] text-zinc-600 font-medium">点击跳转并自动复制片段内容</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-0.5 bg-white/5 rounded-full border border-white/5 mr-2">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-tighter">{segments.length} SEGMENTS</span>
              </div>
              
              {/* Action Buttons in Header */}
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                <button
                  onClick={() => setIsAssetLibraryOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white hover:border-emerald-500/30 transition-all group"
                  title="打开资产库"
                >
                  <Box className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">资产库</span>
                </button>
                <button
                  onClick={handleExport}
                  disabled={!output}
                  className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                  title="导出TXT"
                >
                  <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={() => handleCopy(output)}
                  disabled={!output}
                  className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
                  title="复制全部"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-2 flex gap-2 overflow-x-auto custom-scrollbar-h no-scrollbar hover:no-scrollbar pb-3">
            <AnimatePresence mode="popLayout">
              {segments.length > 0 ? (
                segments.map((segmentId, index) => (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.01 }}
                    key={segmentId}
                    onClick={() => handleSegmentClick(segmentId)}
                    className="flex-none px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-500 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all border border-white/5 bg-zinc-900/40 flex items-center gap-1.5 group whitespace-nowrap"
                  >
                    <span className="text-zinc-700 group-hover:text-emerald-500 transition-colors">#</span>
                    <span>片段 {segmentId}</span>
                  </motion.button>
                ))
              ) : (
                <div className="flex items-center gap-2 text-[10px] text-zinc-700 italic px-2">
                  <Info className="w-3 h-3" />
                  生成后此处将显示片段索引...
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Output Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#030303] to-transparent z-10 pointer-events-none" />
          
          <div className="flex-1 overflow-y-auto p-8 lg:p-16 custom-scrollbar scroll-smooth" ref={outputRef}>
            <div className="max-w-3xl mx-auto">
              {output ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-invert max-w-none 
                    prose-h3:text-emerald-400 prose-h3:font-black prose-h3:text-lg prose-h3:tracking-tight prose-h3:mt-16 prose-h3:mb-8 prose-h3:flex prose-h3:items-center prose-h3:gap-3 prose-h3:border-l-2 prose-h3:border-emerald-500 prose-h3:pl-4
                    prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-[14px]
                    prose-pre:bg-zinc-900/40 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl prose-pre:p-6 prose-pre:shadow-2xl
                    prose-strong:text-zinc-200 prose-strong:font-bold
                    prose-hr:border-white/5"
                >
                  <Markdown 
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h3: ({node, ...props}) => {
                        const text = String(props.children);
                        const match = text.match(/【片段(\d+)】/);
                        if (match) {
                          return (
                            <div className="relative group/header">
                              <h3 id={`segment-${chapterId}-${match[1]}`} className="scroll-mt-32" {...props} />
                              <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover/header:opacity-100 transition-all">
                                <button 
                                  onClick={() => handleCopy(text)}
                                  className="p-1.5 bg-zinc-900 border border-white/10 rounded-lg text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-xl"
                                  title="复制片段标题"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        }
                        return <h3 {...props} />;
                      }
                    }}
                  >
                    {highlightAssets(output, assetNames)}
                  </Markdown>
                </motion.div>
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-800">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.02, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="w-20 h-20 rounded-[2rem] bg-zinc-900/50 border border-white/5 flex items-center justify-center shadow-2xl mb-10"
                  >
                    <Sparkles className="w-8 h-8 text-emerald-500" />
                  </motion.div>
                  <div className="text-center space-y-4">
                    <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.3em]">AI 创作空间</h4>
                    <p className="text-[12px] text-zinc-600 max-w-[240px] leading-relaxed font-medium">
                      在左侧面板输入您的剧本内容，点击生成按钮，AI 将为您创作精美的分镜提示词。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030303] to-transparent z-10 pointer-events-none" />
        </div>
      </div>

      {isAssetLibraryOpen && (
        <div className="absolute inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAssetLibraryOpen(false)} />
          <div className="relative w-full max-w-4xl ml-auto bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Box className="w-6 h-6 text-emerald-400" />
                  资产库
                </h2>
                <p className="text-sm text-zinc-500 mt-1">管理和生成角色、道具、场景的提示词与参考图</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleExtractAssets}
                  disabled={isExtracting || !output}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  提取资产
                </button>
                <button onClick={() => setIsAssetLibraryOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex border-b border-white/10 px-6">
              <button
                onClick={() => setActiveAssetTab('character')}
                className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeAssetTab === 'character' ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-400 hover:text-zinc-300")}
              >
                <Users className="w-4 h-4" /> 角色 ({assetNames?.characters.length || 0})
              </button>
              <button
                onClick={() => setActiveAssetTab('prop')}
                className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeAssetTab === 'prop' ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-400 hover:text-zinc-300")}
              >
                <Box className="w-4 h-4" /> 道具 ({assetNames?.props.length || 0})
              </button>
              <button
                onClick={() => setActiveAssetTab('scene')}
                className={cn("px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeAssetTab === 'scene' ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-400 hover:text-zinc-300")}
              >
                <Map className="w-4 h-4" /> 场景 ({assetNames?.scenes.length || 0})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!assetNames ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                  <Box className="w-12 h-12 opacity-20" />
                  <p>点击右上角“提取资产”开始分析</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(activeAssetTab === 'character' ? assetNames.characters : activeAssetTab === 'prop' ? assetNames.props : assetNames.scenes).map((name, idx) => (
                    <div key={idx} className="bg-zinc-900 border border-white/5 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-emerald-400 text-lg">{name}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGenerateAssetPrompt(name, activeAssetTab)}
                            disabled={generatingPrompts[name]}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                            title="生成提示词"
                          >
                            {generatingPrompts[name] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-zinc-300" />}
                          </button>
                          <button
                            onClick={() => handleGenerateAssetImage(name)}
                            disabled={!assetPrompts[name] || generatingImages[name]}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                            title="生成参考图"
                          >
                            {generatingImages[name] ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-zinc-300" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs text-zinc-500 uppercase font-bold">生图提示词</label>
                        <textarea
                          value={assetPrompts[name] || ''}
                          onChange={(e) => setAssetPrompts(prev => ({ ...prev, [name]: e.target.value }))}
                          placeholder="点击右上角按钮生成提示词..."
                          className="w-full h-24 bg-black/40 border border-white/5 rounded-lg p-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                        />
                      </div>

                      {assetImages[name] && (
                        <div className="space-y-2">
                          <label className="text-xs text-zinc-500 uppercase font-bold">参考图</label>
                          <div className="relative group rounded-lg overflow-hidden border border-white/10 bg-black/40 aspect-square">
                            <img 
                              src={assetImages[name]} 
                              alt={name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button 
                                onClick={() => setPreviewImage({ url: assetImages[name], name })}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
                              >
                                <ImageIcon className="w-5 h-5 text-white" />
                              </button>
                              <button 
                                onClick={() => handleDownloadImage(assetImages[name], name)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
                              >
                                <Download className="w-5 h-5 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-5xl w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <div className="absolute top-4 right-4 flex items-center gap-4">
              <button 
                onClick={() => handleDownloadImage(previewImage.url, previewImage.name)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition-colors text-white"
              >
                <Download className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <img 
              src={previewImage.url} 
              alt={previewImage.name} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <p className="mt-4 text-white/70 font-medium">{previewImage.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
