
import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  BrainCircuit, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Copy
} from 'lucide-react';
import { QAPair, GenerationStatus } from './types';
import { generateQuizFromContent } from './services/geminiService';
import { downloadCSV } from './utils/csvHelper';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [status, setStatus] = useState<GenerationStatus>({
    loading: false,
    error: null,
    success: false
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setInputText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setStatus({ ...status, error: "Veuillez entrer du texte ou télécharger un fichier." });
      return;
    }

    setStatus({ loading: true, error: null, success: false });
    try {
      const results = await generateQuizFromContent(inputText);
      setQaPairs(results);
      setStatus({ loading: false, error: null, success: true });
    } catch (error: any) {
      setStatus({ loading: false, error: error.message || "Une erreur est survenue.", success: false });
    }
  };

  const handleClear = () => {
    setInputText('');
    setQaPairs([]);
    setStatus({ loading: false, error: null, success: false });
  };

  const handleExport = () => {
    downloadCSV(qaPairs, `quiz-${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Quiz Generator <span className="text-blue-600">IA</span></h1>
          </div>
          <div className="hidden sm:block text-sm text-slate-500 font-medium">
            Transformez vos cours en fichiers CSV
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Input */}
          <section className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Source du Cours
                </h2>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Importer .txt
                    <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <button 
                    onClick={handleClear}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    title="Tout effacer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Collez ici votre cours, vos notes ou le contenu de votre livre..."
                className="w-full h-80 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-400 text-slate-700 bg-slate-50/50"
              />
              
              <button
                onClick={handleGenerate}
                disabled={status.loading || !inputText.trim()}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${
                  status.loading 
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300'
                }`}
              >
                {status.loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-5 h-5" />
                    Générer les Questions-Réponses
                  </>
                )}
              </button>

              {status.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {status.error}
                </div>
              )}
            </div>

            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <h3 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Comment ça marche ?
              </h3>
              <ol className="text-sm text-blue-700/80 space-y-2 list-decimal ml-4">
                <li>Collez votre contenu pédagogique ou téléchargez un fichier texte.</li>
                <li>Cliquez sur <strong>"Générer"</strong> pour extraire les concepts clés.</li>
                <li>Visualisez les résultats et téléchargez-les au format <strong>CSV</strong>.</li>
                <li>Importez le CSV dans Anki, Quizlet ou Excel !</li>
              </ol>
            </div>
          </section>

          {/* Right Column: Results */}
          <section className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Copy className="w-5 h-5 text-green-500" />
                  Résultats {qaPairs.length > 0 && <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{qaPairs.length}</span>}
                </h2>
                {qaPairs.length > 0 && (
                  <button
                    onClick={handleExport}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                )}
              </div>

              {qaPairs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 py-12">
                  <div className="bg-slate-50 p-6 rounded-full">
                    <BrainCircuit className="w-12 h-12 text-slate-200" />
                  </div>
                  <p className="text-sm max-w-[200px] text-center">Les questions-réponses apparaîtront ici après la génération.</p>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {qaPairs.map((pair, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
                      <div className="text-xs font-bold text-blue-500 mb-1 uppercase tracking-wider">Question {idx + 1}</div>
                      <p className="text-slate-800 font-medium mb-3">{pair.question}</p>
                      <div className="text-xs font-bold text-green-500 mb-1 uppercase tracking-wider">Réponse</div>
                      <p className="text-slate-600 text-sm italic">{pair.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer sticky bar for mobile actions */}
      {qaPairs.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 sm:hidden">
          <button
            onClick={handleExport}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger le CSV
          </button>
        </div>
      )}

      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-400 text-sm border-t border-slate-200 mt-12">
        <p>© {new Date().getFullYear()} Générateur de Quiz IA - Optimisé pour l'apprentissage.</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default App;
