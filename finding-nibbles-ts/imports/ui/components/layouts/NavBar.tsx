import React from "react";
import { Link } from "react-router-dom";

const bunnyIcon = "/images/bunnyIcon.png";

export const NavBar = () => {
    return (
        <nav className="flex justify-between items-center p-4 bg-[#c17030] text-white font-['Comic_Sans_MS',cursive,sans-serif]">
            <div className="flex items-center gap-2.5 pr-2.5">
                <Link to="/" className="text-white no-underline text-xl font-bold flex items-center">
                    <img
                        src={bunnyIcon}
                        alt="Bunny Icon"
                        className="w-[30px] h-[30px] object-contain"
                    />
                    <span>Finding Nibbles</span>
                </Link>
            </div>
            <ul className="list-none flex gap-4 m-0 p-0">
                <li className="inline">
                    <Link to="/login" className="no-underline text-white text-base transition-colors hover:text-[#fdf2e3]">Login</Link>
                </li>
                <li className="inline">
                    <Link to="/register" className="no-underline text-white text-base transition-colors hover:text-[#fdf2e3]">Register</Link>
                </li>
                <li className="inline">
                    <Link to="/map" className="no-underline text-white text-base transition-colors hover:text-[#fdf2e3]">Map</Link>
                </li>
            </ul>
        </nav>
    );
};
