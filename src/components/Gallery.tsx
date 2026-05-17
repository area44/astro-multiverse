import React, { useEffect, useRef, useState, useEffectEvent } from "react";
import { createPortal } from "react-dom";

interface ImageData {
  src: string;
  thumbnail: string;
}

interface GalleryProps {
  images: ImageData[];
}

interface LightboxProps {
  images: ImageData[];
  currentIndex: number;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  closeLightbox: () => void;
  navigateNext: (e?: React.MouseEvent | KeyboardEvent) => void;
  navigatePrev: (e?: React.MouseEvent | KeyboardEvent) => void;
}

const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  loading,
  setLoading,
  closeLightbox,
  navigateNext,
  navigatePrev,
}) => {
  const currentImage = images[currentIndex];
  const imageRef = useRef<HTMLImageElement>(null);
  const touchStartX = useRef<number | null>(null);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      navigateNext();
    } else if (diff < -50) {
      navigatePrev();
    }
    touchStartX.current = null;
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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    setLoading(true);
    document.body.classList.add("modal-active");
  };

  const closeLightbox = () => {
    setIsOpen(false);
    document.body.classList.remove("modal-active");
  };

  const onNavigateNext = useEffectEvent((e?: React.MouseEvent | KeyboardEvent) => {
    if (e && "stopPropagation" in e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setLoading(true);
  });

  const onNavigatePrev = useEffectEvent((e?: React.MouseEvent | KeyboardEvent) => {
    if (e && "stopPropagation" in e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setLoading(true);
  });

  const onClose = useEffectEvent(() => {
    closeLightbox();
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigateNext(e);
      if (e.key === "ArrowLeft") onNavigatePrev(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <div id="main">
        {images.map((img, index) => (
          <article className="thumb" key={img.src}>
            <button
              type="button"
              className="image cursor-pointer p-0"
              onClick={() => {
                openLightbox(index);
              }}
              style={{
                backgroundImage: `url(${img.thumbnail})`,
              }}
              aria-label="View Image"
            >
              <img src={img.thumbnail} alt="" className="thumb-img" />
            </button>
          </article>
        ))}
      </div>

      {isOpen &&
        isMounted &&
        createPortal(
          <Lightbox
            images={images}
            currentIndex={currentIndex}
            loading={loading}
            setLoading={setLoading}
            closeLightbox={closeLightbox}
            navigateNext={onNavigateNext}
            navigatePrev={onNavigatePrev}
          />,
          document.body,
        )}
    </>
  );
};

export default Gallery;
