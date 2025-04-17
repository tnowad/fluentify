"use client";

import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Settings,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";

import {
  AlertTriangle,
  BarChart2,
  Bell,
  CheckCircle,
  Clock,
  Flame,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMeQueryOptions } from "@/lib/queries/user.queries";
import { useRouter } from "next/navigation";

const mainMenu = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/daily-quiz", label: "Daily Quiz", icon: Clock },
  { href: "/discover", label: "Discover", icon: Flame },
  { href: "/how-do-i-say", label: "How Do I Say", icon: BookOpen },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/progress", label: "Progress", icon: BarChart2 },
  { href: "/review", label: "Review", icon: CheckCircle },
  { href: "/weakness-report", label: "Weakness Report", icon: AlertTriangle },
  { href: "/words", label: "Words", icon: BookOpen },
  { href: "/achievements", label: "Achievements", icon: Trophy },
];
const personalMenu = [{ href: "/settings", label: "Settings", icon: Settings }];

function RenderSidebarMenu({ items }: { items: typeof mainMenu }) {
  return (
    <SidebarMenu>
      {items.map(({ href, label, icon: Icon }) => (
        <SidebarMenuItem key={href}>
          <SidebarMenuButton asChild>
            <Link href={href}>
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading } = useQuery(getMeQueryOptions);

  if (isLoading) return null;
  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Fluentify</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <RenderSidebarMenu items={mainMenu} />
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Personal</SidebarGroupLabel>
              <SidebarGroupContent>
                <RenderSidebarMenu items={personalMenu} />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/logout">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.name ?? "Learner"}! Ready to continue
                learning?
              </p>
            </div>
            <SidebarTrigger className="lg:hidden" />
          </div>
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
