import { AnimatePresence, motion } from "framer-motion";
import { useLocation, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FlightsPage } from "./pages/FlightsPage";
import { PredictPage } from "./pages/PredictPage";

const pageTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.25 },
};

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--sky-bg)] text-[var(--sky-text)]">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div {...pageTransition}>
                <DashboardPage />
              </motion.div>
            }
          />
          <Route
            path="/predict"
            element={
              <motion.div {...pageTransition}>
                <PredictPage />
              </motion.div>
            }
          />
          <Route
            path="/analytics"
            element={
              <motion.div {...pageTransition}>
                <AnalyticsPage />
              </motion.div>
            }
          />
          <Route
            path="/flights"
            element={
              <motion.div {...pageTransition}>
                <FlightsPage />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
