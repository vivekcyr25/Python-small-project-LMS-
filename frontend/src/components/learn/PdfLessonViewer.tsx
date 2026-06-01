interface PdfLessonViewerProps {
  url: string;
}

const PdfLessonViewer = ({ url }: PdfLessonViewerProps) => {
  return (
    <div data-testid="pdf-lesson-viewer" className="w-full h-[70vh] rounded-xl overflow-hidden border border-white/10 bg-black/40">
      <iframe
        src={url}
        title="PDF lesson"
        className="w-full h-full"
      />
    </div>
  );
};

export default PdfLessonViewer;
