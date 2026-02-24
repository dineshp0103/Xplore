export function DailyGoals() {
    return (
        <div className="bg-[#192633] rounded-xl border border-[#233648] flex flex-col">
            <div className="p-5 border-b border-[#233648] flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Daily Goals</h3>
                <span className="text-xs font-medium text-[#137fec] bg-[#137fec]/10 px-2 py-1 rounded">1/3 Done</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
                <GoalItem label="Complete Quiz: Python Lists" subLabel="Completed" completed />
                <GoalItem label="Watch 2 Video Lessons" subLabel="+50 XP Reward" />
                <GoalItem label="Update Profile Bio" subLabel="Profile Strength" />
            </div>
        </div>
    );
}

function GoalItem({ label, subLabel, completed }: { label: string; subLabel: string; completed?: boolean }) {
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            <input
                type="checkbox"
                defaultChecked={completed}
                className="mt-1 size-5 rounded border-[#233648] bg-[#111a22] text-[#137fec] focus:ring-offset-[#192633] focus:ring-[#137fec]"
            />
            <div className="flex flex-col">
                <span className={`text-sm transition-colors ${completed ? 'text-[#92adc9] line-through group-hover:text-white' : 'text-white group-hover:text-[#137fec]'}`}>
                    {label}
                </span>
                <span className={`text-[10px] font-medium ${completed ? 'text-green-500' : 'text-[#92adc9]'}`}>
                    {subLabel}
                </span>
            </div>
        </label>
    );
}
