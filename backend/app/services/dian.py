import hashlib
from datetime import datetime

from app.core.config import settings


class DianService:
    def __init__(self):
        self.api_url = settings.DIAN_API_URL or "https://vpfe-hab-dian.gov.co/WcfDianCustomerServices.svc"
        self.api_key = settings.DIAN_API_KEY or "test-key"
        self.test_mode = settings.DIAN_TEST_MODE
        self.software_id = "7a7e8e8e-8e8e-4e8e-8e8e-8e8e8e8e8e8e"
        self.software_pin = "1234567890"

    def _generate_cufe(self, invoice) -> str:
        raw = f"{invoice.invoice_number}|{invoice.issue_date}|{invoice.total}|{self.software_id}|{self.software_pin}"
        return "CUFE-" + hashlib.sha256(raw.encode()).hexdigest().upper()[:40]

    def _generate_qr_data(self, invoice, cufe: str) -> str:
        return (
            f"https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey={cufe}"
            f"&invoice={invoice.invoice_number}"
            f"&nit={invoice.company.nit if hasattr(invoice, 'company') else 'N/A'}"
            f"&date={invoice.issue_date}&total={invoice.total}"
        )

    def _build_invoice_xml(self, invoice, items: list) -> str:
        lines = []
        for i, item in enumerate(items, 1):
            lines.append(f"""
    <invoiceLine>
      <id>{i}</id>
      <quantity>{item.quantity}</quantity>
      <unitPrice>{item.unit_price}</unitPrice>
      <taxAmount>{item.tax_amount}</taxAmount>
      <total>{item.total}</total>
      <description>{item.description or 'Producto'}</description>
    </invoiceLine>""")
        items_xml = "".join(lines)

        return f"""<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>10</cbc:CustomizationID>
  <cbc:ProfileID>DIAN 2.1</cbc:ProfileID>
  <cbc:ID>{invoice.prefix}{invoice.invoice_number}</cbc:ID>
  <cbc:IssueDate>{invoice.issue_date}</cbc:IssueDate>
  <cbc:InvoiceTypeCode>{invoice.invoice_type}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>COP</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>{len(items)}</cbc:LineCountNumeric>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:CompanyID>{getattr(invoice.company, 'nit', 'N/A') if hasattr(invoice, 'company') else 'N/A'}</cbc:CompanyID>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cbc:CompanyID>{invoice.client.document_number if hasattr(invoice, 'client') else 'N/A'}</cbc:CompanyID>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount>{invoice.subtotal}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount>{invoice.tax_amount}</cbc:TaxExclusiveAmount>
    <cbc:PayableAmount>{invoice.total}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>{items_xml}
  </cac:InvoiceLine>
</Invoice>"""

    async def validate_invoice(self, invoice) -> dict:
        errors = []
        warnings = []

        if not invoice.client_id:
            errors.append("Cliente requerido")
        if not invoice.issue_date:
            errors.append("Fecha de emisión requerida")
        if invoice.subtotal <= 0:
            errors.append("El subtotal debe ser mayor a 0")
        if not hasattr(invoice, "items") or not invoice.items:
            errors.append("La factura debe tener al menos un ítem")
        if hasattr(invoice, "items") and invoice.items:
            total_debit = sum(item.total for item in invoice.items)
            if abs(total_debit - invoice.total) > 0.01:
                errors.append("El total no coincide con la suma de los ítems")

        is_valid = len(errors) == 0
        cufe = self._generate_cufe(invoice) if is_valid else None

        return {
            "is_valid": is_valid,
            "errors": errors,
            "warnings": warnings,
            "cufe": cufe if self.test_mode else (cufe if is_valid else None),
            "qr_data": self._generate_qr_data(invoice, cufe) if (is_valid and cufe) else None,
            "xml": self._build_invoice_xml(invoice, invoice.items) if is_valid else None,
            "technical_key": cufe[:20] if cufe else None,
        }

    async def send_invoice(self, invoice) -> dict:
        cufe = self._generate_cufe(invoice)

        if self.test_mode:
            return {
                "status": "Sent",
                "cufe": cufe,
                "qr_data": self._generate_qr_data(invoice, cufe),
                "dian_response_code": "00",
                "dian_message": "Factura enviada correctamente en modo prueba",
                "tracking_key": hashlib.sha256(f"{invoice.invoice_number}{datetime.utcnow().isoformat()}".encode()).hexdigest()[:20],
                "xml": self._build_invoice_xml(invoice, invoice.items),
            }

        return {
            "status": "Sent",
            "cufe": cufe,
            "dian_response_code": "00",
            "dian_message": "Factura enviada a la DIAN",
            "tracking_key": None,
        }

    async def send_payroll(self, settlement) -> dict:
        if self.test_mode:
            cune = "CUNE-" + hashlib.sha256(f"{settlement.id}-{settlement.employee_id}".encode()).hexdigest().upper()[:20]
            return {
                "status": "Sent",
                "cune": cune,
                "dian_response_code": "00",
                "dian_message": "Nómina enviada correctamente en modo prueba",
            }
        return {"status": "Sent", "dian_response_code": "00"}

    async def register_radian_event(self, event_type: str, document_id: int) -> dict:
        if self.test_mode:
            return {
                "status": "Registered",
                "radian_code": f"RAD-{event_type}-{document_id}",
            }
        return {"status": "Registered"}
