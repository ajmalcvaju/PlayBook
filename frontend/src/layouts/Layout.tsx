import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import TurfSidePanel from '../components/TurfSidePanel';
import AdminSidePanel from '../components/AdminSidebar';

interface Props {
  children: React.ReactNode;
  user?: string;
  page?:string
}

const Layout = ({ children, user,page }: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user}/>
      <Hero user={user} />
      {(page === 'authentication' && user === 'turf') && (<div className="container mx-auto py-10 flex-1">{children}</div>)}
      {(user === "turf"&&page!=='authentication')&& (<div className="flex flex-1"><TurfSidePanel page={page}/><div className="flex-1">{children}</div></div>)}
      {(page === 'authentication' && user === 'admin') && (<div className="mx-autoflex-1">{children}</div>)}
      {(user === "admin"&&page!=='authentication') && (<div className="flex flex-1"><AdminSidePanel page={page}/><div className="flex-1">{children}</div></div>)}
      {(user === "user"&&page=='authentication') && (<div className="my-auto flex-1">{children}</div>)}
      {(user === "user"&&page!=='authentication') && (<div className="flex-1">{children}</div>)}
      
      
      <Footer />
    </div>
  );
};

export default Layout;
