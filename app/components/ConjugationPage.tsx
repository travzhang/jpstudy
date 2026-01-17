"use client";

import { useState, useEffect } from "react";
import { Picker, Card, List, Space } from "antd-mobile";
import type { PickerValue } from "antd-mobile/es/components/picker";
import {
  conjugateGodanVerb,
  conjugateIchidanVerb,
  conjugateIrregularVerb,
  conjugateIAdjective,
  conjugateNaAdjective,
  conjugateNoun,
} from "@/lib/japanese-conjugation";

// 词性类型
type WordType = "adjective" | "verb" | "noun";

// 形容词类型
type AdjectiveType = "i-adjective" | "na-adjective";

// 动词类型
type VerbType = "godan" | "ichidan" | "irregular";

// 变形数据
interface ConjugationData {
  present: {
    plain: string;
    polite: string;
  };
  negative: {
    plain: string;
    polite: string;
  };
  past: {
    plain: string;
    polite: string;
  };
  pastNegative: {
    plain: string;
    polite: string;
  };
}

// 示例数据
const exampleWords = {
  adjective: {
    "i-adjective": [
      { word: "高い", reading: "たかい", meaning: "高的" },
      { word: "新しい", reading: "あたらしい", meaning: "新的" },
      { word: "大きい", reading: "おおきい", meaning: "大的" },
    ],
    "na-adjective": [
      { word: "静か", reading: "しずか", meaning: "安静的" },
      { word: "元気", reading: "げんき", meaning: "有精神的" },
      { word: "きれい", reading: "きれい", meaning: "漂亮的" },
    ],
  },
  verb: {
    godan: [
      { word: "書く", reading: "かく", meaning: "写" },
      { word: "読む", reading: "よむ", meaning: "读" },
      { word: "話す", reading: "はなす", meaning: "说" },
    ],
    ichidan: [
      { word: "食べる", reading: "たべる", meaning: "吃" },
      { word: "見る", reading: "みる", meaning: "看" },
      { word: "起きる", reading: "おきる", meaning: "起床" },
    ],
    irregular: [
      { word: "する", reading: "する", meaning: "做" },
      { word: "来る", reading: "くる", meaning: "来" },
    ],
  },
  noun: [
    { word: "学生", reading: "がくせい", meaning: "学生" },
    { word: "本", reading: "ほん", meaning: "书" },
    { word: "車", reading: "くるま", meaning: "车" },
  ],
};

// 使用日语语法规则生成变形
function generateAdjectiveConjugation(
  word: string,
  reading: string,
  type: AdjectiveType
): ConjugationData {
  if (type === "i-adjective") {
    return conjugateIAdjective(word, reading);
  } else {
    return conjugateNaAdjective(word, reading);
  }
}

function generateVerbConjugation(
  word: string,
  reading: string,
  type: VerbType
): ConjugationData {
  if (type === "godan") {
    return conjugateGodanVerb(word, reading);
  } else if (type === "ichidan") {
    return conjugateIchidanVerb(word, reading);
  } else {
    return conjugateIrregularVerb(word, reading);
  }
}

function generateNounConjugation(word: string): ConjugationData {
  return conjugateNoun(word);
}

interface Word {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  wordType: string;
  subType: string | null;
}

export default function ConjugationPage() {
  const [wordType, setWordType] = useState<WordType | null>(null);
  const [wordTypeValue, setWordTypeValue] = useState<(string | null)[]>([]);
  const [subType, setSubType] = useState<string | null>(null);
  const [subTypeValue, setSubTypeValue] = useState<(string | null)[]>([]);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    reading: string;
    meaning: string;
  } | null>(null);
  const [wordValue, setWordValue] = useState<(string | null)[]>([]);
  const [conjugationData, setConjugationData] =
    useState<ConjugationData | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);

  const wordTypeOptions = [
    { label: "形容词", value: "adjective" },
    { label: "动词", value: "verb" },
    { label: "名词", value: "noun" },
  ];

  const getSubTypeOptions = () => {
    if (wordType === "adjective") {
      return [
        { label: "一类形容词（い形容词）", value: "i-adjective" },
        { label: "二类形容词（な形容词）", value: "na-adjective" },
      ];
    }
    if (wordType === "verb") {
      return [
        { label: "五段动词（一类动词）", value: "godan" },
        { label: "一段动词（二类动词）", value: "ichidan" },
        { label: "不规则动词（三类动词）", value: "irregular" },
      ];
    }
    return [];
  };

  // 从数据库加载单词
  useEffect(() => {
    const fetchWords = async () => {
      if (!wordType) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ wordType });
        if (wordType !== "noun" && subType) {
          params.append("subType", subType);
        }
        const response = await fetch(`/api/words?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setWords(data);
        }
      } catch (error) {
        console.error("Failed to fetch words:", error);
      } finally {
        setLoading(false);
      }
    };

    if (wordType && (wordType === "noun" || subType)) {
      fetchWords();
    } else {
      setWords([]);
    }
  }, [wordType, subType]);

  const getWordOptions = () => {
    // 优先使用数据库中的单词
    if (words.length > 0) {
      return words.map((w, i) => ({
        label: `${w.word}（${w.reading}） - ${w.meaning}`,
        value: i.toString(),
      }));
    }

    // 如果没有数据库单词，使用示例数据
    if (!wordType) return [];
    if (wordType === "noun") {
      return exampleWords.noun.map((w, i) => ({
        label: `${w.word}（${w.reading}） - ${w.meaning}`,
        value: i.toString(),
      }));
    }
    if (!subType) return [];
    let exampleWordsList: { word: string; reading: string; meaning: string }[] = [];
    if (wordType === "adjective") {
      exampleWordsList = exampleWords.adjective[subType as AdjectiveType] || [];
    } else if (wordType === "verb") {
      exampleWordsList = exampleWords.verb[subType as VerbType] || [];
    }
    return exampleWordsList.map((w, i) => ({
      label: `${w.word}（${w.reading}） - ${w.meaning}`,
      value: i.toString(),
    }));
  };

  const handleWordTypeChange = (value: PickerValue[]) => {
    const newType = value[0] as WordType;
    setWordTypeValue(value as (string | null)[]);
    setWordType(newType);
    setSubType(null);
    setSubTypeValue([]);
    setSelectedWord(null);
    setWordValue([]);
    setConjugationData(null);
  };

  const handleSubTypeChange = (value: PickerValue[]) => {
    const newSubType = value[0] as string;
    setSubTypeValue(value as (string | null)[]);
    setSubType(newSubType);
    setSelectedWord(null);
    setWordValue([]);
    setConjugationData(null);
  };

  const handleWordChange = (value: PickerValue[]) => {
    if (!wordType) return;
    setWordValue(value as (string | null)[]);
    const index = parseInt(value[0] as string);
    let word: { word: string; reading: string; meaning: string };

    // 优先使用数据库中的单词
    if (words.length > 0) {
      word = words[index];
    } else {
      // 使用示例数据
      if (wordType === "noun") {
        word = exampleWords.noun[index];
      } else {
        if (!subType) return;
        let exampleWordsList: { word: string; reading: string; meaning: string }[] = [];
        if (wordType === "adjective") {
          exampleWordsList = exampleWords.adjective[subType as AdjectiveType] || [];
        } else if (wordType === "verb") {
          exampleWordsList = exampleWords.verb[subType as VerbType] || [];
        }
        word = exampleWordsList[index];
      }
    }

    setSelectedWord(word);
    // 生成变形
    let conjugation: ConjugationData;
    if (wordType === "adjective") {
      conjugation = generateAdjectiveConjugation(
        word.word,
        word.reading,
        subType as AdjectiveType
      );
    } else if (wordType === "verb") {
      conjugation = generateVerbConjugation(
        word.word,
        word.reading,
        subType as VerbType
      );
    } else {
      conjugation = generateNounConjugation(word.word);
    }
    setConjugationData(conjugation);
  };

  return (
    <div className="p-2 pb-20">
      <Card title="日语变形助手" className="mb-2" style={{ fontSize: "14px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div className="mb-2">
            <div className="text-xs text-gray-600 mb-1">选择词性</div>
            <Picker
              columns={[wordTypeOptions]}
              value={wordTypeValue}
              onConfirm={handleWordTypeChange}
            >
              {(items, { open }) => (
                <div
                  onClick={open}
                  className="p-2 bg-gray-50 rounded cursor-pointer border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
                >
                  {items[0]?.label || (
                    <span className="text-gray-400">请选择词性</span>
                  )}
                </div>
              )}
            </Picker>
          </div>

          {wordType && wordType !== "noun" && (
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-1">选择分类</div>
              <Picker
                columns={[getSubTypeOptions()]}
                value={subTypeValue}
                onConfirm={handleSubTypeChange}
              >
                {(items, { open }) => (
                  <div
                    onClick={open}
                    className="p-2 bg-gray-50 rounded cursor-pointer border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
                  >
                    {items[0]?.label || (
                      <span className="text-gray-400">请选择分类</span>
                    )}
                  </div>
                )}
              </Picker>
            </div>
          )}

          {wordType && (wordType === "noun" || subType) && (
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-1">选择单词</div>
              <Picker
                columns={[getWordOptions()]}
                value={wordValue}
                onConfirm={handleWordChange}
              >
                {(items, { open }) => (
                  <div
                    onClick={open}
                    className="p-2 bg-gray-50 rounded cursor-pointer border border-gray-200 hover:bg-gray-100 transition-colors text-sm"
                  >
                    {items[0]?.label || (
                      <span className="text-gray-400">请选择单词</span>
                    )}
                  </div>
                )}
              </Picker>
            </div>
          )}
        </Space>
      </Card>

      {selectedWord && conjugationData && (
        <Card
          title={`${selectedWord.word} 的变形表`}
          className="mb-2"
          style={{ fontSize: "14px" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1 px-2 font-medium text-gray-700">
                    时态
                  </th>
                  <th className="text-left py-1 px-2 font-medium text-gray-700">
                    简体
                  </th>
                  <th className="text-left py-1 px-2 font-medium text-gray-700">
                    敬体
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-2 text-gray-600">现在一般时</td>
                  <td className="py-1 px-2 font-medium">
                    {conjugationData.present.plain}
                  </td>
                  <td className="py-1 px-2 font-medium">
                    {conjugationData.present.polite}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-2 text-gray-600">否定</td>
                  <td className="py-1 px-2 font-medium">
                    {conjugationData.negative.plain}
                  </td>
                  <td className="py-1 px-2 font-medium">
                    {conjugationData.negative.polite}
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-2 text-gray-600">过去时</td>
                  <td className="py-1 px-2 font-medium">
                    {conjugationData.past.plain}
                  </td>
                  <td className="py-1 px-2 font-medium">
                    {conjugationData.past.polite}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 px-2 text-gray-600">过去否定</td>
                  <td className="py-1 px-2 font-medium">
                    {conjugationData.pastNegative.plain}
                  </td>
                  <td className="py-1 px-2 font-medium">
                    {conjugationData.pastNegative.polite}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
