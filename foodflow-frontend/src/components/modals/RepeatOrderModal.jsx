import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { enUS } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export const RepeatOrderModal = ({ isOpen, onClose, onSave, openingTime, closingTime }) => {
    // Stanja forme
    const [repeatType, setRepeatType] = useState('WEEKLY');
    const [dayOfWeek, setDayOfWeek] = useState(null);
    const [dayOfMonth, setDayOfMonth] = useState(null);
    const [deliveryTime, setDeliveryTime] = useState('');
    const [ends, setEnds] = useState('never');
    const [repeatUntil, setRepeatUntil] = useState(null); // Sada je tipa Date


    const [timeError, setTimeError] = useState('');


    const handleRepeatTypeChange = (type) => {
        setRepeatType(type);
        // Resetuj suprotno stanje da sprečiš slanje nevalidnih podataka
        if (type === 'WEEKLY') {
            setDayOfMonth(null);
        } else {
            setDayOfWeek(null);
        }
    };


    const validateTime = (selectedTime) => {
        if (openingTime && closingTime && selectedTime) {
            if (selectedTime < openingTime || selectedTime > closingTime) {
                setTimeError(`Time must be between ${openingTime} and ${closingTime}.`);
                return false;
            }
        }
        setTimeError('');
        return true;
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setDeliveryTime(newTime);
        validateTime(newTime);
    };

    const handleSave = () => {
        // --- VALIDACIJA ---
        const isTimeValid = validateTime(deliveryTime);

        if (!deliveryTime || !isTimeValid) return toast.error("Please select a delivery time.");
        if (repeatType === 'WEEKLY' && !dayOfWeek) return toast.error("Please select a day of the week.");
        if (repeatType === 'MONTHLY' && !dayOfMonth) return toast.error("Please select a day of the month.");
        if (ends === 'specific' && !repeatUntil) return toast.error("Please select an end date.");
        
        const repeatData = {
            repeatType,
            deliveryTime,
            repeatUntil: ends === 'specific' ? format(repeatUntil, 'yyyy-MM-dd') : null,
            dayOfWeek: repeatType === 'WEEKLY' ? dayOfWeek : null,
            dayOfMonth: repeatType === 'MONTHLY' ? dayOfMonth : null
        };
        
        onSave(repeatData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Repeat Order Settings</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex gap-2">

                        <Button variant={repeatType === 'WEEKLY' ? 'default' : 'outline'} onClick={() => handleRepeatTypeChange('WEEKLY')} className="w-full">Weekly</Button>
                        <Button variant={repeatType === 'MONTHLY' ? 'default' : 'outline'} onClick={() => handleRepeatTypeChange('MONTHLY')} className="w-full">Monthly</Button>                    </div>

                    {repeatType === 'WEEKLY' && (
                        <div>
                            <Label>Repeat on:</Label>
                            <RadioGroup onValueChange={setDayOfWeek} className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day, i) => (
                                    <div key={day} className="flex items-center space-x-2">
                                        <RadioGroupItem value={day} id={`day-${i}`} />
                                        <Label htmlFor={`day-${i}`}>{day.substring(0,3)}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )}
                    
                    {repeatType === 'MONTHLY' && (
                        <div>
                           <Label>Repeat on:</Label>
                           <RadioGroup onValueChange={setDayOfMonth} className="space-y-2 mt-2">
                               <div className="flex items-center space-x-2"><RadioGroupItem value="FIRST" id="dom-1" /><Label htmlFor="dom-1">1st of the month</Label></div>
                               <div className="flex items-center space-x-2"><RadioGroupItem value="FIFTEENTH" id="dom-15" /><Label htmlFor="dom-15">15th of the month</Label></div>
                               <div className="flex items-center space-x-2"><RadioGroupItem value="LAST" id="dom-last" /><Label htmlFor="dom-last">Last day of the month</Label></div>
                           </RadioGroup>
                        </div>
                    )}

                    <div>
                        <Label>
                            At Time: {openingTime && closingTime && `(Open ${openingTime}-${closingTime})`}
                        </Label>
                        <Input 
                            type="time" 
                            value={deliveryTime} 
                            onChange={handleTimeChange} // Koristi novi handler
                            min={openingTime}
                            max={closingTime}
                        />
                          {timeError && <p className="text-red-500 text-sm mt-1">{timeError}</p>}
                    </div>

                    <div>
                        <Label>Ends:</Label>
                        <RadioGroup onValueChange={setEnds} defaultValue="never" className="space-y-2 mt-2">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="never" id="ends-never" /><Label htmlFor="ends-never">Never</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="specific" id="ends-specific" /><Label htmlFor="ends-specific">On a specific date</Label></div>
                        </RadioGroup>
                        {ends === 'specific' && (
                            // === KORIŠĆENJE CALENDAR KOMPONENTE ===
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal mt-2", !repeatUntil && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {repeatUntil ? format(repeatUntil, "PPP", { locale: enUS }) : <span>Pick an end date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={repeatUntil}
                                        onSelect={setRepeatUntil}
                                        initialFocus
                                        fromDate={new Date()} // Ne može se izabrati datum u prošlosti
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave} disabled={!!timeError}>Save Repetition</Button>
                    </div>
                </DialogFooter>

                    <p className="text-xs text-gray-500 text-left mt-2">
                    Note: The first order will be placed immediately, and will then repeat based on these settings.
                    </p>

            </DialogContent>
        </Dialog>
    );
};