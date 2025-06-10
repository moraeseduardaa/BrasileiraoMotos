import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
  autoplay?: boolean;
  autoplayInterval?: number;
  continuousScroll?: boolean;
  scrollSpeed?: number;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      autoplay = false,
      autoplayInterval = 3000,
      continuousScroll = false,
      scrollSpeed = 1,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const [isPlaying, setIsPlaying] = React.useState(autoplay);

    // Autoplay functionality
    const autoplayRef = React.useRef<NodeJS.Timeout>();
    const continuousScrollRef = React.useRef<number>();

    const startAutoplay = React.useCallback(() => {
      if (!autoplay || !api) return;

      autoplayRef.current = setInterval(() => {
        if (api.canScrollNext()) {
          api.scrollNext();
        } else {
          // When reaching the end, go back to the first slide
          api.scrollTo(0);
        }
      }, autoplayInterval);
    }, [api, autoplay, autoplayInterval]);

    const startContinuousScroll = React.useCallback(() => {
      if (!continuousScroll || !api) return;

      let startTime = 0;
      const animate = (currentTime: number) => {
        if (startTime === 0) startTime = currentTime;
        const elapsed = currentTime - startTime;

        // Move continuously based on scroll speed
        const progress = (elapsed * scrollSpeed) / 1000; // pixels per second

        // Get current scroll position
        const scrollProgress = api.scrollProgress();
        const newProgress = (scrollProgress + progress / 1000) % 1;

        // Smooth scroll to new position
        api.scrollTo(
          Math.floor(newProgress * (api.scrollSnapList().length - 1))
        );

        // Reset start time for next frame
        startTime = currentTime;

        continuousScrollRef.current = requestAnimationFrame(animate);
      };

      continuousScrollRef.current = requestAnimationFrame(animate);
    }, [api, continuousScroll, scrollSpeed]);

    const stopAutoplay = React.useCallback(() => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = undefined;
      }
    }, []);

    const stopContinuousScroll = React.useCallback(() => {
      if (continuousScrollRef.current) {
        cancelAnimationFrame(continuousScrollRef.current);
        continuousScrollRef.current = undefined;
      }
    }, []);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );

    // Handle mouse enter/leave for autoplay pause/resume
    const handleMouseEnter = React.useCallback(() => {
      if (autoplay && isPlaying) {
        stopAutoplay();
      }
      if (continuousScroll) {
        stopContinuousScroll();
      }
    }, [
      autoplay,
      isPlaying,
      stopAutoplay,
      continuousScroll,
      stopContinuousScroll,
    ]);

    const handleMouseLeave = React.useCallback(() => {
      if (autoplay && isPlaying) {
        startAutoplay();
      }
      if (continuousScroll) {
        startContinuousScroll();
      }
    }, [
      autoplay,
      isPlaying,
      startAutoplay,
      continuousScroll,
      startContinuousScroll,
    ]);

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      return () => {
        api?.off("select", onSelect);
      };
    }, [api, onSelect]);

    // Autoplay effect
    React.useEffect(() => {
      if (continuousScroll && api) {
        startContinuousScroll();
      } else if (autoplay && api && isPlaying) {
        startAutoplay();
      }

      return () => {
        stopAutoplay();
        stopContinuousScroll();
      };
    }, [
      api,
      autoplay,
      isPlaying,
      continuousScroll,
      startAutoplay,
      startContinuousScroll,
      stopAutoplay,
      stopContinuousScroll,
    ]);

    // Stop autoplay when component unmounts
    React.useEffect(() => {
      return () => {
        stopAutoplay();
        stopContinuousScroll();
      };
    }, [stopAutoplay, stopContinuousScroll]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          autoplay,
          autoplayInterval,
          continuousScroll,
          scrollSpeed,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute  h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = "CarouselNext";

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
