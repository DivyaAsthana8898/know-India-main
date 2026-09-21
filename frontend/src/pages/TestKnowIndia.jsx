import React, { useEffect, useState } from "react";
import { states, uts } from '@aryanjsx/knowindia';

const TestKnowIndia = () => {
  const [statesData, setStatesData] = useState(null);
  const [utsData, setUtsData] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  
  useEffect(() => {
    try {
      const allStates = states();
      const allUTs = uts();
      
      console.log("TestKnowIndia - All states:", allStates);
      console.log("TestKnowIndia - All UTs:", allUTs);
      
      setStatesData(allStates);
      setUtsData(allUTs);
      
      // Test with a specific state
      if (allStates.WB) {
        console.log("TestKnowIndia - West Bengal data:", allStates.WB);
        setSelectedState(allStates.WB);
      }
    } catch (error) {
      console.error("Error loading knowindia data:", error);
    }
  }, []);
  
  if (!statesData || !utsData) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-4">Testing knowindia Package</h1>
        <p>Loading data...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Testing knowindia Package</h1>
      
      {selectedState && (
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">{selectedState.name}</h2>
          <p><strong>Capital:</strong> {selectedState.capital}</p>
          <p><strong>Area:</strong> {selectedState.area}</p>
          <p><strong>Population:</strong> {selectedState.population}</p>
          <p><strong>Languages:</strong> {selectedState.officialLanguages.join(", ")}</p>
          <p><strong>Famous For:</strong> {selectedState.famousFor.join(", ")}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">States</h2>
          <ul className="space-y-2">
            {Object.keys(statesData).map(code => (
              <li key={code} className="p-2 border rounded hover:bg-gray-100">
                <strong>{code}:</strong> {statesData[code].name}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Union Territories</h2>
          <ul className="space-y-2">
            {Object.keys(utsData).map(code => (
              <li key={code} className="p-2 border rounded hover:bg-gray-100">
                <strong>{code}:</strong> {utsData[code].name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestKnowIndia; 