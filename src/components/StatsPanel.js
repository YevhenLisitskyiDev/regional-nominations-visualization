import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const StatsPanel = ({ data, currentNomination, currentStory, currentSubsection }) => {
  const chartRef = useRef();

  // Log data and state changes
  useEffect(() => {
    console.log('📈 StatsPanel update:', {
      dataLength: data.length,
      currentNomination,
      currentStory,
      currentSubsection,
      hasData: data.length > 0,
      sampleData: data.length > 0 ? data[0] : null
    });
  }, [data, currentNomination, currentStory, currentSubsection]);

  const getStatsTitle = (nomination) => {
    // Special title for intro section
    if (currentStory === 0) {
      return 'Загальна статистика зарахування';
    }
    
    // No special subject stats titles needed anymore
    
    switch (nomination) {
      case 'Highest_Average_Score':
        return 'Academic Performance Distribution';
      case 'subject_excellence':
        return 'Subject Excellence Analysis';
      case 'age_demographics':
        return 'Age Distribution Statistics';
      case 'gender_balance':
        return 'Gender Balance Overview';
      case 'regional_patterns':
        return 'Regional Variation Patterns';
      default:
        return 'Educational Overview Statistics';
    }
  };

  const renderAcademicChart = () => {
    console.log('📊 Rendering Academic Chart:', {
      dataLength: data.length,
      currentNomination,
      sampleScores: data.slice(0, 3).map(d => ({ region: d.Region, score: d.Average_Score }))
    });

    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    if (!data.length) {
      console.log('❌ No data available for Academic Chart');
      return;
    }

    const width = 280;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Filter valid data and parse scores
    const validData = data.filter(d => {
      const score = parseFloat(d.Average_Score);
      return d && d.Average_Score && !isNaN(score) && score > 0;
    });

    if (!validData.length) {
      console.log('❌ No valid data for Academic Chart after filtering');
      return;
    }

    console.log('✅ Academic Chart valid data:', {
      validDataLength: validData.length,
      scoreRange: d3.extent(validData.map(d => parseFloat(d.Average_Score))),
      sampleValidData: validData.slice(0, 2).map(d => ({ region: d.Region, score: d.Average_Score }))
    });

    // Create scales
    const scores = validData.map(d => parseFloat(d.Average_Score));
    const xScale = d3.scaleLinear()
      .domain(d3.extent(scores))
      .range([0, chartWidth]);

    const bins = d3.histogram()
      .value(d => parseFloat(d.Average_Score))
      .domain(xScale.domain())
      .thresholds(10)(validData);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 1])
      .range([chartHeight, 0]);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Draw bars
    g.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.x0 || 0))
      .attr('y', d => yScale(d.length || 0))
      .attr('width', d => {
        const width = xScale(d.x1 || 0) - xScale(d.x0 || 0) - 1;
        return Math.max(0, isNaN(width) ? 0 : width);
      })
      .attr('height', d => chartHeight - yScale(d.length || 0))
      .attr('fill', '#4299e1')
      .attr('opacity', 0.7);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5));

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5));

    // Add labels
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 35)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Average Score');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -25)
      .attr('x', -chartHeight / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Regions');
  };

  const renderGenderChart = () => {
    console.log('👫 Rendering Gender Chart:', {
      dataLength: data.length,
      currentNomination,
      sampleGenderData: data.slice(0, 3).map(d => ({ 
        region: d.Region, 
        female: d.Female_Percentage, 
        male: d.Male_Percentage 
      }))
    });

    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    if (!data.length) {
      console.log('❌ No data available for Gender Chart');
      return;
    }

    const width = 280;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 20;

    // Filter valid data first
    const validData = data.filter(d => d && d.Female_Percentage && d.Male_Percentage);
    if (!validData.length) {
      console.log('❌ No valid gender data after filtering');
      return;
    }

    console.log('✅ Gender Chart valid data:', {
      validDataLength: validData.length,
      avgFemalePreview: d3.mean(validData.slice(0, 5), d => parseFloat(d.Female_Percentage) || 0),
      avgMalePreview: d3.mean(validData.slice(0, 5), d => parseFloat(d.Male_Percentage) || 0)
    });

    const genderData = validData.map(d => ({
      region: d.Region,
      female: parseFloat(d.Female_Percentage) || 0,
      male: parseFloat(d.Male_Percentage) || 0
    }));

    // Calculate averages
    const avgFemale = d3.mean(genderData, d => d.female) || 0;
    const avgMale = d3.mean(genderData, d => d.male) || 0;

    const pieData = [
      { label: 'Female Average', value: avgFemale, color: '#d53f8c' },
      { label: 'Male Average', value: avgMale, color: '#3182ce' }
    ];

    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const arcs = g.selectAll('arc')
      .data(pie(pieData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('opacity', 0.8);

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .text(d => `${(d.data.value || 0).toFixed(1)}%`);

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${radius + 10}, ${-radius / 2})`);

    pieData.forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', item.color);

      legendItem.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '11px')
        .text(item.label);
    });
  };

  const renderAgeChart = () => {
    console.log('👶 Rendering Age Chart:', {
      dataLength: data.length,
      currentNomination,
      sampleAgeData: data.slice(0, 3).map(d => ({ 
        region: d.Region, 
        under18: d.Under_18_Percentage, 
        over30: d.Over_30_Percentage,
        medianAge: d.Median_Age
      }))
    });

    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    if (!data.length) {
      console.log('❌ No data available for Age Chart');
      return;
    }

    const width = 280;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Prepare age data
    const validData = data.filter(d => d && d.Region && d.Under_18_Percentage && d.Over_30_Percentage);
    if (!validData.length) {
      console.log('❌ No valid age data after filtering');
      return;
    }

    console.log('✅ Age Chart valid data:', {
      validDataLength: validData.length,
      sampleValidAgeData: validData.slice(0, 3).map(d => ({
        region: d.Region,
        under18: d.Under_18_Percentage,
        over30: d.Over_30_Percentage
      }))
    });

    const ageData = validData.map(d => ({
      region: d.Region.split(' ')[0], // Shorter names
      under18: parseFloat(d.Under_18_Percentage) || 0,
      over30: parseFloat(d.Over_30_Percentage) || 0,
      median: parseFloat(d.Median_Age) || 0
    })).slice(0, 8); // Show top 8 regions

    const xScale = d3.scaleBand()
      .domain(ageData.map(d => d.region))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(ageData, d => Math.max(d.under18, d.over30))])
      .range([chartHeight, 0]);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Draw under 18 bars
    g.selectAll('.bar-under18')
      .data(ageData)
      .enter()
      .append('rect')
      .attr('class', 'bar-under18')
      .attr('x', d => xScale(d.region))
      .attr('y', d => yScale(d.under18))
      .attr('width', xScale.bandwidth() / 2)
      .attr('height', d => chartHeight - yScale(d.under18))
      .attr('fill', '#38b2ac')
      .attr('opacity', 0.8);

    // Draw over 30 bars
    g.selectAll('.bar-over30')
      .data(ageData)
      .enter()
      .append('rect')
      .attr('class', 'bar-over30')
      .attr('x', d => xScale(d.region) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.over30))
      .attr('width', xScale.bandwidth() / 2)
      .attr('height', d => chartHeight - yScale(d.over30))
      .attr('fill', '#ed8936')
      .attr('opacity', 0.8);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5));

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${chartWidth - 80}, 10)`);

    const legendData = [
      { color: '#38b2ac', label: 'Under 18' },
      { color: '#ed8936', label: 'Over 30' }
    ];

    legendData.forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 18})`);

      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', item.color);

      legendItem.append('text')
        .attr('x', 16)
        .attr('y', 9)
        .style('font-size', '10px')
        .text(item.label);
    });
  };

  const renderIntroStats = () => {
    console.log('🏠 Rendering Intro Stats (simplified):', {
      dataLength: data.length,
      currentStory
    });

    if (!data.length) {
      console.log('❌ No data available for Intro Stats');
      return null;
    }

    // Filter out invalid data and provide safe defaults
    const validData = data.filter(d => d && d.Total_Students && d.Average_Score && d.Region);
    
    if (!validData.length) {
      console.log('❌ No valid data for Intro Stats after filtering');
      return (
        <div className="stats-content intro-stats">
          <div className="stat-item intro-stat">
            <span className="stat-value">Завантаження...</span>
            <span className="stat-label">Дані</span>
          </div>
        </div>
      );
    }

    console.log('✅ Intro Stats valid data:', {
      validDataLength: validData.length,
      sampleValidData: validData.slice(0, 2).map(d => ({
        region: d.Region,
        students: d.Total_Students,
        avgScore: d.Average_Score
      }))
    });

    const totalStudents = validData.reduce((sum, d) => {
      const students = parseInt(d.Total_Students) || 0;
      return sum + students;
    }, 0);

    const avgScore = d3.mean(validData, d => {
      const score = parseFloat(d.Average_Score);
      return isNaN(score) ? null : score;
    }) || 0;

    return (
      <div className="stats-content intro-stats">
        <div className="stat-item intro-stat">
          <span className="stat-value">{totalStudents.toLocaleString()}</span>
          <span className="stat-label">Загальна кількість зарахованих</span>
        </div>
        <div className="stat-item intro-stat">
          <span className="stat-value">{avgScore && avgScore > 0 ? avgScore.toFixed(1) : 'N/A'}</span>
          <span className="stat-label">Середній бал по Україні</span>
        </div>
      </div>
    );
  };

  const renderDefaultStats = () => {
    console.log('📊 Rendering Default Stats:', {
      dataLength: data.length,
      currentNomination,
      currentStory
    });

    if (!data.length) {
      console.log('❌ No data available for Default Stats');
      return null;
    }

    // Filter out invalid data and provide safe defaults
    const validData = data.filter(d => d && d.Total_Students && d.Average_Score && d.Region);
    
    if (!validData.length) {
      console.log('❌ No valid data for Default Stats after filtering');
      return (
        <div className="stats-content">
          <div className="stat-item">
            <span className="stat-value">Loading...</span>
            <span className="stat-label">Data</span>
          </div>
        </div>
      );
    }

    console.log('✅ Default Stats valid data:', {
      validDataLength: validData.length,
      sampleValidData: validData.slice(0, 2).map(d => ({
        region: d.Region,
        students: d.Total_Students,
        avgScore: d.Average_Score,
        nominations: d.Nomination_Count
      }))
    });

    const totalStudents = validData.reduce((sum, d) => {
      const students = parseInt(d.Total_Students) || 0;
      return sum + students;
    }, 0);

    const avgScore = d3.mean(validData, d => {
      const score = parseFloat(d.Average_Score);
      return isNaN(score) ? null : score;
    }) || 0;

    const topRegion = validData.reduce((max, d) => {
      const currentScore = parseFloat(d.Average_Score) || 0;
      const maxScore = parseFloat(max.Average_Score) || 0;
      return currentScore > maxScore ? d : max;
    }, validData[0]);

    const totalNominations = validData.reduce((sum, d) => {
      const nominations = parseInt(d.Nomination_Count) || 0;
      return sum + nominations;
    }, 0);

    return (
      <div className="stats-content">
        <div className="stat-item">
          <span className="stat-value">{totalStudents.toLocaleString()}</span>
          <span className="stat-label">Total Students</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{avgScore && avgScore > 0 ? avgScore.toFixed(1) : 'N/A'}</span>
          <span className="stat-label">Average Score</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{topRegion && topRegion.Region ? topRegion.Region.split(' ')[0] : 'N/A'}</span>
          <span className="stat-label">Top Region</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{totalNominations}</span>
          <span className="stat-label">Total Nominations</span>
        </div>
      </div>
    );
  };

  const renderSubjectStats = () => {
    console.log('📚 Rendering Combined Subject Stats (Best & Worst):');

    if (!data.length) {
      console.log('❌ No data available for Subject Stats');
      return null;
    }

    // Parse nominations from the data to extract subject-specific winners/losers
    const subjectData = {};
    const subjects = ['Географія', 'Біологія', 'Фізика', 'Математика', 'Іноземна мова', 'Хімія', 'Історія України'];
    
    data.forEach(row => {
      if (row.Nominations_Won && row.Nominations_Won !== 'None') {
        const nominations = row.Nominations_Won.split(', ');
        nominations.forEach(nomination => {
          subjects.forEach(subject => {
            // Check for both highest and lowest
            if (nomination.includes('Highest_' + subject)) {
              if (!subjectData[subject]) subjectData[subject] = {};
              subjectData[subject].best = {
                region: row.Region,
                score: parseFloat(row.Average_Score) || 0
              };
            }
            if (nomination.includes('Lowest_' + subject)) {
              if (!subjectData[subject]) subjectData[subject] = {};
              subjectData[subject].worst = {
                region: row.Region,
                score: parseFloat(row.Average_Score) || 0
              };
            }
          });
        });
      }
    });

    console.log('✅ Combined subject data extracted:', subjectData);

    // If no subject-specific data found, show general stats
    if (Object.keys(subjectData).length === 0) {
      return (
        <div className="stats-content">
          <div className="stat-item">
            <span className="stat-value">Немає даних</span>
            <span className="stat-label">Предметні номінації</span>
          </div>
        </div>
      );
    }

    return (
      <div className="stats-content subject-stats">
        <div className="subject-stats-grid">
          {Object.entries(subjectData).map(([subject, info]) => (
            <div key={subject} className="subject-stat-item">
              <span className="subject-name">{subject}</span>
              {info.best && (
                <div className="region-info best">
                  <span className="region-label">Найкращий:</span>
                  <span className="region-name">{info.best.region.replace(' обл.', '').replace('м. ', '')}</span>
                </div>
              )}
              {info.worst && (
                <div className="region-info worst">
                  <span className="region-label">Найгірший:</span>
                  <span className="region-name">{info.worst.region.replace(' обл.', '').replace('м. ', '')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    console.log('🔀 Chart rendering decision:', {
      hasData: data.length > 0,
      dataLength: data.length,
      currentNomination,
      willRender: data.length > 0 ? 'YES' : 'NO'
    });

    if (!data.length) {
      console.log('⏸️ Skipping chart render - no data');
      return;
    }

    switch (currentNomination) {
      case 'Highest_Average_Score':
        console.log('📈 Triggering Academic Chart (Highest_Average_Score)');
        renderAcademicChart();
        break;
      case 'regional_patterns':
        console.log('📈 Triggering Academic Chart (regional_patterns)');
        renderAcademicChart();
        break;
      case 'gender_balance':
        console.log('👫 Triggering Gender Chart');
        renderGenderChart();
        break;
      case 'age_demographics':
        console.log('👶 Triggering Age Chart');
        renderAgeChart();
        break;
      default:
        console.log('🧹 Clearing chart - default state (no nomination)');
        // Clear chart for default stats
        if (chartRef.current) {
          d3.select(chartRef.current).selectAll('*').remove();
        }
        break;
    }
  }, [data, currentNomination]);

  return (
    <div className={`stats-container ${currentStory === 0 ? 'intro-stats-container' : ''}`}>
      <div className="stats-title">{getStatsTitle(currentNomination)}</div>
      
      {currentStory === 0 ? (
        // Special intro stats - only show total students and average score
        renderIntroStats()
      ) : (
        // This should never render since StatsPanel is only shown for first section
        renderDefaultStats()
      )}
    </div>
  );
};

export default StatsPanel; 