/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { ReactNode, useState } from "react";

import { cn } from "@/lib/utils/cn";
import clsx from "clsx";

// Type des props pour le composant Table
type TableProps = {
    headers: { label: string; id: string; icon?: ReactNode }[]; // Liste des en-têtes du tableau avec label et id
    datas: Array<{ [key: string]: any }>; // Données des lignes du tableau (clé-valeur)
    className?: string; // Classes CSS supplémentaires (optionnel)
    noDataMessage?: string; // Message affiché lorsque les données sont vides (optionnel)
    selectable?: boolean; // Ajoute des cases de sélection (optionnel)
    onSelectionChange?: (selectedRows: any[]) => void; // Callback pour récupérer les lignes sélectionnées
};

export const Table: React.FC<TableProps> = ({
    headers,
    datas,
    className,
    noDataMessage = "Aucun résultat",
    selectable = false,
    onSelectionChange,
}) => {
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    // Vérifie si toutes les lignes sont sélectionnées
    const isAllSelected = selectedRows.length === datas.length && datas.length > 0;

    // Fonction pour basculer la sélection d'une ligne
    const toggleRowSelection = (rowIndex: number) => {
        let newSelectedRows;
        if (selectedRows.includes(rowIndex)) {
            newSelectedRows = selectedRows.filter(index => index !== rowIndex);
        } else {
            newSelectedRows = [...selectedRows, rowIndex];
        }
        setSelectedRows(newSelectedRows);
        onSelectionChange?.(newSelectedRows.map(index => datas[index])); // Envoie les données sélectionnées
    };

    // Fonction pour sélectionner/désélectionner toutes les lignes
    const toggleAllSelection = () => {
        const newSelectedRows = isAllSelected ? [] : datas.map((_, index) => index);
        setSelectedRows(newSelectedRows);
        onSelectionChange?.(newSelectedRows.map(index => datas[index])); // Envoie les données sélectionnées
    };

    return (
        <div
            className={cn(
                " border border-primary/30 rounded-xl shadow-xs overflow-auto",
                className
            )}
        >
            <table className="w-[900px] sm:min-w-full">
                {/* En-têtes du tableau */}
                <thead>
                    <tr>
                        {selectable && (
                            <th className="px-4 py-2 rounded-tl-xl bg-gray-50 text-left text-sm font-medium border-b border-primary/30">
                                <input
                                    type="checkbox"
                                    id="global-selection"
                                    checked={isAllSelected}
                                    onChange={toggleAllSelection}
                                    className="w-4 h-4 hidden"
                                />
                                <label
                                    htmlFor={`global-selection`}
                                    className={cn(
                                        "inline-flex w-5 h-5 text-foreground bg-white border rounded-md items-center justify-center",
                                        {
                                            "bg-primary border-primary":
                                                isAllSelected,
                                            "border-primary/30": !isAllSelected,
                                        }
                                    )}
                                >
                                    {isAllSelected && (
                                        <div className="text-white">
                                            <DefaultCheckIcon />
                                        </div>
                                    )}
                                </label>
                            </th>
                        )}
                        {headers.map((header, idx) => (
                            <th
                                key={header.id}
                                className={clsx(
                                    "px-4 py-2 text-left bg-gray-50 text-xs font-semibold text-primary border-b border-primary/30",
                                    { "rounded-tr-xl": idx + 1 === headers.length },
                                    { "rounded-tl-xl": !selectable && idx === 0 }
                                )}
                            >
                                <div className="flex items-center gap-[4px]">
                                    {header.label}
                                    {header.icon}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Lignes du tableau */}
                <tbody>
                    {datas.length > 0 ? (
                        datas.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={cn(
                                    "not-last:border-b border-b-primary/30",
                                    {
                                        "bg-gray-50": selectedRows.includes(rowIndex),
                                    }
                                )}
                            >
                                {selectable && (
                                    <td
                                        className={cn(
                                            "px-4 py-2 text-sm w-5",
                                            {
                                                "bg-gray-50":
                                                    selectedRows.includes(rowIndex),
                                            },
                                            {
                                                "rounded-bl-xl": rowIndex + 1 === datas.length,
                                            }
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            id={`aaa-${rowIndex}`}
                                            checked={selectedRows.includes(rowIndex)}
                                            onChange={() => toggleRowSelection(rowIndex)}
                                            className="w-4 h-4 hidden"
                                        />
                                        <label
                                            htmlFor={`aaa-${rowIndex}`}
                                            className={cn(
                                                "inline-flex w-5 h-5  border rounded-md items-center justify-center",
                                                {
                                                    "bg-primary border-primary":
                                                        selectedRows.includes(rowIndex),
                                                    "border-primary/30":
                                                        !selectedRows.includes(rowIndex),
                                                }
                                            )}
                                        >
                                            {selectedRows.includes(rowIndex) && (
                                                <div className="text-white">
                                                    <DefaultCheckIcon />
                                                </div>
                                            )}
                                        </label>
                                    </td>
                                )}
                                {headers.map((header, idx) => (
                                    <td
                                        key={`${rowIndex}-${header.id}`}
                                        className={cn(
                                            "px-4 py-2 text-sm text-primary",
                                            {
                                                "bg-gray-50":
                                                    selectedRows.includes(rowIndex),
                                            },
                                            {
                                                "rounded-br-xl":
                                                    rowIndex + 1 === datas.length &&
                                                    idx + 1 === headers.length,
                                            }
                                        )}
                                    >
                                        {React.isValidElement(row[header.id])
                                            ? row[header.id]
                                            : row[header.id] || "-"}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={headers.length + (selectable ? 1 : 0)}
                                className="px-4 py-4 text-sm text-foreground/60 text-center "
                            >
                                {noDataMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* <div className="border-t border-primary/30">
        pagination logic
      </div> */}
        </div>
    );
};

const DefaultCheckIcon: React.FC = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
