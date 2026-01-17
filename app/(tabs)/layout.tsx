"use client";

import { usePathname, useRouter } from "next/navigation";
import { TabBar } from "antd-mobile";
import { UserOutline, FileOutline, AppOutline } from "antd-mobile-icons";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // 根据路径确定当前tab
  const getActiveTab = () => {
    if (pathname?.startsWith("/grammar")) return "grammar";
    if (pathname?.startsWith("/my")) return "my";
    return "words"; // 默认
  };

  const activeTab = getActiveTab();

  const handleTabChange = (key: string) => {
    if (key === "words") {
      router.push("/words");
    } else if (key === "grammar") {
      router.push("/grammar");
    } else if (key === "my") {
      router.push("/my");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">{children}</div>
      <TabBar
        activeKey={activeTab}
        onChange={handleTabChange}
        className="border-t border-gray-200"
      >
        <TabBar.Item key="words" icon={<FileOutline />} title="单词" />
        <TabBar.Item key="grammar" icon={<AppOutline />} title="语法" />
        <TabBar.Item key="my" icon={<UserOutline />} title="我的" />
      </TabBar>
    </div>
  );
}
