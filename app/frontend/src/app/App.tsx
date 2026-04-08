import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { HomeScreen } from './components/HomeScreen';
import { ImagePreviewScreen } from './components/ImagePreviewScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { ResultScreen } from './components/ResultScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { GuidelinesScreen } from './components/GuidelinesScreen';
import { BottomNav } from './components/BottomNav';
import {
  analyzeImage,
  ApiError,
  fetchHealth,
  getApiBaseUrl,
  resolveAssetUrl,
  saveApiBaseUrl,
} from './api';
import type { HistoryItem, PredictionResult } from './types';

type Screen =
  | 'splash'
  | 'home'
  | 'preview'
  | 'processing'
  | 'result'
  | 'history'
  | 'guidelines';

type Tab = 'home' | 'history' | 'guidelines';

const HISTORY_STORAGE_KEY = 'dmc-dustbin-monitor-history';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentResult, setCurrentResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [apiBaseUrl, setApiBaseUrl] = useState(() => getApiBaseUrl());
  const [backendReady, setBackendReady] = useState<boolean | null>(null);
  const [backendMessage, setBackendMessage] = useState('Connecting to backend...');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved) as HistoryItem[]);
      } catch {
        window.localStorage.removeItem(HISTORY_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const health = await fetchHealth();
        setBackendReady(health.model_ready);
        setBackendMessage(
          health.model_ready
            ? 'Backend and model are ready for live predictions.'
            : health.detail,
        );
      } catch (error) {
        setBackendReady(false);
        setBackendMessage(
          error instanceof Error ? error.message : 'Could not reach backend.',
        );
      }
    };
    void loadHealth();
  }, [apiBaseUrl]);

  const handleGetStarted = () => {
    setCurrentScreen('home');
  };

  const handleCaptureImage = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadImage = () => {
    uploadInputRef.current?.click();
  };

  const handleFileSelection = (file: File | null) => {
    if (!file) {
      return;
    }
    setErrorMessage('');
    setSelectedFile(file);
    setSelectedImage(URL.createObjectURL(file));
    setCurrentResult(null);
    setCurrentScreen('preview');
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileSelection(file);
    event.target.value = '';
  };

  const handleRetake = () => {
    setErrorMessage('');
    setCurrentResult(null);
    setCurrentScreen('home');
  };

  const mapHistoryItem = (result: PredictionResult): HistoryItem => ({
    id: result.id,
    imageUrl: resolveAssetUrl(result.image_url),
    timestamp: result.created_at,
    actionRequired: result.action_required,
    confidence: result.confidence,
    reasons: result.reasons,
    finalScore: result.final_score,
    stage2Label: result.stage2_label,
    stage2ProbAction: result.stage2_prob_action,
    numStage1Boxes: result.num_stage1_boxes,
    filename: result.filename,
  });

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage('Please choose an image first.');
      return;
    }
    setErrorMessage('');
    setIsAnalyzing(true);
    setCurrentScreen('processing');
    try {
      const result = await analyzeImage(selectedFile);
      const normalized = {
        ...result,
        image_url: resolveAssetUrl(result.image_url),
      };
      setSelectedImage(normalized.image_url);
      setCurrentResult(normalized);
      setHistory((prev) => [mapHistoryItem(normalized), ...prev].slice(0, 20));
      setCurrentScreen('result');
    } catch (error) {
      setCurrentScreen('home');
      setErrorMessage(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Prediction failed.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCheckAnother = () => {
    setCurrentScreen('home');
    setActiveTab('home');
    setSelectedImage('');
    setSelectedFile(null);
    setCurrentResult(null);
  };

  const handleReport = () => {
    alert('Report recorded. Connect this action to your notification workflow if needed.');
  };

  const handleSaveApiBaseUrl = (value: string) => {
    const normalized = saveApiBaseUrl(value);
    setApiBaseUrl(normalized);
    setBackendMessage(
      normalized
        ? `Saved backend URL: ${normalized}`
        : 'Backend URL reset to the app default.',
    );
  };

  const handleResetApiBaseUrl = () => {
    const normalized = saveApiBaseUrl('');
    setApiBaseUrl(normalized);
    setBackendMessage('Backend URL reset to the app default.');
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentScreen(tab);
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setSelectedImage(item.imageUrl);
    setCurrentResult({
      id: item.id,
      filename: item.filename,
      image_url: item.imageUrl,
      created_at: item.timestamp,
      action_required: item.actionRequired,
      confidence: item.confidence,
      final_score: item.finalScore,
      stage2_label: item.stage2Label,
      stage2_prob_action: item.stage2ProbAction,
      num_stage1_boxes: item.numStage1Boxes,
      reasons: item.reasons,
      stage1_boxes: [],
    });
    setCurrentScreen('result');
  };

  const showBottomNav = ['home', 'history', 'guidelines'].includes(currentScreen);

  return (
    <div className="size-full flex flex-col bg-white max-w-md mx-auto">
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />
      <div className={`flex-1 overflow-hidden ${showBottomNav ? '' : 'pb-0'}`}>
        {currentScreen === 'splash' && (
          <SplashScreen onGetStarted={handleGetStarted} />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            onCaptureImage={handleCaptureImage}
            onUploadImage={handleUploadImage}
            backendReady={backendReady}
            backendMessage={errorMessage || backendMessage}
          />
        )}

        {currentScreen === 'preview' && (
          <ImagePreviewScreen
            imageUrl={selectedImage}
            fileName={selectedFile?.name}
            onRetake={handleRetake}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        )}

        {currentScreen === 'processing' && (
          <ProcessingScreen imageUrl={selectedImage} />
        )}

        {currentScreen === 'result' && currentResult && (
          <ResultScreen
            imageUrl={selectedImage}
            actionRequired={currentResult.action_required}
            confidence={currentResult.confidence}
            finalScore={currentResult.final_score}
            stage2Label={currentResult.stage2_label}
            numStage1Boxes={currentResult.num_stage1_boxes}
            reasons={currentResult.reasons}
            onReport={currentResult.action_required ? handleReport : undefined}
            onCheckAnother={handleCheckAnother}
          />
        )}

        {currentScreen === 'history' && (
          <HistoryScreen
            history={history}
            onItemClick={handleHistoryItemClick}
          />
        )}

        {currentScreen === 'guidelines' && (
          <GuidelinesScreen
            apiBaseUrl={apiBaseUrl}
            backendReady={backendReady}
            backendMessage={backendMessage}
            onSaveApiBaseUrl={handleSaveApiBaseUrl}
            onResetApiBaseUrl={handleResetApiBaseUrl}
          />
        )}
      </div>

      {showBottomNav && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}
