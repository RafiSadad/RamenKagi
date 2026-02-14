"use client";

import { useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import MenuGrid from "@/components/MenuGrid";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import WelcomePage from "@/components/WelcomePage";
import { motion, AnimatePresence } from "framer-motion";
import type { Category, MenuItem, Banner, WelcomePage as WelcomePageData } from "@/types/menu";

interface HomeClientProps {
  categories: Category[];
  menuItems: MenuItem[];
  banners: Banner[];
  welcome: WelcomePageData | null;
}

export default function HomeClient({
  categories,
  menuItems,
  banners,
  welcome,
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
            <WelcomePage welcome={welcome} onEnter={() => setShowWelcome(false)} />
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
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.15,
                  },
                },
              }}
              className="contents"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
                <HeroBanner banners={banners} />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
                <MenuGrid categories={categories} menuItems={menuItems} />
              </motion.div>
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
