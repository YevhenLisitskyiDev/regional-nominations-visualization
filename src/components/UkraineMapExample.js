import React, { useState } from 'react';
import * as d3 from 'd3';
import ChoroplethMap from './ChoroplethMap';

const UkraineMapExample = () => {
  // Sample data for different scenarios
  const [selectedDataset, setSelectedDataset] = useState('population');
  
  // Sample regional data - replace with your actual data
  const sampleData = {
    population: {
      'Kyiv': 2884000,
      'Kharkiv': 2675000,
      'Odesa': 2380000,
      'Dnipropetrovs\'k': 3206000,
      'Donets\'k': 4131000,
      'Zaporizhzhya': 1705000,
      'L\'viv': 2512000,
      'Kyyiv': 1781000, // Note: sometimes Kiev is spelled differently in the data
      'Mykolayiv': 1119000,
      'Luhans\'k': 2151000,
      'Vinnytsya': 1560000,
      'Kherson': 1037000,
      'Volyn': 1041000,
      'Rivne': 1152000,
      'Sumy': 1068000,
      'Ternopil': 1049000,
      'Cherkasy': 1206000,
      'Chernihiv': 1007000,
      'Chernivtsi': 904000,
      'Crimea': 1965000,
      'Ivano-Frankivs\'k': 1378000,
      'Kirovohrad': 956000,
      'Poltava': 1422000,
      'Khmelnytsky': 1264000,
      'Cherkasy': 1206000,
      'Zhytomyr': 1220000,
      'Zakarpattya': 1259000
    },
    
    nominations: {
      'Kyiv': 45,
      'Kharkiv': 32,
      'Odesa': 28,
      'Dnipropetrovs\'k': 22,
      'L\'viv': 38,
      'Zaporizhzhya': 15,
      'Donets\'k': 18,
      'Mykolayiv': 12,
      'Chernihiv': 8,
      'Sumy': 10,
      'Vinnytsya': 14,
      'Ternopil': 9,
      'Rivne': 11,
      'Volyn': 7,
      'Khmelnytsky': 13,
      'Cherkasy': 16,
      'Poltava': 19,
      'Kirovohrad': 6,
      'Chernivtsi': 8,
      'Ivano-Frankivs\'k': 17,
      'Zakarpattya': 12,
      'Zhytomyr': 9,
      'Kherson': 11,
      'Luhans\'k': 5
    },
    
    economic: {
      'Kyiv': 95,
      'Kharkiv': 78,
      'Dnipropetrovs\'k': 82,
      'Odesa': 75,
      'L\'viv': 72,
      'Zaporizhzhya': 68,
      'Donets\'k': 45, // Lower due to conflict
      'Luhans\'k': 30, // Lower due to conflict
      'Poltava': 70,
      'Vinnytsya': 65,
      'Khmelnytsky': 62,
      'Cherkasy': 63,
      'Mykolayiv': 61,
      'Sumy': 59,
      'Chernihiv': 57,
      'Rivne': 58,
      'Volyn': 56,
      'Ternopil': 55,
      'Ivano-Frankivs\'k': 64,
      'Chernivtsi': 52,
      'Zakarpattya': 48,
      'Zhytomyr': 54,
      'Kirovohrad': 53,
      'Kherson': 50,
      'Crimea': 35 // Lower due to situation
    }
  };

  // Different color scales for different data types
  const colorScales = {
    population: d3.scaleSequential(d3.interpolateBlues),
    nominations: d3.scaleSequential(d3.interpolateReds),
    economic: d3.scaleSequential(d3.interpolateGreens)
  };

  // Handle region click
  const handleRegionClick = (regionName, value, properties) => {
    alert(`Clicked on ${regionName}\nValue: ${value || 'No data'}\nType: ${properties.ENGTYPE_1}`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Ukraine Regions Choropleth Map</h1>
      
      {/* Dataset selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
          Select Dataset:
        </label>
        <select 
          value={selectedDataset} 
          onChange={(e) => setSelectedDataset(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="population">Population (thousands)</option>
          <option value="nominations">Nominations Count</option>
          <option value="economic">Economic Index</option>
        </select>
      </div>

      {/* Map component */}
      <ChoroplethMap
        regionData={sampleData[selectedDataset]}
        colorScale={colorScales[selectedDataset]}
        width={900}
        height={600}
        onRegionClick={handleRegionClick}
        tooltipEnabled={true}
        title={`Ukraine - ${selectedDataset.charAt(0).toUpperCase() + selectedDataset.slice(1)} Data`}
      />

      {/* Legend */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <h3>How to Use This Map:</h3>
        <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li><strong>Hover</strong> over regions to see detailed information</li>
          <li><strong>Click</strong> on regions to trigger custom actions</li>
          <li><strong>Switch datasets</strong> using the dropdown above</li>
          <li>Regions with <strong>no data</strong> appear in light gray</li>
          <li>Color intensity represents the <strong>relative value</strong> within the dataset</li>
        </ul>
      </div>

      {/* Data preview */}
      <div style={{ marginTop: '30px' }}>
        <h3>Current Dataset Preview:</h3>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <pre>{JSON.stringify(sampleData[selectedDataset], null, 2)}</pre>
        </div>
      </div>

      {/* Available regions info */}
      <div style={{ marginTop: '30px' }}>
        <h3>Available Region Names in Dataset:</h3>
        <p style={{ fontSize: '14px', color: '#666' }}>
          The following region names are recognized by the map (use these exact names as keys in your regionData object):
        </p>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Major regions include:</strong> Cherkasy, Chernihiv, Chernivtsi, Crimea, Dnipropetrovs'k, 
          Donets'k, Ivano-Frankivs'k, Kharkiv, Kherson, Khmelnytsky, Kirovohrad, Kyiv, Kyyiv, L'viv, 
          Luhans'k, Mykolayiv, Odesa, Poltava, Rivne, Sumy, Ternopil, Vinnytsya, Volyn, Zakarpattya, 
          Zaporizhzhya, Zhytomyr
          <br/><br/>
          <em>Note: Some regions may have different spelling variations in the source data. 
          Check browser console for exact region names if your data doesn't display correctly.</em>
        </div>
      </div>
    </div>
  );
};

export default UkraineMapExample; 