"use client";

import { useEffect, useState } from "react";

import { ChevronRight } from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import type { NavGroup } from "./config";

interface NavMainProps {
  groups: NavGroup[];
}

export function NavMain({ groups }: NavMainProps) {
  const pathname = usePathname();

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-wide text-muted-foreground/90 uppercase">
            {group.label}
          </SidebarGroupLabel>
          <SidebarMenu>
            {group.items.length === 1 ? (
              <SingleItem item={group.items[0]} pathname={pathname} />
            ) : (
              <CollapsibleGroup group={group} pathname={pathname} />
            )}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

function SingleItem({
  item,
  pathname,
}: {
  item: NavGroup["items"][number];
  pathname: string;
}) {
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.url} />}
        isActive={pathname === item.url}
      >
        {Icon && <Icon className="size-4" />}
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function CollapsibleGroup({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  const isActive = group.items.some((item) => pathname.startsWith(item.url));
  const GroupIcon = group.icon;
  const [open, setOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setOpen(true);
    }
  }, [isActive]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger render={<SidebarMenuButton tooltip={group.label} />}>
          {GroupIcon && <GroupIcon className="size-4" />}
          <span className="font-semibold">{group.dropdownTitle ?? group.label}</span>
          <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.items.map((item) => (
              <SidebarMenuSubItem key={item.url}>
                <SidebarMenuSubButton
                  render={<Link href={item.url} />}
                  isActive={pathname === item.url}
                >
                  <span>{item.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}