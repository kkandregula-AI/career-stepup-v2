import { useState } from "react";
import InputStep from "./components/InputStep.jsx";
import PortfolioView from "./components/PortfolioView.jsx";

export default function App() {
  const [portfolio, setPortfolio] = useState(null);
  const [filename, setFilename] = useState("portfolio");

  const handleGenerate = ({ data, filename }) => {
    setPortfolio(data);
    setFilename(filename);
  };

  return portfolio
    ? <PortfolioView data={portfolio} filename={filename} onReset={() => setPortfolio(null)} />
    : <InputStep onGenerate={handleGenerate} />;
}
