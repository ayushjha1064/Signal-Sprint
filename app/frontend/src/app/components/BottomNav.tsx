import { Home, Clock, Info } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'history' | 'guidelines';
  onTabChange: (tab: 'home' | 'history' | 'guidelines') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'history' as const, icon: Clock, label: 'History' },
    { id: 'guidelines' as const, icon: Info, label: 'Guidelines' }
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3 shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
              <span className={`text-xs font-semibold ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
