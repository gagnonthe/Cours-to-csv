
import { QAPair } from "../types";

export const downloadCSV = (data: QAPair[], filename: string = "quiz-export.csv") => {
  if (data.length === 0) return;

  // Header
  const headers = ["Question", "Réponse"];
  
  // Convert rows
  const csvRows = data.map(item => {
    const q = `"${item.question.replace(/"/g, '""')}"`;
    const a = `"${item.answer.replace(/"/g, '""')}"`;
    return [q, a].join(",");
  });

  const csvString = [headers.join(","), ...csvRows].join("\n");
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
