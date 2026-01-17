"use client";

import { useState, useEffect } from "react";
import {
  Card,
  List,
  Button,
  Dialog,
  Input,
  Picker,
  Space,
  Toast,
  Popup,
} from "antd-mobile";
import { AddOutline, DeleteOutline, EditSOutline, SearchOutline } from "antd-mobile-icons";
import type { PickerValue } from "antd-mobile/es/components/picker";
import {
  conjugateGodanVerb,
  conjugateIchidanVerb,
  conjugateIrregularVerb,
  conjugateIAdjective,
  conjugateNaAdjective,
} from "@/lib/japanese-conjugation";

interface Word {
  id: number;
  word: string;
  reading: string;
  meaning: string;
  wordType: string;
  subType: string | null;
}

interface ConjugationData {
  present: { plain: string; polite: string };
  negative: { plain: string; polite: string };
  past: { plain: string; polite: string };
  pastNegative: { plain: string; polite: string };
}

export default function WordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [conjugationVisible, setConjugationVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [conjugationData, setConjugationData] = useState<ConjugationData | null>(null);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    word: "",
    reading: "",
    meaning: "",
    wordType: "",
    subType: "",
  });

  const wordTypeOptions = [
    { label: "形容词", value: "adjective" },
    { label: "动词", value: "verb" },
  ];

  const getSubTypeOptions = (wordType: string) => {
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

  const fetchWords = async (search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) {
        params.append("search", search);
      }
      // 添加时间戳防止缓存，并设置 no-cache 头部
      params.append("_t", Date.now().toString());
      const response = await fetch(`/api/words?${params.toString()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      } else {
        Toast.show("获取单词列表失败");
      }
    } catch (error) {
      Toast.show("获取单词列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWords(searchQuery);
    }, 300); // 防抖

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleWordClick = (word: Word) => {
    setSelectedWord(word);
    // 生成变形
    let conjugation: ConjugationData;
    if (word.wordType === "adjective") {
      if (word.subType === "i-adjective") {
        conjugation = conjugateIAdjective(word.word, word.reading);
      } else {
        conjugation = conjugateNaAdjective(word.word, word.reading);
      }
    } else if (word.wordType === "verb") {
      if (word.subType === "godan") {
        conjugation = conjugateGodanVerb(word.word, word.reading);
      } else if (word.subType === "ichidan") {
        conjugation = conjugateIchidanVerb(word.word, word.reading);
      } else {
        conjugation = conjugateIrregularVerb(word.word, word.reading);
      }
    } else {
      // 不应该到这里
      Toast.show("不支持的词性");
      return;
    }
    setConjugationData(conjugation);
    setConjugationVisible(true);
  };

  const handleAdd = () => {
    setEditingWord(null);
    setFormData({
      word: "",
      reading: "",
      meaning: "",
      wordType: "",
      subType: "",
    });
    setVisible(true);
  };

  const handleEdit = (e: React.MouseEvent, word: Word) => {
    e.stopPropagation();
    setEditingWord(word);
    setFormData({
      word: word.word,
      reading: word.reading,
      meaning: word.meaning,
      wordType: word.wordType,
      subType: word.subType || "",
    });
    setVisible(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      const result = await Dialog.confirm({
        content: "确定要删除这个单词吗？",
        confirmText: "删除",
        cancelText: "取消",
      });
      
      if (result) {
        const response = await fetch(`/api/words/${id}`, {
          method: "DELETE",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        
        if (response.ok) {
          Toast.show("删除成功");
          // 重新获取单词列表
          await fetchWords(searchQuery);
        } else {
          const errorData = await response.json().catch(() => ({}));
          Toast.show(errorData.error || "删除失败");
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      Toast.show("删除失败，请重试");
    }
  };

  const handleSubmit = async () => {
    if (!formData.word || !formData.reading || !formData.meaning) {
      Toast.show("请填写完整信息");
      return;
    }

    if (formData.wordType === "adjective" || formData.wordType === "verb") {
      if (!formData.subType) {
        Toast.show("请选择分类");
        return;
      }
    }

    try {
      const url = editingWord
        ? `/api/words/${editingWord.id}`
        : "/api/words";
      const method = editingWord ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          word: formData.word,
          reading: formData.reading,
          meaning: formData.meaning,
          wordType: formData.wordType,
          subType: formData.subType || null,
        }),
      });

      if (response.ok) {
        Toast.show(editingWord ? "更新成功" : "创建成功");
        setVisible(false);
        fetchWords(searchQuery);
      } else {
        const error = await response.json();
        Toast.show(error.error || "操作失败");
      }
    } catch (error) {
      Toast.show("操作失败");
    }
  };

  const getWordTypeLabel = (wordType: string) => {
    const option = wordTypeOptions.find((opt) => opt.value === wordType);
    return option?.label || wordType;
  };

  const getSubTypeLabel = (wordType: string, subType: string | null) => {
    if (!subType) return "";
    const options = getSubTypeOptions(wordType);
    const option = options.find((opt) => opt.value === subType);
    return option?.label || subType;
  };

  return (
    <div className="p-2 pb-20">
      <Card
        title="单词管理"
        extra={
          <Button
            size="small"
            color="primary"
            onClick={handleAdd}
            style={{ fontSize: "12px" }}
          >
            <div className="flex items-center gap-1">
            <AddOutline /> 添加
            </div>
          </Button>
        }
        className="mb-2"
        style={{ fontSize: "14px" }}
      >
        <div className="mb-3 relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchOutline />
          </div>
          <Input
            placeholder="搜索单词、读音或意思..."
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            style={{ paddingLeft: "32px" }}
            clearable
          />
        </div>
        {loading ? (
          <div className="text-center py-4 text-gray-400">加载中...</div>
        ) : words.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            {searchQuery ? "未找到匹配的单词" : "暂无单词"}
          </div>
        ) : (
          <List>
            {words.map((word) => (
              <List.Item
                key={word.id}
                onClick={() => handleWordClick(word)}
                extra={
                  <Space onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      fill="none"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleEdit(e, word);
                      }}
                    >
                      <EditSOutline />
                    </Button>
                    <Button
                      size="small"
                      fill="none"
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDelete(e, word.id);
                      }}
                    >
                      <DeleteOutline />
                    </Button>
                  </Space>
                }
                className="cursor-pointer"
              >
                <div>
                  <div className="font-medium text-base">
                    {word.word}（{word.reading}）
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {word.meaning}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {getWordTypeLabel(word.wordType)}
                    {word.subType && ` - ${getSubTypeLabel(word.wordType, word.subType)}`}
                  </div>
                </div>
              </List.Item>
            ))}
          </List>
        )}
      </Card>

      {/* 变形表浮层 */}
      <Popup
        visible={conjugationVisible}
        onMaskClick={() => setConjugationVisible(false)}
        bodyStyle={{ borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}
      >
        <div className="p-4">
          <div className="text-lg font-medium mb-4">
            {selectedWord?.word} 的变形表
          </div>
          {conjugationData && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-700">
                      时态
                    </th>
                    <th className="text-left py-2 px-2 font-medium text-gray-700">
                      简体
                    </th>
                    <th className="text-left py-2 px-2 font-medium text-gray-700">
                      敬体
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2 text-gray-600">现在一般时</td>
                    <td className="py-2 px-2 font-medium">
                      {conjugationData.present.plain}
                    </td>
                    <td className="py-2 px-2 font-medium">
                      {conjugationData.present.polite}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2 text-gray-600">否定</td>
                    <td className="py-2 px-2 font-medium">
                      {conjugationData.negative.plain}
                    </td>
                    <td className="py-2 px-2 font-medium">
                      {conjugationData.negative.polite}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-2 text-gray-600">过去时</td>
                    <td className="py-2 px-2 font-medium">
                      {conjugationData.past.plain}
                    </td>
                    <td className="py-2 px-2 font-medium">
                      {conjugationData.past.polite}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-gray-600">过去否定</td>
                    <td className="py-2 px-2 font-medium">
                      {conjugationData.pastNegative.plain}
                    </td>
                    <td className="py-2 px-2 font-medium">
                      {conjugationData.pastNegative.polite}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Button
              block
              color="primary"
              onClick={() => setConjugationVisible(false)}
            >
              关闭
            </Button>
          </div>
        </div>
      </Popup>

      {/* 添加/编辑单词浮层 */}
      <Popup
        visible={visible}
        onMaskClick={() => setVisible(false)}
        bodyStyle={{ borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}
      >
        <div className="p-4">
          <div className="text-lg font-medium mb-4">
            {editingWord ? "编辑单词" : "添加单词"}
          </div>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <div className="text-sm text-gray-600 mb-1">单词</div>
              <Input
                placeholder="输入单词（汉字/假名）"
                value={formData.word}
                onChange={(val) => setFormData({ ...formData, word: val })}
              />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">读音</div>
              <Input
                placeholder="输入读音（假名）"
                value={formData.reading}
                onChange={(val) => setFormData({ ...formData, reading: val })}
              />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">意思</div>
              <Input
                placeholder="输入中文意思"
                value={formData.meaning}
                onChange={(val) => setFormData({ ...formData, meaning: val })}
              />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">词性</div>
              <Picker
                columns={[wordTypeOptions]}
                value={formData.wordType ? [formData.wordType] : []}
                onConfirm={(val) => {
                  const newWordType = val[0] as string;
                  setFormData({
                    ...formData,
                    wordType: newWordType,
                    subType: "", // 重置子类型
                  });
                }}
              >
                {(items, { open }) => (
                  <div
                    onClick={open}
                    className="p-2 bg-gray-50 rounded cursor-pointer border border-gray-200 text-sm"
                  >
                    {items[0]?.label || (
                      <span className="text-gray-400">请选择词性</span>
                    )}
                  </div>
                )}
              </Picker>
            </div>
            {(formData.wordType === "adjective" ||
              formData.wordType === "verb") && (
              <div>
                <div className="text-sm text-gray-600 mb-1">分类</div>
                <Picker
                  columns={[getSubTypeOptions(formData.wordType)]}
                  value={formData.subType ? [formData.subType] : []}
                  onConfirm={(val) => {
                    setFormData({
                      ...formData,
                      subType: val[0] as string,
                    });
                  }}
                >
                  {(items, { open }) => (
                    <div
                      onClick={open}
                      className="p-2 bg-gray-50 rounded cursor-pointer border border-gray-200 text-sm"
                    >
                      {items[0]?.label || (
                        <span className="text-gray-400">请选择分类</span>
                      )}
                    </div>
                  )}
                </Picker>
              </div>
            )}
            <Space style={{ width: "100%" }} justify="between">
              <Button
                block
                onClick={() => setVisible(false)}
                style={{ flex: 1 }}
              >
                取消
              </Button>
              <Button
                block
                color="primary"
                onClick={handleSubmit}
                style={{ flex: 1 }}
              >
                {editingWord ? "更新" : "创建"}
              </Button>
            </Space>
          </Space>
        </div>
      </Popup>
    </div>
  );
}
