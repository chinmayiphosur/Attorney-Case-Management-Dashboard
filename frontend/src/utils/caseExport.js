import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportCaseToPDF = (caseData) => {
    try {
        if (!caseData) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;

        // Header
        doc.setFillColor(37, 99, 235); // Primary Blue
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('MEDICODIO', margin, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('LEGAL CASE MANAGEMENT SYSTEM', margin, 32);

        // Case Title & Reference
        doc.setTextColor(31, 41, 55); // Dark Gray
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(caseData.title, margin, 55);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128); // Medium Gray
        doc.text(`Case Reference: ${caseData.caseNumber}`, margin, 65);

        // Section 1: Case Details
        autoTable(doc, {
            startY: 75,
            margin: { left: margin, right: margin },
            head: [['Case Information', 'Details']],
            body: [
                ['Type', caseData.type || 'N/A'],
                ['Status', caseData.status || 'N/A'],
                ['Priority', caseData.priority || 'N/A'],
                ['Court', caseData.court || 'N/A'],
                ['Judge', caseData.judge || 'N/A']
            ],
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
            styles: { fontSize: 10, cellPadding: 4 }
        });

        // Section 2: Client & Dates
        autoTable(doc, {
            startY: (doc.lastAutoTable ? doc.lastAutoTable.finalY : 120) + 10,
            margin: { left: margin, right: margin },
            head: [['Client Details', 'Important Dates']],
            body: [
                [
                    `Name: ${caseData.client?.name || 'N/A'}\nEmail: ${caseData.client?.email || 'N/A'}`,
                    `Filing Date: ${caseData.filingDate ? new Date(caseData.filingDate).toLocaleDateString() : 'N/A'}\nHearing Date: ${caseData.hearingDate ? new Date(caseData.hearingDate).toLocaleDateString() : 'N/A'}`
                ]
            ],
            theme: 'grid',
            headStyles: { fillColor: [75, 85, 99], textColor: [255, 255, 255] },
            styles: { fontSize: 10, cellPadding: 6 }
        });

        // Section 3: Description & Notes
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('Description', margin, doc.lastAutoTable.finalY + 15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        const descriptionLines = doc.splitTextToSize(caseData.description || 'No description provided.', pageWidth - 2 * margin);
        doc.text(descriptionLines, margin, doc.lastAutoTable.finalY + 22);

        let nextY = doc.lastAutoTable.finalY + 30 + (descriptionLines.length * 5);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('Internal Notes', margin, nextY);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        const notesLines = doc.splitTextToSize(caseData.internalNotes || 'No internal notes.', pageWidth - 2 * margin);
        doc.text(notesLines, margin, nextY + 7);

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            doc.text(
                `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        doc.save(`Case_${caseData.caseNumber}.pdf`);
    } catch (error) {
        console.error('Error generating Case PDF:', error);
        alert('Failed to generate PDF. Check console.');
    }
};

export const exportCasesListToPDF = (cases) => {
    try {
        if (!cases || cases.length === 0) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;

        // Header
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('MEDICODIO', margin, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('CASE LIST REPORT', margin, 32);

        doc.setTextColor(31, 41, 55);
        doc.setFontSize(14);
        doc.text(`Total Cases: ${cases.length}`, margin, 55);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, 55, { align: 'right' });

        const tableBody = cases.map(c => [
            c.caseNumber || 'N/A',
            c.title || 'N/A',
            c.client?.name || 'N/A',
            c.type || 'N/A',
            c.status || 'N/A',
            c.priority || 'N/A'
        ]);

        autoTable(doc, {
            startY: 65,
            margin: { left: margin, right: margin },
            head: [['Case #', 'Title', 'Client', 'Type', 'Status', 'Priority']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
            styles: { fontSize: 8, cellPadding: 3 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        doc.save(`Medicodio_Cases_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error('Error generating Cases List PDF:', error);
        alert('Failed to generate Cases List PDF. Check console.');
    }
};
