import { Info, CheckCircle2, XCircle, Trash2, Leaf, AlertCircle, Save, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from './ui/input';

interface GuidelinesScreenProps {
  apiBaseUrl: string;
  backendReady: boolean | null;
  backendMessage: string;
  onSaveApiBaseUrl: (value: string) => void;
  onResetApiBaseUrl: () => void;
}

export function GuidelinesScreen({
  apiBaseUrl,
  backendReady,
  backendMessage,
  onSaveApiBaseUrl,
  onResetApiBaseUrl,
}: GuidelinesScreenProps) {
  const [draftApiBaseUrl, setDraftApiBaseUrl] = useState(apiBaseUrl);

  useEffect(() => {
    setDraftApiBaseUrl(apiBaseUrl);
  }, [apiBaseUrl]);

  const guidelines = [
    {
      icon: Trash2,
      title: 'Authorized IITK Dustbins Only',
      description: 'The app only considers the 3 authorized campus dustbin types',
      type: 'info',
      color: 'blue'
    },
    {
      icon: XCircle,
      title: 'Garbage Without Dustbin',
      description: 'Garbage without an authorized dustbin does NOT trigger DMC action',
      type: 'warning',
      color: 'orange'
    },
    {
      icon: Leaf,
      title: 'Natural Leaves Excluded',
      description: 'Natural leaves are not considered waste and won\'t trigger alerts',
      type: 'info',
      color: 'green'
    },
    {
      icon: CheckCircle2,
      title: 'Full Dustbin ≠ Action',
      description: 'A full dustbin without spillover does not require DMC action',
      type: 'info',
      color: 'cyan'
    },
    {
      icon: AlertCircle,
      title: 'Action Triggers',
      description: 'DMC is notified only when authorized dustbin has overflow/spillover',
      type: 'critical',
      color: 'red'
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-500',
      text: 'text-blue-900'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      iconBg: 'bg-orange-500',
      text: 'text-orange-900'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-500',
      text: 'text-green-900'
    },
    cyan: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      iconBg: 'bg-cyan-500',
      text: 'text-cyan-900'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-500',
      text: 'text-red-900'
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-6">
        <div className="flex items-center gap-3 mb-2">
          <Info className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Guidelines</h1>
        </div>
        <p className="text-sm text-blue-100">
          Understanding DMC action requirements
        </p>
      </div>

      <div className="px-6 py-6 space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Backend Connection</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter the public backend URL that serves the ML API for mobile predictions.
          </p>
          <div
            className={`mb-4 rounded-xl border p-4 ${
              backendReady
                ? 'border-green-200 bg-green-50'
                : backendReady === false
                ? 'border-amber-200 bg-amber-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <p className="text-sm font-semibold text-gray-900">
              {backendReady ? 'Backend connected' : backendReady === false ? 'Backend needs attention' : 'Checking backend'}
            </p>
            <p className="mt-1 text-sm text-gray-600">{backendMessage}</p>
          </div>
          <div className="space-y-3">
            <Input
              type="url"
              value={draftApiBaseUrl}
              placeholder="https://your-backend.example.com"
              onChange={(event) => setDraftApiBaseUrl(event.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSaveApiBaseUrl(draftApiBaseUrl)}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
              >
                <Save className="h-4 w-4" />
                Save URL
              </button>
              <button
                onClick={() => {
                  setDraftApiBaseUrl('');
                  onResetApiBaseUrl();
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700"
              >
                <RefreshCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Example: use your deployed API host, not `localhost`, when installing on a phone.
            </p>
          </div>
        </div>

        {/* Guidelines Cards */}
        {guidelines.map((guideline, index) => {
          const colors = colorClasses[guideline.color as keyof typeof colorClasses];
          const Icon = guideline.icon;

          return (
            <div
              key={index}
              className={`${colors.bg} border-2 ${colors.border} rounded-xl p-5 shadow-sm`}
            >
              <div className="flex gap-4">
                <div className={`${colors.iconBg} rounded-xl p-3 flex-shrink-0 h-fit`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${colors.text} mb-1`}>
                    {guideline.title}
                  </h3>
                  <p className={`text-sm ${colors.text} opacity-80`}>
                    {guideline.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Decision Matrix */}
        <div className="bg-white rounded-xl p-6 shadow-lg mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Decision Matrix</h2>

          <div className="space-y-3">
            <div className="grid grid-cols-[1fr,auto] gap-4 items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-gray-900">No authorized dustbin</p>
                <p className="text-xs text-gray-600">Even with garbage present</p>
              </div>
              <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap">
                Decision: 0
              </div>
            </div>

            <div className="grid grid-cols-[1fr,auto] gap-4 items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-gray-900">Authorized dustbin, no overflow</p>
                <p className="text-xs text-gray-600">Dustbin may be full but contained</p>
              </div>
              <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap">
                Decision: 0
              </div>
            </div>

            <div className="grid grid-cols-[1fr,auto] gap-4 items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-gray-900">Authorized dustbin + overflow</p>
                <p className="text-xs text-gray-600">Garbage spilling or lying nearby</p>
              </div>
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap">
                Decision: 1
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mt-4">
          <h3 className="font-bold text-lg text-gray-900 mb-3">About This App</h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            DMC Dustbin Monitor is a smart campus utility app designed for IIT Kanpur.
            It uses AI to detect when the Dustbin Management Committee should be informed
            about dustbin overflow issues.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            The app helps maintain campus cleanliness by ensuring timely action on
            authorized dustbins that require attention.
          </p>
        </div>
      </div>
    </div>
  );
}
