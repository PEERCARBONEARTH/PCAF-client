import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { db, type LoanPortfolioItem, type PortfolioCalculation } from '@/lib/db';

export interface ReportData {
  portfolioSummary: {
    reportDate: string;
    institutionName: string;
    reportingPeriod: string;
    totalLoans: number;
    totalLoanValue: number;
    totalOutstandingBalance: number;
    totalFinancedEmissions: number;
    weightedAvgDataQuality: number;
    pcafCompliantLoans: number;
    emissionIntensity: number;
  };
  loans: LoanPortfolioItem[];
  calculations: PortfolioCalculation[];
  dataQualityBreakdown: Record<string, number>;
  emissionBreakdowns: {
    byFuelType: Record<string, number>;
    byVehicleType: Record<string, number>;
  };
}

export class PCAFReportGenerator {
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private static formatNumber(num: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  private static getDataQualityLabel(score: number): string {
    if (score <= 1.5) return 'Excellent (Level 1)';
    if (score <= 2.5) return 'Good (Level 2)';
    if (score <= 3.5) return 'Fair (Level 3)';
    if (score <= 4.5) return 'Poor (Level 4)';
    return 'Very Poor (Level 5)';
  }

  static async generatePortfolioSummaryPDF(data: ReportData): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let currentY = margin;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PCAF Category 15 Financed Emissions Report', margin, currentY);
    currentY += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Portfolio Summary - Motor Vehicle Loans', margin, currentY);
    currentY += 20;

    // Institution Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Institution Information', margin, currentY);
    currentY += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const institutionInfo = [
      ['Institution Name:', data.portfolioSummary.institutionName || 'Not Specified'],
      ['Reporting Period:', data.portfolioSummary.reportingPeriod || '2024'],
      ['Report Date:', data.portfolioSummary.reportDate],
      ['Methodology:', 'PCAF Standard 2.0 - Category 15 (Motor Vehicle Loans)'],
    ];

    institutionInfo.forEach(([label, value]) => {
      doc.text(label, margin, currentY);
      doc.text(value, margin + 60, currentY);
      currentY += 7;
    });

    currentY += 10;

    // Executive Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, currentY);
    currentY += 10;

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Value', 'Unit/Description']],
      body: [
        ['Total Loans', data.portfolioSummary.totalLoans.toString(), 'loans'],
        ['Total Loan Value', this.formatCurrency(data.portfolioSummary.totalLoanValue), 'USD'],
        ['Outstanding Balance', this.formatCurrency(data.portfolioSummary.totalOutstandingBalance), 'USD'],
        ['Total Financed Emissions', this.formatNumber(data.portfolioSummary.totalFinancedEmissions, 3), 'tCO₂e'],
        ['Emission Intensity', this.formatNumber(data.portfolioSummary.emissionIntensity, 4), 'kg CO₂e per $ outstanding'],
        ['PCAF Box 8 WDQS (Loan-weighted)', this.formatNumber(data.portfolioSummary.weightedAvgDataQuality, 2), this.getDataQualityLabel(data.portfolioSummary.weightedAvgDataQuality)],
        ['PCAF Compliant Loans', `${data.portfolioSummary.pcafCompliantLoans}/${data.portfolioSummary.totalLoans}`, `${((data.portfolioSummary.pcafCompliantLoans/data.portfolioSummary.totalLoans)*100).toFixed(1)}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [46, 125, 50] },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Add new page if needed
    if (currentY > doc.internal.pageSize.height - 60) {
      doc.addPage();
      currentY = margin;
    }

    // Emission Breakdowns
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Emission Breakdowns', margin, currentY);
    currentY += 10;

    // Fuel Type Breakdown
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('By Fuel Type:', margin, currentY);
    currentY += 5;

    const fuelTypeData = Object.entries(data.emissionBreakdowns.byFuelType)
      .map(([fuelType, emissions]) => [
        fuelType.charAt(0).toUpperCase() + fuelType.slice(1),
        this.formatNumber(emissions, 3),
        `${((emissions / data.portfolioSummary.totalFinancedEmissions) * 100).toFixed(1)}%`
      ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Fuel Type', 'Emissions (tCO₂e)', 'Percentage']],
      body: fuelTypeData,
      theme: 'striped',
      headStyles: { fillColor: [66, 165, 245] },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Data Quality Assessment
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Data Quality Assessment', margin, currentY);
    currentY += 10;

    const qualityData = Object.entries(data.dataQualityBreakdown)
      .filter(([, count]) => count > 0)
      .map(([level, count]) => [
        `Level ${level}`,
        this.getDataQualityLabel(parseInt(level)),
        count.toString(),
        `${((count / data.portfolioSummary.totalLoans) * 100).toFixed(1)}%`
      ]);

    autoTable(doc, {
      startY: currentY,
      head: [['PCAF Level', 'Description', 'Loan Count', 'Percentage']],
      body: qualityData,
      theme: 'grid',
      headStyles: { fillColor: [156, 39, 176] },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Add new page for methodology
    doc.addPage();
    currentY = margin;

    // Methodology Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Methodology & Data Quality', margin, currentY);
    currentY += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const methodologyText = [
      'This report follows the Partnership for Carbon Accounting Financials (PCAF) Standard 2.0',
      'methodology for calculating financed emissions from motor vehicle loans (Category 15).',
      '',
      'Key Calculation Components:',
      '• Attribution Factor = Outstanding Loan Balance ÷ Vehicle Value',
      '• Annual Emissions = Distance Driven × Emission Factor',
      '• Financed Emissions = Annual Emissions × Attribution Factor × Temporal Attribution',
      '',
      'Data Quality Hierarchy (PCAF Levels 1-5):',
      '• Level 1: Asset-specific, verified actual data',
      '• Level 2: Asset-specific, partially verified data',
      '• Level 3: Asset-type average data from representative samples',
      '• Level 4: Asset-type average data from proxy samples',  
      '• Level 5: Asset-type average data from highly uncertain sources',
      '',
      'PCAF Compliance: Weighted average data quality score ≤ 3.5 is considered compliant.',
      '',
      'Demo Disclosure: Scope limited to motor vehicle loans; placeholder emission factors (TTW basis) are used for demonstration. Official PCAF factors will be integrated upon accreditation.'
    ];

    methodologyText.forEach((line, index) => {
      if (line.startsWith('•')) {
        doc.text(line, margin + 5, currentY);
      } else if (line.includes(':')) {
        doc.setFont('helvetica', 'bold');
        doc.text(line, margin, currentY);
        doc.setFont('helvetica', 'normal');
      } else {
        doc.text(line, margin, currentY);
      }
      currentY += line === '' ? 4 : 6;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
        margin,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        'PCAF Category 15 Financed Emissions Report',
        pageWidth - margin - 80,
        doc.internal.pageSize.height - 10
      );
    }

    // Save the PDF
    doc.save(`PCAF_Portfolio_Summary_${data.portfolioSummary.reportDate}.pdf`);
  }

  static async generateDetailedLoansPDF(data: ReportData): Promise<void> {
    const doc = new jsPDF();
    const margin = 15;
    let currentY = margin;

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PCAF Detailed Loan Emissions Report', margin, currentY);
    currentY += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Date: ${data.portfolioSummary.reportDate}`, margin, currentY);
    doc.text(`Total Loans: ${data.loans.length}`, margin + 100, currentY);
    currentY += 15;

    // Loan Details Table
    const loanTableData = data.loans.map(loan => [
      loan.loan_id,
      loan.vehicle_type.replace('_', ' '),
      loan.fuel_type,
      this.formatCurrency(loan.loan_amount),
      this.formatCurrency(loan.outstanding_balance),
      `${(loan.attribution_factor * 100).toFixed(1)}%`,
      this.formatNumber(loan.financed_emissions, 3),
      loan.data_quality_score.toString(),
      loan.verification_status
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Loan ID', 'Vehicle', 'Fuel', 'Loan Amt', 'Outstanding', 'Attribution', 'Emissions (tCO₂e)', 'Quality', 'Status']],
      body: loanTableData,
      theme: 'striped',
      headStyles: { fillColor: [46, 125, 50], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 15 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 18 },
        6: { cellWidth: 20 },
        7: { cellWidth: 12 },
        8: { cellWidth: 18 },
      },
      margin: { left: margin, right: margin },
      pageBreak: 'auto',
    });

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Detailed Loan Report | Page ${i} of ${pageCount}`,
        margin,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`PCAF_Detailed_Loans_${data.portfolioSummary.reportDate}.pdf`);
  }

  static async generateExcelReport(data: ReportData): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Portfolio Summary Sheet
    const summaryData = [
      ['PCAF Category 15 Financed Emissions Report'],
      ['Generated:', data.portfolioSummary.reportDate],
      ['Institution:', data.portfolioSummary.institutionName || 'Not Specified'],
      ['Reporting Period:', data.portfolioSummary.reportingPeriod || '2024'],
      [],
      ['Portfolio Metrics'],
      ['Total Loans', data.portfolioSummary.totalLoans],
      ['Total Loan Value', data.portfolioSummary.totalLoanValue],
      ['Outstanding Balance', data.portfolioSummary.totalOutstandingBalance],
      ['Total Financed Emissions (tCO₂e)', data.portfolioSummary.totalFinancedEmissions],
      ['PCAF Box 8 WDQS (Loan-weighted)', data.portfolioSummary.weightedAvgDataQuality],
      ['PCAF Compliant Loans', data.portfolioSummary.pcafCompliantLoans],
      ['Emission Intensity (kg CO₂e/$)', data.portfolioSummary.emissionIntensity],
      [],
      ['Emission Breakdown by Fuel Type'],
      ...Object.entries(data.emissionBreakdowns.byFuelType).map(([fuel, emissions]) => [fuel, emissions]),
      [],
      ['Emission Breakdown by Vehicle Type'],
      ...Object.entries(data.emissionBreakdowns.byVehicleType).map(([vehicle, emissions]) => [vehicle, emissions]),
      [],
      ['Data Quality Distribution'],
      ...Object.entries(data.dataQualityBreakdown).map(([level, count]) => [`Level ${level}`, count]),
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Portfolio Summary');

    // Detailed Loans Sheet
    const loanHeaders = [
      'Loan ID', 'Loan Amount', 'Vehicle Type', 'Fuel Type', 'Engine Size',
      'Vehicle Value', 'Estimated KM/Year', 'Loan Term (Years)', 'Outstanding Balance',
      'Attribution Factor', 'Annual Emissions (tCO₂e)', 'Financed Emissions (tCO₂e)',
      'Data Quality Score', 'Temporal Attribution', 'Loan Origination Date',
      'Reporting Date', 'Data Source', 'Emission Factor Source', 'Verification Status',
      'Created At', 'Updated At'
    ];

    const loanData = data.loans.map(loan => [
      loan.loan_id,
      loan.loan_amount,
      loan.vehicle_type,
      loan.fuel_type,
      loan.engine_size,
      loan.vehicle_value,
      loan.estimated_km_per_year,
      loan.loan_term_years,
      loan.outstanding_balance,
      loan.attribution_factor,
      loan.annual_emissions,
      loan.financed_emissions,
      loan.data_quality_score,
      loan.temporal_attribution,
      loan.loan_origination_date,
      loan.reporting_date,
      loan.data_source,
      loan.emission_factor_source,
      loan.verification_status,
      loan.created_at?.toISOString(),
      loan.updated_at?.toISOString()
    ]);

    const loansSheet = XLSX.utils.aoa_to_sheet([loanHeaders, ...loanData]);
    XLSX.utils.book_append_sheet(workbook, loansSheet, 'Loan Details');

    // PCAF Methodology Sheet
    const methodologyData = [
      ['PCAF Standard 2.0 Methodology'],
      ['Category 15: Motor Vehicle Loans'],
      [],
      ['Calculation Formula:'],
      ['Financed Emissions = Annual Emissions × Attribution Factor × Temporal Attribution'],
      [],
      ['Where:'],
      ['Annual Emissions = Distance Driven (km/year) × Emission Factor (kg CO₂/km)'],
      ['Attribution Factor = Outstanding Loan Balance ÷ Vehicle Value'],
      ['Temporal Attribution = Portion of reporting year covered by loan'],
      [],
      ['Data Quality Hierarchy:'],
      ['Level 1', 'Asset-specific, verified actual data'],
      ['Level 2', 'Asset-specific, partially verified data'],
      ['Level 3', 'Asset-type average, representative sample'],
      ['Level 4', 'Asset-type average, proxy sample'],
      ['Level 5', 'Asset-type average, highly uncertain'],
      [],
      ['PCAF Compliance:'],
      ['Weighted average data quality ≤ 3.5 considered compliant'],
      ['Higher scores indicate lower data quality and higher uncertainty'],
    ];

    const methodologySheet = XLSX.utils.aoa_to_sheet(methodologyData);
    XLSX.utils.book_append_sheet(workbook, methodologySheet, 'PCAF Methodology');

    // Save the Excel file
    XLSX.writeFile(workbook, `PCAF_Complete_Report_${data.portfolioSummary.reportDate}.xlsx`);
  }

  static async generateReportData(): Promise<ReportData> {
    const loans = await db.loans.toArray();
    const calculations = await db.portfolio_calculations.orderBy('calculation_date').reverse().limit(10).toArray();

    if (loans.length === 0) {
      throw new Error('No loan data available for reporting');
    }

    // Calculate portfolio metrics
    const totalLoans = loans.length;
    const totalLoanValue = loans.reduce((sum, loan) => sum + loan.loan_amount, 0);
    const totalOutstandingBalance = loans.reduce((sum, loan) => sum + loan.outstanding_balance, 0);
    const totalFinancedEmissions = loans.reduce((sum, loan) => sum + loan.financed_emissions, 0);
    
    // PCAF Box 8 WDQS calculation (loan-weighted, not emission-weighted)
    const weightedAvgDataQuality = totalOutstandingBalance > 0 
      ? loans.reduce((sum, loan) => sum + (loan.data_quality_score * loan.outstanding_balance), 0) / totalOutstandingBalance
      : 0;

    const pcafCompliantLoans = loans.filter(loan => loan.data_quality_score <= 3).length;
    const emissionIntensity = totalOutstandingBalance > 0 ? (totalFinancedEmissions * 1000) / totalOutstandingBalance : 0;

    // Breakdowns
    const emissionsByFuelType: Record<string, number> = {};
    const emissionsByVehicleType: Record<string, number> = {};
    const dataQualityBreakdown: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

    loans.forEach(loan => {
      // Fuel type breakdown
      if (!emissionsByFuelType[loan.fuel_type]) {
        emissionsByFuelType[loan.fuel_type] = 0;
      }
      emissionsByFuelType[loan.fuel_type] += loan.financed_emissions;

      // Vehicle type breakdown
      if (!emissionsByVehicleType[loan.vehicle_type]) {
        emissionsByVehicleType[loan.vehicle_type] = 0;
      }
      emissionsByVehicleType[loan.vehicle_type] += loan.financed_emissions;

      // Data quality breakdown
      const qualityLevel = Math.floor(loan.data_quality_score).toString();
      dataQualityBreakdown[qualityLevel]++;
    });

    return {
      portfolioSummary: {
        reportDate: new Date().toISOString().split('T')[0],
        institutionName: 'Financial Institution', // This could be configurable
        reportingPeriod: '2024',
        totalLoans,
        totalLoanValue,
        totalOutstandingBalance,
        totalFinancedEmissions,
        weightedAvgDataQuality,
        pcafCompliantLoans,
        emissionIntensity
      },
      loans,
      calculations,
      dataQualityBreakdown,
      emissionBreakdowns: {
        byFuelType: emissionsByFuelType,
        byVehicleType: emissionsByVehicleType
      }
    };
  }
}