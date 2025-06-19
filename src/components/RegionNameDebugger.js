import React, { useEffect, useState } from 'react';
import * as topojson from 'topojson-client';

const RegionNameDebugger = () => {
  const [regionNames, setRegionNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRegionNames = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://raw.githubusercontent.com/org-scn-design-studio-community/sdkcommunitymaps/refs/heads/master/geojson/Europe/Ukraine-regions.json');
        const topoData = await response.json();
        
        // Convert TopoJSON to GeoJSON and extract region names
        const ukraineRegions = topojson.feature(topoData, topoData.objects.UKR_adm1);
        
        const names = ukraineRegions.features.map(feature => ({
          name: feature.properties.NAME_1,
          id: feature.properties.ID_1,
          type: feature.properties.ENGTYPE_1,
          varname: feature.properties.VARNAME_1
        }));
        
        // Sort alphabetically
        names.sort((a, b) => a.name.localeCompare(b.name));
        
        setRegionNames(names);
        setError(null);
      } catch (err) {
        setError('Failed to load region data');
        console.error('Error loading TopoJSON:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRegionNames();
  }, []);

  if (loading) {
    return <div>Loading region names...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <h3>Ukraine Region Names Reference</h3>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Use these exact region names as keys in your regionData object:
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '10px',
        marginTop: '15px'
      }}>
        {regionNames.map((region, index) => (
          <div 
            key={index}
            style={{
              padding: '10px',
              backgroundColor: 'white',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              fontSize: '13px'
            }}
          >
            <strong style={{ color: '#007bff' }}>{region.name}</strong>
            <br />
            <span style={{ color: '#6c757d' }}>
              Type: {region.type}
            </span>
            {region.varname && (
              <>
                <br />
                <span style={{ color: '#28a745', fontSize: '11px' }}>
                  Variants: {region.varname}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '4px' }}>
        <h4>JavaScript Object Template:</h4>
        <pre style={{ 
          fontSize: '11px', 
          backgroundColor: '#f8f9fa', 
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
{`const regionData = {
${regionNames.map(region => `  '${region.name}': 0, // ${region.type}`).join('\n')}
};`}
        </pre>
      </div>
    </div>
  );
};

export default RegionNameDebugger; 