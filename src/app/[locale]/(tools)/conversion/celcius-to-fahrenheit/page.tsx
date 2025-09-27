"use client"
import { Section } from "@/components/ui/Section";
import { useState } from "react";
import { convertTemp } from "./tempraturConverter";
import { useTranslations } from "next-intl";


export default function TemperatureConverter() {
  const [fahrenheit, setFahrenheit] = useState("");
  const [celsius, setCelsius] = useState("");
  
  const t = useTranslations("tools.conversion.CelciusToFahrenheit")

  // Handlers for input changes
  function handleFahrenheitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setFahrenheit(value);
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      setCelsius("");
      return;
    }
    
    setCelsius(convertTemp("FC", num).toFixed(2) + "°C");
  }

  function handleCelsiusChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCelsius(value);
    const num = parseFloat(value);
    if (isNaN(num)) {
      setFahrenheit("");
      return;
    }
    setFahrenheit(convertTemp("CF", num).toFixed(2) + "°F");
  }

  return (
    <div className="flex flex-col gap-6 pt-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-center">{t("title")}</h2>
      <div className="flex flex-row gap-4 justify-center items-center">
        <div className="flex flex-col items-center">
          <label className="text-sm mb-1" htmlFor="fahrenheit">{t("fahrenheit")}</label>
          <input
            id="fahrenheit"
            value={fahrenheit}
            onChange={handleFahrenheitChange}
            className="w-28 px-2 py-1 rounded border border-gray-300 text-center"
            placeholder="°F"
          />
        </div>
        <span className="text-xl font-bold">⇄</span>
        <div className="flex flex-col items-center">
          <label className="text-sm mb-1" htmlFor="celsius">{t("celcius")}</label>
          <input
            id="celsius"
            value={celsius}
            onChange={handleCelsiusChange}
            className="w-28 px-2 py-1 rounded border border-gray-300 text-center"
            placeholder="°C"
          />
        </div>
      </div>
      <Section variant="ghost">
        <h2 className="header-section-2">{t("description.title")}</h2>
        <p>
          {t("description.text")}
        </p>
      </Section>
    </div>
  );
}

