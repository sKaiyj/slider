import {
  Children,
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./Slider.module.scss";

const Slider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<React.ReactNode>();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const slides = useRef<HTMLDivElement>(null);
  const sliderWindow = useRef<HTMLDivElement>(null);

  const animationTime = 500; // Duration of transition
  const playTime = 500; // Time between each slide, not including transition

  const setTransitionTime = () => {
    slides.current!.style.transition = `all ${animationTime}ms ease-in-out`;
  };

  const resizeHandler = useCallback(() => {
    const _width = sliderWindow.current!.offsetWidth;
    setWidth(_width);
    slides.current!.style.transform = `translateX(${-currentSlide * _width}px)`;
  }, [currentSlide]);

  useEffect(() => {
    window.addEventListener("resize", resizeHandler);
    resizeHandler(); // set initial size of slider
    return () => window.removeEventListener("resize", resizeHandler);
  }, [resizeHandler]);

  useEffect(() => {
    const modifiedChildren = Children.map(children, (child) => (
      <div className={styles.slide}>{child}</div>
    ));
    if (modifiedChildren) {
      setItems([
        cloneElement(modifiedChildren[modifiedChildren.length - 1], {
          key: "last",
        }),
        ...modifiedChildren,
        cloneElement(modifiedChildren[0], { key: "first" }),
      ]);
    }
  }, [children]);

  useEffect(() => {
    if (items) {
      // loop to first slide after last slide
      if (currentSlide >= Children.count(items) - 1) {
        setTimeout(() => {
          slides.current!.style.transition = "none";
          slides.current!.style.transform = `translateX(${-width}px)`;
          setCurrentSlide(1);
        }, animationTime);
      }

      // loop to last slide after first slide
      if (currentSlide <= 0) {
        setTimeout(() => {
          slides.current!.style.transition = "none";
          slides.current!.style.transform = `translateX(${
            -width * (Children.count(items) - 2)
          }px)`;
          setCurrentSlide(Children.count(items) - 2);
        }, animationTime);
      }
    }
  }, [currentSlide, items, width]);

  useEffect(() => {
    // cancel ability to play next slide when animating
    if (isAnimating) {
      const animationTimeout = setTimeout(() => {
        setIsAnimating(false);
      }, animationTime);
      return () => clearTimeout(animationTimeout);
    }
  }, [isAnimating]);

  const slideTo = useCallback(
    (newSlide: number) => {
      if (!isAnimating && items) {
        setIsAnimating(true);
        setTransitionTime();
        slides.current!.style.transform = `translateX(${-newSlide * width}px)`;
        setCurrentSlide(newSlide);
      }
    },
    [isAnimating, items, width]
  );

  const nextSlide = useCallback(
    () => slideTo(currentSlide + 1),
    [currentSlide, slideTo]
  );
  const prevSlide = () => slideTo(currentSlide - 1);

  useEffect(() => {
    if (isPlaying && !isAnimating) {
      const playTimeout = setTimeout(nextSlide, animationTime + playTime);
      return () => clearTimeout(playTimeout);
    }
  }, [
    currentSlide,
    isPlaying,
    isAnimating,
    animationTime,
    playTime,
    nextSlide,
  ]);

  const startPlaying = () => setIsPlaying(true);
  const stopPlaying = () => {
    setIsPlaying(false);
    clearTimeout(timerRef.current);
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.slider} ref={sliderWindow}>
        <div className={styles.items} ref={slides}>
          {items}
        </div>
      </div>
      <div className={styles.buttons}>
        <button onClick={prevSlide}>prev</button>
        <button onClick={startPlaying} disabled={isPlaying}>
          play
        </button>
        <button onClick={stopPlaying} disabled={!isPlaying}>
          stop
        </button>
        <button onClick={nextSlide}>next</button>
      </div>
    </div>
  );
};

export default Slider;
