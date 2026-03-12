import { useState } from "react";
import InputStep from "./components/InputStep.jsx";
import PortfolioView from "./components/PortfolioView.jsx";

export default function App() {
  const [portfolio, setPortfolio] = useState(null);

  return portfolio
    ? <PortfolioView data={portfolio} onReset={() => setPortfolio(null)} />
    : <InputStep onGenerate={setPortfolio} />;
}
