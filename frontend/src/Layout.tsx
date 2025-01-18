import React from 'react';
import naviDisplay from './naviDisplay';

interface LayoutProps {
    user: string;
    page: string;
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, page, children }) => {
    return (
        <div>
            <header className="bg-gray-800 text-white p-4">
                <h1 className="text-lg">{`Welcome ${user} - ${page}`}</h1>
            </header>
            <naviDisplay />
            <main className="p-4">{children}</main>
        </div>
    );
};

export default Layout;
