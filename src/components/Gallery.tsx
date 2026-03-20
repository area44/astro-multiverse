import React, { useCallback, useEffect, useRef, useState } from "react";

interface ImageData {
  src: string;
  thumbnail: string;
}

interface GalleryProps {
  images: ImageData[];
}

const Gallery: React.FC<GalleryProps> = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Play initial animations on page load.
    const timer = setTimeout(() => {
      document.body.classList.remove("is-preload");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-active");
    } else {
      document.body.classList.remove("modal-active");
    }
  }, [isOpen]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  const navigateNext = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      if (e && "stopPropagation" in e) e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    },
    [images.length]
  );

  const navigatePrev = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      if (e && "stopPropagation" in e) e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigateNext(e);
      if (e.key === "ArrowLeft") navigatePrev(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, navigateNext, navigatePrev, closeLightbox]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (
      e.target === overlayRef.current ||
      (e.target as HTMLElement).classList.contains("pic")
    ) {
      closeLightbox();
    }
  };

  return (
    <>
      <div id="main">
        {images.map((img, index) => (
          <article className="thumb" key={img.src}>
            <a
              className="image"
              href={img.src}
              onClick={(e) => {
                e.preventDefault();
                openLightbox(index);
              }}
              style={{
                backgroundImage: `url(${img.thumbnail})`,
                cursor: "pointer",
              }}
            >
              <img
                src={img.thumbnail}
                alt="Astro Multiverse"
                style={{ display: "none" }}
              />
            </a>
          </article>
        ))}
      </div>

      {isOpen && (
        <div
          className="poptrox-popup"
          role="dialog"
          aria-modal="true"
          ref={overlayRef}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "calc(100% - 100px)",
            height: "calc(100% - 100px)",
            zIndex: 20000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
          onClick={handleOverlayClick}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeLightbox();
          }}
          tabIndex={-1}
        >
          <div
            className="pic"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={images[currentIndex].src}
              alt=""
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          <button
            type="button"
            className="closer"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            style={{ cursor: "pointer", border: 0, background: "transparent" }}
            aria-label="Close"
          />
          <button
            type="button"
            className="nav-previous"
            onClick={navigatePrev}
            style={{ cursor: "pointer", border: 0, background: "transparent" }}
            aria-label="Previous"
          />
          <button
            type="button"
            className="nav-next"
            onClick={navigateNext}
            style={{ cursor: "pointer", border: 0, background: "transparent" }}
            aria-label="Next"
          />
        </div>
      )}
    </>
  );
};

export default Gallery;
