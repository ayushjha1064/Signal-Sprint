import { Loader2, Scan } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProcessingScreenProps {
  imageUrl: string;
}

export function ProcessingScreen({ imageUrl }: ProcessingScreenProps) {
  const [step, setStep] = useState(0);

  const steps = [
    'Detecting authorized dustbin…',
    'Checking for spillover / overflow…',
    'Evaluating DMC action requirement…'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Image with scanning overlay */}
        <div className="relative w-full max-w-md mb-8">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={imageUrl}
              alt="Processing"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />

            {/* Scanning line animation */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan" />
            </div>

            {/* Bounding box overlay */}
            <div className="absolute inset-8 border-2 border-cyan-400 rounded-lg">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-cyan-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-cyan-400" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-cyan-400" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-cyan-400" />
            </div>
          </div>
        </div>

        {/* AI Scanning UI */}
        <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Scan className="w-8 h-8 text-blue-600 animate-pulse" />
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Analyzing Image</h2>
          </div>

          {/* Progress steps */}
          <div className="space-y-4">
            {steps.map((stepText, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  index === step
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : index < step
                    ? 'bg-green-50 border-2 border-green-500'
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                {index < step ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : index === step ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0" />
                )}
                <span className={`text-sm ${
                  index === step ? 'text-blue-900 font-semibold' :
                  index < step ? 'text-green-900 font-medium' :
                  'text-gray-500'
                }`}>
                  {stepText}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
