import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { enUS } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export const ScheduleDeliveryModal = ({ isOpen, onClose, onConfirm, openingTime, closingTime }) => {
    const [date, setDate] = useState(null);
    const [time, setTime] = useState('');
    const [timeError, setTimeError] = useState(''); // State specifically for the time validation error

    // This validation function will be called immediately when the time changes
    const validateTime = (selectedTime) => {
        // Only validate if we have all the necessary information
        if (openingTime && closingTime && selectedTime) {
            if (selectedTime < openingTime || selectedTime > closingTime) {
                setTimeError(`Time must be between ${openingTime} and ${closingTime}.`);
                return false; // Indicate validation failed
            }
        }
        // If the time is valid or we can't validate, clear any existing error
        setTimeError('');
        return true; // Indicate validation passed
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setTime(newTime);
        validateTime(newTime); // Validate immediately on change
    };

    const handleConfirm = () => {
        // Re-run validation as a final check before confirming
        const isTimeValid = validateTime(time);

        if (!date || !time || !isTimeValid) {
            toast.error("Please select a valid date and time.");
            return;
        }

        const formattedDate = format(date, 'yyyy-MM-dd');

        onConfirm({ scheduledDate: formattedDate, scheduledTime: time });
        onClose();
    };

    const disabledDateMatcher = (day) => {
        const today = new Date();
        const sevenDaysFromNow = new Date();
        today.setHours(0, 0, 0, 0);
        sevenDaysFromNow.setDate(today.getDate() + 7);
        return day < today || day > sevenDaysFromNow;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Schedule Delivery</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div>
                        <Label htmlFor="date">Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: enUS }) : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={disabledDateMatcher}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label htmlFor="time">
                            Time {openingTime && closingTime && `(Open from ${openingTime} to ${closingTime})`}
                        </Label>
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={handleTimeChange} // Use the new handler
                            min={openingTime}           // Sets the earliest selectable time
                            max={closingTime}           // Sets the latest selectable time
                        />
                        {/* Display the error message right below the input if it exists */}
                        {timeError && <p className="text-red-500 text-sm mt-1">{timeError}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!!timeError}>Confirm Schedule</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};