import React from 'react';
import { Sparkles, PlayCircle, Loader2, ExternalLink, Plus, Send, BookOpenCheck } from 'lucide-react';

export default function KnowledgeTab({
  theme,
  isLoadingAi,
  aiResponse,
  aiError,
  suggestedQuestions,
  searchQuery,
  setSearchQuery,
  handleAiSearch,
  setAiResponse,
  setAiError
}) {
  const parseBoldText = (text) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part);
  };

  const renderFormattedAiText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const cleanLine = line.trim();
      if (!cleanLine) return <div key={idx} className="h-2" />;

      if (cleanLine.startsWith('###') || cleanLine.startsWith('##') || cleanLine.startsWith('#')) {
        const titleText = cleanLine.replace(/^[#\s]+/, '');
        return (
          <h4 key={idx} className="text-xs font-bold text-green-300 mt-3 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <BookOpenCheck className="w-3.5 h-3.5 text-green-400" />
            {titleText}
          </h4>
        );
      }

      if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
        const bulletText = cleanLine.replace(/^[-*\s]+/, '');
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-[10px] text-white/90 leading-relaxed">
            <span className="text-green-400 mt-1 shrink-0">🌿</span>
            <span>{parseBoldText(bulletText)}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-[10px] text-white/80 leading-relaxed my-1">
          {parseBoldText(cleanLine)}
        </p>
      );
    });
  };

  return (
    <div className="p-3 h-full flex flex-col pt-4">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-4 flex-shrink-0 px-1">
        <Sparkles className="w-4 h-4 text-yellow-300" />
        <h2 className="text-sm font-bold text-white">Chuyên Gia Cà Phê AI</h2>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-4">
        {/* Initial State */}
        {!isLoadingAi && !aiResponse && !aiError && (
          <div className="flex flex-col h-full animate-fadeIn justify-center">
            <div className={`${theme.cardGlass} p-5 rounded-3xl text-center mb-4 border border-green-500/20`}>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white/10 mb-3">
                <Sparkles className="w-8 h-8 text-[#fff]" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Xin chào, tôi là Gemini!</h3>
              <p className="text-[10px] text-white/80 leading-relaxed">
                Hãy hỏi tôi bất cứ điều gì về kỹ thuật canh tác, sâu bệnh hại, hoặc giá cả thị trường cà phê Robusta tại Tây Nguyên.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider block px-1">💡 Hoặc thử các gợi ý sau:</span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(q);
                    handleAiSearch(q);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl ${theme.itemGlass} hover:bg-white/20 text-[10px] text-white/90 font-medium transition-all flex items-center justify-between border border-white/10`}
                >
                  <span className="truncate">{q}</span>
                  <PlayCircle className="w-4 h-4 text-green-300 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingAi && (
          <div className={`p-5 rounded-3xl ${theme.cardGlass} flex flex-col items-center justify-center gap-3 border border-green-400/20 shadow-xl min-h-[160px] animate-pulse`}>
            <div className="relative">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
              <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <div className="text-center">
              <p className="text-[10px] text-green-300 font-bold">Chuyên gia Gemini đang phân tích...</p>
              <p className="text-[8px] text-white/60 mt-0.5">Sử dụng Google Search để lấy kiến thức nông học thực tế Chư Prông</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {aiError && !isLoadingAi && (
          <div className={`p-4 rounded-3xl bg-red-950/40 border border-red-500/30 text-white/90 text-[10px] ${theme.cardGlass}`}>
            <p className="font-bold text-red-300 mb-1 flex items-center gap-1">⚠️ Lỗi kết nối trợ lý</p>
            <p>{aiError}</p>
            <button 
              onClick={() => handleAiSearch()}
              className="mt-3 bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 px-3 text-[9px] font-bold"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && !isLoadingAi && (
          <div className={`p-4 rounded-3xl ${theme.cardGlass} border border-green-400/20 shadow-xl space-y-3 animate-fadeIn`}>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-[10px] font-bold text-green-300">Tư vấn của Gemini AI</span>
              </div>
              <button 
                onClick={() => {
                  setAiResponse(null);
                  setSearchQuery('');
                  setAiError('');
                }}
                className="text-white/50 hover:text-white bg-white/10 p-1.5 rounded-full transition-all flex items-center gap-1 text-[8px] px-2"
              >
                <Plus className="w-3 h-3 rotate-45" /> Mới
              </button>
            </div>

            <div className="space-y-1">
              {renderFormattedAiText(aiResponse.text)}
            </div>

            {aiResponse?.sources?.length > 0 && (
              <div className="border-t border-white/10 pt-3 mt-2">
                <span className="text-[8px] text-white/50 font-bold uppercase tracking-wider block mb-1.5">🔍 Nguồn kiểm chứng uy tín:</span>
                <div className="flex flex-wrap gap-1">
                  {aiResponse.sources.map((src, i) => (
                    <a 
                      key={i} 
                      href={src.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full px-2 py-1 text-[8px] text-green-300 transition-all font-medium truncate max-w-[150px]"
                    >
                      <ExternalLink className="w-2.5 h-2.5 text-white/50 shrink-0" />
                      <span className="truncate">{src.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Input Area */}
      <div className="mt-auto pt-3 flex-shrink-0">
        <div className={`flex items-center p-2 rounded-2xl ${theme.inputGlass} focus-within:ring-1 focus-within:ring-green-400/50 transition-all`}>
          <input 
            type="text" 
            placeholder="Hỏi chuyên gia AI..." 
            className="bg-transparent border-none outline-none text-[11px] text-white w-full placeholder:text-white/40 focus:ring-0 px-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
          />
          <button 
            onClick={() => handleAiSearch()}
            disabled={isLoadingAi || !searchQuery?.trim()}
            className="bg-green-500 hover:bg-green-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-[#fff] rounded-xl p-2.5 text-[9px] font-bold transition-all flex items-center justify-center shrink-0 shadow-lg"
          >
            {isLoadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}