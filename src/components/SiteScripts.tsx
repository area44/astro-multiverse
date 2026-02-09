import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

declare global {
  interface Window {
    browser?: {
      name?: string;
      mobile?: boolean;
      canUse?: (property: string) => boolean;
    };
  }
}

type GalleryItem = {
  href: string;
  caption?: string;
};

const getGalleryItems = () => {
  const anchors = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("#main .thumb > a.image")
  );

  return anchors.map((anchor) => {
    const caption = Array.from(anchor.parentElement?.children ?? [])
      .filter((node) => node !== anchor)
      .map((node) => (node as HTMLElement).outerHTML)
      .join("");

    return {
      href: anchor.getAttribute("href") ?? "",
      caption: caption || undefined,
    };
  });
};

const updateThumbBackgrounds = () => {
  const anchors = document.querySelectorAll<HTMLAnchorElement>(
    "#main .thumb > a.image"
  );

  anchors.forEach((anchor) => {
    const img = anchor.querySelector<HTMLImageElement>("img");
    if (!img) return;
    const position = img.dataset.position;

    const setBackground = () => {
      const source = img.currentSrc || img.src || img.getAttribute("src") || "";
      if (!source) return;
      anchor.style.backgroundImage = `url(${source})`;
      if (position) anchor.style.backgroundPosition = position;
      img.style.display = "none";
    };

    if (img.complete) {
      setBackground();
    } else {
      img.addEventListener("load", setBackground, { once: true });
    }
  });
};

const setupPanels = () => {
  const body = document.body;
  const panels = Array.from(document.querySelectorAll<HTMLElement>(".panel"));
  const panelMap = panels.map((panel) => {
    const id = panel.getAttribute("id");
    const toggles = id
      ? Array.from(document.querySelectorAll<HTMLElement>(`[href="#${id}"]`))
      : [];
    const closer = panel.querySelector<HTMLElement>(".closer");

    return { panel, toggles, closer };
  });

  const hidePanel = (panel: HTMLElement, toggles: HTMLElement[]) => {
    panel.classList.remove("active");
    toggles.forEach((toggle) => {
      toggle.classList.remove("active");
    });
    body.classList.remove("content-active");
  };

  const showPanel = (panel: HTMLElement, toggles: HTMLElement[]) => {
    panelMap.forEach((entry) => {
      hidePanel(entry.panel, entry.toggles);
    });
    panel.classList.add("active");
    toggles.forEach((toggle) => {
      toggle.classList.add("active");
    });
    body.classList.add("content-active");
  };

  const togglePanel = (panel: HTMLElement, toggles: HTMLElement[]) => {
    if (panel.classList.contains("active")) {
      hidePanel(panel, toggles);
    } else {
      showPanel(panel, toggles);
    }
  };

  const removeHandlers: Array<() => void> = [];

  panelMap.forEach(({ panel, toggles, closer }) => {
    const stopPropagation = (event: Event) => {
      event.stopPropagation();
    };

    panel.addEventListener("click", stopPropagation);
    removeHandlers.push(() =>
      panel.removeEventListener("click", stopPropagation)
    );

    toggles.forEach((toggle) => {
      toggle.style.cursor = "pointer";
      const onToggleClick = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        togglePanel(panel, toggles);
      };

      toggle.addEventListener("click", onToggleClick);
      removeHandlers.push(() =>
        toggle.removeEventListener("click", onToggleClick)
      );
    });

    if (closer) {
      const onCloseClick = (event: Event) => {
        event.preventDefault();
        hidePanel(panel, toggles);
      };
      closer.addEventListener("click", onCloseClick);
      removeHandlers.push(() =>
        closer.removeEventListener("click", onCloseClick)
      );
    }
  });

  const onBodyClick = (event: Event) => {
    if (body.classList.contains("content-active")) {
      event.preventDefault();
      event.stopPropagation();
      panelMap.forEach((entry) => {
        hidePanel(entry.panel, entry.toggles);
      });
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === "Escape" && body.classList.contains("content-active")) {
      event.preventDefault();
      event.stopPropagation();
      panelMap.forEach((entry) => {
        hidePanel(entry.panel, entry.toggles);
      });
    }
  };

  body.addEventListener("click", onBodyClick);
  window.addEventListener("keyup", onKeyUp);
  removeHandlers.push(() => body.removeEventListener("click", onBodyClick));
  removeHandlers.push(() => window.removeEventListener("keyup", onKeyUp));

  return () => {
    removeHandlers.forEach((remove) => {
      remove();
    });
  };
};

const setupHeaderLinks = () => {
  const header = document.getElementById("header");
  if (!header) return () => undefined;

  const anchors = Array.from(header.querySelectorAll<HTMLAnchorElement>("a"));
  const handlers: Array<() => void> = [];

  anchors.forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    anchor.style.cursor = "pointer";
    const onClick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      window.location.href = href;
    };

    anchor.addEventListener("click", onClick);
    handlers.push(() => anchor.removeEventListener("click", onClick));
  });

  return () => {
    handlers.forEach((remove) => {
      remove();
    });
  };
};

const setupFooterCopyright = () => {
  const footer = document.getElementById("footer");
  const copyright = footer?.querySelector<HTMLElement>(".copyright");
  const parent = copyright?.parentElement ?? null;
  const lastParent = parent?.parentElement
    ?.lastElementChild as HTMLElement | null;

  if (!copyright || !parent || !lastParent) {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia("(max-width: 980px)");
  const updateLocation = () => {
    if (mediaQuery.matches) {
      lastParent.appendChild(copyright);
    } else {
      parent.appendChild(copyright);
    }
  };

  updateLocation();
  mediaQuery.addEventListener("change", updateLocation);

  return () => {
    mediaQuery.removeEventListener("change", updateLocation);
  };
};

const useWindowMargin = () => {
  const [margin, setMargin] = useState(50);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 480px)");
    const updateMargin = () => {
      setMargin(mediaQuery.matches ? 0 : 50);
    };

    updateMargin();
    mediaQuery.addEventListener("change", updateMargin);

    return () => {
      mediaQuery.removeEventListener("change", updateMargin);
    };
  }, []);

  return margin;
};

const SiteScripts = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const windowMargin = useWindowMargin();

  const activeItem = items[activeIndex];
  const maxDimension = useMemo(
    () => ({
      maxWidth: `calc(100vw - ${windowMargin * 2}px)`,
      maxHeight: `calc(100vh - ${windowMargin * 2}px)`,
    }),
    [windowMargin]
  );

  useEffect(() => {
    const body = document.body;

    if (window.browser?.name === "ie") {
      body.classList.add("ie");
    }

    if (window.browser?.mobile || "ontouchstart" in window) {
      body.classList.add("touch");
    }

    const supportsTransition = window.browser?.canUse
      ? window.browser.canUse("transition")
      : "transition" in document.body.style;

    let resizeTimeout = 0;

    const onLoad = () => {
      window.setTimeout(() => body.classList.remove("is-preload"), 100);
    };

    const onResize = () => {
      window.clearTimeout(resizeTimeout);
      body.classList.add("is-resizing");
      resizeTimeout = window.setTimeout(() => {
        body.classList.remove("is-resizing");
      }, 100);
    };

    if (supportsTransition) {
      window.addEventListener("load", onLoad);
      window.addEventListener("resize", onResize);
    } else {
      onLoad();
    }

    window.scrollTo(0, 0);
    updateThumbBackgrounds();

    const panelsCleanup = setupPanels();
    const headerCleanup = setupHeaderLinks();
    const copyrightCleanup = setupFooterCopyright();

    setItems(getGalleryItems());

    return () => {
      if (supportsTransition) {
        window.removeEventListener("load", onLoad);
        window.removeEventListener("resize", onResize);
      }
      panelsCleanup();
      headerCleanup();
      copyrightCleanup();
    };
  }, []);

  useEffect(() => {
    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("#main .thumb > a.image")
    );

    const handlers = anchors.map((anchor, index) => {
      const handler = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        setActiveIndex(index);
        setIsLoading(true);
        setIsOpen(true);
      };

      anchor.style.cursor = "pointer";
      anchor.addEventListener("click", handler);
      return () => anchor.removeEventListener("click", handler);
    });

    return () => {
      handlers.forEach((remove) => {
        remove();
      });
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !activeItem?.href) return;

    setIsLoading(true);

    const previewImage = new Image();
    previewImage.src = activeItem.href;

    const handleComplete = () => {
      setIsLoading(false);
    };

    previewImage.onload = handleComplete;
    previewImage.onerror = handleComplete;

    if (previewImage.complete) {
      setIsLoading(false);
    }

    return () => {
      previewImage.onload = null;
      previewImage.onerror = null;
    };
  }, [isOpen, activeItem?.href]);

  useEffect(() => {
    const body = document.body;
    if (isOpen) {
      body.classList.add("modal-active");
    } else {
      body.classList.remove("modal-active");
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (items.length === 0) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % items.length);
        setIsLoading(true);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + items.length) % items.length);
        setIsLoading(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, items.length]);

  if (!isOpen || !activeItem) {
    return null;
  }

  return createPortal(
    <div
      className="poptrox-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20000,
        textAlign: "center",
      }}
    >
      <button
        type="button"
        aria-label="Close lightbox"
        onClick={() => setIsOpen(false)}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          border: 0,
          padding: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          display: "inline-block",
          height: "100%",
          verticalAlign: "middle",
        }}
      />
      <div
        className={`poptrox-popup${isLoading ? " loading" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        tabIndex={-1}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          const isInteractiveArea = target.closest(
            "img, .caption, .caption a, .nav-previous, .nav-next, .closer"
          );

          if (isInteractiveArea) {
            return;
          }

          setIsOpen(false);
        }}
        onKeyDown={(event) => event.stopPropagation()}
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          position: "relative",
          zIndex: 1,
        }}
      >
        {isLoading ? <div className="loader" /> : null}
        <img
          alt=""
          src={activeItem.href}
          style={{
            ...maxDimension,
            height: "auto",
            width: "auto",
            display: isLoading ? "none" : "block",
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
        <button
          type="button"
          className="closer"
          aria-label="Close"
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen(false);
          }}
          style={{ background: "none", border: 0, padding: 0 }}
        />
        <button
          type="button"
          className="nav-previous"
          aria-label="Previous"
          onClick={(event) => {
            event.stopPropagation();
            setActiveIndex(
              (index) => (index - 1 + items.length) % items.length
            );
            setIsLoading(true);
          }}
          style={{ background: "none", border: 0, padding: 0 }}
        />
        <button
          type="button"
          className="nav-next"
          aria-label="Next"
          onClick={(event) => {
            event.stopPropagation();
            setActiveIndex((index) => (index + 1) % items.length);
            setIsLoading(true);
          }}
          style={{ background: "none", border: 0, padding: 0 }}
        />
        {activeItem.caption ? (
          <div
            className="caption"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: the source is static content from the page.
            dangerouslySetInnerHTML={{ __html: activeItem.caption }}
          />
        ) : null}
      </div>
    </div>,
    document.body
  );
};

export default SiteScripts;
