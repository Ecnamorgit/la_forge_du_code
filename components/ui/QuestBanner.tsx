"use client";

import BrandLogo from "@/components/ui/BrandLogo";
import Sprite from "@/components/ui/Sprite";
import { BANNER_ICONS } from "@/lib/sprite-config";

interface QuestBannerProps {
  show: boolean;
  title: string;
  subtitle: string;
  xpLabel: string;
  buttonLabel: string;
  /** Optional frame in /sprites/banner-icons.png. Falls back to BrandLogo. */
  bannerFrame?: number;
  /** 1-based index of the step just completed. */
  progressNow?: number;
  /** Total number of steps in the chapter. */
  progressTotal?: number;
  onNext: () => void;
  onDimClick: () => void;
}

export default function QuestBanner({
  show,
  title,
  subtitle,
  xpLabel,
  buttonLabel,
  bannerFrame,
  progressNow,
  progressTotal,
  onNext,
  onDimClick,
}: QuestBannerProps) {
  if (!show) return null;

  const showProgress =
    typeof progressNow === "number" && typeof progressTotal === "number";
  const isLast = showProgress && progressNow === progressTotal;
  const remaining = showProgress ? progressTotal! - progressNow! : 0;

  return (
    <>
      <div
        className="fixed inset-0 z-[399] bg-[rgba(3,6,13,0.85)] animate-overlay-in"
        onClick={onDimClick}
      />
      <div className="fixed left-1/2 top-1/2 z-[400] min-w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-sm border border-nebula-cyan bg-nebula-bg-panel px-12 py-8 text-center shadow-[0_0_60px_rgba(0,240,255,0.15),0_0_120px_rgba(0,240,255,0.05)] animate-modal-pop-in">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center animate-float-gentle">
          {bannerFrame !== undefined ? (
            <Sprite
              sheet={BANNER_ICONS}
              frame={bannerFrame}
              displaySize={80}
              title={title}
            />
          ) : (
            <BrandLogo
              size={80}
              className="drop-shadow-[0_0_24px_rgba(0,240,255,0.28)]"
            />
          )}
        </div>
        {showProgress && (
          <div className="mb-2 font-tech text-[11px] uppercase tracking-[0.32em] text-nebula-text-dim">
            {isLast ? (
              <span className="text-nebula-orange">
                ★ ÉTAPE {progressNow} / {progressTotal} · CHAPITRE TERMINÉ ★
              </span>
            ) : (
              <>
                ÉTAPE {progressNow} / {progressTotal}
                <span className="ml-2 text-nebula-cyan">
                  · {remaining} restante{remaining > 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        )}
        <div className="mb-2.5 font-tech text-lg leading-relaxed tracking-wider text-nebula-cyan [text-shadow:0_0_20px_rgba(0,240,255,0.4)]">
          {title}
        </div>
        <div className="mb-5 font-body text-base leading-normal text-nebula-text-secondary">
          {subtitle}
        </div>
        <div className="mb-5 font-tech text-sm tracking-wider text-nebula-green">
          {xpLabel}
        </div>
        <button
          onClick={onNext}
          className="relative rounded-sm border-none bg-nebula-cyan px-5 py-2 font-tech text-xs uppercase tracking-widest text-nebula-bg-darkest shadow-[0_4px_0_var(--cyan-dim)] animate-btn-appear hover:top-px hover:shadow-[0_3px_0_var(--cyan-dim)] active:top-1 active:shadow-none"
        >
          {buttonLabel}
        </button>
      </div>
    </>
  );
}
