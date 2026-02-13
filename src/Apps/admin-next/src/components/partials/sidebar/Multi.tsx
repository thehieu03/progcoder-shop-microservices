import Badge from "@/components/ui/Badge";
import React from "react";
import { Collapse } from "react-collapse";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MultiMenuItem {
  multiTitle: string;
  multiLink: string;
}

interface LockLinkItem {
  multiTitle: string;
  badge?: string;
}

interface LockLinkProps {
  to: string;
  children: React.ReactNode | ((props: { active: boolean }) => React.ReactNode);
  item: LockLinkItem;
}

const LockLink: React.FC<LockLinkProps> = ({ to, children, item }) => {
  const pathname = usePathname();
  const active = pathname === to;
  const resolvedChildren =
    typeof children === "function" ? children({ active }) : children;
  const { multiTitle, badge } = item;

  return (
    <>
      {item.badge ? (
        <span
          className={`text-slate-600 dark:text-slate-300 opacity-50 cursor-not-allowed
           text-sm flex space-x-3 rtl:space-x-reverse items-center `}>
          <span className="h-2 w-2 rounded-full border border-slate-600 dark:border-white inline-block flex-none"></span>
          <span className="flex-1 flex  space-x-2 rtl:space-x-reverse  truncate">
            <span className=" grow   truncate">{multiTitle}</span>
            <span className="grow-0">
              <Badge className="bg-slate-900 px-2 py-[3px]  font-normal text-xs rounded-full text-slate-100  capitalize">
                {badge}
              </Badge>
            </span>
          </span>
        </span>
      ) : (
        <Link href={to}>{resolvedChildren}</Link>
      )}
    </>
  );
};

interface SubItem {
  multi_menu?: MultiMenuItem[];
}

interface MultilevelProps {
  activeMultiMenu: number | null;
  j: number;
  subItem: SubItem;
}

const Multilevel: React.FC<MultilevelProps> = ({ activeMultiMenu, j, subItem }) => {
  return (
    <Collapse isOpened={activeMultiMenu === j}>
      <ul className="space-y-[14px] pl-4">
        {subItem?.multi_menu?.map((item, i) => (
          <li key={i} className=" first:pt-[14px]">
            <LockLink to={item.multiLink} item={item}>
              {({ active }: { active: boolean }) => (
                <span
                  className={`${
                    active
                      ? " text-black dark:text-white font-medium"
                      : "text-slate-600 dark:text-slate-300"
                  } text-sm flex space-x-3 rtl:space-x-reverse items-center transition-all duration-150`}>
                  <span
                    className={`${
                      active
                        ? " bg-slate-900 dark:bg-slate-300 ring-4 ring-slate-500/20 dark:ring-slate-300/20"
                        : ""
                    } h-2 w-2 rounded-full border border-slate-600! dark:border-white inline-block flex-none`}></span>
                  <span className="flex-1">{item.multiTitle}</span>
                </span>
              )}
            </LockLink>
          </li>
        ))}
      </ul>
    </Collapse>
  );
};

export default Multilevel;

