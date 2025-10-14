// src/components/DateRangePicker.jsx

import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils"; // Pretpostavka da koristite shadcn/ui za `cn`
import { Button } from "@/components/ui/button"; // Pretpostavka za Button
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Pretpostavka za Popover

// Ako nemate shadcn/ui, `cn` je prosta funkcija za spajanje klasa,
// a Button i Popover možete zameniti svojim ili stilizovati div/button elemente.

export function DateRangePicker({ onUpdate, className }) {
  const [range, setRange] = useState(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleApply = () => {
    onUpdate(range);
    setPopoverOpen(false);
  };

  const handleClear = () => {
    setRange(undefined);
    onUpdate({ from: undefined, to: undefined });
    setPopoverOpen(false);
  };

  const footer = (
    <div className="flex items-center justify-end gap-2 pt-4 border-t mt-2">
      <Button variant="outline" size="sm" onClick={handleClear}>
        Clear
      </Button>
      <Button size="sm" onClick={handleApply} disabled={!range?.from}>
        Apply
      </Button>
    </div>
  );

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal shadow-sm border-gray-300",
              !range && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "LLL dd, y")} -{" "}
                  {format(range.to, "LLL dd, y")}
                </>
              ) : (
                format(range.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <DayPicker
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            footer={footer}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
