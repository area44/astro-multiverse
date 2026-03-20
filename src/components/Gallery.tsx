import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ImageData {
  src: string;
  thumbnail: string;
  title?: string;
  description?: string;
}

interface GalleryProps {
  images: ImageData[];
}

const Gallery: React.FC<GalleryProps> = ({ images }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
    setLoading(true);
  };

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  const navigateNext = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      if (e && "stopPropagation" in e) e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setLoading(true);
    },
    [images.length]
  );

  const navigatePrev = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      if (e && "stopPropagation" in e) e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setLoading(true);
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

  const Lightbox = () => {
    const currentImage = images[currentIndex];
    const imageRef = useRef<HTMLImageElement>(null);

    const handleImageLoad = () => {
      setLoading(false);
    };

    return (
      <div
        className={`poptrox-popup ${loading ? "loading" : ""}`}
        role="dialog"
        aria-modal="true"
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
        onClick={closeLightbox}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            closeLightbox();
          }
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
            ref={imageRef}
            src={currentImage.src}
            alt={currentImage.title || ""}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              transition: "opacity 0.3s ease-in-out",
              opacity: loading ? 0 : 1,
            }}
            onLoad={handleImageLoad}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") e.stopPropagation();
            }}
          />
        </div>

        {loading && <div className="loader" />}

        {!loading && currentImage.title && (
          <div
            className="caption"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="document"
          >
            <h2>{currentImage.title}</h2>
            {currentImage.description && <p>{currentImage.description}</p>}
          </div>
        )}

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
    );
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
                alt={img.title || "Astro Multiverse"}
                style={{ display: "none" }}
              />
            </a>
            {img.title && <h2>{img.title}</h2>}
            {img.description && (
              <p style={{ display: "none" }}>{img.description}</p>
            )}
          </article>
        ))}
      </div>

      {isOpen && isMounted && createPortal(<Lightbox />, document.body)}
    </>
  );
};

export default Gallery;
