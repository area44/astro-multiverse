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
    [images.length],
  );

  const navigatePrev = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      if (e && "stopPropagation" in e) e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setLoading(true);
    },
    [images.length],
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
      <div className="poptrox-overlay">
        <button
          type="button"
          className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent"
          onClick={closeLightbox}
          aria-label="Close"
        />
        <div
          className={`poptrox-popup ${loading ? "loading" : ""}`}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
            }
          }}
          tabIndex={-1}
        >
          <div className="pic">
            <img
              ref={imageRef}
              src={currentImage.src}
              alt=""
              className="lightbox-img"
              style={{
                opacity: loading ? 0 : 1,
              }}
              onLoad={handleImageLoad}
            />
          </div>

          {loading && <div className="loader" />}

          {!loading && (
            <>
              <button
                type="button"
                className="closer"
                onClick={(e) => {
                  e.stopPropagation();
                  closeLightbox();
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
                aria-label="Previous"
              />
              <button
                type="button"
                className="nav-next"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateNext();
                }}
                aria-label="Next"
              />
            </>
          )}
        </div>
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
              }}
            >
              <img src={img.thumbnail} alt="" className="thumb-img" />
            </a>
          </article>
        ))}
      </div>

      {isOpen && isMounted && createPortal(<Lightbox />, document.body)}
    </>
  );
};

export default Gallery;
