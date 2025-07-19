
"use client";

import { useState } from "react";
import { jsPDF, GState } from "jspdf";
import autoTable from 'jspdf-autotable';
import type { User, UserPlan } from "@/lib/types";
import { Button } from "./ui/button";
import { Download, Loader2 } from "lucide-react";

type PlanDownloaderProps = {
  user: User;
  plan: UserPlan;
};

// You need to add the font file to your project, e.g., in /public/fonts
// This is a placeholder, as I cannot add binary files.
// You would need to add a Base64 encoded font or host it.
const font = "..." // Base64 representation of a .ttf file

export function PlanDownloader({ user, plan }: PlanDownloaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF();
      
      // Load image data first
      const logoImg = new Image();
      logoImg.src = '/images/logo.png'; // Path to your logo in the public folder
      await new Promise(resolve => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve; // Continue even if logo fails to load
      });

      // Header
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text("Plan de Entrenamiento - Dojo Dynamics", 105, 20, { align: "center" });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`Cliente: ${user.name}`, 14, 40);

      // Recommendations
      if (plan.recommendations) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text("Recomendaciones Generales:", 14, 55);
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const splitRecommendations = doc.splitTextToSize(plan.recommendations, 180);
          doc.text(splitRecommendations, 14, 62);
      }
      
      let startY = plan.recommendations ? 80 : 60;

      // Weekly Plan
      plan.weeklyPlan.forEach((dayPlan) => {
          if (startY > 220) {
              doc.addPage();
              startY = 20;
          }

          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`${dayPlan.day} - ${dayPlan.focus}`, 14, startY);
          
          const head = [['Ejercicio', 'Series', 'Reps', 'Descanso']];
          const body = dayPlan.exercises.map(ex => [ex.name, ex.series, ex.reps, ex.rest]);

          autoTable(doc, {
              head: head,
              body: body,
              startY: startY + 5,
              theme: 'striped',
              headStyles: { fillColor: [160, 80, 190] }, // Primary color
              styles: { font: 'helvetica', fontSize: 10 },
          });

          const tableHeight = (doc as any).lastAutoTable.finalY;
          startY = tableHeight + 15;
      });

      // Add Watermark and Footer to all pages
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          
          // Watermark
          if (logoImg.complete && logoImg.naturalHeight !== 0) {
            const imgWidth = 100;
            const imgHeight = (logoImg.naturalHeight * imgWidth) / logoImg.naturalWidth;
            const x = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
            const y = (doc.internal.pageSize.getHeight() - imgHeight) / 2;
            doc.setGState(new GState({opacity: 0.1}));
            doc.addImage(logoImg, 'PNG', x, y, imgWidth, imgHeight);
            doc.setGState(new GState({opacity: 1})); // Reset opacity
          }

          // Footer
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(`Página ${i} de ${pageCount}`, 105, 287, { align: 'center' });
          doc.text("Generado por Dojo Dynamics", 14, 287);
      }

      doc.save(`Plan_Entrenamiento_${user.firstName}_${user.paternalLastName}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button onClick={handleDownload} variant="outline" size="sm" disabled={isDownloading}>
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Descargando...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Descargar Plan en PDF
        </>
      )}
    </Button>
  );
}
