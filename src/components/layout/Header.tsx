import Link from 'next/link';

export function Header() {
    return (
        <header className="flex items-center justify-between border-b border-[#233648] px-6 py-4 bg-[#111a22]/50 backdrop-blur-md sticky top-0 z-20 w-full">
            {/* Mobile Menu Button (Visible only on small screens) */}
            <button className="md:hidden text-white mr-4">
                <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Search */}
            <div className="hidden md:flex w-full max-w-md items-center h-10 rounded-lg bg-[#192633] border border-[#233648] focus-within:border-[#137fec]/50 transition-colors">
                <div className="text-[#92adc9] flex items-center justify-center pl-3">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                    className="w-full bg-transparent border-none text-white placeholder-[#92adc9] text-sm focus:ring-0 px-3 focus:outline-none"
                    placeholder="Search for courses, skills, or mentors..."
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Streak */}
                <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#192633] border border-[#233648] rounded-lg text-orange-400 hover:bg-[#233648] transition">
                    <span className="material-symbols-outlined text-[20px] fill-current">local_fire_department</span>
                    <span className="text-sm font-bold text-white">12 Days</span>
                </button>

                {/* Notifications */}
                <button className="relative flex items-center justify-center size-10 rounded-lg text-[#92adc9] hover:text-white hover:bg-[#233648] transition">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-[#111a22]"></span>
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-2 border-l border-[#233648]">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full size-9 border-2 border-[#233648]"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDgiEr17hSxitEf1VYahYbev_JoTQC7d_M9AKBb9dhlysj7tZyei5QZnpZ-fz3_Nza5vSzDmtTqolc_fra651ybD-sH3TxP-rHuJU1EPLewCYSryRiHfNmxt728Hgp6c0RuPmnhji2ns1pIB3CIg13m_vk2En8zfMOxP6wInixPZE8O7a7liT3sQ4Xp_K_jdsaEjb36nsqJYQJ1uN5qqAaMX9XNa0-1wYKg_rVt3VaxhwCebXGUGT7ixWJXn8yf4H_ppszitR_duJY")' }}
                    ></div>
                    <div className="hidden lg:block">
                        <p className="text-sm font-medium text-white leading-none">Alex M.</p>
                        <p className="text-xs text-[#92adc9] mt-1">Student</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
