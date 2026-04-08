import { Clock, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { useState } from 'react';
import type { HistoryItem } from '../types';

interface HistoryScreenProps {
  history: HistoryItem[];
  onItemClick: (item: HistoryItem) => void;
}

export function HistoryScreen({ history, onItemClick }: HistoryScreenProps) {
  const [filter, setFilter] = useState<'all' | 'action' | 'noaction'>('all');

  const filteredHistory = history.filter(item => {
    if (filter === 'action') return item.actionRequired;
    if (filter === 'noaction') return !item.actionRequired;
    return true;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const toDate = (value: string) => new Date(value);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Recent Checks</h1>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('action')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === 'action'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Action Required
          </button>
          <button
            onClick={() => setFilter('noaction')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filter === 'noaction'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            No Action
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Filter className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No checks found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(item)}
                className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all text-left"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt="Check"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {item.actionRequired ? (
                      <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                        <AlertTriangle className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        item.actionRequired
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {item.actionRequired ? 'Action Required' : 'No Action'}
                      </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(toDate(item.timestamp))}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Confidence</p>
                        <p className="text-sm font-bold text-gray-900">
                          {(item.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Decision</p>
                        <p className={`text-sm font-bold ${
                          item.actionRequired ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {item.actionRequired ? '1' : '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
