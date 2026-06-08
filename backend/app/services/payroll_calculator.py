from datetime import date


class PayrollCalculator:
    SMMLV = 1423000  # Salario Mínimo Mensual Legal Vigente 2026
    TRANSPORT_ALLOWANCE = 200000  # Auxilio de transporte 2026
    HEALTH_PERCENT = 0.04
    PENSION_PERCENT = 0.04
    EMPLOYER_HEALTH = 0.085
    EMPLOYER_PENSION = 0.12
    ARL_RISKS = {"I": 0.00522, "II": 0.01044, "III": 0.02436, "IV": 0.04350, "V": 0.06960}
    CCF_PERCENT = 0.04
    SENA_PERCENT = 0.02
    ICBF_PERCENT = 0.03

    def calculate(self, employee, period) -> dict:
        salary = employee.salary
        worked_days = (period.end_date - period.start_date).days + 1

        transport_allowance = self.TRANSPORT_ALLOWANCE if salary <= 2 * self.SMMLV else 0

        gross_salary = salary + transport_allowance

        health_deduction = salary * self.HEALTH_PERCENT
        pension_deduction = salary * self.PENSION_PERCENT

        total_deductions = health_deduction + pension_deduction

        solidarity_fund = 0
        if salary > 4 * self.SMMLV:
            solidarity_fund = salary * 0.01

        withholding_tax = self._calculate_withholding(salary)

        total_deductions += solidarity_fund + withholding_tax

        net_payment = gross_salary - total_deductions

        severance = (salary * worked_days) / 360
        severance_interest = severance * 0.12 * (worked_days / 360)
        prima = (salary * worked_days) / 360
        vacation = (salary * worked_days) / 720

        risk_class = employee.risk_class or "I"
        arl_rate = self.ARL_RISKS.get(risk_class, self.ARL_RISKS["I"])

        employer_health = salary * self.EMPLOYER_HEALTH
        employer_pension = salary * self.EMPLOYER_PENSION
        arl = salary * arl_rate
        ccf = salary * self.CCF_PERCENT
        sena = salary * self.SENA_PERCENT if employee.company_id else 0
        icbf = salary * self.ICBF_PERCENT if employee.company_id else 0
        total_parafiscal = employer_health + employer_pension + arl + ccf + sena + icbf

        return {
            "base_salary": salary,
            "worked_days": worked_days,
            "overtime_hours": 0,
            "overtime_amount": 0,
            "bonuses": 0,
            "commissions": 0,
            "transport_allowance": transport_allowance,
            "gross_salary": gross_salary,
            "health_percentage": self.HEALTH_PERCENT * 100,
            "health_deduction": health_deduction,
            "pension_percentage": self.PENSION_PERCENT * 100,
            "pension_deduction": pension_deduction,
            "solidarity_fund": solidarity_fund,
            "withholding_tax": withholding_tax,
            "other_deductions": 0,
            "total_deductions": total_deductions,
            "net_payment": net_payment,
            "severance": severance,
            "severance_interest": severance_interest,
            "prima": prima,
            "vacation": vacation,
            "employer_health": employer_health,
            "employer_pension": employer_pension,
            "arl": arl,
            "ccf": ccf,
            "sena": sena,
            "icbf": icbf,
            "total_parafiscal": total_parafiscal,
            "status": "Calculated",
        }

    def _calculate_withholding(self, salary: float) -> float:
        if salary <= 2 * self.SMMLV:
            return 0
        elif salary <= 4 * self.SMMLV:
            return (salary - 2 * self.SMMLV) * 0.05
        elif salary <= 6 * self.SMMLV:
            return (salary - 4 * self.SMMLV) * 0.10 + (2 * self.SMMLV * 0.05)
        else:
            return (salary - 6 * self.SMMLV) * 0.15 + (2 * self.SMMLV * 0.10) + (2 * self.SMMLV * 0.05)

    def calculate_severance(self, employee, start_date: date, end_date: date) -> float:
        days = (end_date - start_date).days
        return (employee.salary * days) / 360

    def calculate_prima(self, employee, semester_start: date, semester_end: date) -> float:
        days = (semester_end - semester_start).days
        return (employee.salary * days) / 360

    def calculate_vacation(self, employee, service_start: date, service_end: date) -> float:
        days = (service_end - service_start).days
        return (employee.salary * days) / 720
