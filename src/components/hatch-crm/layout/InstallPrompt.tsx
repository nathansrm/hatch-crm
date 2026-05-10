import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const DISMISSAL_KEY = "hatch.installPrompt.dismissedAt";
const DISMISSAL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const wasRecentlyDismissed = (): boolean => {
  const value = localStorage.getItem(DISMISSAL_KEY);
  if (!value) return false;
  const dismissedAt = new Date(value).getTime();
  if (Number.isNaN(dismissedAt)) return false;
  return Date.now() - dismissedAt < DISMISSAL_WINDOW_MS;
};

const isStandalone = (): boolean => {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
};

const isIos = (): boolean =>
  /iPhone|iPad|iPod/i.test(window.navigator.userAgent);

export const InstallPrompt = () => {
  const isMobile = useIsMobile();
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isMobile) return;
    if (isStandalone()) return;
    if (wasRecentlyDismissed()) return;

    if (isIos()) {
      setShowIosPrompt(true);
      return;
    }

    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isMobile]);

  if (!isMobile || dismissed) return null;
  if (!installEvent && !showIosPrompt) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSAL_KEY, new Date().toISOString());
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setDismissed(true);
  };

  return (
    <div
      className="fixed left-4 right-4 z-50"
      style={{
        bottom: "calc(64px + env(safe-area-inset-bottom, 0px) + 16px)",
      }}
    >
      <Card className="shadow-lg">
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="font-semibold leading-none">Install Hatch Theory</p>
            <p className="text-sm text-muted-foreground">
              {showIosPrompt
                ? "Tap the share icon, then 'Add to Home Screen'."
                : "Add this app to your home screen for faster access."}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            {showIosPrompt ? (
              <Button size="sm" onClick={dismiss}>
                Got it
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={dismiss}>
                  Not now
                </Button>
                <Button size="sm" onClick={handleInstall}>
                  Install
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
