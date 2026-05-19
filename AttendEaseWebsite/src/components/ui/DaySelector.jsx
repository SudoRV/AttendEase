import { useState } from "react";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

export default function DaySelector({ selectedDay, setSelectedDay, classes }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const currentDay = selectedDay || classes?.day;

    return (
        <div className="inline-flex items-center h-12 transition-all duration-300 ease-in-out">
            
            {!isExpanded ? (
                <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center gap-1.5 p-0 bg-transparent border-none outline-none text-xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100 cursor-pointer group"
                >
                    <span>{currentDay}</span>
                    <FiChevronRight 
                        size={18} 
                        className="text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-transform duration-200 group-hover:translate-x-0.5" 
                    />
                </button>
            ) : (
                <div className="flex items-center gap-1 bg-neutral-100/80 dark:bg-neutral-900/60 p-1 rounded-xl border border-neutral-200/50 dark:border-neutral-800/40 backdrop-blur-sm overflow-x-auto no-scrollbar max-w-full transition-all duration-200 ease-out scale-100 opacity-100">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(false)}
                        className="p-2 border-none bg-indigo-500 text-neutral-100 hover:bg-indigo-600 rounded-lg transition-colors mr-1"
                        title="Collapse options"
                    >
                        <FiChevronLeft size={16} />
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {days.map((day) => {
                            const isActive = currentDay === day;
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => {
                                        setSelectedDay(day);
                                        setIsExpanded(false);
                                    }}
                                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 whitespace-nowrap select-none border-none
                                        ${isActive 
                                            ? 'bg-neutral-950 dark:bg-neutral-50 text-white dark:text-neutral-950 shadow-sm scale-[1.02]' 
                                            : 'text-neutral-500 bg-white dark:bg-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-neutral-800/40'
                                        }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

        </div>
    );
}