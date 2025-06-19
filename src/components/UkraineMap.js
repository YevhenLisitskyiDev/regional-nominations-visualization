import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import ukraineTopoData from '../Ukraine-regions.json';

const UkraineMap = ({ 
  width = 900, 
  height = 600, 
  showRegionNames = true,
  onRegionClick = null,
  regionData = {},
  originalData = null,
  colorScale = d3.scaleSequential(d3.interpolateBlues),
  title = "Ukraine Regions Map",
  metricName = "Значення",
  metricUnits = ""
}) => {
  const svgRef = useRef();

  // Mapping from English TopoJSON names to Ukrainian names
  const englishToUkrainian = {
    'Luhans\'k': 'Луганська область',
    'Poltava': 'Полтавська область',
    'Kiev City': 'м. Київ',
    'Rivne': 'Рівненська область',
    'L\'viv': 'Львівська область',
    'Donets\'k': 'Донецька область',
    'Vinnytsya': 'Вінницька область',
    'Odessa': 'Одеська область',
    'Sumy': 'Сумська область',
    'Kharkiv': 'Харківська область',
    'Dnipropetrovs\'k': 'Дніпропетровська область',
    'Volyn': 'Волинська область',
    'Kherson': 'Херсонська область',
    'Kirovohrad': 'Кіровоградська область',
    'Mykolayiv': 'Миколаївська область',
    'Chernivtsi': 'Чернівецька область',
    'Zaporizhzhya': 'Запорізька область',
    'Cherkasy': 'Черкаська область',
    'Transcarpathia': 'Закарпатська область',
    'Ternopil\'': 'Тернопільська область',
    'Zhytomyr': 'Житомирська область',
    'Khmel\'nyts\'kyy': 'Хмельницька область',
    'Chernihiv': 'Чернігівська область',
    'Ivano-Frankivs\'k': 'Івано-Франківська область',
    'Kiev': 'Київська область',
    'Crimea': 'Автономна Республіка Крим',
    'Sevastopol\'': 'м. Севастополь'
  };

  // Short Ukrainian names for display on map
  const englishToUkrainianShort = {
    'Luhans\'k': 'Луганська',
    'Poltava': 'Полтавська',
    'Kiev City': 'Київ',
    'Rivne': 'Рівненська',
    'L\'viv': 'Львівська', 
    'Donets\'k': 'Донецька',
    'Vinnytsya': 'Вінницька',
    'Odessa': 'Одеська',
    'Sumy': 'Сумська',
    'Kharkiv': 'Харківська',
    'Dnipropetrovs\'k': 'Дніпро',
    'Volyn': 'Волинська',
    'Kherson': 'Херсонська',
    'Kirovohrad': 'Кіровоград',
    'Mykolayiv': 'Миколаївська',
    'Chernivtsi': 'Чернівецька',
    'Zaporizhzhya': 'Запорізька',
    'Cherkasy': 'Черкаська',
    'Transcarpathia': 'Закарпатська',
    'Ternopil\'': 'Тернопільська',
    'Zhytomyr': 'Житомирська',
    'Khmel\'nyts\'kyy': 'Хмельницька',
    'Chernihiv': 'Чернігівська',
    'Ivano-Frankivs\'k': 'Івано-Франк.',
    'Kiev': 'Київська',
    'Crimea': 'Крим',
    'Sevastopol\'': 'Севастополь'
  };

  useEffect(() => {
    if (!ukraineTopoData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Convert TopoJSON to GeoJSON
    const ukraineRegions = topojson.feature(ukraineTopoData, ukraineTopoData.objects.UKR_adm1);

    // Set up projection and path
    const projection = d3.geoMercator()
      .fitSize([width, height], ukraineRegions);
    
    const pathGenerator = d3.geoPath().projection(projection);

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "ukraine-map-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "14px")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("max-width", "300px");

    // Set up color scale domain based on data values
    const dataValues = Object.values(regionData).filter(val => val !== null && val !== undefined);
    let minValue = 0, maxValue = 100;
    if (dataValues.length > 0) {
      [minValue, maxValue] = d3.extent(dataValues);
      colorScale.domain([minValue, maxValue]);
    }

    // For legend, use original data values if available
    const originalValues = originalData ? Object.values(originalData).filter(val => val !== null && val !== undefined) : [];
    let legendMinValue = minValue, legendMaxValue = maxValue;
    if (originalValues.length > 0) {
      [legendMinValue, legendMaxValue] = d3.extent(originalValues);
    }

    // Create main group
    const mapGroup = svg.append("g");

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
        return "#e6f3ff"; // Light blue for regions without data
      })
      .attr("stroke", "#2c5aa0")
      .attr("stroke-width", 1.5)
      .style("cursor", onRegionClick ? "pointer" : "default")
      .on("mouseover", function(event, d) {
        const englishName = d.properties.NAME_1;
        const ukrainianName = englishToUkrainian[englishName] || englishName;
        // Use original data for tooltip if available, otherwise use regionData
        const value = originalData && originalData[englishName] !== undefined 
          ? originalData[englishName] 
          : regionData[englishName];
        const engType = d.properties.ENGTYPE_1;
        const hasc = d.properties.HASC_1;
        
        let displayValue;
        
        if (value !== undefined && value !== null) {
          // Format value based on metric type - simple formatting
          if (metricName.includes('відсоток') || metricName.includes('Percentage')) {
            displayValue = `${value.toFixed(1)}%`;
          } else if (metricName.includes('бал') || metricName.includes('Score')) {
            displayValue = value.toFixed(2);
          } else if (metricName.includes('вік') || metricName.includes('Age')) {
            displayValue = value.toFixed(1);
          } else if (metricName.includes('кількість') || metricName.includes('Count')) {
            displayValue = Math.round(value).toLocaleString();
          } else {
            displayValue = value.toLocaleString();
          }
          
          // Add units if they are provided and not already included (like %)
          if (metricUnits && metricUnits.trim() !== "" && !displayValue.includes('%')) {
            displayValue = `${displayValue} ${metricUnits}`;
          }
        } else {
          displayValue = "Немає даних";
        }
        
        tooltip.style("visibility", "visible")
          .html(`
            <strong>${ukrainianName}</strong><br/>
            ${metricName}: ${displayValue}
          `);
        
        // Enhanced hover effect - make region darker/more saturated
        const currentFill = d3.select(this).attr("fill");
        const currentColor = d3.color(currentFill);
        
        if (currentColor) {
          // Make the color darker and more saturated on hover
          const hoverColor = currentColor.darker(0.3).toString();
          d3.select(this)
            .transition()
            .duration(200)
            .attr("fill", hoverColor)
            .attr("stroke-width", 3)
            .attr("stroke", "#1a365d");
        } else {
          d3.select(this)
            .attr("stroke-width", 3)
            .attr("stroke", "#1a365d");
        }
      })
      .on("mousemove", function(event) {
        tooltip.style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function(event, d) {
        tooltip.style("visibility", "hidden");
        
        // Restore original color
        const englishName = d.properties.NAME_1;
        const value = regionData[englishName];
        let originalFill;
        
        if (value !== undefined && value !== null) {
          originalFill = colorScale(value);
        } else {
          originalFill = "#e6f3ff"; // Light blue for regions without data
        }
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", originalFill)
          .attr("stroke-width", 1.5)
          .attr("stroke", "#2c5aa0");
      })
      .on("click", function(event, d) {
        if (onRegionClick) {
          const regionName = d.properties.NAME_1;
          const value = regionData[regionName];
          onRegionClick(regionName, value, d.properties);
        }
      });

    // Add region names if enabled
    if (showRegionNames) {
      mapGroup.selectAll(".region-label")
        .data(ukraineRegions.features)
        .enter()
        .append("text")
        .attr("class", "region-label")
        .attr("x", d => pathGenerator.centroid(d)[0])
        .attr("y", d => pathGenerator.centroid(d)[1])
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("fill", "#1a365d")
        .style("pointer-events", "none")
        .style("text-shadow", "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white")
        .text(d => {
          const englishName = d.properties.NAME_1;
          const ukrainianName = englishToUkrainianShort[englishName] || englishName;
          // Return Ukrainian name, truncate if too long
          if (ukrainianName.length > 12) {
            return ukrainianName.substring(0, 10) + '...';
          }
          return ukrainianName;
        });
    }

    // Add color legend (only if we have data)
    if (dataValues.length > 0) {
      const legendWidth = 20;
      const legendHeight = 200;
      const legendX = width + 20; // Move legend outside the map with gap
      const legendY = 60;
      
      // Create gradient definition
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "colorLegendGradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");
      
      // Add color stops to gradient
      const numStops = 10;
      for (let i = 0; i <= numStops; i++) {
        const ratio = i / numStops;
        const value = minValue + (maxValue - minValue) * ratio;
        gradient.append("stop")
          .attr("offset", `${ratio * 100}%`)
          .attr("stop-color", colorScale(value));
      }
      
      // Add legend rectangle
      svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#colorLegendGradient)")
        .style("stroke", "#333")
        .style("stroke-width", 1);
      
      // Add legend title with text wrapping for long titles
      const titleWords = metricName.split(' ');
      const maxLineLength = 15; // Maximum characters per line
      let lines = [];
      let currentLine = '';
      
      titleWords.forEach(word => {
        if ((currentLine + word).length <= maxLineLength) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);
      
      // If still too long, truncate
      if (lines.length > 2) {
        lines = [lines[0], lines[1].slice(0, 12) + '...'];
      }
      
      lines.forEach((line, index) => {
        svg.append("text")
          .attr("x", legendX + legendWidth/2)
          .attr("y", legendY - 25 + (index * 12))
          .attr("text-anchor", "middle")
          .style("font-size", "11px")
          .style("font-weight", "bold")
          .style("fill", "#333")
          .text(line);
      });
      
      // Format value function for legend
      const formatLegendValue = (val) => {
        let formatted;
        if (metricName.includes('відсоток') || metricName.includes('Percentage')) {
          formatted = `${val.toFixed(1)}%`;
        } else if (metricName.includes('кількість') || metricName.includes('Total_Students') || val >= 1000) {
          // Format large numbers with thousands separator
          formatted = Math.round(val).toLocaleString();
        } else {
          formatted = val.toFixed(1);
        }
        
        if (metricUnits && metricUnits.trim() !== "" && !formatted.includes('%')) {
          formatted = `${formatted} ${metricUnits}`;
        }
        
        return formatted;
      };
      
      // Add min value label (use original values for display)
      svg.append("text")
        .attr("x", legendX + legendWidth + 5)
        .attr("y", legendY + legendHeight - 5)
        .style("font-size", "11px")
        .style("fill", "#666")
        .text(formatLegendValue(legendMinValue));
      
      // Add max value label (use original values for display)
      svg.append("text")
        .attr("x", legendX + legendWidth + 5)
        .attr("y", legendY + 15)
        .style("font-size", "11px")
        .style("fill", "#666")
        .text(formatLegendValue(legendMaxValue));
      
      // Add middle value label (use original values for display)
      const midValue = (legendMinValue + legendMaxValue) / 2;
      svg.append("text")
        .attr("x", legendX + legendWidth + 5)
        .attr("y", legendY + legendHeight/2 + 5)
        .style("font-size", "11px")
        .style("fill", "#666")
        .text(formatLegendValue(midValue));
    }

    // Cleanup tooltip on component unmount
    return () => {
      tooltip.remove();
    };

  }, [regionData, colorScale, width, height, onRegionClick, showRegionNames, title]);

  return (
    <div style={{ 
      width: '100%', 
      height: 'auto', 
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <svg 
        ref={svgRef} 
        width={width + 100} // Add space for external legend
        height={height}
        style={{ 
          backgroundColor: 'white',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
};

export default UkraineMap; 