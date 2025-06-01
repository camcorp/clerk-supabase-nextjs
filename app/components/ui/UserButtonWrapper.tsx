'use client';

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function UserButtonWrapper({ afterSignOutUrl }: { afterSignOutUrl: string }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    // Return a placeholder with similar dimensions to avoid layout shift
    return <div className="h-8 w-8 rounded-full bg-gray-200"></div>;
  }
  
  return <UserButton afterSignOutUrl={afterSignOutUrl} />;
}