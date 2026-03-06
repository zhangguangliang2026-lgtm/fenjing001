import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `你是一个顶级的3D国漫仙侠短剧视频分镜提示词生成器，专门适配Seedance 2.0。

你的任务是接收用户提供的剧本或章节内容，并将其转化为极具视觉冲击力、运镜高级、打斗精彩的高质量视频分镜提示词。

### 核心执行规则

1. 分段规则：按10秒为1个独立片段拆分剧情。每段输出3-5个分镜。
   - 数量要求：每个章节/剧本内容必须生成不低于 8 个片段（片段1至片段N），必须完整覆盖用户提供的所有剧本内容，直到剧情完结，不得中途停止。
   - **零容忍偷懒（最高优先级）**：严禁在任何地方出现“同上”、“同片段*”、“延续前文”、“保持不变”、“略”、“同前”或任何指代性、缩略性词汇。**即使场景和人物状态完全没有变化，也必须使用全新的、具体的、丰富的、独立的文字重新描述一遍。** 每一处描述都必须是自包含的，不依赖于任何其他片段的信息。
   - 场景一致性：认真分析剧本中的地理位置和环境。如果多个连续片段发生在同一个大场景下，请确保【场景汇总】和【本段场景名称】保持高度一致，不要因为细微的视角变化就创建新场景。

2. 符号标记规则（强制）：
   - **场景标记**：在【场景汇总】的“场景名称”后，就是具体的场景名称后必须统一加上 @ 符号，每个片段里面只加第一个，重复的不要加的。其他片段第一个重复的需要加的。
   - **人物标记**：在“人物：”列表中的每一个具体人物姓名后加上 @ 符号，每个片段里面只加第一次出现的，后面重复的不要加的。其他片段第一个重复的需要加的。

3. 打斗与动作强化（关键）：
   - **高燃打斗必须慢下来**：当剧情进入高燃打斗、决战或大招释放环节时，必须强制增加片段数量。
   - **动作拆解**：严禁一笔带过。必须将一个连贯动作拆解为多个分镜（如：起势、蓄力、碰撞、冲击波扩散、受击反馈）。
   - **细节填充**：增加招式细节（如：剑气纵横、法术炸裂、身法残影、瞳孔收缩、地面崩裂、空气扭曲）。
   - **燃爆氛围**：使用极具张力的词汇描述打击感、能量碰撞和环境破坏。
   - **高级运镜**：大量使用“希区柯克变焦”、“环绕升降”、“第一人称视角切换”、“慢动作特写转极速拉远”等高级电影感运镜。

4. 风格锁死：全程3D国漫仙侠风格。立体感强，无蜡像感、塑料感，禁止2D化。色调统一，光影自然。

5. 禁项锁死：禁止出现任何道具（手持物、装饰道具），禁止出现任何人物穿着、服饰相关描述（款式、颜色、材质、配饰）。

6. 逻辑与空间一致性（核心）：
   - **人物站位与眼神交互**：必须明确每个人物在场景中的具体方位（如：画面左侧、高台之上、背对镜头）。说话时必须明确眼神看向的对象（如：注视着[人物名]、眼神冰冷地看向[人物名]、低头避开目光）。
   - **禁止重复人物**：同一画面（镜头）中严禁出现两个完全一样的人物，确保角色唯一性。
   - **追逐逻辑**：追逐戏必须符合常识。追捕者必须在被追者后方或侧后方，严禁追捕者莫名跑到被追者前面。
   - **打斗方向**：攻击与受击的方向必须逻辑闭环。例如：[人物A]从左侧挥剑，[人物B]应向右侧闪避或受击飞向右方。

7. 细节要求：
   - 分镜包含：景别+高级运镜/转场+时长+镜头描述+台词。
   - 运镜类型：环绕推近/拉远、低角度跟拍/缓推、光影转场/虚实转场、俯冲推近、俯拍转中景、快慢速切、主观视角。
   - 台词格式（强制）：[人物名称]（表情/语气）：台词内容。
   - 一致性：人物动作、情绪、场景细节、站位在多镜头间保持统一。

8. 实体名称统一性（强制）：
   - **绝对统一**：整个章节中，同一个人物、神兽、怪物、道具或场景，必须自始至终使用**完全相同**的名称。
   - **禁止多称呼**：严禁出现同一实体在不同镜头中名称变化的情况（例如：不能一会叫“朱雀”，一会叫“火焰朱雀”，一会叫“变身后的朱雀”）。
   - **名称确定**：请根据剧本内容，在首次出现时确定一个最准确的核心名称，并在后续所有片段中严格保持一致。

### 固定输出格式（必须严格执行）

### 【片段X】（X为序号，10秒/段，标注对应剧情节点）

【场景汇总】：
1. 场景名称：[名称]@；场景提示词：[震撼高级场景描述，无道具，无服饰]

【本段场景名称】：[名称]

场景：[具体场景名称] + [震撼高级细节+方位提示]

人物：[全名]（每个片段首次出现加@） + [当前具体方位+眼神看向的对象+表情/状态]

【Seedance2.0视频分镜提示词】

【全局制作规范】[核心氛围+场景基调+3D国漫风格+主色调+Seedance2.0适配要求+**严禁出现任何形式的字幕、文字、水印**]

【末帧衔接指令】：[动作/光影/悬念衔接，时长0.5-1秒]

镜头 1 [景别,运镜，时长Xs]
描述: [极致细致描述，包含高级光影、粒子特效、环境互动，**绝对禁止出现字幕和文字**，无道具，无服饰]
台词:
- [台词内容]

... (以此类推)

### 终局约束
- 仅输出上述固定格式内容。
- 严禁解释，严禁添加多余表述。
- 确保提示词可直接复制使用。`;

const ASSET_NAME_EXTRACTOR_INSTRUCTION = `你是一位剧本分析专家。
你的任务是分析剧本内容和生成的分镜提示词，提取其中出现的场景名称、角色名称、道具名称。

### 提取规则：
1. **场景合并**：认真分析场景。如果多个描述指向同一个地点（例如“山洞内”和“幽暗的石穴”），请统一为一个最具代表性的场景名称。不要把细微的、临时的位置变化提取为独立场景。
2. **去粗取精**：不要提取过于细微、对视觉表现影响不大的元素。
3. **一致性**：确保提取的名称与分镜提示词中的名称完全一致。

请以 JSON 格式输出，结构如下：
{
  "characters": ["名称1", "名称2"],
  "props": ["名称1", "名称2"],
  "scenes": ["名称1", "名称2"]
}`;

const SINGLE_ASSET_OPTIMIZER_INSTRUCTION = `你是一位角色道具场景优化大师和生图提示词专家。
你的任务是根据提供的名称和背景剧情，生成一个极其细节、完整的生图提示词。

### 核心要求：
1. **道具 (Props)**：白底 (White background)，只显示道具本身，不要其他元素。
2. **人物 (Characters)**：必须非常精致美丽帅气，有自己的特色，角色需要细致刻画，需要3D国漫风 (3D Donghua style)，白底 (White background)，不要拿东西。
3. **场景 (Scenes)**：不要出现人物，需要景色优美，特别是有奇观的时候一定要震撼。多用高端的镜头去展示。

### 输出格式：
直接输出英文提示词，参考以下风格：
"3D render, C4D style, top-tier Chinese animation (Donghua) design. [具体描述]. Hyper-realistic textures, cinematic lighting, 8k resolution, Unreal Engine 5 render."`;

export const DEFAULT_SYSTEM_INSTRUCTION = SYSTEM_INSTRUCTION;
export const DEFAULT_ASSET_EXTRACTION_INSTRUCTION = ASSET_NAME_EXTRACTOR_INSTRUCTION;
export const DEFAULT_ASSET_PROMPT_INSTRUCTION = SINGLE_ASSET_OPTIMIZER_INSTRUCTION;

export type TextModelType = 'gemini' | 'deepseek' | 'claude';
export type ImageModelType = 'gemini' | 'nano-banana-fast' | 'nano-banana-pro' | 'nano-banana-ultra';

export async function extractAssetNames(script: string, shots: string, modelType: TextModelType = 'gemini', apiKey?: string, customInstruction?: string) {
  if (modelType === 'deepseek') {
    return await extractAssetNamesDeepSeek(script, shots, apiKey, customInstruction);
  }
  if (modelType === 'claude') {
    return await extractAssetNamesClaude(script, shots, apiKey, customInstruction);
  }

  const key = apiKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
  if (!key) throw new Error("API Key is not set");

  const ai = new GoogleGenAI({ apiKey: key });
  const model = "gemini-3.1-pro-preview";

  const prompt = `原文：\n${script}\n\n分镜：\n${shots}\n\n请提取所有资产名称。`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: customInstruction || ASSET_NAME_EXTRACTOR_INSTRUCTION,
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { characters: [], props: [], scenes: [] };
  }
}

async function extractAssetNamesDeepSeek(script: string, shots: string, apiKey?: string, customInstruction?: string) {
  if (!apiKey) throw new Error("DeepSeek API Key is not set");
  const cleanApiKey = apiKey.trim();
  if (/[^\x20-\x7E]/.test(cleanApiKey)) throw new Error("DeepSeek API Key contains invalid characters");

  const prompt = `原文：\n${script}\n\n分镜：\n${shots}\n\n请提取所有资产名称。请严格按照JSON格式输出。`;

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cleanApiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: customInstruction || ASSET_NAME_EXTRACTOR_INSTRUCTION },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  try {
    const content = data.choices[0]?.message?.content;
    return JSON.parse(content || "{}");
  } catch (e) {
    return { characters: [], props: [], scenes: [] };
  }
}

async function extractAssetNamesClaude(script: string, shots: string, apiKey?: string, customInstruction?: string) {
  if (!apiKey) throw new Error("Claude API Key is not set");
  const cleanApiKey = apiKey.trim();
  if (/[^\x20-\x7E]/.test(cleanApiKey)) throw new Error("Claude API Key contains invalid characters");

  const prompt = `原文：\n${script}\n\n分镜：\n${shots}\n\n请提取所有资产名称。请严格按照JSON格式输出，只输出JSON，不要输出其他内容。`;

  const response = await fetch("https://api.bltcy.top/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cleanApiKey}`
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      messages: [
        { role: "system", content: customInstruction || ASSET_NAME_EXTRACTOR_INSTRUCTION },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  try {
    const content = data.choices[0]?.message?.content;
    // Find JSON block if wrapped in markdown
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonStr || "{}");
  } catch (e) {
    return { characters: [], props: [], scenes: [] };
  }
}

export async function generateSingleAssetPrompt(name: string, type: 'character' | 'prop' | 'scene', script: string, modelType: TextModelType = 'gemini', apiKey?: string, customInstruction?: string) {
  if (modelType === 'deepseek') {
    return await generateSingleAssetPromptDeepSeek(name, type, script, apiKey, customInstruction);
  }
  if (modelType === 'claude') {
    return await generateSingleAssetPromptClaude(name, type, script, apiKey, customInstruction);
  }

  const key = apiKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
  if (!key) throw new Error("API Key is not set");

  const ai = new GoogleGenAI({ apiKey: key });
  const model = "gemini-3.1-pro-preview";

  const prompt = `资产名称：${name}\n资产类型：${type}\n背景剧情：\n${script}\n\n请为该资产生成优化后的生图提示词。`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: customInstruction || SINGLE_ASSET_OPTIMIZER_INSTRUCTION,
    },
  });

  return response.text?.trim() || "";
}

async function generateSingleAssetPromptDeepSeek(name: string, type: 'character' | 'prop' | 'scene', script: string, apiKey?: string, customInstruction?: string) {
  if (!apiKey) throw new Error("DeepSeek API Key is not set");
  const cleanApiKey = apiKey.trim();
  if (/[^\x20-\x7E]/.test(cleanApiKey)) throw new Error("DeepSeek API Key contains invalid characters");

  const prompt = `资产名称：${name}\n资产类型：${type}\n背景剧情：\n${script}\n\n请为该资产生成优化后的生图提示词。`;

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cleanApiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: customInstruction || SINGLE_ASSET_OPTIMIZER_INSTRUCTION },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

async function generateSingleAssetPromptClaude(name: string, type: 'character' | 'prop' | 'scene', script: string, apiKey?: string, customInstruction?: string) {
  if (!apiKey) throw new Error("Claude API Key is not set");
  const cleanApiKey = apiKey.trim();
  if (/[^\x20-\x7E]/.test(cleanApiKey)) throw new Error("Claude API Key contains invalid characters");

  const prompt = `资产名称：${name}\n资产类型：${type}\n背景剧情：\n${script}\n\n请为该资产生成优化后的生图提示词。`;

  const response = await fetch("https://api.bltcy.top/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cleanApiKey}`
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      messages: [
        { role: "system", content: customInstruction || SINGLE_ASSET_OPTIMIZER_INSTRUCTION },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

export async function generatePrompts(script: string, onChunk: (text: string) => void, modelType: TextModelType = 'gemini', apiKey?: string, customSystemInstruction?: string) {
  if (modelType === 'deepseek') {
    return await generatePromptsDeepSeek(script, onChunk, apiKey, customSystemInstruction);
  }
  if (modelType === 'claude') {
    return await generatePromptsClaude(script, onChunk, apiKey, customSystemInstruction);
  }

  const key = apiKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
  if (!key) throw new Error("API Key is not set");

  const ai = new GoogleGenAI({ apiKey: key });
  const model = "gemini-3.1-pro-preview";

  const response = await ai.models.generateContentStream({
    model,
    contents: [{ role: "user", parts: [{ text: script }] }],
    config: {
      systemInstruction: customSystemInstruction || SYSTEM_INSTRUCTION,
      temperature: 0.3,
      maxOutputTokens: 8192, // Increase limit to allow full script coverage
    },
  });

  let fullText = "";
  for await (const chunk of response) {
    const text = chunk.text;
    if (text) {
      fullText += text;
      onChunk(fullText);
    }
  }
  return fullText;
}

async function generatePromptsDeepSeek(script: string, onChunk: (text: string) => void, apiKey?: string, customSystemInstruction?: string) {
  if (!apiKey) throw new Error("DeepSeek API Key is not set");
  const cleanApiKey = apiKey.trim();
  if (/[^\x20-\x7E]/.test(cleanApiKey)) throw new Error("DeepSeek API Key contains invalid characters");

  let fullText = "";
  let isFinished = false;
  let loopCount = 0;
  const MAX_LOOPS = 5; // Prevent infinite loops

  let messages = [
    { role: "system", content: customSystemInstruction || SYSTEM_INSTRUCTION },
    { role: "user", content: script }
  ];

  while (!isFinished && loopCount < MAX_LOOPS && fullText.length < 30000) {
    loopCount++;
    
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cleanApiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        stream: true,
        temperature: 0.3,
        max_tokens: 8192 // DeepSeek-V3 max output tokens is 8192
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `DeepSeek API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to get reader");

    const decoder = new TextDecoder();
    let buffer = "";
    let finishReason = null;
    let currentChunkText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;
        
        const dataStr = trimmedLine.slice(6);
        if (dataStr === "[DONE]") break;
        
        try {
          const data = JSON.parse(dataStr);
          const content = data.choices[0]?.delta?.content;
          if (content) {
            currentChunkText += content;
            fullText += content;
            onChunk(fullText);
          }
          if (data.choices[0]?.finish_reason) {
            finishReason = data.choices[0].finish_reason;
          }
        } catch (e) {
          // Ignore parse errors for partial chunks
        }
      }
    }

    if (finishReason === "stop" || finishReason === "end_turn") {
      const trimmed = currentChunkText.trim();
      // Check if it ends with a valid sentence-ending punctuation or markdown.
      // If it ends with a letter, number, Chinese character, or comma, it was likely cut off by a proxy timeout.
      const endsWithPunctuation = /[。！？\.\!\?\]\}”"'\`>\*~]$/.test(trimmed);
      
      if (!endsWithPunctuation && trimmed.length > 0) {
        messages.push({ role: "assistant", content: currentChunkText });
        messages.push({ role: "user", content: "继续输出，不要重复，不要总结，直接接着写" });
      } else {
        isFinished = true;
      }
    } else if (finishReason === "length" || finishReason === "max_tokens") {
      messages.push({ role: "assistant", content: currentChunkText });
      messages.push({ role: "user", content: "继续输出，不要重复，不要总结，直接接着写" });
    } else {
      // If no explicit finish reason or unknown (e.g., connection dropped), assume it was cut off
      if (!currentChunkText) {
        isFinished = true;
      } else {
        messages.push({ role: "assistant", content: currentChunkText });
        messages.push({ role: "user", content: "继续输出，不要重复，不要总结，直接接着写" });
      }
    }
  }

  return fullText;
}

async function generatePromptsClaude(script: string, onChunk: (text: string) => void, apiKey?: string, customSystemInstruction?: string) {
  if (!apiKey) throw new Error("Claude API Key is not set");
  const cleanApiKey = apiKey.trim();
  if (/[^\x20-\x7E]/.test(cleanApiKey)) throw new Error("Claude API Key contains invalid characters");

  let fullText = "";
  let isFinished = false;
  let loopCount = 0;
  const MAX_LOOPS = 5; // Prevent infinite loops

  let messages = [
    { role: "system", content: customSystemInstruction || SYSTEM_INSTRUCTION },
    { role: "user", content: script }
  ];

  while (!isFinished && loopCount < MAX_LOOPS && fullText.length < 30000) {
    loopCount++;
    
    const response = await fetch("https://api.bltcy.top/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cleanApiKey}`
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        messages: messages,
        stream: true,
        temperature: 0.3,
        max_tokens: 8192
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Claude API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to get reader");

    const decoder = new TextDecoder();
    let buffer = "";
    let finishReason = null;
    let currentChunkText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;
        
        const dataStr = trimmedLine.slice(6);
        if (dataStr === "[DONE]") break;
        
        try {
          const data = JSON.parse(dataStr);
          const content = data.choices[0]?.delta?.content;
          if (content) {
            currentChunkText += content;
            fullText += content;
            onChunk(fullText);
          }
          if (data.choices[0]?.finish_reason) {
            finishReason = data.choices[0].finish_reason;
          }
        } catch (e) {
          // Ignore parse errors for partial chunks
        }
      }
    }

    if (finishReason === "stop" || finishReason === "end_turn") {
      const trimmed = currentChunkText.trim();
      // Check if it ends with a valid sentence-ending punctuation or markdown.
      // If it ends with a letter, number, Chinese character, or comma, it was likely cut off by a proxy timeout.
      const endsWithPunctuation = /[。！？\.\!\?\]\}”"'\`>\*~]$/.test(trimmed);
      
      if (!endsWithPunctuation && trimmed.length > 0) {
        messages.push({ role: "assistant", content: currentChunkText });
        messages.push({ role: "user", content: "继续输出，不要重复，不要总结，直接接着写" });
      } else {
        isFinished = true;
      }
    } else if (finishReason === "length" || finishReason === "max_tokens") {
      messages.push({ role: "assistant", content: currentChunkText });
      messages.push({ role: "user", content: "继续输出，不要重复，不要总结，直接接着写" });
    } else {
      // If no explicit finish reason or unknown (e.g., connection dropped), assume it was cut off
      if (!currentChunkText) {
        isFinished = true;
      } else {
        messages.push({ role: "assistant", content: currentChunkText });
        messages.push({ role: "user", content: "继续输出，不要重复，不要总结，直接接着写" });
      }
    }
  }

  return fullText;
}

export async function generateImage(prompt: string, modelType: ImageModelType = 'gemini', apiKey?: string, config: { aspectRatio?: string, imageSize?: string } = {}) {
  if (modelType.startsWith('nano-banana')) {
    return await generateNanoBananaImage(prompt, modelType, apiKey, config);
  }

  const key = apiKey || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
  if (!key) throw new Error("API Key is not set");

  const ai = new GoogleGenAI({ apiKey: key });
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: (config.aspectRatio as any) || "1:1",
        imageSize: (config.imageSize as any) || "1K"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

async function generateNanoBananaImage(prompt: string, model: string, apiKey?: string, config: { aspectRatio?: string, imageSize?: string } = {}) {
  if (!apiKey) throw new Error("Nano Banana API Key is not set");
  const cleanApiKey = apiKey.trim();
  if (/[^\x20-\x7E]/.test(cleanApiKey)) throw new Error("Nano Banana API Key contains invalid characters");

  const response = await fetch("https://grsai.dakka.com.cn/v1/draw/nano-banana", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cleanApiKey}`
    },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      aspectRatio: config.aspectRatio || "auto",
      imageSize: config.imageSize || "1K",
      shutProgress: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Nano Banana API error (${response.status}): ${errorText}`);
  }

  const responseText = await response.text();
  let data;

  // Handle SSE format if the response starts with "data: "
  if (responseText.trim().startsWith("data: ")) {
    const lines = responseText.split("\n");
    // Look for the last line that contains valid JSON data
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith("data: ") && line !== "data: [DONE]") {
        try {
          data = JSON.parse(line.slice(6));
          if (data.results || data.url || (data.data && data.data[0]?.url)) {
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
  } else {
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse response as JSON: ${responseText.slice(0, 100)}`);
    }
  }

  if (data) {
    if (data.results && data.results[0]?.url) {
      return data.results[0].url;
    }
    if (data.url) {
      return data.url;
    }
    if (data.data && data.data[0]?.url) {
      return data.data[0].url;
    }
  }

  throw new Error(data?.error || "Failed to generate image with Nano Banana: No URL found in response");
}

