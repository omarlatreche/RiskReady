import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const TEAL = [13, 148, 112] // #0d9470
const DARK = [28, 25, 23] // surface-900
const GRAY = [106, 101, 92] // surface-600

export function generateResultsPDF({ score, questions, responses, chapterBreakdown, chapters }) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(...TEAL)
  doc.rect(0, 0, pageWidth, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('RiskReady — GR1 Mock Exam Results', 14, 18)

  // Date
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), pageWidth - 14, 18, { align: 'right' })

  // Score summary
  let y = 40
  doc.setTextColor(...DARK)
  doc.setFontSize(36)
  doc.setFont('helvetica', 'bold')
  doc.text(`${score.percentage}%`, 14, y)

  doc.setFontSize(14)
  if (score.passed) {
    doc.setTextColor(22, 163, 74) // success
    doc.text('PASSED', 55, y)
  } else {
    doc.setTextColor(220, 38, 38) // danger
    doc.text('NOT PASSED', 55, y)
  }

  y += 8
  doc.setTextColor(...GRAY)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${score.correct} of ${score.total} correct  |  Pass mark: 65% (33/50)`, 14, y)

  // Chapter breakdown table
  y += 12
  const chapterRows = chapters
    .filter((ch) => chapterBreakdown[ch.id])
    .map((ch) => {
      const { correct, total } = chapterBreakdown[ch.id]
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0
      return [`Ch ${ch.number}`, ch.title, `${correct}/${total}`, `${pct}%`]
    })

  autoTable(doc, {
    startY: y,
    head: [['Chapter', 'Title', 'Score', 'Accuracy']],
    body: chapterRows,
    theme: 'striped',
    headStyles: { fillColor: TEAL, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 20 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  })

  // Question detail
  y = doc.lastAutoTable.finalY + 10
  doc.setTextColor(...DARK)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Question Detail', 14, y)
  y += 6

  const optionLabels = ['A', 'B', 'C', 'D']
  const questionRows = questions.map((q, i) => {
    const resp = responses[q.id]
    const userAnswer = resp ? optionLabels[resp.answer] : '—'
    const correctAnswer = optionLabels[q.answer]
    const result = resp?.correct ? 'Correct' : 'Incorrect'
    const stem = q.stem.length > 80 ? q.stem.slice(0, 77) + '...' : q.stem
    return [String(i + 1), stem, userAnswer, correctAnswer, result]
  })

  autoTable(doc, {
    startY: y,
    head: [['#', 'Question', 'Your Answer', 'Correct', 'Result']],
    body: questionRows,
    theme: 'striped',
    headStyles: { fillColor: TEAL, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 100 },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.raw === 'Correct') data.cell.styles.textColor = [22, 163, 74]
        else data.cell.styles.textColor = [220, 38, 38]
      }
    },
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...GRAY)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' })
    doc.text('RiskReady — CII GR1 Exam Preparation', 14, doc.internal.pageSize.getHeight() - 10)
  }

  doc.save('RiskReady_Mock_Results.pdf')
}

export function generateCertificatePDF({ userName, score, completedAt }) {
  const doc = new jsPDF({ orientation: 'landscape', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  // Decorative border
  doc.setDrawColor(...TEAL)
  doc.setLineWidth(2)
  doc.rect(10, 10, w - 20, h - 20)
  doc.setLineWidth(0.5)
  doc.rect(14, 14, w - 28, h - 28)

  // Decorative corner accents
  const cornerLen = 20
  doc.setLineWidth(1.5)
  // Top-left
  doc.line(10, 30, 10 + cornerLen, 30)
  doc.line(30, 10, 30, 10 + cornerLen)
  // Top-right
  doc.line(w - 10, 30, w - 10 - cornerLen, 30)
  doc.line(w - 30, 10, w - 30, 10 + cornerLen)
  // Bottom-left
  doc.line(10, h - 30, 10 + cornerLen, h - 30)
  doc.line(30, h - 10, 30, h - 10 - cornerLen)
  // Bottom-right
  doc.line(w - 10, h - 30, w - 10 - cornerLen, h - 30)
  doc.line(w - 30, h - 10, w - 30, h - 10 - cornerLen)

  // Logo
  const cx = w / 2
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('Risk', cx - 15, 40, { align: 'right' })
  doc.setTextColor(...TEAL)
  doc.text('Ready', cx - 14, 40)

  // Title
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TEAL)
  doc.text('Certificate of Achievement', cx, 65, { align: 'center' })

  // Decorative line
  doc.setDrawColor(...TEAL)
  doc.setLineWidth(0.8)
  doc.line(cx - 60, 72, cx + 60, 72)

  // Body
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text('This certifies that', cx, 90, { align: 'center' })

  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text(userName || 'Guest User', cx, 106, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text('has successfully passed the', cx, 120, { align: 'center' })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('CII GR1 Group Risk Insurance', cx, 134, { align: 'center' })
  doc.text('Mock Examination', cx, 146, { align: 'center' })

  // Score and date
  doc.setFontSize(14)
  doc.setTextColor(...TEAL)
  doc.text(`Score: ${score}%`, cx, 166, { align: 'center' })

  const dateStr = new Date(completedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  doc.setFontSize(11)
  doc.setTextColor(...GRAY)
  doc.text(dateStr, cx, 178, { align: 'center' })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(168, 162, 157) // surface-400
  doc.text('This certificate is issued by RiskReady for training purposes and does not constitute an official CII qualification.', cx, h - 22, { align: 'center' })

  doc.save('RiskReady_Certificate.pdf')
}
