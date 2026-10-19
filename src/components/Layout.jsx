import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store, rehydrateStore } from "../store/store";
import Header from "./Header";
import Footer from "./Footer";
import ToastStack from "./ToastStack";
import LoginPopup from "./LoginPopup";
import "../styles/global.css";

export default function Layout({ children }) {
  // After React hydration is done, pull persisted state from localStorage
  // into the Redux store. This runs only on the client (useEffect doesn't
  // fire during SSR), so the initial server-rendered HTML and the client's
  // first render use the same fallback values — no #418 mismatch.
  useEffect(() => {
    rehydrateStore();
  }, []);

  return (
    <Provider store={store}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <ToastStack />
      <LoginPopup />
    </Provider>
  );
}
