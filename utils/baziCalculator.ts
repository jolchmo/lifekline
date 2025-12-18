/**
 * 八字排盘计算工具
 * 根据阳历出生日期时间计算四柱八字
 */

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 时辰对应表 (小时 -> 地支索引)
const HOUR_TO_ZHI: { [key: number]: number } = {
  23: 0, 0: 0,   // 子时 23:00-01:00
  1: 1, 2: 1,    // 丑时 01:00-03:00
  3: 2, 4: 2,    // 寅时 03:00-05:00
  5: 3, 6: 3,    // 卯时 05:00-07:00
  7: 4, 8: 4,    // 辰时 07:00-09:00
  9: 5, 10: 5,   // 巳时 09:00-11:00
  11: 6, 12: 6,  // 午时 11:00-13:00
  13: 7, 14: 7,  // 未时 13:00-15:00
  15: 8, 16: 8,  // 申时 15:00-17:00
  17: 9, 18: 9,  // 酉时 17:00-19:00
  19: 10, 20: 10, // 戌时 19:00-21:00
  21: 11, 22: 11, // 亥时 21:00-23:00
};

// 农历数据 1900-2100年
// 每年用16进制表示，前12位表示12个月的大小月（1大0小），后4位表示闰月月份（0表示无闰月）
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520,
];

// 节气数据 - 每年24节气的日期偏移（从小寒开始）
// 这里使用简化算法，实际应用中可能需要更精确的数据
const SOLAR_TERM_BASE = [
  [6, 20], [4, 19], [6, 21], [5, 20], [6, 21], [6, 22],
  [7, 23], [8, 23], [8, 23], [9, 23], [8, 23], [7, 22],
  [8, 22], [8, 23], [8, 23], [8, 23], [7, 22], [7, 22],
  [8, 23], [8, 23], [8, 22], [8, 22], [7, 22], [7, 21]
];

// 节气名称
const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

/**
 * 获取某年某月的节气日期（简化算法）
 */
function getSolarTermDate(year: number, month: number, termIndex: number): number {
  // termIndex: 0-23 对应24节气
  // 每个月有两个节气，termIndex = (month - 1) * 2 或 (month - 1) * 2 + 1
  const baseDay = SOLAR_TERM_BASE[termIndex][0];

  // 简单的年份修正
  const yearOffset = Math.floor((year - 1900) * 0.2422);
  let day = baseDay + yearOffset;

  // 特殊年份修正（简化处理）
  if (termIndex === 2 && year >= 2000) { // 立春
    day = Math.floor(4 + (year - 2000) * 0.2422) - Math.floor((year - 2000) / 4);
  }

  return day;
}

/**
 * 获取立春日期
 */
function getLiChunDate(year: number): Date {
  // 立春通常在2月3-5日
  const day = getSolarTermDate(year, 2, 2);
  return new Date(year, 1, day); // 月份从0开始
}

/**
 * 获取某月的节气日期（月初的节气）
 */
function getMonthJieQi(year: number, month: number): number {
  // 月初节气索引：1月=小寒(0), 2月=立春(2), 3月=惊蛰(4)...
  const termIndex = ((month - 1) * 2) % 24;
  return getSolarTermDate(year, month, termIndex);
}

/**
 * 计算年柱
 * 以立春为界，立春前属于上一年
 */
export function getYearPillar(date: Date): string {
  let year = date.getFullYear();
  const liChun = getLiChunDate(year);

  // 立春前属于上一年
  if (date < liChun) {
    year -= 1;
  }

  // 年干支计算：(年份 - 4) % 60
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;

  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

/**
 * 计算月柱
 * 以节气为界
 */
export function getMonthPillar(date: Date, yearGanIndex: number): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // 获取当月节气日期
  const jieQiDay = getMonthJieQi(year, month);

  // 确定农历月份
  let lunarMonth = month;
  if (day < jieQiDay) {
    lunarMonth = month - 1;
    if (lunarMonth === 0) lunarMonth = 12;
  }

  // 月地支固定：寅月(1月/正月)=2, 卯月=3...
  // 农历正月=寅月，对应阳历2月左右
  // 简化处理：阳历月份对应
  const monthZhiMap: { [key: number]: number } = {
    1: 11, // 丑月 (小寒后)
    2: 0,  // 寅月 (立春后) - 注意这里用0表示寅
    3: 1,  // 卯月
    4: 2,  // 辰月
    5: 3,  // 巳月
    6: 4,  // 午月
    7: 5,  // 未月
    8: 6,  // 申月
    9: 7,  // 酉月
    10: 8, // 戌月
    11: 9, // 亥月
    12: 10, // 子月
  };

  // 调整：寅月开始，所以地支索引需要+2
  let zhiIndex = monthZhiMap[lunarMonth];
  zhiIndex = (zhiIndex + 2) % 12;

  // 月干计算：根据年干推算
  // 甲己之年丙作首，乙庚之岁戊为头，丙辛之岁寻庚上，丁壬壬寅顺水流，戊癸之年甲寅头
  const yearGan = yearGanIndex % 10;
  let monthGanBase = 0;

  if (yearGan === 0 || yearGan === 5) { // 甲、己
    monthGanBase = 2; // 丙
  } else if (yearGan === 1 || yearGan === 6) { // 乙、庚
    monthGanBase = 4; // 戊
  } else if (yearGan === 2 || yearGan === 7) { // 丙、辛
    monthGanBase = 6; // 庚
  } else if (yearGan === 3 || yearGan === 8) { // 丁、壬
    monthGanBase = 8; // 壬
  } else { // 戊、癸
    monthGanBase = 0; // 甲
  }

  // 从寅月开始计算月干
  const monthOffset = (lunarMonth + 10) % 12; // 寅月=0
  const ganIndex = (monthGanBase + monthOffset) % 10;

  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

/**
 * 计算日柱
 * 使用儒略日算法
 */
export function getDayPillar(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 计算儒略日
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;

  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // 日干支计算
  // 以1900年1月31日（甲辰日）为基准
  const baseJD = 2415051; // 1900年1月31日的儒略日
  const offset = jd - baseJD;

  const ganIndex = ((offset % 10) + 10) % 10;
  const zhiIndex = ((offset % 12) + 12) % 12;

  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

/**
 * 计算时柱
 */
export function getHourPillar(hour: number, dayGanIndex: number): string {
  // 获取时辰地支
  let zhiIndex = HOUR_TO_ZHI[hour];
  if (zhiIndex === undefined) {
    zhiIndex = 0;
  }

  // 时干计算：根据日干推算
  // 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
  const dayGan = dayGanIndex % 10;
  let hourGanBase = 0;

  if (dayGan === 0 || dayGan === 5) { // 甲、己
    hourGanBase = 0; // 甲
  } else if (dayGan === 1 || dayGan === 6) { // 乙、庚
    hourGanBase = 2; // 丙
  } else if (dayGan === 2 || dayGan === 7) { // 丙、辛
    hourGanBase = 4; // 戊
  } else if (dayGan === 3 || dayGan === 8) { // 丁、壬
    hourGanBase = 6; // 庚
  } else { // 戊、癸
    hourGanBase = 8; // 壬
  }

  const ganIndex = (hourGanBase + zhiIndex) % 10;

  return TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex];
}

/**
 * 获取天干索引
 */
export function getGanIndex(gan: string): number {
  return TIAN_GAN.indexOf(gan);
}

/**
 * 获取地支索引
 */
export function getZhiIndex(zhi: string): number {
  return DI_ZHI.indexOf(zhi);
}

/**
 * 完整的八字计算
 */
export interface BaziResult {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  yearGanIndex: number;
  dayGanIndex: number;
}

export function calculateBazi(
  year: number,
  month: number,
  day: number,
  hour: number
): BaziResult {
  const date = new Date(year, month - 1, day);

  // 计算年柱
  const yearPillar = getYearPillar(date);
  const yearGanIndex = getGanIndex(yearPillar.charAt(0));

  // 计算月柱
  const monthPillar = getMonthPillar(date, yearGanIndex);

  // 计算日柱
  const dayPillar = getDayPillar(date);
  const dayGanIndex = getGanIndex(dayPillar.charAt(0));

  // 计算时柱
  const hourPillar = getHourPillar(hour, dayGanIndex);

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    yearGanIndex,
    dayGanIndex,
  };
}

/**
 * 时辰选项列表
 */
export const HOUR_OPTIONS = [
  { value: 0, label: '子时 (23:00-01:00)' },
  { value: 2, label: '丑时 (01:00-03:00)' },
  { value: 4, label: '寅时 (03:00-05:00)' },
  { value: 6, label: '卯时 (05:00-07:00)' },
  { value: 8, label: '辰时 (07:00-09:00)' },
  { value: 10, label: '巳时 (09:00-11:00)' },
  { value: 12, label: '午时 (11:00-13:00)' },
  { value: 14, label: '未时 (13:00-15:00)' },
  { value: 16, label: '申时 (15:00-17:00)' },
  { value: 18, label: '酉时 (17:00-19:00)' },
  { value: 20, label: '戌时 (19:00-21:00)' },
  { value: 22, label: '亥时 (21:00-23:00)' },
];
