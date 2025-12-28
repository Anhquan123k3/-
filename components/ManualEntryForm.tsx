import React, { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { Side2Result } from '../types';

interface ManualEntryFormProps {
  onSave: (data: Side2Result) => void;
}

const INITIAL_STATE = {
  studentId: '',
  Q1: 0,
  Q2: '',
  Q3: '',
  Q4: [] as string[],
  Q5: '',
  Q6: null as number | null,
  Q7: null as number | null,
  Q8: '',
  Q9: '',
  Q10: null as number | null,
};

const Q4_OPTIONS = [
  "1. 专注于课堂内容",
  "2. 思考与本节课或本课程相关的其他内容",
  "3. 思考与其他课程相关的事情",
  "4. 在想与任何课程都无相关的事情",
  "5. 使用手机或电脑进行于课堂无关的活动"
];

interface ManualEntryFormProps {
  onSave: (data: Side2Result) => void;
  nextSequentialId: number;
}

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onSave, nextSequentialId }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [timeEntries, setTimeEntries] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: keyof typeof INITIAL_STATE, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  // Special handler for Q1 to generate Q2 inputs
  const handleCountChange = (val: number) => {
    const count = Math.max(0, val);
    setFormData(prev => ({ ...prev, Q1: count }));
    setIsSaved(false);

    setTimeEntries(prev => {
      if (count > prev.length) {
        // Add empty strings for new entries
        return [...prev, ...Array(count - prev.length).fill('')];
      } else if (count < prev.length) {
        // Slice to reduce
        return prev.slice(0, count);
      }
      return prev;
    });
  };

  // Handler for individual time inputs
  const handleTimeEntryChange = (index: number, value: string) => {
    const newEntries = [...timeEntries];
    newEntries[index] = value;
    setTimeEntries(newEntries);
    setIsSaved(false);
  };

  const handleQ4Change = (option: string) => {
    setFormData(prev => {
      const current = prev.Q4;
      if (current.includes(option)) {
        return { ...prev, Q4: current.filter(item => item !== option) };
      } else {
        return { ...prev, Q4: [...current, option] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aggregated Q2 time entries into a single string with Chinese labels
    const q2String = timeEntries
      .map((t, i) => `第${i + 1}次=${t.trim() || '?'}`)
      .join(', ');

    const newRecord: Side2Result = {
      ...formData,
      studentId: formData.studentId.trim() || String(nextSequentialId),
      Q2: q2String,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    onSave(newRecord);

    // Reset form
    setFormData(INITIAL_STATE);
    setTimeEntries([]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const renderRatingButtons = (field: 'Q6' | 'Q7' | 'Q10', value: number | null) => (
    <div className="flex gap-2 mt-2">
      {[1, 2, 3, 4, 5].map((val) => (
        <button
          key={val}
          type="button"
          onClick={() => handleChange(field, value === val ? null : val)}
          className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${value === val
            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
            : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
            }`}
        >
          {val}
        </button>
      ))}
      <button
        type="button"
        onClick={() => handleChange(field, null)}
        className={`px-3 h-10 rounded-lg border text-xs font-medium transition-all ${value === null
          ? 'bg-gray-200 border-gray-300 text-gray-700'
          : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
          }`}
      >
        Clear
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Side 2: Manual Entry</h2>
        {isSaved && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full animate-pulse">
            Record Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow space-y-6">
        {/* Student ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (Mã SV - Optional)</label>
          <input
            type="text"
            value={formData.studentId}
            onChange={(e) => handleChange('studentId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={`Leave empty to use ${nextSequentialId}`}
          />
        </div>

        {/* Q1 & Q2 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Q1: Count (Số lần)</label>
            <input
              type="number"
              min="0"
              value={formData.Q1}
              onChange={(e) => handleCountChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Q2: Time per occurrence (Thời gian/lần)</label>
            {timeEntries.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {timeEntries.map((time, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">第 {idx + 1} 次</span>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => handleTimeEntryChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="VD: 5p"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Nhập số lần ở Q1 để nhập thời gian chi tiết.</p>
            )}
          </div>
        </div>

        {/* Q3 Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Q3: Reason (Nguyên nhân)</label>
          <textarea
            rows={2}
            value={formData.Q3}
            onChange={(e) => handleChange('Q3', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Q4 Multi-select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Q4: Thoughts (Suy nghĩ)</label>
          <div className="space-y-2">
            {Q4_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 leading-tight">
                <input
                  type="checkbox"
                  checked={formData.Q4.includes(opt)}
                  onChange={() => handleQ4Change(opt)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Q5 Measures */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Q5: Measures (Biện pháp)</label>
          <textarea
            rows={2}
            value={formData.Q5}
            onChange={(e) => handleChange('Q5', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Q6 & Q7 Rating */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Q6: Self Rating (1-5)</label>
            {renderRatingButtons('Q6', formData.Q6)}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Q7: Impact (1-5)</label>
            {renderRatingButtons('Q7', formData.Q7)}
          </div>
        </div>

        {/* Q8 & Q9 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Q8: Focus (Tập trung nhất)</label>
            <input
              type="text"
              value={formData.Q8}
              onChange={(e) => handleChange('Q8', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Q9: Distraction (Sao nhãng)</label>
            <input
              type="text"
              value={formData.Q9}
              onChange={(e) => handleChange('Q9', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Q10 Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Q10: Lecture Interest (Muốn nghe giảng)</label>
          {renderRatingButtons('Q10', formData.Q10)}
        </div>
      </form>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={handleSubmit}
          className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg"
        >
          <Save className="w-5 h-5" />
          Save Record & Reset
        </button>
      </div>
    </div>
  );
};
