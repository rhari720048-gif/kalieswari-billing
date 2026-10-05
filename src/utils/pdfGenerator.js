import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getShopSettings } from './storage';

/**
 * High-Performance, Instant Multi-Page PDF Generator for Billing.
 * Handles 1 item to 2000+ items in milliseconds without freezing or missing products.
 */
export function createInvoicePDF(billData) {
  if (!billData) return null;

  const shopSettings = getShopSettings();
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm
  const margin = 12; // 12 mm margins

  // Color Palette
  const primaryRed = [220, 38, 38];   // #dc2626
  const darkRed = [153, 27, 27];     // #991b1b
  const textDark = [15, 23, 42];      // #0f172a
  const textMuted = [100, 116, 139];  // #64748b
  const bgLight = [248, 250, 252];    // #f8fafc

  const billNo = billData.billNo || billData.bill_no || 'INV-01';
  const billDate = billData.billDate || billData.created_at || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const customerName = billData.customerName || billData.customer_name || 'Walk-in Customer';
  const customerPhone = billData.customerPhone || billData.customer_phone || '';
  const customerAddress = billData.customerAddress || billData.customer_address || '';
  const items = billData.items || [];
  const paymentMode = billData.paymentMode || billData.payment_mode || 'Cash';
  const subtotal = Number(billData.subtotal || billData.grand_total || 0);
  const discountTotal = Number(billData.discountTotal || billData.discount_total || 0);
  const grandTotal = Number(billData.grandTotal || billData.grand_total || 0);
  const status = billData.status || 'Paid';

  // 1. Draw Brand & Document Header (Page 1)
  // Shop Title & Subtitle
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(...primaryRed);
  pdf.text((shopSettings.shopName || 'SRI KALIESWARI CRACKERS').toUpperCase(), margin, 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...textMuted);
  pdf.text('Quality Fireworks & Sparklers • Sivakasi', margin, 23);

  // Right-aligned Address & Contact
  const rightMargin = pageWidth - margin;
  const addr = shopSettings.address || 'Main Road, Sivakasi - 626123, Tamil Nadu';
  const phone = shopSettings.phone ? `Phone: ${shopSettings.phone}` : '';
  const gstin = shopSettings.gstin ? `GSTIN: ${shopSettings.gstin}` : '';

  pdf.text(addr, rightMargin, 16, { align: 'right' });
  if (gstin) pdf.text(gstin, rightMargin, 21, { align: 'right' });
  if (phone) pdf.text(phone, rightMargin, gstin ? 26 : 21, { align: 'right' });

  // Top Divider Line
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 29, rightMargin, 29);

  // 2. Invoice Title & Details
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(...textDark);
  pdf.text('INVOICE', margin, 38);

  pdf.setFontSize(11);
  pdf.setTextColor(...darkRed);
  pdf.text(`# ${billNo}`, margin, 44);

  // Bill To & Metadata Background Box
  pdf.setFillColor(...bgLight);
  pdf.roundedRect(margin, 48, pageWidth - (margin * 2), 26, 3, 3, 'F');

  // Left: Customer Info
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...textMuted);
  pdf.text('BILL TO:', margin + 4, 54);

  pdf.setFontSize(10);
  pdf.setTextColor(...textDark);
  pdf.text(customerName, margin + 4, 60);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...textMuted);
  let custSub = customerAddress || 'Sivakasi, Tamil Nadu';
  if (customerPhone) custSub += `  |  Mobile: ${customerPhone}`;
  pdf.text(custSub, margin + 4, 66);

  // Right: Invoice Metadata
  const col2X = pageWidth - margin - 60;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...textMuted);
  pdf.text('Date & Time:', col2X, 54);
  pdf.text('Payment Mode:', col2X, 60);
  pdf.text('Status:', col2X, 66);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...textDark);
  pdf.text(String(billDate), rightMargin - 4, 54, { align: 'right' });
  pdf.text(String(paymentMode), rightMargin - 4, 60, { align: 'right' });
  pdf.setTextColor(...darkRed);
  pdf.text(String(status), rightMargin - 4, 66, { align: 'right' });

  // 3. Prepare Table Rows for 1 to 2000+ Items
  const tableRows = items.map((item, idx) => {
    const mrpVal = Number(item.mrp || 0);
    const priceVal = Number(item.price || (item.discount_price !== undefined ? item.discount_price : (mrpVal * 0.1)));
    const itemTotal = priceVal * item.quantity;

    // Filter non-Latin characters for clean, standard PDF font encoding
    let cleanName = (item.name || '').replace(/[^\x00-\x7F]/g, '').trim();
    if (!cleanName) cleanName = item.name || 'Cracker Item';

    return [
      idx + 1,
      item.code || '',
      cleanName,
      mrpVal > 0 ? `₹${mrpVal.toFixed(2)}` : '-',
      '90%',
      `₹${Math.round(priceVal)}`,
      item.quantity,
      `₹${Math.round(itemTotal).toLocaleString('en-IN')}`
    ];
  });

  // 4. Generate Multi-Page Table using autoTable
  autoTable(pdf, {
    startY: 78,
    head: [['#', 'Code', 'Item Name', 'MRP', 'Discount', 'Price', 'Qty', 'Amount']],
    body: tableRows,
    margin: { left: margin, right: margin, top: 16, bottom: 18 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 2.5,
      overflow: 'linebreak',
      textColor: textDark,
      lineColor: [241, 245, 249],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: bgLight,
      textColor: [100, 116, 139],
      fontStyle: 'bold',
      fontSize: 8.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.4
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', fontStyle: 'bold', textColor: darkRed, cellWidth: 20 },
      2: { halign: 'left' },
      3: { halign: 'center', textColor: textMuted, cellWidth: 22 },
      4: { halign: 'center', textColor: darkRed, fontStyle: 'bold', cellWidth: 18 },
      5: { halign: 'right', fontStyle: 'bold', cellWidth: 20 },
      6: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
      7: { halign: 'right', fontStyle: 'bold', textColor: darkRed, cellWidth: 24 }
    },
    didDrawPage: (data) => {
      // Add Page Numbers Footer on bottom of every page
      const pageCount = pdf.internal.getNumberOfPages();
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...textMuted);
      pdf.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );
      pdf.text(
        `Thank you for your business! - ${shopSettings.shopName || 'Kalieswari Crackers'}`,
        pageWidth - margin,
        pageHeight - 6,
        { align: 'right' }
      );
    }
  });

  // 5. Draw Payment Summary & Notes at End of Table
  let finalY = pdf.lastAutoTable.finalY + 8;

  // Add new page if summary box doesn't fit on current page
  if (finalY + 42 > pageHeight - 14) {
    pdf.addPage();
    finalY = 18;
  }

  const summaryWidth = 105;
  const summaryX = pageWidth - margin - summaryWidth;

  pdf.setFillColor(254, 242, 242); // #fef2f2
  pdf.setDrawColor(254, 205, 211); // #fecdd3
  pdf.roundedRect(summaryX, finalY, summaryWidth, 34, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(...darkRed);
  pdf.text('Payment Summary', summaryX + 4, finalY + 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...textMuted);
  pdf.text('Subtotal MRP:', summaryX + 4, finalY + 14);
  pdf.text(`₹${Math.round(subtotal).toLocaleString('en-IN')}`, summaryX + summaryWidth - 4, finalY + 14, { align: 'right' });

  pdf.setTextColor(...primaryRed);
  pdf.text('Cracker Discount Savings:', summaryX + 4, finalY + 20);
  pdf.text(`-₹${Math.round(discountTotal).toLocaleString('en-IN')}`, summaryX + summaryWidth - 4, finalY + 20, { align: 'right' });

  pdf.setDrawColor(254, 205, 211);
  pdf.line(summaryX + 4, finalY + 23, summaryX + summaryWidth - 4, finalY + 23);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...darkRed);
  pdf.text('Net Total:', summaryX + 4, finalY + 30);
  pdf.text(`₹${Math.round(grandTotal).toLocaleString('en-IN')}`, summaryX + summaryWidth - 4, finalY + 30, { align: 'right' });

  // Notes & Terms Box on Left
  const notesWidth = pageWidth - (margin * 2) - summaryWidth - 8;
  if (notesWidth > 40) {
    pdf.setFillColor(...bgLight);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(margin, finalY, notesWidth, 34, 3, 3, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...textDark);
    pdf.text('Notes & Terms', margin + 4, finalY + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...textMuted);
    pdf.text('• Thank you for your business!', margin + 4, finalY + 13);
    pdf.text('• Goods once sold will not be exchanged.', margin + 4, finalY + 19);
    if (shopSettings.phone) {
      pdf.text(`• Support: ${shopSettings.phone}`, margin + 4, finalY + 25);
    }
  }

  return pdf;
}

/**
 * Instant PDF Download helper function.
 */
export async function downloadInvoicePDF(billData, filename) {
  const pdf = createInvoicePDF(billData);
  if (pdf) {
    const saveName = filename || `Bill_${billData?.billNo || billData?.bill_no || 'Invoice'}.pdf`;
    pdf.save(saveName);
  }
}
