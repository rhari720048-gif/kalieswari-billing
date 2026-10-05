import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates a multi-page jsPDF instance from a DOM element.
 * Smartly splits pages without cutting table rows or cards in half.
 */
export async function createInvoicePDF(sourceEl) {
  if (!sourceEl) return null;

  // Create temporary offscreen container with fixed A4 width (800px)
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '800px';
  container.style.background = '#ffffff';
  container.style.zIndex = '-9999';

  const clone = sourceEl.cloneNode(true);
  clone.style.width = '800px';
  clone.style.maxWidth = '800px';
  clone.style.margin = '0 auto';
  clone.style.padding = '24px 28px';
  clone.style.boxSizing = 'border-box';

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // Measure row & block element boundaries inside clone before html2canvas
    const cloneRect = clone.getBoundingClientRect();
    const breakableElements = Array.from(clone.querySelectorAll('tr, .payment-summary-box, .notes-box'));
    const elementBoundaries = breakableElements.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top - cloneRect.top,
        bottom: rect.bottom - cloneRect.top
      };
    });

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 800,
      windowWidth: 800
    });

    document.body.removeChild(container);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pdfPageHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    const scaleRatio = canvas.height / (clone.offsetHeight || (canvas.height / 2));
    const pageHeightPx = (canvas.width * pdfPageHeight) / pdfWidth;

    let srcY = 0;
    let pageIndex = 0;

    while (srcY < canvas.height - 2) {
      let targetBottom = srcY + pageHeightPx;

      if (targetBottom < canvas.height - 2) {
        // Find if targetBottom cuts through a breakable element (like a table row)
        const splittingElement = elementBoundaries.find(r => {
          const rTop = r.top * scaleRatio;
          const rBottom = r.bottom * scaleRatio;
          return rTop < targetBottom && rBottom > targetBottom && rTop > srcY + (50 * scaleRatio);
        });

        if (splittingElement) {
          targetBottom = splittingElement.top * scaleRatio;
        }
      } else {
        targetBottom = canvas.height;
      }

      const sliceHeightPx = targetBottom - srcY;
      if (sliceHeightPx <= 0) break;

      const sliceHeightMm = (sliceHeightPx * pdfWidth) / canvas.width;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;
      const ctx = pageCanvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0, srcY, canvas.width, sliceHeightPx,
        0, 0, canvas.width, sliceHeightPx
      );

      const pageImgData = pageCanvas.toDataURL('image/png');

      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, sliceHeightMm);

      srcY = targetBottom;
      pageIndex++;
    }

    return pdf;
  } catch (err) {
    if (document.body.contains(container)) document.body.removeChild(container);
    console.error('Error in createInvoicePDF:', err);
    throw err;
  }
}

export async function downloadInvoicePDF(sourceEl, filename = 'Invoice.pdf') {
  const pdf = await createInvoicePDF(sourceEl);
  if (pdf) {
    pdf.save(filename);
  }
}
