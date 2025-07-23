
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getAllJournalEntries, getTodayString } from '@/utils/supabaseStorage';
import jsPDF from 'jspdf';

const JournalPDFReport = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing Dates",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Invalid Date Range",
        description: "Start date must be before end date.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const allEntries = await getAllJournalEntries();
      
      // Filter entries by date range
      const filteredEntries = Object.entries(allEntries)
        .filter(([date]) => {
          const entryDate = new Date(date);
          return entryDate >= startDate && entryDate <= endDate;
        })
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());

      if (filteredEntries.length === 0) {
        toast({
          title: "No Entries Found",
          description: "No journal entries found in the selected date range.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      // Create PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxLineWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      const title = 'Journal Report';
      const titleWidth = pdf.getTextWidth(title);
      pdf.text(title, (pageWidth - titleWidth) / 2, yPosition);
      yPosition += 15;

      // Add date range
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const dateRange = `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
      const dateRangeWidth = pdf.getTextWidth(dateRange);
      pdf.text(dateRange, (pageWidth - dateRangeWidth) / 2, yPosition);
      yPosition += 20;

      // Add summary
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Summary', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Entries: ${filteredEntries.length}`, margin, yPosition);
      yPosition += 8;

      const totalWords = filteredEntries.reduce((sum, [, content]) => {
        return sum + (content.trim().split(/\s+/).length || 0);
      }, 0);
      pdf.text(`Total Words: ${totalWords}`, margin, yPosition);
      yPosition += 8;

      const avgWords = Math.round(totalWords / filteredEntries.length);
      pdf.text(`Average Words per Entry: ${avgWords}`, margin, yPosition);
      yPosition += 20;

      // Add line separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Add entries
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Journal Entries', margin, yPosition);
      yPosition += 15;

      for (const [date, content] of filteredEntries) {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }

        // Add date header
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        const formattedDate = format(new Date(date), 'EEEE, MMMM dd, yyyy');
        pdf.text(formattedDate, margin, yPosition);
        yPosition += 10;

        // Add entry content
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        if (content.trim()) {
          const lines = pdf.splitTextToSize(content.trim(), maxLineWidth);
          for (const line of lines) {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin, yPosition);
            yPosition += 5;
          }
        } else {
          pdf.setFont('helvetica', 'italic');
          pdf.text('No entry for this date', margin, yPosition);
          yPosition += 5;
        }

        yPosition += 15;

        // Add separator line between entries
        if (yPosition < pageHeight - 50) {
          pdf.setDrawColor(230, 230, 230);
          pdf.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
        }
      }

      // Generate filename
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      const filename = `Journal_Report_${startDateStr}_to_${endDateStr}.pdf`;

      // Download PDF
      pdf.save(filename);

      toast({
        title: "📄 PDF Generated",
        description: `Journal report downloaded as ${filename}`,
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Generate PDF Report</h3>
        <p className="text-sm text-gray-400">
          Download your journal entries as a PDF for the selected date range.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Date Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Start Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                  !startDate && "text-gray-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            End Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                  !endDate && "text-gray-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Quick Date Range Buttons */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Quick Select
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              const lastWeek = new Date(today);
              lastWeek.setDate(today.getDate() - 7);
              setStartDate(lastWeek);
              setEndDate(today);
            }}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            Last 7 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              const lastMonth = new Date(today);
              lastMonth.setMonth(today.getMonth() - 1);
              setStartDate(lastMonth);
              setEndDate(today);
            }}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            Last 30 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              const lastThreeMonths = new Date(today);
              lastThreeMonths.setMonth(today.getMonth() - 3);
              setStartDate(lastThreeMonths);
              setEndDate(today);
            }}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            Last 3 Months
          </Button>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generatePDF}
        disabled={isGenerating || !startDate || !endDate}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors duration-200"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Generate PDF Report
          </>
        )}
      </Button>
    </div>
  );
};

export default JournalPDFReport;
