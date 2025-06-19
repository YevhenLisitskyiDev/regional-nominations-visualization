import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import ukraineTopoData from '../Ukraine-regions.json';

const ChoroplethMap = ({ 
  regionData = {}, 
  colorScale = d3.scaleSequential(d3.interpolateBlues),
  width = 800, 
  height = 600,
  onRegionClick = null,
  tooltipEnabled = true,
  title = "Ukraine Regions Map"
}) => {
  const svgRef = useRef();
  const [topoData, setTopoData] = useState(ukraineTopoData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Render map
  useEffect(() => {
    if (!topoData || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Convert TopoJSON to GeoJSON
    const ukraineRegions = topojson.feature(topoData, topoData.objects.UKR_adm1);

    // Set up projection and path
    const projection = d3.geoMercator()
      .fitSize([width, height], ukraineRegions);
    
    const pathGenerator = d3.geoPath().projection(projection);

    // Create tooltip if enabled
    let tooltip;
    if (tooltipEnabled) {
      tooltip = d3.select("body").append("div")
        .attr("class", "map-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000");
    }

    // Set up color scale domain based on data values
    const dataValues = Object.values(regionData).filter(val => val !== null && val !== undefined);
    if (dataValues.length > 0) {
      colorScale.domain(d3.extent(dataValues));
    }

    // Create main group
    const mapGroup = svg.append("g");

    // Add title
    if (title) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .text(title);
    }

    // Draw regions
    mapGroup.selectAll("path")
      .data(ukraineRegions.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator)
      .attr("fill", d => {
        const regionName = d.properties.NAME_1;
        const value = regionData[regionName];
        if (value !== undefined && value !== null) {
          return colorScale(value);
        }
        return "#f0f0f0"; // Default color for regions without data
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("cursor", onRegionClick ? "pointer" : "default")
      .on("mouseover", function(event, d) {
        if (tooltipEnabled) {
          const regionName = d.properties.NAME_1;
          const value = regionData[regionName];
          const displayValue = value !== undefined && value !== null ? value : "No data";
          
          tooltip.style("visibility", "visible")
            .html(`<strong>${regionName}</strong><br/>Value: ${displayValue}`);
          
          d3.select(this)
            .attr("stroke-width", 2)
            .attr("stroke", "#333");
        }
      })
      .on("mousemove", function(event) {
        if (tooltipEnabled) {
          tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        }
      })
      .on("mouseout", function() {
        if (tooltipEnabled) {
          tooltip.style("visibility", "hidden");
          d3.select(this)
            .attr("stroke-width", 1)
            .attr("stroke", "#fff");
        }
      })
      .on("click", function(event, d) {
        if (onRegionClick) {
          const regionName = d.properties.NAME_1;
          const value = regionData[regionName];
          onRegionClick(regionName, value, d.properties);
        }
      });

    // Cleanup tooltip on component unmount
    return () => {
      if (tooltip) {
        tooltip.remove();
      }
    };

  }, [topoData, regionData, colorScale, width, height, onRegionClick, tooltipEnabled, title, loading]);

  if (loading) {
    return (
      <div style={{ 
        width: '100%', 
        height: height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}>
        <div>Loading map data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#fff5f5',
        border: '1px solid #ffccc7',
        borderRadius: '4px',
        color: '#d4380d'
      }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 'auto', textAlign: 'center' }}>
      <svg 
        ref={svgRef} 
        width={width} 
        height={height}
        style={{ 
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: 'white'
        }}
      />
    </div>
  );
};

export default ChoroplethMap; 