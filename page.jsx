"use client";
import React, { useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import Image from "next/image";

const products = [
  "Mozzarella Sticks",
  "Hash Brown Bites",
  "Cheese Triangles",
  "Chili Cheese Nuggets",
];

export default function Page() {
  const [activeProduct, setActiveProduct] = useState(products[0]);
  const [inputs, setInputs] = useState({
    pricePerPortion: "",
    piecesPerPortion: "",
    piecesPerKg: "",
    costPerKg: "",
    wrappingCost: "",
  });
  const pdfRef = useRef();

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const calc = () => {
    const { pricePerPortion, piecesPerPortion, piecesPerKg, costPerKg, wrappingCost } = inputs;
    const portionCost = (piecesPerPortion / piecesPerKg) * costPerKg;
    const totalCost = portionCost + parseFloat(wrappingCost || 0);
    const profit = pricePerPortion - totalCost;
    const margin = pricePerPortion > 0 ? profit / pricePerPortion : 0;
    return { portionCost, totalCost, profit, margin };
  };

  const { portionCost, totalCost, profit, margin } = calc();

  const handleDownloadPDF = () => {
    const element = pdfRef.current;
    const opt = {
      margin: 0.5,
      filename: `${activeProduct.replace(/\s+/g, '_').toLowerCase()}_profit_report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-10">
      <div className="flex items-center mb-6">
        <Image src="/logo.png" alt="Farm Frites Logo" width={180} height={60} />
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {products.map((product) => (
          <button
            key={product}
            className={`px-4 py-2 rounded-xl ${
              activeProduct === product ? 'bg-[#83B13B] text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveProduct(product)}
          >
            {product}
          </button>
        ))}
      </div>

      <div ref={pdfRef} className="bg-gray-100 p-6 rounded-2xl shadow space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Price Per Portion (€)" name="pricePerPortion" value={inputs.pricePerPortion} onChange={handleChange} />
          <Input label="Pieces Per Portion" name="piecesPerPortion" value={inputs.piecesPerPortion} onChange={handleChange} />
          <Input label="Pieces Per KG" name="piecesPerKg" value={inputs.piecesPerKg} onChange={handleChange} />
          <Input label="Cost Per KG (€)" name="costPerKg" value={inputs.costPerKg} onChange={handleChange} />
          <Input label="Wrapping & Other Costs (€)" name="wrappingCost" value={inputs.wrappingCost} onChange={handleChange} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-base">
          <Result label="Portion Cost" value={`€ ${portionCost.toFixed(2)}`} />
          <Result label="Total Cost" value={`€ ${totalCost.toFixed(2)}`} />
          <Result label="Profit per Portion" value={`€ ${profit.toFixed(2)}`} highlight="#3A915D" />
          <Result label="Profit Margin" value={`${(margin * 100).toFixed(1)}%`} highlight="#DE7023" />
        </div>
      </div>

      <button onClick={handleDownloadPDF} className="mt-4 px-4 py-2 bg-[#83B13B] text-white rounded-xl">
        Download as PDF
      </button>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <input {...props} type="number" className="w-full p-2 rounded bg-white border border-gray-300" />
    </div>
  );
}

function Result({ label, value, highlight }) {
  return (
    <div className={`p-4 rounded-xl ${highlight ? `text-white` : ''}`} style={{ backgroundColor: highlight || '#e5e7eb' }}>
      <strong>{label}:</strong> {value}
    </div>
  );
}
