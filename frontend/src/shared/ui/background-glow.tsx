"use client";

import { motion } from "framer-motion";

export const BackgroundGlow = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-white pointer-events-none">
      {/* Glow 1 */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[128px]"
      />
      {/* Glow 2 */}
      <motion.div
        animate={{
          x: [0, -150, 0],
          y: [0, 100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-purple-500/15 blur-[128px]"
      />
    </div>
  );
};
