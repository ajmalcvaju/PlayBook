import React from "react";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import TurfSidePanel from "../components/TurfSidePanel";
import AdminSidePanel from "../components/AdminSidebar";

interface Props {
  children: React.ReactNode;
  user?: string;
  page?: string;
}

const Layout = ({ children, user, page }: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Conditionally Render Header, Hero, and Footer based on the user and page */}
      {(user === "turf" && page !== "authentication") ||
      (user === "admin" && page !== "authentication") ||
      (user === "user" && page !== "authentication") ? (
        <>
          {/* <Header user={user} /> */}
          <Hero user={user} />

          {/* Turf Panel */}
          {user === "turf" && page !== "authentication" && (
            <>
              <TurfSidePanel page={page as string} />
              <div className="flex-1">{children}</div>
            </>
          )}

          {/* Admin Panel */}
          {user === "admin" && page !== "authentication" && (
            <>
              <AdminSidePanel page={page as string} />
              <div className="flex-1">{children}</div>
            </>
          )}

          {/* User Content */}
          {user === "user" && page !== "authentication" && (
            
            <div className="flex-1">{children}</div>
          )}

          <Footer />
        </>
      ) : (
        // Authentication Page Content (for Turf, Admin, and User)
        <>
          {page === "authentication" && user === "turf" && (
            <div className="my-auto flex-1">{children}</div>
          )}
          {page === "authentication" && user === "admin" && (
            <div className="my-auto flex-1">{children}</div>
          )}
          {user === "user" && page === "authentication" && (
            <div className="my-auto flex-1">{children}</div>
          )}
        </>
      )}
    </div>
  );
};

export default Layout;
