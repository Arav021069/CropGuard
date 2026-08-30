import { useEffect, useRef, useState } from 'react'
import './App.css'

type AnalysisState = 'empty' | 'ready' | 'analyzing' | 'complete'

interface Recommendation {
  overview: string;
  immediate_actions: string[];
  treatment: string[];
  prevention: string[];
  precautions: string[];
}

interface AnalysisResult {
  disease: string;
  confidence: number;
  severity: string;
  recommendation?: Recommendation;
}

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [analysisState, setAnalysisState] = useState<AnalysisState>('empty')
  const [isDragging, setIsDragging] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl) }, [imageUrl])

  const selectImage = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(URL.createObjectURL(file))
    setImageFile(file)
    setFileName(file.name)
    setAnalysisState('ready')
    setResult(null)
  }

  const analyzeImage = async (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (!imageFile) return
    
    setAnalysisState('analyzing')
    
    const formData = new FormData()
    formData.append('image', imageFile)

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      })

      console.log('HTTP Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Body:', errorText);
        throw new Error(`Backend error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Backend Data Received:', data);
      setResult(data);
      setAnalysisState('complete');
    } catch (error) {
      console.error('❌ Full Request Error:', error);
      alert('Failed to analyze image. Check console for details.');
      setAnalysisState('ready');
    }
  }

  const clearImage = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(null)
    setImageFile(null)
    setFileName('')
    setAnalysisState('empty')
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="CropGuard home">
          <span className="brand-mark">C</span>
          <span>Crop<span>Guard</span></span>
        </a>
        <div className="trust-note"><span className="status-dot" /> Private by design</div>
      </header>

      <section className="intro">
        <p className="eyebrow">Plant health, made simple</p>
        <h1>See what your plant<br /><em>is trying to tell you.</em></h1>
        <p className="intro-copy">Upload a clear photo of a leaf or crop. CropGuard will help you spot signs of stress and decide what to do next.</p>
      </section>

      <section className="workspace" aria-label="Plant image analysis">
        <div className={`upload-panel ${isDragging ? 'is-dragging' : ''}`}>
          <div className="panel-heading">
            <div><span className="step-label">01</span><h2>Add a plant photo</h2></div>
            {analysisState !== 'empty' && <button className="text-button" type="button" onClick={clearImage}>Remove photo</button>}
          </div>
          {!imageUrl ? (
            <button 
              className="dropzone" 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} 
              onDragLeave={() => setIsDragging(false)} 
              onDrop={(event) => { event.preventDefault(); setIsDragging(false); selectImage(event.dataTransfer.files[0]) }}
            >
              <span className="upload-icon" aria-hidden="true">↑</span>
              <strong>Drop your image here</strong>
              <span>or <u>browse from your device</u></span>
              <small>JPG, PNG or WEBP · up to 10 MB</small>
            </button>
          ) : (
            <div className="image-preview">
              <img src={imageUrl} alt={`Selected plant: ${fileName}`} />
              <div className="file-detail">
                <span className="file-icon">IMG</span>
                <span><strong>{fileName}</strong><small>Ready to analyze</small></span>
                <span className="checkmark">✓</span>
              </div>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => selectImage(event.target.files?.[0])} />
        </div>

        <div className={`result-panel ${analysisState === 'complete' ? 'has-result' : ''}`}>
          <div className="panel-heading">
            <div><span className="step-label">02</span><h2>Your plant report</h2></div>
            <span className="result-badge">AI assisted</span>
          </div>
          
          {analysisState === 'complete' && result ? (
            <div className="report">
              <div className="report-header">
                <span className="health-score">{Math.round(result.confidence * 100)}</span>
                <div>
                  <strong>{result.disease}</strong>
                  <p>Analysis Confidence: {Math.round(result.confidence * 100)}%</p>
                </div>
              </div>
              <div className="finding-list">
                <div className="finding">
                  <div><span>Severity</span><strong>{result.severity}</strong></div>
                  <p>The AI detected signs consistent with {result.disease.toLowerCase()}.</p>
                </div>
               {result.recommendation && (
  <div className="finding">
    <div>
      <span>Recommendation</span>
      <strong>Action Required</strong>
    </div>

    <p>{result.recommendation.overview}</p>

    <strong>Immediate Actions</strong>
    <ul>
      {result.recommendation.immediate_actions.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>

    <strong>Treatment</strong>
    <ul>
      {result.recommendation.treatment.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>

                      <strong>Prevention</strong>
                      <ul>
                        {result.recommendation.prevention.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>

                      <strong>Precautions</strong>
                      <ul>
                        {result.recommendation.precautions.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <div className="empty-result">
              <span className="leaf-outline" aria-hidden="true">⌁</span>
              <strong>{analysisState === 'analyzing' ? 'Analyzing your plant...' : 'Your results will appear here'}</strong>
              <p>Upload a photo to get a friendly, easy-to-follow health summary.</p>
            </div>
          )}
        </div>
      </section>

      <div className="action-row">
        <button 
          className="analyze-button" 
          type="button" 
          disabled={!imageUrl || analysisState === 'analyzing'} 
          onClick={(e) => analyzeImage(e)}
        >
          {analysisState === 'analyzing' ? 'Reading your plant...' : analysisState === 'complete' ? 'Analyze another photo' : 'Analyze my plant'}
          <span>→</span>
        </button>
        <p><span className="lock">⌑</span> Your photo stays in this browser</p>
      </div>

      <footer><span>CropGuard</span><span>Built for curious growers</span></footer>
    </main>
  )
}

export default App
