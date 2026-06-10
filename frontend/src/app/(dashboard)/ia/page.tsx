'use client'
{/* Página: ContaPro AI
   Propósito: Análisis financiero inteligente, detección de errores contables, predicción de flujo de caja y reportes ejecutivos
   Módulo: Inteligencia Artificial */}
import { useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Search, AlertTriangle, TrendingUp, FileText, Sparkles, MessageSquare, Lightbulb, RefreshCw } from 'lucide-react'

export default function IAPage() {
  const [analysis, setAnalysis] = useState<string>('')
  const [errors, setErrors] = useState<any>(null)
  const [prediction, setPrediction] = useState<string>('')
  const [report, setReport] = useState<string>('')
  const [loading, setLoading] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setLoading('analyze')
    try {
      const now = new Date()
      const res = await api.ai.analyze(now.getFullYear(), now.getMonth() + 1)
      setAnalysis(res.analysis || 'No se pudo generar el análisis')
    } catch (err) {
      setAnalysis('Error al conectar con el asistente IA')
    } finally {
      setLoading(null)
    }
  }

  const handleDetectErrors = async () => {
    setLoading('errors')
    try {
      const res = await api.ai.detectErrors()
      setErrors(res)
    } catch (err) {
      setErrors({ error: 'Error al detectar errores' })
    } finally {
      setLoading(null)
    }
  }

  const handlePredictCashFlow = async () => {
    setLoading('predict')
    try {
      const res = await api.ai.predictCashFlow()
      setPrediction(res.prediction || 'No se pudo generar la predicción')
    } catch (err) {
      setPrediction('Error al generar predicción')
    } finally {
      setLoading(null)
    }
  }

  const handleGenerateReport = async () => {
    setLoading('report')
    try {
      const res = await api.ai.generateReport('executive')
      setReport(res.report || 'No se pudo generar el reporte')
    } catch (err) {
      setReport('Error al generar reporte')
    } finally {
      setLoading(null)
    }
  }

  const aiCards = [
    {
      key: 'analyze',
      title: 'Analizar Finanzas',
      description: 'Obtén un análisis detallado de la situación financiera de tu empresa',
      icon: Search,
      iconColor: '#3b82f6',
      gradient: 'from-blue-500/5 to-blue-600/5',
      action: handleAnalyze,
      result: analysis,
      buttonText: loading === 'analyze' ? 'Analizando...' : 'Analizar',
      buttonIcon: Sparkles,
    },
    {
      key: 'errors',
      title: 'Detectar Errores',
      description: 'Detecta errores contables, asientos descuadrados y anomalías',
      icon: AlertTriangle,
      iconColor: '#FBBF24',
      gradient: 'from-yellow-500/5 to-yellow-600/5',
      action: handleDetectErrors,
      result: errors?.errors_detected || null,
      buttonText: loading === 'errors' ? 'Revisando...' : 'Revisar',
      buttonIcon: Search,
      extra: errors?.total_entries_reviewed ? `${errors.total_entries_reviewed} asientos revisados` : null,
      error: errors?.error || null,
    },
    {
      key: 'predict',
      title: 'Predecir Flujo de Caja',
      description: 'Predice el flujo de caja para los próximos meses usando IA',
      icon: TrendingUp,
      iconColor: '#06b6d4',
      gradient: 'from-cyan-500/5 to-cyan-600/5',
      action: handlePredictCashFlow,
      result: prediction,
      buttonText: loading === 'predict' ? 'Prediciendo...' : 'Predecir',
      buttonIcon: Sparkles,
    },
    {
      key: 'report',
      title: 'Reporte Ejecutivo IA',
      description: 'Genera reportes ejecutivos inteligentes con análisis y recomendaciones',
      icon: FileText,
      iconColor: '#10b981',
      gradient: 'from-green-500/5 to-green-600/5',
      action: handleGenerateReport,
      result: report,
      buttonText: loading === 'report' ? 'Generando...' : 'Generar',
      buttonIcon: FileText,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header gradient-primary">
        <div className="page-header-decoration" />
        <div className="page-header-decoration-2" />
        <div className="page-header-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-heading font-bold text-white">ContaPro AI</h1>
                  <span className="px-2 py-0.5 bg-[#6EEB83]/20 text-[#6EEB83] text-[10px] font-semibold rounded-full uppercase tracking-wider">Beta</span>
                </div>
                <p className="text-sm text-blue-200">Inteligencia Artificial aplicada a tu contabilidad</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {aiCards.map((card) => (
          <Card key={card.key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${card.gradient}`}>
                    <card.icon className="w-4 h-4" style={{ color: card.iconColor }} />
                  </div>
                  {card.title}
                </h3>
                <Button variant="primary" size="sm" onClick={card.action} disabled={loading === card.key}
                  className="bg-[#062B5B] hover:bg-[#05244d] text-white border-none text-xs">
                  <card.buttonIcon className="w-3.5 h-3.5 mr-1" /> {card.buttonText}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-4">{card.description}</p>
              {card.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400 mb-3">
                  {card.error}
                </div>
              )}
              {card.result && (
                <div className="p-4 rounded-xl bg-[#F5F7FA] dark:bg-gray-800/50 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto scrollbar-thin leading-relaxed">
                  {card.result}
                </div>
              )}
              {card.extra && (
                <p className="text-xs text-gray-500 mt-2">{card.extra}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
