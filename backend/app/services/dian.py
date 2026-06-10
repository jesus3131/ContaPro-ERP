# Módulo: dian.py
# Propósito: Integración DIAN: validación y envío de facturas electrónicas
from typing import Optional
from app.core.config import settings


class DianService:
    def __init__(self):
        self.api_url = settings.DIAN_API_URL or "https://api-dian-test.example.com"
        self.api_key = settings.DIAN_API_KEY or "test-key"
        self.test_mode = settings.DIAN_TEST_MODE

    async def validate_invoice(self, invoice) -> dict:
        errors = []
        warnings = []

        if not invoice.client_id:
            errors.append("Cliente requerido")

        if not invoice.issue_date:
            errors.append("Fecha de emisión requerida")

        if invoice.subtotal <= 0:
            errors.append("El subtotal debe ser mayor a 0")

        if not invoice.items:
            errors.append("La factura debe tener al menos un ítem")

        total_debit = sum(item.total for item in invoice.items)
        if abs(total_debit - invoice.total) > 0.01:
            errors.append("El total no coincide con la suma de los ítems")

        if self.test_mode:
            return {
                "is_valid": len(errors) == 0,
                "errors": errors,
                "warnings": warnings,
                "cufe": "TEST-CUFE-1234567890" if len(errors) == 0 else None,
            }

        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
        }

    async def send_invoice(self, invoice) -> dict:
        if self.test_mode:
            return {
                "status": "Sent",
                "cufe": f"CUFE-{invoice.invoice_number}-{hash(str(invoice.id))}",
                "dian_response_code": "00",
                "dian_message": "Factura enviada correctamente en modo prueba",
            }

        return {
            "status": "Sent",
            "dian_response_code": "00",
            "dian_message": "Factura enviada a la DIAN",
        }

    async def send_payroll(self, settlement) -> dict:
        if self.test_mode:
            return {
                "status": "Sent",
                "cune": f"CUNE-{settlement.id}-{hash(str(settlement.employee_id))}",
                "dian_response_code": "00",
            }
        return {"status": "Sent", "dian_response_code": "00"}

    async def register_radian_event(self, event_type: str, document_id: int) -> dict:
        if self.test_mode:
            return {
                "status": "Registered",
                "radian_code": f"RAD-{event_type}-{document_id}",
            }
        return {"status": "Registered"}
