import { RotateCcw, Play, Info } from 'lucide-react';

interface ImagePreviewScreenProps {
  imageUrl: string;
  fileName?: string;
  onRetake: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function ImagePreviewScreen({
  imageUrl,
  fileName,
  onRetake,
  onAnalyze,
  isAnalyzing,
}: ImagePreviewScreenProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        {/* Image Preview */}
        <div className="relative bg-black">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-96 object-contain"
          />
          <div className="absolute top-4 right-4 bg-black/50 rounded-full p-2">
            <button className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="px-6 py-6">
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-cyan-900">
                  The model checks for authorized dustbins, overflow, and nearby garbage
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">What will be checked:</h3>
            {fileName && (
              <p className="mb-3 text-xs font-medium text-gray-500">
                Selected file: {fileName}
              </p>
            )}
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Presence of authorized IITK dustbin</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Dustbin spillover or overflow</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Garbage lying near the dustbin</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onRetake}
            className="flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Retake
          </button>
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Play className="w-5 h-5" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>
    </div>
  );
}
