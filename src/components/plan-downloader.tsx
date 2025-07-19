
"use client";

import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import type { User, UserPlan } from "@/lib/types";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { Logo } from "./logo";

type PlanDownloaderProps = {
  user: User;
  plan: UserPlan;
};

// You need to add the font file to your project, e.g., in /public/fonts
// This is a placeholder, as I cannot add binary files.
// You would need to add a Base64 encoded font or host it.
const font = "..." // Base64 representation of a .ttf file

export function PlanDownloader({ user, plan }: PlanDownloaderProps) {
  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Add custom font (optional, requires font file)
    // doc.addFileToVFS("Inter-Regular.ttf", font);
    // doc.addFont("Inter-Regular.ttf", "Inter", "normal");
    // doc.setFont("Inter");

    // Header
    // I can't add images directly, but if you have a base64 version of your logo, you can use it.
    // const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...";
    // doc.addImage(logoBase64, 'PNG', 14, 10, 30, 30);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("Plan de Entrenamiento - Rutinas Kali", 105, 20, { align: "center" });

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
        // Add a page break if there's not enough space for the table header + a few rows
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
            headStyles: { fillColor: [255, 193, 7] }, // Primary color (yellow)
            styles: { font: 'helvetica', fontSize: 10 },
        });

        const tableHeight = (doc as any).lastAutoTable.finalY;
        startY = tableHeight + 15;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, 105, 287, { align: 'center' });
        doc.text("Generado por Rutinas Kali", 14, 287);
    }

    doc.save(`Plan_Entrenamiento_${user.firstName}_${user.paternalLastName}.pdf`);
  };

  return (
    <Button onClick={handleDownload} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Descargar Plan en PDF
    </Button>
  );
}
