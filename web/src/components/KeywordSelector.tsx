'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, Sparkles } from 'lucide-react';
import { emotionKeywords, keywordsByCategory, categories } from '@/lib/emotion-keywords';

interface KeywordSelectorProps {
  selectedKeywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  maxSelection?: number;
}

export default function KeywordSelector({
  selectedKeywords,
  onKeywordsChange,
  maxSelection = 16
}: KeywordSelectorProps) {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [hiddenKeywords, setHiddenKeywords] = useState<Set<string>>(new Set());

  // 更新隐藏的关键词集合
  useEffect(() => {
    setHiddenKeywords(new Set(selectedKeywords));
  }, [selectedKeywords]);

  // 获取当前分类下的关键词
  const getCurrentCategoryKeywords = () => {
    if (activeCategory === '全部') {
      return emotionKeywords.filter(keyword => !hiddenKeywords.has(keyword.keyword));
    }
    return keywordsByCategory[activeCategory]?.filter(keyword => !hiddenKeywords.has(keyword.keyword)) || [];
  };

  // 处理关键词点击（选择）
  const handleKeywordClick = (keyword: string) => {
    if (selectedKeywords.length >= maxSelection) {
      alert(`最多只能选择${maxSelection}个关键词`);
      return;
    }

    const newSelected = [...selectedKeywords, keyword];
    onKeywordsChange(newSelected);
  };

  // 处理已选择关键词点击（取消选择）
  const handleSelectedKeywordClick = (keyword: string) => {
    const newSelected = selectedKeywords.filter(k => k !== keyword);
    onKeywordsChange(newSelected);
  };

  // 清空所有选择
  const handleClearAll = () => {
    onKeywordsChange([]);
  };

  // 随机选择关键词
  const handleRandomSelect = () => {
    const remaining = maxSelection - selectedKeywords.length;
    if (remaining <= 0) return;

    const availableKeywords = emotionKeywords
      .filter(k => !selectedKeywords.includes(k.keyword))
      .map(k => k.keyword);

    const shuffled = [...availableKeywords].sort(() => 0.5 - Math.random());
    const randomSelected = shuffled.slice(0, remaining);

    onKeywordsChange([...selectedKeywords, ...randomSelected]);
  };

  const allCategories = ['全部', ...categories];
  const currentKeywords = getCurrentCategoryKeywords();

  return (
    <div className="space-y-6">
      {/* 关键词选择标题和操作按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">关键词选择</h3>
          <p className="text-sm text-gray-500">
            已选择的关键词 ({selectedKeywords.length}/{maxSelection}) - 至少选择1个，最多{maxSelection}个
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRandomSelect}
            disabled={selectedKeywords.length >= maxSelection}
            className="flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4" />
            随机选择
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearAll}
            disabled={selectedKeywords.length === 0}
            className="flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            清空选择
          </Button>
        </div>
      </div>

      {/* 已选择的关键词显示区域 */}
      {selectedKeywords.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-3">已选择的关键词</h4>
          <div className="flex flex-wrap gap-2">
            {selectedKeywords.map((keyword, index) => (
              <div
                key={`selected-${index}`}
                className="group relative bg-blue-500 text-white px-3 py-2 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 animate-fadeInScale"
                onClick={() => handleSelectedKeywordClick(keyword)}
              >
                <span className="flex items-center gap-1">
                  {keyword}
                  <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            💡 点击上面的关键词可以取消选择
          </p>
        </div>
      )}

      {/* 分类标签 */}
      <div className="border-b border-gray-200">
        <div className="flex flex-wrap gap-1 pb-2">
          {allCategories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className={`transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* 关键词网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {currentKeywords.map((keywordObj, index) => {
          const isSelected = selectedKeywords.includes(keywordObj.keyword);
          const isMaxReached = selectedKeywords.length >= maxSelection && !isSelected;

          return (
            <div
              key={`${activeCategory}-${keywordObj.keyword}-${index}`}
              className={`
                relative p-2 rounded-lg border-2 text-center cursor-pointer text-sm font-medium
                transition-all duration-300 transform hover:scale-105
                animate-slideInFromBottom
                ${isMaxReached
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                }
              `}
              style={{
                animationDelay: `${index * 50}ms`
              }}
              onClick={() => !isMaxReached && handleKeywordClick(keywordObj.keyword)}
              title={keywordObj.description}
            >
              <span className={`block ${isMaxReached ? 'opacity-50' : ''}`}>
                {keywordObj.keyword}
              </span>
              {!isMaxReached && (
                <div className="absolute inset-0 bg-blue-500 opacity-0 hover:opacity-10 rounded-lg transition-opacity duration-200" />
              )}
            </div>
          );
        })}
      </div>

      {/* 无关键词提示 */}
      {currentKeywords.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">🎯 该分类下的关键词已全部选择</p>
          <p className="text-sm mt-2">切换到其他分类或清空选择来查看更多关键词</p>
        </div>
      )}

      {/* 关键词计数提示 */}
      <div className="text-center text-sm text-gray-500">
        <p>
          当前分类显示 <span className="font-medium text-blue-600">{currentKeywords.length}</span> 个关键词
          {selectedKeywords.length > 0 && selectedKeywords.length < maxSelection && (
            <>
              ，还可选择 <span className="font-medium text-orange-600">{Math.max(0, maxSelection - selectedKeywords.length)}</span> 个
            </>
          )}
          {selectedKeywords.length >= 1 && (
            <>
              ，<span className="font-medium text-green-600">已满足生成条件</span>
            </>
          )}
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.3s ease-out;
        }

        .animate-slideInFromBottom {
          animation: slideInFromBottom 0.4s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}