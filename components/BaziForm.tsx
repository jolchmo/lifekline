import React, { useState, useMemo } from 'react';
import { UserInput, Gender } from '../types';
import { Loader2, Sparkles, MapPin, Calendar } from 'lucide-react';
import { calculateBazi, HOUR_OPTIONS } from '../utils/baziCalculator';

interface BaziFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const BaziForm: React.FC<BaziFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserInput>({
    name: '',
    gender: Gender.MALE,
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthHour: '12',
    birthPlace: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // 实时计算八字预览
  const baziPreview = useMemo(() => {
    const year = parseInt(formData.birthYear);
    const month = parseInt(formData.birthMonth);
    const day = parseInt(formData.birthDay);
    const hour = parseInt(formData.birthHour);

    if (!year || !month || !day || isNaN(hour)) {
      return null;
    }

    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    try {
      const bazi = calculateBazi(year, month, day, hour);
      return bazi;
    } catch {
      return null;
    }
  }, [formData.birthYear, formData.birthMonth, formData.birthDay, formData.birthHour]);

  // 生成年份选项
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= 1900; y--) {
    yearOptions.push(y);
  }

  // 生成月份选项
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // 生成日期选项
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-serif-sc font-bold text-gray-800 mb-2">八字排盘</h2>
        <p className="text-gray-500 text-sm">请输入出生日期时间和地点</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名 (可选)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: Gender.MALE })}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
                  formData.gender === Gender.MALE
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                乾造 (男)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: Gender.FEMALE })}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
                  formData.gender === Gender.FEMALE
                    ? 'bg-white text-pink-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                坤造 (女)
              </button>
            </div>
          </div>
        </div>

        {/* Birth Date & Time */}
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
          <div className="flex items-center gap-2 mb-3 text-amber-800 text-sm font-bold">
            <Calendar className="w-4 h-4" />
            <span>出生日期时间 (阳历)</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">年</label>
              <select
                name="birthYear"
                required
                value={formData.birthYear}
                onChange={handleChange}
                className="w-full px-2 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-center font-bold"
              >
                <option value="">选择</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">月</label>
              <select
                name="birthMonth"
                required
                value={formData.birthMonth}
                onChange={handleChange}
                className="w-full px-2 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-center font-bold"
              >
                <option value="">选择</option>
                {monthOptions.map((m) => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">日</label>
              <select
                name="birthDay"
                required
                value={formData.birthDay}
                onChange={handleChange}
                className="w-full px-2 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white text-center font-bold"
              >
                <option value="">选择</option>
                {dayOptions.map((d) => (
                  <option key={d} value={d}>{d}日</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">时辰</label>
            <select
              name="birthHour"
              required
              value={formData.birthHour}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold"
            >
              {HOUR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Birth Place */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-2 mb-3 text-indigo-800 text-sm font-bold">
            <MapPin className="w-4 h-4" />
            <span>出生地点</span>
          </div>
          <input
            type="text"
            name="birthPlace"
            required
            value={formData.birthPlace}
            onChange={handleChange}
            placeholder="如：北京、上海、广州"
            className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold"
          />
          <p className="text-xs text-indigo-600/70 mt-2">
            地点用于参考真太阳时校正
          </p>
        </div>

        {/* Bazi Preview */}
        {baziPreview && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-3 text-gray-700 text-sm font-bold">
              <Sparkles className="w-4 h-4" />
              <span>八字预览</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">年柱</div>
                <div className="text-lg font-serif-sc font-bold text-gray-800">{baziPreview.yearPillar}</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">月柱</div>
                <div className="text-lg font-serif-sc font-bold text-gray-800">{baziPreview.monthPillar}</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">日柱</div>
                <div className="text-lg font-serif-sc font-bold text-gray-800">{baziPreview.dayPillar}</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">时柱</div>
                <div className="text-lg font-serif-sc font-bold text-gray-800">{baziPreview.hourPillar}</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              系统自动计算，AI 将进行校验和大运排盘
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-900 to-gray-900 hover:from-black hover:to-black text-white font-bold py-3.5 rounded-xl shadow-lg transform transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              <span>大师推演中(3-5分钟)</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-amber-300" />
              <span>生成人生K线</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BaziForm;
