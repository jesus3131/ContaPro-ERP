'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Search, AlertTriangle, TrendingUp, FileText, Sparkles } from 'lucide-react'

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Brain className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asistente IA</h1>
            <p className="text-sm text-gray-500 mt-1">Inteligencia Artificial aplicada a tu contabilidad</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-600" /> Analizar Finanzas
              </h3>
              <Button variant="primary" size="sm" onClick={handleAnalyze} disabled={loading === 'analyze'}>
                <Sparkles className="w-4 h-4 mr-1" /> {loading === 'analyze' ? 'Analizando...' : 'Analizar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Obtén un análisis detallado de la situación financiera de tu empresa
            </p>
            {analysis && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                {analysis}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" /> Detectar Errores
              </h3>
              <Button variant="primary" size="sm" onClick={handleDetectErrors} disabled={loading === 'errors'}>
                <Search className="w-4 h-4 mr-1" /> {loading === 'errors' ? 'Revisando...' : 'Revisar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Detecta errores contables, asientos descuadrados y anomalías
            </p>
            {errors && (
              <div className="space-y-3">
                {errors.errors_detected && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {errors.errors_detected}
                  </div>
                )}
                {errors.total_entries_reviewed && (
                  <p className="text-xs text-gray-500">Asientos revisados: {errors.total_entries_reviewed}</p>
                )}
                {errors.error && <p className="text-danger text-sm">{errors.error}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-info" /> Predecir Flujo de Caja
              </h3>
              <Button variant="primary" size="sm" onClick={handlePredictCashFlow} disabled={loading === 'predict'}>
                <Sparkles className="w-4 h-4 mr-1" /> {loading === 'predict' ? 'Prediciendo...' : 'Predecir'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Predice el flujo de caja para los próximos meses usando IA
            </p>
            {prediction && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                {prediction}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-success" /> Reporte Ejecutivo IA
              </h3>
              <Button variant="primary" size="sm" onClick={handleGenerateReport} disabled={loading === 'report'}>
                <FileText className="w-4 h-4 mr-1" /> {loading === 'report' ? 'Generando...' : 'Generar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Genera reportes ejecutivos inteligentes con análisis y recomendaciones
            </p>
            {report && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                {report}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
