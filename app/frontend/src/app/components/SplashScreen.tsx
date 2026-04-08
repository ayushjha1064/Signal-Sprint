import { Camera, Scan, Trash2 } from 'lucide-react';

interface SplashScreenProps {
  onGetStarted: () => void;
}

export function SplashScreen({ onGetStarted }: SplashScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-xl">
            <Trash2 className="w-16 h-16 text-white" strokeWidth={2} />
          </div>
          <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 bg-cyan-500 rounded-full p-2 shadow-lg">
            <Scan className="w-6 h-6 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-3 text-center">
          DMC Dustbin Monitor
        </h1>

        <p className="text-lg text-gray-600 text-center max-w-sm">
          Smart campus dustbin overflow reporting
        </p>
      </div>

      <button
        onClick={onGetStarted}
        className="w-full max-w-xs bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Get Started
      </button>
    </div>
  );
}
