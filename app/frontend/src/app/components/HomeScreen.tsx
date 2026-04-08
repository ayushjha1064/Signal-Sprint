import { Camera, Upload, Trash2, Info } from 'lucide-react';

interface HomeScreenProps {
  onCaptureImage: () => void;
  onUploadImage: () => void;
  backendReady: boolean | null;
  backendMessage: string;
}

export function HomeScreen({
  onCaptureImage,
  onUploadImage,
  backendReady,
  backendMessage,
}: HomeScreenProps) {
  const authorizedDustbins = [
    {
      name: 'Ground Standing',
      description: 'Blue/green/cyan dustbin',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Metal Cage',
      description: 'Fully packed dustbin',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Elevated Stand',
      description: 'Metal stand dustbin',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">DMC Dustbin Monitor</h1>
            <p className="text-sm text-blue-100">IIT Kanpur Campus</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Main Prompt */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Check if DMC needs to be informed
          </h2>
          <p className="text-gray-600">
            Take or upload a photo of an authorized campus dustbin
          </p>
        </div>

        <div
          className={`mb-6 rounded-xl border p-4 ${
            backendReady
              ? 'border-green-200 bg-green-50'
              : backendReady === false
              ? 'border-amber-200 bg-amber-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <p className="text-sm font-semibold text-gray-900">
            {backendReady ? 'Backend connected' : backendReady === false ? 'Backend needs attention' : 'Checking backend'}
          </p>
          <p className="mt-1 text-sm text-gray-600">{backendMessage}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <button
            onClick={onCaptureImage}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-gray-900">Capture Image</h3>
                <p className="text-sm text-gray-600">Use camera to take photo</p>
              </div>
            </div>
          </button>

          <button
            onClick={onUploadImage}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-cyan-500"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl p-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-gray-900">Upload Image</h3>
                <p className="text-sm text-gray-600">Select from gallery</p>
              </div>
            </div>
          </button>
        </div>

        {/* Authorized Dustbin Types */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg text-gray-900">Authorized Dustbin Types</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {authorizedDustbins.map((dustbin, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-md">
                <div className={`w-full aspect-square bg-gradient-to-br ${dustbin.color} rounded-lg mb-3 flex items-center justify-center`}>
                  <Trash2 className="w-8 h-8 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-900 mb-1">{dustbin.name}</p>
                <p className="text-xs text-gray-600">{dustbin.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Note:</span> Only these campus dustbins are considered for DMC action
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
