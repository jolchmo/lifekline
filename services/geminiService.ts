import { UserInput, LifeDestinyResult, Gender } from "../types";
import { BAZI_SYSTEM_INSTRUCTION } from "../constants";
import { calculateBazi } from "../utils/baziCalculator";

// 从环境变量读取配置
const API_KEY = process.env.API_KEY || '';
const API_BASE_URL = process.env.BASE_URL || '';
const MODEL = process.env.MODEL || '';

export const generateLifeAnalysis = async (input: UserInput): Promise<LifeDestinyResult> => {

  // 检查环境变量是否配置
  if (!API_KEY || !API_BASE_URL || !MODEL) {
    throw new Error("请在 .env 文件中配置 BASE_URL、API_KEY 和 MODEL");
  }

  const genderStr = input.gender === Gender.MALE ? '男 (乾造)' : '女 (坤造)';

  // 解析出生日期
  const birthYear = parseInt(input.birthYear);
  const birthMonth = parseInt(input.birthMonth);
  const birthDay = parseInt(input.birthDay);
  const birthHour = parseInt(input.birthHour);

  // 计算八字四柱
  const bazi = calculateBazi(birthYear, birthMonth, birthDay, birthHour);

  // 格式化出生日期时间
  const birthDateTime = `${birthYear}年${birthMonth}月${birthDay}日`;

  // 时辰名称映射
  const hourNames: { [key: number]: string } = {
    0: '子时 (23:00-01:00)',
    2: '丑时 (01:00-03:00)',
    4: '寅时 (03:00-05:00)',
    6: '卯时 (05:00-07:00)',
    8: '辰时 (07:00-09:00)',
    10: '巳时 (09:00-11:00)',
    12: '午时 (11:00-13:00)',
    14: '未时 (13:00-15:00)',
    16: '申时 (15:00-17:00)',
    18: '酉时 (17:00-19:00)',
    20: '戌时 (19:00-21:00)',
    22: '亥时 (21:00-23:00)',
  };
  const hourName = hourNames[birthHour] || `${birthHour}时`;

  // 判断年干阴阳
  const yangStems = ['甲', '丙', '戊', '庚', '壬'];
  const yearStem = bazi.yearPillar.charAt(0);
  const isYangYear = yangStems.includes(yearStem);

  // 计算大运方向
  let isForward = false;
  if (input.gender === Gender.MALE) {
    isForward = isYangYear; // 阳男顺行，阴男逆行
  } else {
    isForward = !isYangYear; // 阴女顺行，阳女逆行
  }
  const daYunDirection = isForward ? '顺行' : '逆行';

  const userPrompt = `
    请根据以下出生信息进行八字命理分析。

    【基本信息】
    性别：${genderStr}
    姓名：${input.name || "未提供"}
    出生地点：${input.birthPlace}

    【出生日期时间】(阳历)
    日期：${birthDateTime}
    时辰：${hourName}

    【系统预排八字四柱】(供参考，请根据真太阳时校验)
    年柱：${bazi.yearPillar}
    月柱：${bazi.monthPillar}
    日柱：${bazi.dayPillar}
    时柱：${bazi.hourPillar}

    【大运方向】
    年干「${yearStem}」属${isYangYear ? '阳' : '阴'}，${genderStr}，大运${daYunDirection}。

    【任务要求】
    1. 根据出生地点「${input.birthPlace}」考虑真太阳时校正，确认或调整四柱八字。
    2. 计算起运年龄和第一步大运干支。
    3. 根据大运方向（${daYunDirection}）推算完整的大运序列。
    4. 确认格局与喜忌。
    5. 生成 **1-100 岁 (虚岁)** 的人生流年K线数据。
    6. 在 \`reason\` 字段中提供流年详批。
    7. 生成带评分的命理分析报告。

    请严格按照系统指令生成 JSON 数据。
  `;

  try {
    // 确保 BASE_URL 末尾没有斜杠
    const baseUrl = API_BASE_URL.replace(/\/+$/, '');
    const requestUrl = `${baseUrl}/chat/completions`;

    console.log('请求 URL:', requestUrl);
    console.log('使用模型:', MODEL);
    console.log('使用流式输出...');

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: BAZI_SYSTEM_INSTRUCTION },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        stream: true  // 启用流式输出
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${errText}`);
    }

    // 读取流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("无法读取响应流");
    }

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonStr = trimmedLine.slice(6);
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
            }
          } catch {
            // 忽略解析错误，继续处理下一行
          }
        }
      }
    }

    console.log('流式输出完成，总长度:', fullContent.length);

    if (!fullContent) {
      throw new Error("模型未返回任何内容。");
    }

    // 解析 JSON
    const data = JSON.parse(fullContent);

    // 简单校验数据完整性
    if (!data.chartPoints || !Array.isArray(data.chartPoints)) {
      throw new Error("模型返回的数据格式不正确（缺失 chartPoints）。");
    }

    return {
      chartData: data.chartPoints,
      analysis: {
        bazi: data.bazi || [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar],
        summary: data.summary || "无摘要",
        summaryScore: data.summaryScore || 5,
        industry: data.industry || "无",
        industryScore: data.industryScore || 5,
        wealth: data.wealth || "无",
        wealthScore: data.wealthScore || 5,
        marriage: data.marriage || "无",
        marriageScore: data.marriageScore || 5,
        health: data.health || "无",
        healthScore: data.healthScore || 5,
        family: data.family || "无",
        familyScore: data.familyScore || 5,
      },
    };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
