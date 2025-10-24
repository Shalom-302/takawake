// "use client";

// import { useState } from "react";
// import type { NavItemDividerType, NavItemType } from "../config";
// import { NavItemBase } from "./nav-item";
// import { cn } from "@/lib/utils/cn";

// interface NavListProps {
//     /** URL of the currently active item. */
//     activeUrl?: string;
//     /** Additional CSS classes to apply to the list. */
//     className?: string;
//     /** List of items to display. */
//     items: (NavItemType | NavItemDividerType)[];
// }

// export const NavList = ({ activeUrl, items, className }: NavListProps) => {

//     return (
//         <ul className={cn("mt-4 flex flex-col px-2 lg:px-4", className)}>
//             {items.map((item, index) => {
//                 if (item.divider) {
//                     return (
//                         <li key={index} className="w-full px-0.5 py-2">
//                             <hr className="h-px w-full border-none bg-border-secondary" />
//                         </li>
//                     );
//                 }

//                 if (item.items?.length) {
//                     return (
//                         <details
//                             key={item.label}
//                             open={activeItem?.href === item.href}
//                             className="appearance-none py-0.5"
//                             onToggle={e => {
//                                 setOpen(e.currentTarget.open);
//                                 setCurrentItem(item);
//                             }}
//                         >
//                             <NavItemBase
//                                 href={item.href}
//                                 badge={item.badge}
//                                 icon={item.icon}
//                                 type="collapsible"
//                             >
//                                 {item.label}
//                             </NavItemBase>

//                             <dd>
//                                 <ul className="py-0.5">
//                                     {item.items.map(childItem => (
//                                         <li key={childItem.label} className="py-0.5">
//                                             <NavItemBase
//                                                 href={childItem.href}
//                                                 badge={childItem.badge}
//                                                 type="collapsible-child"
//                                                 current={activeUrl === childItem.href}
//                                             >
//                                                 {childItem.label}
//                                             </NavItemBase>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </dd>
//                         </details>
//                     );
//                 }

//                 return (
//                     <li key={item.label} className="py-0.5">
//                         <NavItemBase
//                             type="link"
//                             badge={item.badge}
//                             icon={item.icon}
//                             href={item.href}
//                             current={currentItem?.href === item.href}
//                             open={open && currentItem?.href === item.href}
//                         >
//                             {item.label}
//                         </NavItemBase>
//                     </li>
//                 );
//             })}
//         </ul>
//     );
// };

"use client";

import type { NavItemDividerType, NavItemType } from "../config";
import { NavItemBase } from "./nav-item";
import { cn } from "@/lib/utils/cn";

interface NavListProps {
    /** URL of the currently active item. */
    activeUrl?: string;
    /** Additional CSS classes to apply to the list. */
    className?: string;
    /** List of items to display. */
    items: (NavItemType | NavItemDividerType)[];
}

export const NavList = ({ activeUrl, items, className }: NavListProps) => {
    //     const [open, setOpen] = useState(false);
    //     const activeItem = items.find(
    //         item => item.href === activeUrl || item.items?.some(subItem => subItem.href === activeUrl)
    //     );
    //     const [currentItem, setCurrentItem] = useState(activeItem);

    return (
        <ul className={cn("mt-4 flex flex-col px-2 lg:px-4", className)}>
            {items.map((item, index) => {
                if (item.divider) {
                    return (
                        <li key={`divider-${index}`} className="w-full px-0.5 py-2">
                            {item.label && (
                                <div className="px-3 pb-1 text-xs font-semibold text-tertiary">
                                    {item.label}
                                </div>
                            )}
                            <hr className="h-px w-full border-none bg-border-secondary" />
                        </li>
                    );
                }

                // Items avec sous-menu (collapsible)
                if (item.items?.length) {
                    const hasActiveChild = item.items.some(child => child.href === activeUrl);
                    const isParentActive = item.href === activeUrl;

                    return (
                        <details
                            key={item.label}
                            open={hasActiveChild || isParentActive}
                            className="appearance-none py-0.5"
                        >
                            <NavItemBase
                                href={item.href}
                                badge={item.badge}
                                icon={item.icon}
                                type="collapsible"
                                current={isParentActive}
                            >
                                {item.label}
                            </NavItemBase>

                            <dd>
                                <ul className="py-0.5">
                                    {item.items.map(childItem => (
                                        <li key={childItem.label} className="py-0.5">
                                            <NavItemBase
                                                href={childItem.href}
                                                badge={childItem.badge}
                                                type="collapsible-child"
                                                current={activeUrl === childItem.href}
                                            >
                                                {childItem.label}
                                            </NavItemBase>
                                        </li>
                                    ))}
                                </ul>
                            </dd>
                        </details>
                    );
                }

                // Items simples
                return (
                    <li key={item.label} className="py-0.5">
                        <NavItemBase
                            type="link"
                            badge={item.badge}
                            icon={item.icon}
                            href={item.href}
                            current={activeUrl === item.href}
                        >
                            {item.label}
                        </NavItemBase>
                    </li>
                );
            })}
        </ul>
    );
};
