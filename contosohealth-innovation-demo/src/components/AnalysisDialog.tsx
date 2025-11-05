import { X, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { AgentResults } from '../types'
import { useState, useEffect } from 'react'

interface AnalysisDialogProps {
  isOpen: boolean
  onClose: () => void
  agentResults: AgentResults
  ideaId: string | null
  apiUrl: string
}

export function AnalysisDialog({ isOpen, onClose, agentResults, ideaId, apiUrl }: AnalysisDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [soraData, setSoraData] = useState(agentResults.sora)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setSoraData(agentResults.sora)
  }, [agentResults.sora])

  useEffect(() => {
    if (!isOpen || !soraData?.video?.job_id) return

    const status = soraData.video.status
    if (status === 'completed' || status === 'error' || status === 'failed') return

    const pollInterval = setInterval(async () => {
      await checkSoraStatus()
    }, 15000)

    return () => clearInterval(pollInterval)
  }, [isOpen, soraData, apiUrl])

  const checkSoraStatus = async () => {
    if (!soraData?.video?.job_id) return

    try {
      const response = await fetch(`${apiUrl}/api/agents/sora-status/${soraData.video.job_id}`)
      if (!response.ok) return

      const data = await response.json()
      setSoraData({
        ...soraData,
        video: {
          ...soraData.video,
          status: data.status,
          generations: data.generations || [],
          error: data.error
        }
      })
    } catch (error) {
      console.error('Error checking Sora status:', error)
    }
  }

  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    await checkSoraStatus()
    setIsRefreshing(false)
  }

  if (!isOpen) return null

  const completedCount = Object.keys(agentResults).length

  const handleSaveAnalysis = async () => {
    if (!ideaId) {
      alert('No idea ID available')
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const response = await fetch(`${apiUrl}/api/ideas/${ideaId}/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent1: agentResults.agent1 || {},
          agent2: agentResults.agent2 || {},
          agent3: agentResults.agent3 || {},
          agent4: agentResults.agent4 || {},
          sora: agentResults.sora || {},
          completed_count: completedCount
        })
      })

      if (!response.ok) throw new Error('Failed to save analysis')

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving analysis:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-700">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">AI Agent Analysis Results</h2>
            <p className="text-sm text-slate-400 mt-1">Detailed output from all {completedCount} agents</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {agentResults.agent1 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Agent 1: System Context Engine
              </h3>
              <div className="space-y-2">
                {agentResults.agent1.detectedSystems && agentResults.agent1.detectedSystems.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">Detected Systems:</p>
                    <div className="space-y-2">
                      {agentResults.agent1.detectedSystems.map((system, idx) => (
                        <div key={idx} className="bg-slate-900 p-3 rounded border border-slate-600">
                          <p className="text-slate-200 font-medium">{system.system}</p>
                          <p className="text-sm text-slate-400">Category: {system.category}</p>
                          <p className="text-sm text-slate-400">Integration: {system.integration_level}</p>
                          <p className="text-sm text-slate-400">Timeline: {system.typical_timeline_weeks} weeks</p>
                          <p className="text-sm text-slate-400">SME: {system.sme}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify(agentResults.agent1, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {agentResults.agent2 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Agent 2: Solution Architecture Generator
              </h3>
              <div className="space-y-2">
                {agentResults.agent2.architecture ? (
                  <div>
                    {agentResults.agent2.architecture.components && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-slate-300 mb-2">Components:</p>
                        <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                          {agentResults.agent2.architecture.components.map((comp: string, idx: number) => (
                            <li key={idx}>{comp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {agentResults.agent2.architecture.integrations && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-slate-300 mb-2">Integrations:</p>
                        <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                          {agentResults.agent2.architecture.integrations.map((int: string, idx: number) => (
                            <li key={idx}>{int}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto">
                      {JSON.stringify(agentResults.agent2, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify(agentResults.agent2, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {agentResults.agent3 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Agent 3: Feasibility Scorer with Reasoning
              </h3>
              <div className="space-y-2">
                {agentResults.agent3.scoring ? (
                  <div>
                    {agentResults.agent3.scoring.feasibility_score && (
                      <p className="text-slate-300 mb-2">
                        <span className="font-medium">Feasibility Score:</span> {agentResults.agent3.scoring.feasibility_score}/10
                      </p>
                    )}
                    {agentResults.agent3.scoring.technical_complexity && (
                      <p className="text-slate-300 mb-2">
                        <span className="font-medium">Technical Complexity:</span> {agentResults.agent3.scoring.technical_complexity}
                      </p>
                    )}
                    {agentResults.agent3.scoring.risk_assessment && (
                      <p className="text-slate-300 mb-2">
                        <span className="font-medium">Risk Assessment:</span> {agentResults.agent3.scoring.risk_assessment}
                      </p>
                    )}
                    <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto">
                      {JSON.stringify(agentResults.agent3, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify(agentResults.agent3, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {agentResults.agent4 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Agent 4: Internal Solution Discovery Engine
              </h3>
              <div className="space-y-2">
                {agentResults.agent4.similarSolutions && agentResults.agent4.similarSolutions.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">Similar Solutions Found:</p>
                    <div className="space-y-2">
                      {agentResults.agent4.similarSolutions.map((solution, idx) => (
                        <div key={idx} className="bg-slate-900 p-3 rounded border border-slate-600">
                          <p className="text-slate-200 font-medium">{solution.title}</p>
                          <p className="text-sm text-slate-400">Similarity: {(solution.similarity_score * 100).toFixed(0)}%</p>
                          <p className="text-sm text-slate-400">{solution.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify(agentResults.agent4, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {soraData && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-pink-400 mb-3 flex items-center gap-2">
                {soraData.video?.status === 'preprocessing' || soraData.video?.status === 'generating' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : soraData.video?.status === 'error' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Sora: Video Generation
              </h3>
              <div className="space-y-3">
                {soraData.video ? (
                  <div>
                    {soraData.video.status && (
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-slate-300">Status: </span>
                          <span className={`text-sm ${
                            soraData.video.status === 'preprocessing' || soraData.video.status === 'generating' 
                              ? 'text-yellow-400' 
                              : soraData.video.status === 'error' 
                              ? 'text-red-400' 
                              : 'text-green-400'
                          }`}>
                            {soraData.video.status}
                          </span>
                          {soraData.video.job_id && (
                            <p className="text-xs text-slate-400 mt-1">Job ID: {soraData.video.job_id}</p>
                          )}
                        </div>
                        {(soraData.video.status === 'preprocessing' || soraData.video.status === 'generating') && (
                          <button
                            onClick={handleRefreshStatus}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Checking...' : 'Refresh Status'}
                          </button>
                        )}
                      </div>
                    )}
                    
                    {soraData.video.generations && soraData.video.generations.length > 0 && (
                      <div className="space-y-3">
                        {soraData.video.generations.map((gen: any, idx: number) => (
                          <div key={idx} className="bg-slate-900 rounded-lg p-3 border border-slate-600">
                            {gen.url && (
                              <div className="mb-2">
                                <video 
                                  controls 
                                  className="w-full rounded-lg"
                                  poster={gen.thumbnail}
                                >
                                  <source src={gen.url} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            )}
                            {gen.thumbnail && !gen.url && (
                              <img src={gen.thumbnail} alt="Video thumbnail" className="w-full rounded-lg mb-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {soraData.video.url && (
                      <div className="bg-slate-900 rounded-lg p-3 border border-slate-600">
                        <video 
                          controls 
                          className="w-full rounded-lg"
                        >
                          <source src={soraData.video.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    {(soraData.video.status === 'preprocessing' || soraData.video.status === 'generating') && (
                      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                        <p className="text-sm text-blue-300">
                          Video is being generated. This typically takes 2-5 minutes. The status will automatically refresh every 15 seconds.
                        </p>
                      </div>
                    )}

                    {soraData.video.message && (
                      <div className="bg-slate-900 rounded-lg p-3 border border-slate-600">
                        <p className="text-xs text-slate-400">{soraData.video.message}</p>
                      </div>
                    )}

                    <details className="mt-3">
                      <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                        View raw response
                      </summary>
                      <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto mt-2">
                        {JSON.stringify(soraData, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-x-auto">
                    {JSON.stringify(soraData, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Analysis saved successfully!</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">Failed to save analysis</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSaveAnalysis}
              disabled={isSaving || completedCount < 5}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Analysis'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
