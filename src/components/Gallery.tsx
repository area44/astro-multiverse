import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
      <button
        type="button"
        className="poptrox-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 20000,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.85)",
          border: 0,
          padding: 0,
          outline: "none",
        }}
        onClick={closeLightbox}
      >
        <div
          className={`poptrox-popup ${loading ? "loading" : ""}`}
          role="dialog"
          aria-modal="true"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "default",
            pointerEvents: "auto",
            zIndex: 1,
            backgroundColor: "transparent",
            boxShadow: "none",
            border: 0,
            padding: 0,
            margin: 0,
            width: "auto",
            height: "auto",
            maxWidth: "100vw",
            maxHeight: "100vh",
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
            }
          }}
          tabIndex={-1}
        >
          <div
            className="pic"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "100%",
              maxHeight: "100%",
              zIndex: 1,
              padding: 0,
            }}
          >
            <img
              ref={imageRef}
              src={currentImage.src}
              alt=""
              className="lightbox-img"
              style={{
                transition: "opacity 0.3s ease-in-out",
                opacity: loading ? 0 : 1,
                display: "block",
                position: "relative",
                zIndex: 2,
                pointerEvents: "none", // Prevent clicks on image from closing
                boxShadow: "none",
                border: 0,
              }}
              onLoad={handleImageLoad}
            />
          </div>

          {loading && <div className="loader" />}

          <button
            type="button"
            className="closer"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            style={{
              cursor: "pointer",
              border: 0,
              background: "transparent",
              zIndex: 10,
              opacity: 0.8,
              position: "fixed",
              top: "20px",
              right: "20px",
              width: "4em",
              height: "4em",
              backgroundImage: 'url("/images/close.svg")',
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "2.5em",
            }}
            aria-label="Close"
          />
          <button
            type="button"
            className="nav-previous"
            onClick={(e) => {
              e.stopPropagation();
              navigatePrev();
            }}
            style={{
              cursor: "pointer",
              border: 0,
              background: "transparent",
              zIndex: 10,
              opacity: 0.8,
              position: "fixed",
              top: "50%",
              left: "20px",
              width: "5em",
              height: "8em",
              marginTop: "-4em",
              backgroundImage: 'url("/images/arrow.svg")',
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "4em",
              transform: "scaleX(-1)",
            }}
            aria-label="Previous"
          />
          <button
            type="button"
            className="nav-next"
            onClick={(e) => {
              e.stopPropagation();
              navigateNext();
            }}
            style={{
              cursor: "pointer",
              border: 0,
              background: "transparent",
              zIndex: 10,
              opacity: 0.8,
              position: "fixed",
              top: "50%",
              right: "20px",
              width: "5em",
              height: "8em",
              marginTop: "-4em",
              backgroundImage: 'url("/images/arrow.svg")',
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "4em",
            }}
            aria-label="Next"
          />
        </div>
      </button>
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
              <img src={img.thumbnail} alt="" style={{ display: "none" }} />
            </a>
          </article>
        ))}
      </div>

      {isOpen && isMounted && createPortal(<Lightbox />, document.body)}
    </>
  );
};

export default Gallery;
