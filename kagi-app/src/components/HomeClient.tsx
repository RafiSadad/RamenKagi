"use client";

import { useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import MenuGrid from "@/components/MenuGrid";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import WelcomePage from "@/components/WelcomePage";
import { motion, AnimatePresence } from "framer-motion";
import type { Category, MenuItem, Banner } from "@/types/menu";

interface HomeClientProps {
  categories: Category[];
  menuItems: MenuItem[];
  banners: Banner[];
}

export default function HomeClient({
  categories,
  menuItems,
  banners,
}: HomeClientProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <motion.div
            key="welcome-wrapper"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomePage onEnter={() => setShowWelcome(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showWelcome && (
          <motion.div
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Navbar onCartClick={() => setCartOpen(true)} />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <HeroBanner banners={banners} />
              <MenuGrid categories={categories} menuItems={menuItems} />
            </motion.div>

            <CartDrawer
              open={cartOpen}
              onOpenChange={setCartOpen}
              categories={categories}
              menuItems={menuItems}
            />

            <div className="h-20" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
