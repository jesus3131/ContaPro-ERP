# Módulo: ai_assistant.py
# Propósito: Asistente de IA: análisis financiero, detección de errores, predicciones
from openai import AsyncOpenAI

from app.core.config import settings


class AIAssistant:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.model = settings.OPENAI_MODEL

    async def analyze_financials(self, account_data: list, company_name: str) -> dict:
        if not self.client:
            return {"error": "OpenAI no configurado", "analysis": None}

        system_prompt = """Eres un analista financiero experto en contabilidad colombiana, NIIF y normativa DIAN.
Analiza los datos financieros proporcionados y genera un análisis detallado en español que incluya:
1. Resumen ejecutivo de la situación financiera
2. Análisis de liquidez y solvencia
3. Identificación de cuentas con saldos anómalos
4. Recomendaciones de mejora
5. Alertas de cumplimiento normativo"""

        user_prompt = f"Empresa: {company_name}\nDatos contables:\n{account_data[:50]}"

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=2000,
        )

        analysis = response.choices[0].message.content if response.choices else "No se pudo generar el análisis"
        return {"analysis": analysis, "model": self.model}

    async def detect_errors(self, entries_data: list) -> dict:
        if not self.client:
            return {"error": "OpenAI no configurado"}

        system_prompt = """Eres un auditor contable experto. Revisa los asientos contables y detecta:
1. Asientos descuadrados (débito != crédito)
2. Cuentas utilizadas incorrectamente
3. Posibles duplicados
4. Errores de clasificación
5. Riesgos de auditoría"""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Revisa estos asientos contables:\n{entries_data[:30]}"},
            ],
            temperature=0.3,
            max_tokens=2000,
        )

        return {
            "errors_detected": response.choices[0].message.content if response.choices else [],
            "total_entries_reviewed": len(entries_data),
        }

    async def predict_cash_flow(self, monthly_data: list) -> dict:
        if not self.client:
            return {"error": "OpenAI no configurado"}

        system_prompt = """Eres un analista financiero experto en predicción de flujo de caja.
Basado en los datos históricos de ingresos y egresos mensuales:
1. Analiza la tendencia
2. Identifica estacionalidad
3. Predice los próximos 3 meses
4. Genera alertas de riesgo de liquidez
5. Recomienda estrategias de optimización"""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Datos históricos mensuales:\n{monthly_data}"},
            ],
            temperature=0.3,
            max_tokens=2000,
        )

        return {
            "prediction": response.choices[0].message.content if response.choices else [],
            "data_points": len(monthly_data),
        }

    async def generate_report(self, report_type: str, financial_summary: dict) -> dict:
        if not self.client:
            return {"error": "OpenAI no configurado"}

        prompts = {
            "executive": "Genera un reporte ejecutivo en español con análisis de la situación financiera actual.",
            "tax": "Genera un análisis de cumplimiento tributario colombiano, incluyendo impuestos, retenciones y obligaciones DIAN.",
            "inventory": "Analiza el estado del inventario y recomienda optimizaciones.",
            "cash_flow": "Analiza el flujo de caja y genera proyecciones.",
        }

        prompt = prompts.get(report_type, prompts["executive"])
        system_prompt = f"{prompt} Incluye recomendaciones accionables."

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Datos financieros:\n{financial_summary}"},
            ],
            temperature=0.4,
            max_tokens=2500,
        )

        return {
            "report": response.choices[0].message.content if response.choices else [],
            "report_type": report_type,
        }
