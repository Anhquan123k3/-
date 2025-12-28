import React, { useState } from 'react';
import { DataTable } from './components/DataTable';
import { ManualEntryForm } from './components/ManualEntryForm';
import { Side2Result } from './types';
import { Sparkles, PenTool } from 'lucide-react';



const SIDE2_COLUMNS = [
  { key: 'studentId', label: 'ID' },
  { key: 'Q1', label: 'Q1 (Count)' },
  { key: 'Q2', label: 'Q2 (Time)' },
  { key: 'Q3', label: 'Q3 (Reason)' },
  { key: 'Q4', label: 'Q4 (Thoughts)' },
  { key: 'Q5', label: 'Q5 (Measures)' },
  { key: 'Q6', label: 'Q6 (Rate)' },
  { key: 'Q7', label: 'Q7 (Impact)' },
  { key: 'Q8', label: 'Q8 (Focus)' },
  { key: 'Q9', label: 'Q9 (Distraction)' },
  { key: 'Q10', label: 'Q10 (Interest)' },
];

const App: React.FC = () => {
  const [side2Data, setSide2Data] = useState<Side2Result[]>([]);



  const handleSaveSide2 = (record: Side2Result) => {
    setSide2Data(prev => [...prev, record]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">SurveyScanner AI</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Automated & Manual Data Entry</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <PenTool className="w-4 h-4 text-gray-400" />
              <span>Records: <strong className="text-indigo-600">{side2Data.length}</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
          {/* LEFT COLUMN: Input Source */}
          <section className="h-full flex flex-col gap-4">
            <ManualEntryForm
              onSave={handleSaveSide2}
              nextSequentialId={side2Data.length + 1}
            />
          </section>

          {/* RIGHT COLUMN: Data Table */}
          <section className="h-full">
            <DataTable
              title="Manual Entry Data"
              data={side2Data}
              columns={SIDE2_COLUMNS}
              onClear={() => {
                if (confirm('Clear All Data?')) setSide2Data([]);
              }}
              filename="survey_data"
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;