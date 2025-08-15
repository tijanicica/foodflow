import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addMinutes, setHours, setMinutes } from "date-fns";
import { enUS } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2, Repeat, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

//================================================================================
// POMOĆNE FUNKCIJE I KOMPONENTE
//================================================================================

const generateTimeSlots = (startStr, endStr, interval) => {
    const slots = [];
    if (!startStr || !endStr) return slots;
    let current = new Date();
    const [startHour, startMinute] = startStr.split(':').map(Number);
    const [endHour, endMinute] = endStr.split(':').map(Number);
    current = setHours(setMinutes(new Date(), startMinute), startHour);
    let end = setHours(setMinutes(new Date(), endMinute), endHour);
    while (current <= end) {
        slots.push(format(current, "HH:mm"));
        current = addMinutes(current, interval);
    }
    return slots;
};

const OptionPicker = ({ options, selected, onSelect, columns = 2 }) => (
    <div className={`grid grid-cols-${columns} gap-2`}>
        {options.map(({ value, label }) => (
            <Button key={value} variant={selected === value ? 'default' : 'outline'}
                onClick={() => onSelect(value)}
                className={`h-10 ${selected === value && 'bg-brand-primary hover:bg-brand-primary/90'}`}>
                {label}
            </Button>
        ))}
    </div>
);

//================================================================================
// GLAVNA KOMPONENTA MODALA
//================================================================================

export const RepeatOrderModal = ({ isOpen, onClose, onSave, openingTime, closingTime }) => {
    const [repeatType, setRepeatType] = useState('WEEKLY');
    const [dayOfWeek, setDayOfWeek] = useState(null);
    const [dayOfMonth, setDayOfMonth] = useState(null);
    const [deliveryTime, setDeliveryTime] = useState('');
    const [repeatUntil, setRepeatUntil] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setRepeatType('WEEKLY');
            setDayOfWeek(null);
            setDayOfMonth(null);
            setDeliveryTime('');
            setRepeatUntil(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    const allTimeSlots = useMemo(() => generateTimeSlots(openingTime, closingTime, 30), [openingTime, closingTime]);

    const handleSave = () => {
        if (!deliveryTime) return toast.error("Please select a delivery time.");
        if (repeatType === 'WEEKLY' && !dayOfWeek) return toast.error("Please select a day of the week.");
        if (repeatType === 'MONTHLY' && !dayOfMonth) return toast.error("Please select a day of the month.");
        
        setIsLoading(true);
        const repeatData = {
            repeatType,
            deliveryTime,
            repeatUntil: repeatUntil ? format(repeatUntil, 'yyyy-MM-dd') : null,
            dayOfWeek: repeatType === 'WEEKLY' ? dayOfWeek : null,
            dayOfMonth: repeatType === 'MONTHLY' ? dayOfMonth : null
        };
        
        onSave(repeatData);
        onClose();
    };

    const summaryText = useMemo(() => {
        if (!deliveryTime || (repeatType === 'WEEKLY' && !dayOfWeek) || (repeatType === 'MONTHLY' && !dayOfMonth)) return null;
        
        let frequency = '';
        if (repeatType === 'WEEKLY') {
            frequency = `every ${dayOfWeek.toLowerCase()}`;
        } else {
            const dayText = dayOfMonth.replace('_', ' ').toLowerCase();
            frequency = `on the ${dayText} of the month`;
        }
        
        const endDate = repeatUntil ? `until ${format(repeatUntil, "MMM d, yyyy")}` : 'indefinitely';
        return `Repeats ${frequency} at ${deliveryTime}, ${endDate}.`;
    }, [repeatType, dayOfWeek, dayOfMonth, deliveryTime, repeatUntil]);

    const weekDayOptions = [ { value: 'MONDAY', label: 'Mon' }, { value: 'TUESDAY', label: 'Tue' }, { value: 'WEDNESDAY', label: 'Wed' }, { value: 'THURSDAY', label: 'Thu' }, { value: 'FRIDAY', label: 'Fri' }, { value: 'SATURDAY', label: 'Sat' }, { value: 'SUNDAY', label: 'Sun' } ];
    const monthDayOptions = [ { value: 'FIRST', label: '1st' }, { value: 'FIFTEENTH', label: '15th' }, { value: 'LAST', label: 'Last' } ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2"><Repeat size={24}/> Set Up Repeating Order</DialogTitle>
                    <DialogDescription>
                        Automate your favorite orders. The first order is placed immediately.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-3">
                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-700">1. Frequency</Label>
                        <OptionPicker 
                            options={[{value: 'WEEKLY', label: 'Weekly'}, {value: 'MONTHLY', label: 'Monthly'}]}
                            selected={repeatType}
                            onSelect={(type) => { setRepeatType(type); setDayOfWeek(null); setDayOfMonth(null); }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-700">{repeatType === 'WEEKLY' ? '2. Day of the Week' : '2. Day of the Month'}</Label>
                        {repeatType === 'WEEKLY' ? (
                            <OptionPicker options={weekDayOptions} selected={dayOfWeek} onSelect={setDayOfWeek} columns={4}/>
                        ) : (
                            <OptionPicker options={monthDayOptions} selected={dayOfMonth} onSelect={setDayOfMonth} columns={3}/>
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-700">3. Delivery Time</Label>
                        <div className="border rounded-md p-2 max-h-32 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {allTimeSlots.length > 0 ? allTimeSlots.map(slot => (
                                <Button key={slot} variant={deliveryTime === slot ? 'default' : 'outline'} size="sm" onClick={() => setDeliveryTime(slot)} className={deliveryTime === slot ? 'bg-brand-primary' : ''}>{slot}</Button>
                            )) : <p className="col-span-full text-center text-sm text-gray-500 py-4">Restaurant hours not available.</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold text-gray-700">4. End Date (Optional)</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal h-10", !repeatUntil && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {repeatUntil ? format(repeatUntil, "PPP", { locale: enUS }) : <span>Never ends</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={repeatUntil} onSelect={setRepeatUntil} fromDate={new Date()} />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                
                {summaryText && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-brand-background-light p-3 rounded-lg text-center font-semibold text-brand-primary text-sm flex items-center justify-center gap-2">
                        <CheckCircle size={16} className="text-green-600"/> {summaryText}
                    </motion.div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-brand-primary hover:bg-brand-primary/90 w-36">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Save Repetition'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};