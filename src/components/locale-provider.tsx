"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LocaleProvider({
  children,
}: {
  children: (locale: string) => React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const locale = searchParams.get("lang") ?? "en";
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    import("../language/i18n").then(({ initializeI18n }) => {
      initializeI18n(locale).then(() => setIsI18nReady(true));
    });
  }, [locale]);

  if (!isI18nReady) {
    return <div>Loading...</div>;
  }

  return <>{children(locale)}</>;
}
