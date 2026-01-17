"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 默认跳转到单词页面
    router.replace("/words");
  }, [router]);

  return null;
}
