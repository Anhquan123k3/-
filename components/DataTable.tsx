import React from 'react';
import { Download, FileText, Trash2 } from 'lucide-react';

interface DataTableProps {
  data: any[];
  title: string;
  columns: { key: string; label: string; format?: (val: any) => React.ReactNode }[];
  onClear: () => void;
  filename: string;
}

export const DataTable: React.FC<DataTableProps> = ({ data, title, columns, onClear, filename }) => {
  const downloadCSV = () => {
    if (data.length === 0) return;

    // Extract headers from columns prop
    const headers = columns.map(c => c.key);
    
    // Rows
    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        return headers.map(header => {
          let value = row[header];
          // Handle arrays (like Q4 multiselect) for CSV
          if (Array.isArray(value)) {
            value = `"${value.join('; ')}"`;
          } else if (value === null || value === undefined) {
            value = '';
          } else {
            // Escape quotes if string
            value = `"${String(value).replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          {title}
          <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
            {data.length}
          </span>
        </h2>
        <div className="flex gap-2">
           <button
            onClick={onClear}
            disabled={data.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={downloadCSV}
            disabled={data.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-auto p-0">
        {data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <FileText className="w-12 h-12 mb-2 opacity-20" />
            <p>No data collected yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">#</th>
                {columns.map(col => (
                  <th key={col.key} className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{index + 1}</td>
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 border-l border-gray-100">
                      {col.format ? col.format(row[col.key]) : (
                        Array.isArray(row[col.key]) ? row[col.key].join(', ') : row[col.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};