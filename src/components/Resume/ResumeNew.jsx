import React, { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { AiOutlineDownload } from "react-icons/ai";
import { FiExternalLink } from "react-icons/fi";
import Reveal from "../Reveal";
import pdf from "../../Assets/Fidel-Jon-Magat-CV.pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const CV_FILE_NAME = "CV.pdf";

function ResumeNew() {
  const panelHolder = useRef(null);
  const rafId = useRef(0);
  const lastWidth = useRef(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [failed, setFailed] = useState(false);

  // Keep the page sized to the panel so it never overflows or gets upscaled.
  // The state update is deferred out of the ResizeObserver callback and only
  // fires when the value really changed, which avoids the
  // "ResizeObserver loop completed with undelivered notifications" error.
  const measurePanel = useCallback((node) => {
    const previous = panelHolder.current;

    if (previous === node) return;

    if (previous && previous.__cvObserver) {
      previous.__cvObserver.disconnect();
      delete previous.__cvObserver;
    }

    if (rafId.current) {
      window.cancelAnimationFrame(rafId.current);
      rafId.current = 0;
    }

    panelHolder.current = node;

    if (!node || typeof ResizeObserver === "undefined") {
      if (node) {
        lastWidth.current = Math.round(node.clientWidth);
        setPageWidth(lastWidth.current);
      }
      return;
    }

    lastWidth.current = Math.round(node.clientWidth);
    setPageWidth(lastWidth.current);

    const observer = new ResizeObserver((entries) => {
      const next = Math.round(entries[0].contentRect.width);

      if (next <= 0 || next === lastWidth.current) return;

      lastWidth.current = next;

      if (rafId.current) window.cancelAnimationFrame(rafId.current);

      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = 0;
        setPageWidth(next);
      });
    });

    observer.observe(node);
    node.__cvObserver = observer;
  }, []);

  useEffect(() => () => {
    if (rafId.current) window.cancelAnimationFrame(rafId.current);
  }, []);

  const openPreview = useCallback(() => {
    window.open(pdf, "_blank", "noopener,noreferrer");
  }, []);

  // Force a real file download named CV.pdf instead of a print preview.
  const downloadCv = useCallback(async () => {
    try {
      const response = await fetch(pdf, { cache: "no-store" });
      if (!response.ok) throw new Error(`Unexpected status ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = CV_FILE_NAME;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // Direct download attribute, still avoids the browser print preview.
      const link = document.createElement("a");
      link.href = pdf;
      link.download = CV_FILE_NAME;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }, []);

  return (
    <main>
      <section className="page-head resume-head container-x">
        <Reveal>
          <div className="resume-head-row">
            <div className="resume-head-copy">
              <p className="eyebrow">Resume</p>
              <h1 className="display-hero resume-title">
                Curriculum <span className="serif-accent">vitae</span>
              </h1>
              <p className="resume-note">
                Fidel Jon Magat &middot; Full-stack web developer &middot; Angeles
                City, PH
              </p>
            </div>

            <div className="resume-actions">
              <button type="button" className="btn-primary" onClick={downloadCv}>
                <AiOutlineDownload />
                Download CV
              </button>
              <button type="button" className="btn-outline" onClick={openPreview}>
                <FiExternalLink />
                Preview PDF
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section-tight resume-body" style={{ paddingTop: 0 }}>
        <div className="container-x">
          <Reveal delay={80}>
            <div className="resume-panel" ref={measurePanel}>
              {failed ? (
                <p className="resume-status">
                  Preview unavailable on this device.{" "}
                  <button
                    type="button"
                    className="resume-status-link"
                    onClick={openPreview}
                  >
                    Open the PDF instead
                  </button>
                  .
                </p>
              ) : (
                <Document
                  file={pdf}
                  onLoadSuccess={({ numPages: total }) => setNumPages(total)}
                  onLoadError={() => setFailed(true)}
                  loading={<p className="resume-status">Loading CV&hellip;</p>}
                  error={<p className="resume-status">Could not load the CV preview.</p>}
                >
                  <Page
                    pageNumber={1}
                    width={pageWidth || undefined}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              )}
            </div>

            <p className="resume-hint">
              Page 1 of {numPages || 1}
              {numPages > 1 ? " — open the preview for every page." : "."}
            </p>
          </Reveal>

          <Reveal delay={140}>
            <blockquote className="pull-quote resume-quote">
              <p>
                &ldquo;Ask and it will be given to you; seek and you will find;
                knock and the door will be opened to you.&rdquo;
              </p>
              <cite>Matthew 7:7 NIV</cite>
            </blockquote>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export default ResumeNew;
