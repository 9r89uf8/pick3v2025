'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../store/store';


const Navbar = () => {
    const router = useRouter();
    const user = useStore((state) => state.user);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <nav className="bg-[#16242f] shadow-md">
            <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                    </div>

                    {/* Mobile menu button (currently not used) */}
                    {/*<div>*/}
                    {/*    <button*/}
                    {/*        onClick={handleMenuToggle}*/}
                    {/*        className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"*/}
                    {/*        aria-label="account of current user"*/}
                    {/*        aria-controls="menu-appbar"*/}
                    {/*        aria-haspopup="true"*/}
                    {/*    >*/}
                    {/*        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">*/}
                    {/*            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>*/}
                    {/*        </svg>*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;



