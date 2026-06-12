# Módulo: report_generator.py
# Propósito: Generador de reportes: PDF y Excel para todos los módulos
import json
from datetime import datetime
from io import BytesIO

import pandas as pd
from fastapi.encoders import jsonable_encoder
from fastapi.responses import Response


class ReportGenerator:
    def __init__(self, company, db):
        self.company = company
        self.db = db

    async def generate_report(self, report_type: str, data: list, format: str = "pdf"):
        if format == "pdf":
            return await self._generate_pdf(report_type, data)
        elif format == "excel":
            return await self._generate_excel(report_type, data)
        elif format == "csv":
            return await self._generate_csv(report_type, data)
        elif format == "json":
            return await self._generate_json(report_type, data)
        else:
            return await self._generate_pdf(report_type, data)

    async def _generate_pdf(self, report_type: str, data: list):
        try:
            from weasyprint import HTML
            html = self._build_html(report_type, data)
            pdf = BytesIO()
            HTML(string=html).write_pdf(pdf)
            pdf.seek(0)
            return Response(
                content=pdf.read(),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={report_type}_{datetime.now().strftime('%Y%m%d')}.pdf"},
            )
        except Exception as e:
            return Response(content=f"Error generating PDF: {str(e)}", status_code=500)

    async def _generate_excel(self, report_type: str, data: list):
        try:
            df = pd.DataFrame(data)
            output = BytesIO()
            with pd.ExcelWriter(output, engine="openpyxl") as writer:
                df.to_excel(writer, sheet_name=report_type, index=False)
            output.seek(0)
            return Response(
                content=output.read(),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename={report_type}_{datetime.now().strftime('%Y%m%d')}.xlsx"},
            )
        except Exception as e:
            return Response(content=f"Error generating Excel: {str(e)}", status_code=500)

    async def _generate_csv(self, report_type: str, data: list):
        try:
            df = pd.DataFrame(data)
            output = BytesIO()
            df.to_csv(output, index=False, encoding="utf-8-sig")
            output.seek(0)
            return Response(
                content=output.read(),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={report_type}_{datetime.now().strftime('%Y%m%d')}.csv"},
            )
        except Exception as e:
            return Response(content=f"Error generating CSV: {str(e)}", status_code=500)

    async def _generate_json(self, report_type: str, data: list):
        return Response(
            content=json.dumps(jsonable_encoder(data), ensure_ascii=False),
            media_type="application/json",
            headers={"Content-Disposition": f"inline; filename={report_type}.json"},
        )

    def _build_html(self, report_type: str, data: list) -> str:
        titles = {
            "balance_sheet": "Balance General",
            "income_statement": "Estado de Resultados",
            "cash_flow": "Flujo de Efectivo",
            "trial_balance": "Balance de Prueba",
            "accounts_receivable": "Cartera - Cuentas por Cobrar",
            "inventory_report": "Reporte de Inventario",
            "payroll_report": "Reporte de Nómina",
            "tax_report": "Reporte de Impuestos",
        }
        title = titles.get(report_type, "Reporte ContaPro ERP")

        rows = ""
        total = 0
        for item in data:
            balance = item.get("balance", item.get("amount", 0))
            rows += f"""<tr>
                <td>{item.get('code', '')}</td>
                <td>{item.get('name', '')}</td>
                <td class="amount">${balance:,.2f}</td>
            </tr>"""
            total += balance

        return f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>{title}</title>
<style>
    body {{ font-family: Arial, sans-serif; margin: 40px; color: #333; }}
    h1 {{ color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 10px; }}
    .company {{ color: #666; margin-bottom: 20px; }}
    table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
    th {{ background: #1a56db; color: white; padding: 10px; text-align: left; }}
    td {{ padding: 8px 10px; border-bottom: 1px solid #ddd; }}
    .amount {{ text-align: right; }}
    tr:hover {{ background: #f5f5f5; }}
    .total {{ font-weight: bold; background: #e8f4fd; }}
    .footer {{ margin-top: 30px; font-size: 12px; color: #999; text-align: center; }}
</style></head><body>
    <h1>{title}</h1>
    <div class="company">{self.company.name} - NIT: {self.company.nit}</div>
    <p>Fecha de generación: {datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
    <table>
        <thead><tr><th>Código</th><th>Cuenta</th><th>Saldo</th></tr></thead>
        <tbody>{rows}</tbody>
        <tfoot><tr class="total"><td colspan="2">TOTAL</td><td class="amount">${total:,.2f}</td></tr></tfoot>
    </table>
    <div class="footer">ContaPro ERP Colombia - Software Contable y Administrativo</div>
</body></html>"""
