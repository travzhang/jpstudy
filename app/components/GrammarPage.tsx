"use client";

import { useState } from "react";
import { Card, List, Input, Popup, Button } from "antd-mobile";
import { SearchOutline } from "antd-mobile-icons";

interface GrammarPoint {
  id: string;
  title: string;
  structure: string;
  meaning: string;
  examples: string[];
  notes?: string;
}

const n5GrammarPoints: GrammarPoint[] = [
  {
    id: "desu-masu",
    title: "です・ます形",
    structure: "名词/形容词 + です",
    meaning: "礼貌体，用于正式场合",
    examples: [
      "私は学生です。（我是学生。）",
      "これは本です。（这是书。）",
      "今日は暑いです。（今天很热。）",
    ],
  },
  {
    id: "wa-ga",
    title: "は・が",
    structure: "名词 + は/が",
    meaning: "は：主题标记；が：主语标记",
    examples: [
      "私は田中です。（我是田中。）",
      "雨が降っています。（正在下雨。）",
      "猫が好きです。（喜欢猫。）",
    ],
    notes: "は用于已知信息，が用于新信息或强调",
  },
  {
    id: "wo",
    title: "を",
    structure: "名词 + を + 动词",
    meaning: "宾格助词，表示动作的对象",
    examples: [
      "本を読みます。（读书。）",
      "コーヒーを飲みます。（喝咖啡。）",
      "日本語を勉強します。（学习日语。）",
    ],
  },
  {
    id: "ni",
    title: "に",
    structure: "名词 + に",
    meaning: "表示时间、地点、方向、目的等",
    examples: [
      "9時に起きます。（9点起床。）",
      "学校に行きます。（去学校。）",
      "図書館に本を借りに行きます。（去图书馆借书。）",
    ],
  },
  {
    id: "de",
    title: "で",
    structure: "名词 + で",
    meaning: "表示地点、手段、方法、原因等",
    examples: [
      "学校で勉強します。（在学校学习。）",
      "電車で行きます。（坐电车去。）",
      "ペンで書きます。（用笔写。）",
    ],
  },
  {
    id: "to",
    title: "と",
    structure: "名词 + と",
    meaning: "表示'和'、引用、条件等",
    examples: [
      "友達と一緒に行きます。（和朋友一起去。）",
      "「ありがとう」と言います。（说'谢谢'。）",
      "春になると暖かくなります。（一到春天就变暖。）",
    ],
  },
  {
    id: "kara-made",
    title: "から・まで",
    structure: "时间/地点 + から/まで",
    meaning: "から：从...；まで：到...",
    examples: [
      "9時から5時まで働きます。（从9点工作到5点。）",
      "東京から大阪まで行きます。（从东京到大阪。）",
      "月曜日から金曜日まで学校です。（从周一到周五上学。）",
    ],
  },
  {
    id: "he",
    title: "へ",
    structure: "名词 + へ",
    meaning: "表示方向",
    examples: [
      "学校へ行きます。（去学校。）",
      "日本へ旅行します。（去日本旅行。）",
    ],
    notes: "へ和に都可以表示方向，へ更强调方向性",
  },
  {
    id: "no",
    title: "の",
    structure: "名词 + の + 名词",
    meaning: "表示所属、性质、同位等",
    examples: [
      "私の本です。（我的书。）",
      "日本語の本です。（日语书。）",
      "友達の田中さんです。（朋友田中。）",
    ],
  },
  {
    id: "mo",
    title: "も",
    structure: "名词 + も",
    meaning: "也、都",
    examples: [
      "私も学生です。（我也是学生。）",
      "今日も雨です。（今天也下雨。）",
      "コーヒーも紅茶も好きです。（咖啡和红茶都喜欢。）",
    ],
  },
  {
    id: "arimasu-imasu",
    title: "あります・います",
    structure: "名词 + が + あります/います",
    meaning: "あります：无生命物体存在；います：有生命物体存在",
    examples: [
      "机の上に本があります。（桌子上有书。）",
      "公園に猫がいます。（公园里有猫。）",
      "冷蔵庫に牛乳があります。（冰箱里有牛奶。）",
    ],
  },
  {
    id: "te-form",
    title: "て形",
    structure: "动词て形",
    meaning: "表示动作的连续、方法、原因等",
    examples: [
      "本を読んで、寝ます。（读书后睡觉。）",
      "歩いて学校に行きます。（走着去学校。）",
      "雨が降って、寒いです。（下雨了，很冷。）",
    ],
    notes: "五段动词：词尾变て；一段动词：去掉る加て；する→して、くる→きて",
  },
  {
    id: "ta-form",
    title: "た形",
    structure: "动词た形",
    meaning: "过去时",
    examples: [
      "昨日、本を読みました。（昨天读书了。）",
      "先週、日本に行きました。（上周去了日本。）",
      "おととい、友達に会いました。（前天见了朋友。）",
    ],
    notes: "た形变化规则与て形相同，只是て→た、で→だ",
  },
  {
    id: "nai-form",
    title: "ない形",
    structure: "动词ない形 + ない",
    meaning: "否定形",
    examples: [
      "本を読みません。（不读书。）",
      "コーヒーを飲まない。（不喝咖啡。）",
      "学校に行かない。（不去学校。）",
    ],
  },
  {
    id: "tai",
    title: "たい",
    structure: "动词ます形 + たい",
    meaning: "想要...",
    examples: [
      "日本に行きたいです。（想去日本。）",
      "コーヒーが飲みたいです。（想喝咖啡。）",
      "本を読みたいです。（想读书。）",
    ],
    notes: "たい是形容词，前面用が或を都可以",
  },
  {
    id: "hoshii",
    title: "ほしい",
    structure: "名词 + が + ほしい",
    meaning: "想要（某物）",
    examples: [
      "新しい本がほしいです。（想要新书。）",
      "車がほしいです。（想要车。）",
      "何がほしいですか。（你想要什么？）",
    ],
  },
  {
    id: "dekimasu",
    title: "できます",
    structure: "动词辞书形 + ことができます",
    meaning: "能够、会",
    examples: [
      "日本語が話せます。（会说日语。）",
      "ピアノを弾くことができます。（会弹钢琴。）",
      "泳ぐことができます。（会游泳。）",
    ],
    notes: "できます也可以单独使用，表示'能够'",
  },
  {
    id: "temo-ii",
    title: "てもいい",
    structure: "动词て形 + もいい",
    meaning: "可以...",
    examples: [
      "ここで写真を撮ってもいいですか。（可以在这里拍照吗？）",
      "はい、撮ってもいいです。（可以拍。）",
      "窓を開けてもいいです。（可以开窗。）",
    ],
  },
  {
    id: "tewa-ikenai",
    title: "てはいけない",
    structure: "动词て形 + はいけない",
    meaning: "不可以、禁止",
    examples: [
      "ここでタバコを吸ってはいけません。（这里不可以吸烟。）",
      "遅刻してはいけません。（不可以迟到。）",
      "大声で話してはいけません。（不可以大声说话。）",
    ],
  },
  {
    id: "nakereba-naranai",
    title: "なければならない",
    structure: "动词ない形 + なければならない",
    meaning: "必须、不得不",
    examples: [
      "宿題をしなければなりません。（必须做作业。）",
      "毎日勉強しなければなりません。（每天必须学习。）",
      "早く起きなければなりません。（必须早起。）",
    ],
  },
  {
    id: "ta-hou-ga-ii",
    title: "たほうがいい",
    structure: "动词た形 + ほうがいい",
    meaning: "最好...、应该...",
    examples: [
      "早く寝たほうがいいです。（最好早点睡。）",
      "薬を飲んだほうがいいです。（最好吃药。）",
      "傘を持って行ったほうがいいです。（最好带伞去。）",
    ],
  },
  {
    id: "koto-ga-aru",
    title: "ことがある",
    structure: "动词た形 + ことがある",
    meaning: "曾经...过",
    examples: [
      "日本に行ったことがあります。（去过日本。）",
      "寿司を食べたことがあります。（吃过寿司。）",
      "富士山に登ったことがあります。（爬过富士山。）",
    ],
  },
  {
    id: "koto-ga-dekiru",
    title: "ことができる",
    structure: "动词辞书形 + ことができる",
    meaning: "能够、会",
    examples: [
      "日本語を話すことができます。（会说日语。）",
      "車を運転することができます。（会开车。）",
      "料理を作ることができます。（会做菜。）",
    ],
  },
  {
    id: "sugiru",
    title: "すぎる",
    structure: "动词ます形/形容词词干 + すぎる",
    meaning: "太...、过于...",
    examples: [
      "食べすぎました。（吃太多了。）",
      "高すぎます。（太贵了。）",
      "暑すぎます。（太热了。）",
    ],
  },
  {
    id: "hajimeru",
    title: "始める・始まる",
    structure: "动词て形 + 始める",
    meaning: "开始...",
    examples: [
      "雨が降り始めました。（开始下雨了。）",
      "本を読み始めます。（开始读书。）",
      "勉強を始めました。（开始学习了。）",
    ],
  },
  {
    id: "owaru",
    title: "終わる・終える",
    structure: "动词て形 + 終わる",
    meaning: "结束...",
    examples: [
      "仕事が終わりました。（工作结束了。）",
      "本を読み終わりました。（读完了书。）",
      "映画が終わりました。（电影结束了。）",
    ],
  },
  {
    id: "tsuzukeru",
    title: "続ける",
    structure: "动词て形 + 続ける",
    meaning: "继续...",
    examples: [
      "勉強を続けます。（继续学习。）",
      "働き続けます。（继续工作。）",
      "走り続けました。（继续跑。）",
    ],
  },
  {
    id: "adjectives-i",
    title: "い形容词",
    structure: "形容词 + です/だ",
    meaning: "一类形容词，以い结尾",
    examples: [
      "高いです。（很贵。）",
      "新しい本です。（新书。）",
      "暑いですね。（很热呢。）",
    ],
    notes: "否定：高くない；过去：高かった；过去否定：高くなかった",
  },
  {
    id: "adjectives-na",
    title: "な形容词",
    structure: "形容词 + です/だ",
    meaning: "二类形容词，需要加な修饰名词",
    examples: [
      "静かです。（很安静。）",
      "静かな公園です。（安静的公园。）",
      "元気です。（很有精神。）",
    ],
    notes: "否定：静かではない；过去：静かだった；过去否定：静かではなかった",
  },
  {
    id: "comparison",
    title: "比较表达",
    structure: "AはBより + 形容词",
    meaning: "A比B...",
    examples: [
      "日本は中国より小さいです。（日本比中国小。）",
      "コーヒーは紅茶より好きです。（比红茶更喜欢咖啡。）",
      "今日は昨日より暑いです。（今天比昨天热。）",
    ],
  },
  {
    id: "ichiban",
    title: "一番",
    structure: "一番 + 形容词",
    meaning: "最...",
    examples: [
      "一番好きな食べ物は寿司です。（最喜欢的食物是寿司。）",
      "一番高い山は富士山です。（最高的山是富士山。）",
      "一番難しい科目は数学です。（最难的科目是数学。）",
    ],
  },
  {
    id: "quantity",
    title: "数量词",
    structure: "数量词 + で/に",
    meaning: "表示数量",
    examples: [
      "りんごを3つ買いました。（买了3个苹果。）",
      "本を5冊読みました。（读了5本书。）",
      "コーヒーを2杯飲みました。（喝了2杯咖啡。）",
    ],
    notes: "不同物品使用不同的数量词：つ（通用）、冊（书）、杯（饮料）、個（小物品）等",
  },
  {
    id: "time-expressions",
    title: "时间表达",
    structure: "时间词 + に/から/まで",
    meaning: "表示时间",
    examples: [
      "9時に起きます。（9点起床。）",
      "朝から晩まで働きます。（从早到晚工作。）",
      "毎日7時に起きます。（每天7点起床。）",
    ],
    notes: "具体时间用に，时间段用から/まで",
  },
  {
    id: "frequency",
    title: "频率表达",
    structure: "频率词 + 动词",
    meaning: "表示频率",
    examples: [
      "毎日勉強します。（每天学习。）",
      "時々映画を見ます。（有时看电影。）",
      "よく本を読みます。（经常读书。）",
    ],
    notes: "よく（经常）、時々（有时）、たまに（偶尔）、めったに（很少）",
  },
];

export default function GrammarPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrammar, setSelectedGrammar] = useState<GrammarPoint | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);

  const filteredGrammar = n5GrammarPoints.filter(
    (grammar) =>
      grammar.title.includes(searchQuery) ||
      grammar.structure.includes(searchQuery) ||
      grammar.meaning.includes(searchQuery) ||
      grammar.examples.some((ex) => ex.includes(searchQuery))
  );

  const handleGrammarClick = (grammar: GrammarPoint) => {
    setSelectedGrammar(grammar);
    setPopupVisible(true);
  };

  return (
    <div className="p-2 pb-20">
      <Card
        title="N5语法"
        className="mb-2"
        style={{ fontSize: "14px" }}
      >
        <div className="mb-3 relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchOutline />
          </div>
          <Input
            placeholder="搜索语法点..."
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            style={{ paddingLeft: "32px" }}
            clearable
          />
        </div>
        {filteredGrammar.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            {searchQuery ? "未找到匹配的语法点" : "暂无语法点"}
          </div>
        ) : (
          <List>
            {filteredGrammar.map((grammar) => (
              <List.Item
                key={grammar.id}
                onClick={() => handleGrammarClick(grammar)}
                className="cursor-pointer"
              >
                <div>
                  <div className="font-medium text-base mb-1">
                    {grammar.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {grammar.structure}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {grammar.meaning}
                  </div>
                </div>
              </List.Item>
            ))}
          </List>
        )}
      </Card>

      {/* 语法详情浮层 */}
      <Popup
        visible={popupVisible}
        onMaskClick={() => setPopupVisible(false)}
        bodyStyle={{ borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}
      >
        <div className="p-4">
          {selectedGrammar && (
            <>
              <div className="text-lg font-medium mb-4">
                {selectedGrammar.title}
              </div>
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">结构</div>
                <div className="text-base font-medium">
                  {selectedGrammar.structure}
                </div>
              </div>
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">意思</div>
                <div className="text-base">
                  {selectedGrammar.meaning}
                </div>
              </div>
              {selectedGrammar.notes && (
                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-1">备注</div>
                  <div className="text-sm text-gray-500 italic">
                    {selectedGrammar.notes}
                  </div>
                </div>
              )}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">例句</div>
                {selectedGrammar.examples.map((example, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-gray-700 mb-2 pl-2 border-l-2 border-gray-200"
                  >
                    {example}
                  </div>
                ))}
              </div>
              <Button
                block
                color="primary"
                onClick={() => setPopupVisible(false)}
              >
                关闭
              </Button>
            </>
          )}
        </div>
      </Popup>
    </div>
  );
}
