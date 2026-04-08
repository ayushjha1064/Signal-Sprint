import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Bell, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface ResultScreenProps {
  imageUrl: string;
  actionRequired: boolean;
  confidence: number;
  finalScore?: number;
  stage2Label?: string | null;
  numStage1Boxes?: number;
  reasons: string[];
  onReport?: () => void;
  onCheckAnother: () => void;
}

export function ResultScreen({
  imageUrl,
  actionRequired,
  confidence,
  finalScore,
  stage2Label,
  numStage1Boxes,
  reasons,
  onReport,
  onCheckAnother
}: ResultScreenProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      {/* Image Preview */}
      <div className="relative">
        <img
          src={imageUrl}
          alt="Result"
          className="w-full h-64 object-cover"
        />
        {actionRequired && (
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent" />
        )}
        {!actionRequired && (
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent" />
        )}
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Status Card */}
        <div className={`rounded-2xl p-6 shadow-xl ${
          actionRequired
            ? 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300'
            : 'bg-gradient-to-br from-green-50 to-cyan-50 border-2 border-green-300'
        }`}>
          <div className="flex items-start gap-4 mb-4">
            {actionRequired ? (
              <div className="bg-red-500 rounded-full p-3 flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            ) : (
              <div className="bg-green-500 rounded-full p-3 flex-shrink-0">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h2 className={`text-2xl font-bold mb-2 ${
                actionRequired ? 'text-red-900' : 'text-green-900'
              }`}>
                {actionRequired ? 'DMC Action Required' : 'No Action Needed'}
              </h2>
              <p className={`text-sm ${
                actionRequired ? 'text-red-700' : 'text-green-700'
              }`}>
                {actionRequired
                  ? 'Authorized dustbin detected with spill/overflow nearby'
                  : reasons[0] || 'No overflow detected'
                }
              </p>
            </div>
          </div>

          {/* Decision Badge */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <p className="text-xs text-gray-600 mb-1">DMC Intimation Decision</p>
              <p className={`text-3xl font-bold ${
                actionRequired ? 'text-red-600' : 'text-green-600'
              }`}>
                {actionRequired ? '1' : '0'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <p className="text-xs text-gray-600 mb-1">Confidence</p>
              <p className="text-3xl font-bold text-blue-600">
                {(confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <p className="text-xs text-gray-600 mb-1">Final Score</p>
              <p className="text-xl font-bold text-gray-900">
                {typeof finalScore === 'number' ? finalScore.toFixed(2) : '--'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <p className="text-xs text-gray-600 mb-1">Detected Bins</p>
              <p className="text-xl font-bold text-gray-900">
                {typeof numStage1Boxes === 'number' ? numStage1Boxes : '--'}
              </p>
            </div>
          </div>

          {/* Probability Gauge */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-700">P(Intimate DMC)</span>
              <span className="text-sm font-bold text-gray-900">{confidence.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  actionRequired
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-gradient-to-r from-green-500 to-cyan-500'
                }`}
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
            {stage2Label && (
              <p className="mt-3 text-xs text-gray-500">
                Stage 2 label: {stage2Label}
              </p>
            )}
          </div>
        </div>

        {/* Explanation Panel */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">Why this result?</span>
            {showExplanation ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {showExplanation && (
            <div className="px-6 pb-4 space-y-2">
              {reasons.map((reason, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-blue-50 rounded-lg px-4 py-3"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm text-blue-900">{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-6">
          {actionRequired && onReport && (
            <button
              onClick={onReport}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Bell className="w-5 h-5" />
              Report / Notify DMC
            </button>
          )}

          <button
            onClick={onCheckAnother}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            {actionRequired ? 'Check Another Image' : 'Analyze Another Image'}
          </button>
        </div>
      </div>
    </div>
  );
}
