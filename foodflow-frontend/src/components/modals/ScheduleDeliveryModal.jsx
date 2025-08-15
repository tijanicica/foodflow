import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format, addMinutes, setHours, setMinutes, isSameDay, isBefore } from "date-fns";
import { enUS } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';

//================================================================================
// POMOĆNE FUNKCIJE
//================================================================================

const generateTimeSlots = (startStr, endStr, interval) => {
    const slots = [];
    if (!startStr || !endStr) return slots;

    let current = new Date();
    const [startHour, startMinute] = startStr.split(':').map(Number);
    const [endHour, endMinute] = endStr.split(':').map(Number);

    current = setHours(current, startHour);
    current = setMinutes(current, startMinute);
    
    let end = new Date();
    end = setHours(end, endHour);
    end = setMinutes(end, endMinute);

    while (current <= end) {
        slots.push(format(current, "HH:mm"));
        current = addMinutes(current, interval);
    }
    return slots;
};

//================================================================================
// GLAVNA KOMPONENTA MODALA
//================================================================================

export const ScheduleDeliveryModal = ({ isOpen, onClose, onConfirm, openingTime, closingTime }) => {
    const [date, setDate] = useState(null);
    const [time, setTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDate(null);
            setTime('');
            setIsLoading(false);
        }
    }, [isOpen]);

    const allTimeSlots = useMemo(() => generateTimeSlots(openingTime, closingTime, 30), [openingTime, closingTime]);

    const availableTimeSlots = useMemo(() => {
        if (!date) return [];
        const now = new Date();
        if (isSameDay(date, now)) {
            return allTimeSlots.filter(slot => {
                const [hour, minute] = slot.split(':').map(Number);
                const slotTime = setMinutes(setHours(new Date(date), hour), minute);
                return isBefore(now, slotTime);
            });
        }
        return allTimeSlots;
    }, [date, allTimeSlots]);

    const handleConfirm = () => {
        if (!date || !time) {
            toast.error("Please select both a date and a time.");
            return;
        }
        setIsLoading(true);
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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2"><CalendarIcon size={24}/> Schedule Your Delivery</DialogTitle>
                    <DialogDescription>
                        Pick a date and time for your order to arrive.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={disabledDateMatcher}
                            className="rounded-md border p-0"
                        />
                    </div>

                    <div className="flex flex-col">
                        <Label className="font-semibold mb-2 flex items-center gap-2"><Clock size={16}/> Available Times {openingTime && `(${openingTime}-${closingTime})`}</Label>
                        <div className="border rounded-md p-2 h-64 overflow-y-auto">
                            {date ? (
                                availableTimeSlots.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {availableTimeSlots.map(slot => (
                                            <Button 
                                                key={slot}
                                                variant={time === slot ? 'default' : 'outline'}
                                                onClick={() => setTime(slot)}
                                                className={`transition-colors ${time === slot && 'bg-brand-primary'}`}
                                            >
                                                {slot}
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-sm text-gray-500 pt-10">No available slots for today.</div>
                                )
                            ) : (
                                <div className="text-center text-sm text-gray-500 pt-10">Please select a date first.</div>
                            )}
                        </div>
                    </div>
                </div>
                
                {date && time && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-brand-background-light p-3 rounded-lg text-center font-semibold text-brand-primary">
                        Delivery scheduled for {format(date, "EEE, MMM d")} at {time}
                    </motion.div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!date || !time || isLoading} className="bg-brand-primary hover:bg-brand-primary/90 w-36">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm Schedule'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};