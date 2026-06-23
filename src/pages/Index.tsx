import { useState, useCallback, useRef, useEffect } from "react";
import TopBar from "@/components/StyleConcierge/TopBar";
import Hero from "@/components/StyleConcierge/Hero";
import StepCard from "@/components/StyleConcierge/StepCard";
import CuratingLoader from "@/components/StyleConcierge/CuratingLoader";
import ResultsSection from "@/components/StyleConcierge/ResultsSection";
import { Sparkles } from "lucide-react";
import { prepareValidatedPhoto } from "@/lib/photoValidation";
import { getAvailableCategoryOptions, recommendStyle } from "@/lib/api";
import {
  addToAiBag,
  openAiBagInStore,
  subscribeToAiBagCount,
} from "@/lib/aiBag";
import type {
  Gender,
  OccasionContext,
  PriceRange,
  RecommendedProduct,
  UserSizeProfile,
} from "@/types/recommendation";

type PhotoStyleSnapshot = {
  skinToneLabel: string;
  bodyFrameLabel: string;
  poseLabel: string;
};

interface Answers {
  gender: Gender | null;
  photo: string | null;
  sizeProfile: UserSizeProfile | null;
  vibe: string | null;
  category: string | null;
  occasion: string | null;
  priceRange: PriceRange | null;
}

const INITIAL: Answers = {
  gender: null,
  photo: null,
  sizeProfile: null,
  vibe: null,
  category: null,
  occasion: null,
  priceRange: null,
};

const ALL_CATEGORY_OPTIONS = [
  "Tops & Dresses",
  "Cargo & Pants",
  "Tees",
  "Shorts & Skirts",
  "Sweatshirts & Hoodies",
  "Jackets",
  "Cord Set",
  "Athleisure",
];

const STEPS = [
  {
    key: "gender" as const,
    stepNumber: 1,
    question: "Who are we styling for?",
    options: ["Women", "Men"],
    type: "chips" as const,
  },
  {
    key: "photo" as const,
    stepNumber: 2,
    question: "Step 2a. Upload a full-body photo",
    helperText:
      "We’ll verify that the image is head-to-toe and show a quick style snapshot.",
    type: "photo-size" as const,
  },
  {
    key: "vibe" as const,
    stepNumber: 3,
    question: "Pick your vibe",
    options: [
      "Streetwear",
      "Minimal",
      "Daily Drip",
      "Thrift",
      "Fusion",
      "Athleisure",
    ],
    type: "chips" as const,
  },
  {
    key: "category" as const,
    stepNumber: 4,
    question: "Choose a category",
    options: ALL_CATEGORY_OPTIONS,
    type: "chips" as const,
  },
  {
    key: "occasion" as const,
    stepNumber: 5,
    question: "Tell us more about the occasion",
    helperText:
      "We’ll use this only to collect context while your results are filtered mainly by store inventory.",
    type: "prompt" as const,
  },
  {
    key: "priceRange" as const,
    stepNumber: 6,
    question: "Choose your budget",
    options: [
      "₹0 - ₹499",
      "₹500 - ₹999",
      "₹1,000 - ₹1,499",
      "₹1,500 - ₹1,999",
      "₹2,000 - ₹2,499",
      "₹2,500 & above",
    ],
    type: "chips" as const,
  },
];

const Index = () => {
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const [activeStep, setActiveStep] = useState(0);
  const [curating, setCurating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showMenComingSoon, setShowMenComingSoon] = useState(false);
  const [bagCount, setBagCount] = useState(0);
  const [categoryOptions, setCategoryOptions] =
    useState<string[]>(ALL_CATEGORY_OPTIONS);
  const [photoStyleSnapshot, setPhotoStyleSnapshot] =
    useState<PhotoStyleSnapshot | null>(null);

  const [recommendedProducts, setRecommendedProducts] = useState<
    RecommendedProduct[]
  >([]);
  const [occasionContext, setOccasionContext] =
    useState<OccasionContext | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null,
  );

  const flowRef = useRef<HTMLDivElement>(null);
  const categoryOptionsCache = useRef<Record<string, string[]>>({});

  const isCompact = activeStep >= 1 || showResults || showMenComingSoon;
  const shouldLockViewport =
    activeStep === 0 && !curating && !showResults && !showMenComingSoon;

  useEffect(() => {
    const unsubscribe = subscribeToAiBagCount(setBagCount);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (shouldLockViewport) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [shouldLockViewport]);

  const resetRecommendationState = () => {
    setRecommendedProducts([]);
    setOccasionContext(null);
    setRecommendationError(null);
    setShowResults(false);
  };

  const runRecommendation = async (nextAnswers: Answers) => {
    setCurating(true);
    setRecommendationError(null);

    try {
      const response = await recommendStyle({
        gender: nextAnswers.gender as Gender,
        sizeProfile: nextAnswers.sizeProfile,
        vibe: nextAnswers.vibe as string,
        category: nextAnswers.category as string,
        occasion: nextAnswers.occasion as string,
        priceRange: nextAnswers.priceRange as PriceRange,
      });

      setOccasionContext(response.occasionContext);
      setRecommendedProducts(response.products);
      setShowResults(true);
    } catch (error) {
      setRecommendedProducts([]);
      setOccasionContext(null);
      setRecommendationError(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your edit.",
      );
      setShowResults(true);
    } finally {
      setCurating(false);
    }
  };

  const handleAnswer = useCallback(
    (key: keyof Answers, value: string, metadata?: Partial<Answers>) => {
      const nextAnswers = {
        ...answers,
        ...metadata,
        [key]: value,
      } as Answers;

      setAnswers(nextAnswers);

      if (key === "gender") {
        const isMen = value === "Men";
        setShowMenComingSoon(isMen);
        if (isMen) {
          setCurating(false);
          resetRecommendationState();
          return;
        }
      }

      const nextStep = activeStep + 1;

      if (key === "vibe" && nextAnswers.gender) {
        const cacheKey = `${nextAnswers.gender}__${value}`;
        const cached = categoryOptionsCache.current[cacheKey];

        if (cached && cached.length > 0) {
          setCategoryOptions(cached);
        } else {
          void getAvailableCategoryOptions({
            gender: nextAnswers.gender as Gender,
            vibe: value,
          })
            .then((options) => {
              const finalOptions =
                options.length > 0 ? options : ALL_CATEGORY_OPTIONS;
              categoryOptionsCache.current[cacheKey] = finalOptions;
              setCategoryOptions(finalOptions);
            })
            .catch(() => {
              setCategoryOptions(ALL_CATEGORY_OPTIONS);
            });
        }
      }

      if (nextStep < STEPS.length) {
        const delay = key === "photo" ? 70 : 20;
        window.setTimeout(() => {
          setActiveStep(nextStep);
        }, delay);
        return;
      }

      runRecommendation(nextAnswers);
    },
    [activeStep, answers],
  );

  const handlePhotoSelected = useCallback(async (file: File) => {
    const prepared = await prepareValidatedPhoto(file);

    if (!prepared.photoValidation.isValid) {
      throw new Error(
        prepared.photoValidation.reason ||
          "Please upload a full-body photo from head to toe.",
      );
    }

    setPhotoStyleSnapshot(prepared.styleSnapshot);

    return "Full-body photo verified";
  }, []);

  const handleEditStep = useCallback((stepIndex: number) => {
    const keysToReset = STEPS.slice(stepIndex).map((s) => s.key);

    setAnswers((prev) => {
      const updated = { ...prev } as Record<
        keyof Answers,
        Answers[keyof Answers]
      >;
      keysToReset.forEach((key) => {
        updated[key] = null;
      });
      if (stepIndex <= 1) {
        updated.sizeProfile = null;
      }
      return updated as Answers;
    });

    if (stepIndex <= 3) {
      setCategoryOptions(ALL_CATEGORY_OPTIONS);
    }

    if (stepIndex <= 1) {
      setPhotoStyleSnapshot(null);
    }

    if (stepIndex === 0) {
      setShowMenComingSoon(false);
    }

    setActiveStep(stepIndex);
    setCurating(false);
    resetRecommendationState();
  }, []);

  const handleRestart = useCallback(() => {
    setAnswers(INITIAL);
    setActiveStep(0);
    setCurating(false);
    setCategoryOptions(ALL_CATEGORY_OPTIONS);
    setPhotoStyleSnapshot(null);
    setShowMenComingSoon(false);
    resetRecommendationState();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAddToBag = useCallback((product: RecommendedProduct) => {
    addToAiBag(product);
  }, []);

  const handleRefine = () => {
    flowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChangeVibe = () => {
    handleEditStep(2);
  };

  const handleChangeCategory = () => {
    handleEditStep(3);
  };

  return (
    <div
      className={`bg-background grain-overlay corner-glow ${
        !isCompact ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      <TopBar
        bagCount={bagCount}
        onRestart={handleRestart}
        onOpenBag={openAiBagInStore}
        currentStep={showResults ? 6 : activeStep}
        totalSteps={6}
        showProgress={activeStep >= 1 || showResults}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6">
        <Hero compact={isCompact} />

        <div
          ref={flowRef}
          className={`space-y-3 pb-8 smooth-layer transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isCompact ? "-translate-y-8 md:-translate-y-10" : "translate-y-0"
          }`}
        >
          {STEPS.map((step, i) => {
            const answerValue = answers[step.key];
            const isAnswered = answerValue !== null;
            const isActive = i === activeStep && !curating;

            if (i > activeStep && !isAnswered) return null;

            return (
              <StepCard
                key={step.key}
                stepNumber={step.stepNumber}
                question={step.question}
                helperText={step.helperText}
                options={
                  step.key === "category" ? categoryOptions : step.options
                }
                type={step.type}
                answered={isAnswered ? answerValue : undefined}
                onAnswer={(val) => handleAnswer(step.key, val)}
                onAnswerWithMetadata={(val, metadata) =>
                  handleAnswer(step.key, val, metadata)
                }
                onEdit={isAnswered ? () => handleEditStep(i) : undefined}
                isActive={isActive}
                onPhotoSelected={
                  step.key === "photo" ? handlePhotoSelected : undefined
                }
                allowPhotoSkip={step.key === "photo"}
                photoStyleSnapshot={
                  step.key === "photo" ? photoStyleSnapshot : null
                }
              />
            );
          })}

          {curating && <CuratingLoader text="Curating your edit…" />}

          {showMenComingSoon && !curating && (
            <section className="glass-card animate-fade-up rounded-2xl border border-primary/20 px-6 py-9 text-center md:px-10 md:py-12">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                <Sparkles size={22} />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                The Men&apos;s Edit
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-foreground md:text-3xl">
                Men&apos;s styling is coming soon.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground md:text-base">
                We&apos;re curating standout men&apos;s products and refining our
                personalized fit and style matching. A sharper, smarter DRIPSTR
                experience for men is on its way—and it will be worth the wait.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => handleEditStep(0)}
                  className="chip-base chip-selected"
                >
                  Explore Women&apos;s styling
                </button>
                <button onClick={handleRestart} className="chip-base">
                  Start over
                </button>
              </div>
            </section>
          )}
        </div>

        {showResults && !curating && (
          <div className="pb-20">
            <ResultsSection
              products={recommendedProducts}
              occasionContext={occasionContext}
              error={recommendationError}
              onAddToBag={handleAddToBag}
              onRefine={handleRefine}
              onRestart={handleRestart}
              onChangeVibe={handleChangeVibe}
              onChangeCategory={handleChangeCategory}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
