import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import * as d3 from 'd3';
import ReactMarkdown from 'react-markdown';
import UkraineMap from './components/UkraineMap';
import StatsPanel from './components/StatsPanel';
import './App.css';
import UkraineMapExample from './components/UkraineMapExample';
import RegionNameDebugger from './components/RegionNameDebugger';

function App() {
  const [data, setData] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentSubsection, setCurrentSubsection] = useState(0);
  const [isInSubsectionMode, setIsInSubsectionMode] = useState(false);
  const [showChoroplethDemo, setShowChoroplethDemo] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isChapterTransitioning, setIsChapterTransitioning] = useState(false);
  const [isMapTransitioning, setIsMapTransitioning] = useState(false);
  
  // Refs for navigation
  const totalSections = useRef(0);
  const sectionMap = useRef([]);

  // Comprehensive story structure based on ALL dataset nominations
  const storyStructure = [
    {
      id: 'intro',
      title: 'Зарахування бакалаврів по регіонах України 2024',
      content: `Дослідіть географію зарахування бакалаврів у 25 українських регіонах. 
      Цей аналіз показує, куди зараховувалися 185 472 студенти-бакалаври у 2024 році 
      та які категорії абітурієнтів обирали заклади вищої освіти в кожному регіоні.`,
      mapConfig: { 
        metric: 'Total_Students', 
        colorScheme: 'interpolateBlues',
        title: 'Кількість зарахованих бакалаврів по регіонах'
      },
      sections: []
    },

    {
      id: 'score-results',
      title: '1. Академічна успішність зарахованих',
      content: 'Аналіз академічних показників студентів, які зараховувалися до закладів різних регіонів',
      mapConfig: { 
        metric: 'Average_Score', 
        colorScheme: 'interpolateBlues',
        title: 'Академічні показники зарахованих студентів'
      },
      sections: [
        {
          id: 'average-score',
          title: 'Середній бал зарахованих',
          content: `### 📊 Середні бали зарахованих по регіонах

**🏆 Найвищий середній бал зарахованих:**
- **Харківська область** — 157,52 балів (заклади регіону мають високі вимоги до вступу)

**📉 Найнижчий середній бал зарахованих:**
- **Кіровоградська область** — 141,8 балів (заклади регіону більш доступні для абітурієнтів з різними балами)

**📏 Різниця між регіонами:**
- **15,72 балів** показує різноманітність освітніх можливостей по країні`,
          mapConfig: { 
            metric: 'Average_Score', 
            colorScheme: 'interpolateBlues',
            title: 'Середній бал зарахованих по регіонах'
          }
        },
        {
          id: 'most-near-perfect',
          title: 'Зарахування високобальників',
          content: `### 📊 Розподіл високобальників по регіонах

**🏆 Найбільша кількість за абсолютними числами:**
- **Київ** — понад 1,200 студентів
- **Харків** — 340 студентів  
- **Львів** — 280 студентів

**📈 Найкращі пропорції високобальників:**
- **Харківська область** — 4,26%
- **Запорізька область** — 3,8%
- **Дніпропетровська область** — 3,5%

**🇺🇦 Середній показник по Україні:** близько 3,2% від усіх зарахованих

**💡 Особливості:** Великі міста лідирують за кількістю, але менші регіони часто мають кращі пропорції через селективність закладів`,
          mapConfig: { 
            metric: 'Near_Perfect_Count', 
            colorScheme: 'interpolateBlues',
            title: 'Кількість зарахованих з майже ідеальними балами'
          }
        },
        {
          id: 'score-spread',
          title: 'Різноманітність зарахованих за балами',
          content: `### 📈 Різноманітність балів зарахованих

**📊 Найбільша різноманітність зарахованих:**
- **Донецька область** — 19,9 стандартного відхилення (заклади мають широкий діапазон вимог до вступу)

**🎯 Найбільш однорідні за балами:**
- **Вінницька область** — 14,19 стандартного відхилення (заклади мають схожі вимоги до абітурієнтів)

**💡 Висновок:**
- Це відображає різні освітні стратегії регіонів: від селективних до інклюзивних підходів`,
          mapConfig: { 
            metric: 'Std_Deviation', 
            colorScheme: 'interpolateBlues',
            title: 'Різноманітність балів зарахованих студентів'
          }
        }
      ]
    },
    {
      id: 'age-demographics',
      title: '2. Вікові характеристики зарахованих',
      content: 'Аналіз вікового складу студентів, які зараховувалися до закладів різних регіонів',
      mapConfig: { 
        metric: 'Median_Age', 
        colorScheme: 'interpolateBlues',
        title: 'Віковий склад зарахованих студентів'
      },
            sections: [
        {
          id: 'age-analysis',
          title: 'Віковий склад зарахованих',
          content: `### 🎂 Віковий склад зарахованих студентів

**👶 Наймолодший зарахований:**
- **Київ** — 13 років (столичні заклади приймають найталановитіших молодих абітурієнтів)

**👴 Найстарший зарахований:**
- **Запорізька область** — 75 років (регіон відкритий для освіти дорослих)

**📊 Медіанний вік зарахованих:**
- **Найвищий:** Луганська область (26 років) — сюди частіше зараховуються зрілі студенти
- **Найнижчий:** Полтавська область (17 років) — регіон приваблює молодь

`,
          mapConfig: { 
            metric: 'Median_Age', 
            colorScheme: 'interpolateBlues',
            title: 'Медіанний вік зарахованих студентів'
          }
        },
        {
          id: 'below-18-percentage',
          title: 'Зарахування молоді до 18 років',
          content: `### 👶 Зарахування молоді до 18 років

**📈 Найвища пропорція молоді до 18 років:**
- **Львівська область** — **69,69%** (близько 14,400 молодих студентів)

**📉 Найнижча пропорція молоді:**
- **Херсонська область** — **20,90%** (переважно зрілі абітурієнти)

**🇺🇦 Середній показник по Україні:**
- Близько **50%** зарахованих є неповнолітніми

**🏆 За абсолютними числами:**
- **Київ** лідирує (29,680+ молодих), але пропорційно менше ніж Львів (**64,16%**)`,
          mapConfig: { 
            metric: 'Under_18_Count', 
            colorScheme: 'interpolateBlues',
            title: 'Кількість студентів до 18 років по регіонах'
          }
        },
        {
          id: 'above-30-percentage',
          title: 'Зарахування дорослих понад 30 років',
          content: `### 👨‍💼 Зарахування дорослих понад 30 років

**📈 Найвища пропорція дорослих понад 30 років:**
- **Луганська область** — **35,65%** (близько 287 дорослих студентів)

**📉 Найнижча пропорція дорослих:**
- **Чернівецька область** — **3,26%** (переважно молоді абітурієнти)

**🇺🇦 Середній показник по Україні:**
- Близько **10-15%** зарахованих є зрілого віку

**🏆 За абсолютними числами:**
- **Київ** лідирує (2,345+ дорослих), але пропорційно менше ніж Луганськ (**5,07%**)`,
          mapConfig: { 
            metric: 'Over_30_Count', 
            colorScheme: 'interpolateBlues',
            title: 'Кількість студентів понад 30 років по регіонах'
          }
        }
      ]
    },
    {
      id: 'gender-analysis',
      title: '3. Гендерний склад зарахованих',
      content: 'Аналіз гендерного розподілу студентів, які зараховувалися до закладів різних регіонів',
      mapConfig: { 
        metric: 'Gender_Balance_Score', 
        colorScheme: 'interpolateBlues',
        title: 'Гендерний склад зарахованих студентів'
      },
      sections: [
        {
          id: 'gender-participation',
          title: 'Зарахування жінок по регіонах',
          content: `### 👩‍🎓 Зарахування жінок по регіонах

**📈 Найвища пропорція жінок серед зарахованих:**
- **Закарпатська область** — 60,59% (близько 1,200 жінок)

**📉 Найнижча пропорція жінок:**
- **Херсонська область** — 25,87% (переважно зараховуються чоловіки)

**⚖️ Збалансоване зарахування:**
- **Одеська та Волинська області** — ~50% жінок

**🏆 За абсолютними числами:**
- **Київ** лідирує (17,000+ жінок), але пропорційно менше ніж Закарпаття`,
          mapConfig: { 
            metric: 'Female_Percentage', 
            colorScheme: 'interpolateBlues',
            title: 'Відсоток жінок серед зарахованих по регіонах'
          }
        },
        {
          id: 'male-participation',
          title: 'Зарахування чоловіків по регіонах',
          content: `### 👨‍🎓 Зарахування чоловіків по регіонах

**📈 Найвища пропорція чоловіків серед зарахованих:**
- **Херсонська область** — 74,13% (близько 850 чоловіків)

**📉 Найнижча пропорція чоловіків:**
- **Закарпатська область** — 39,41% (переважно зараховуються жінки)

**🇺🇦 Середній показник по Україні:**
- Приблизно 45% зарахованих є чоловіками

**🏆 За абсолютними числами:**
- **Київ** лідирує (13,000+ чоловіків), але пропорційно менше ніж Херсон`,
          mapConfig: { 
            metric: 'Male_Percentage', 
            colorScheme: 'interpolateBlues',
            title: 'Відсоток чоловіків серед зарахованих по регіонах'
          }
        },
        {
          id: 'gender-performance-gap',
          title: 'Гендерні розриви в балах зарахованих',
          content: `### ⚖️ Гендерні розриви в балах зарахованих

**👩‍🎓 Найбільший розрив на користь жінок:**
- **Львівська область** — +6,28 балів (жінки мають значно вищі бали)

**👨‍🎓 Найбільший розрив на користь чоловіків:**
- **Кіровоградська область** — +3,42 балів

**🎯 Найменший гендерний розрив:**
- **Чернігівська область** — 0,01 балів (практично однакові бали)

**📊 Загальна тенденція:**
- У більшості регіонів жінки зараховуються з вищими балами`,
          mapConfig: { 
            metric: 'Gender_Score_Gap', 
            colorScheme: 'interpolateBlues',
            title: 'Різниця в балах між жінками та чоловіками (зарахованими)'
          }
        },

      ]
    }
  ];

  // Load CSV data
  useEffect(() => {
    console.log('📊 Loading CSV data...');
    Papa.parse('/regional_nominations_dataset.csv', {
      download: true,
      header: true,
      complete: (results) => {
        console.log('✅ CSV data loaded:', {
          totalRows: results.data.length,
          sampleRow: results.data[0],
          columns: Object.keys(results.data[0] || {})
        });
        setData(results.data);
      },
      error: (error) => {
        console.error('❌ Error loading CSV:', error);
      }
    });
  }, []);

  // Calculate total sections and create navigation map
  useEffect(() => {
    const sections = [];
    // Only add main chapters to navigation dots, not subsections
    storyStructure.forEach((chapter, chapterIndex) => {
      sections.push({
        type: 'chapter',
        chapterIndex,
        chapterTitle: chapter.title,
        hasSubsections: chapter.sections && chapter.sections.length > 0,
        id: chapter.id
      });
    });
    
    sectionMap.current = sections;
    totalSections.current = sections.length;
    console.log('📋 Navigation map created (chapters only):', sections);
  }, [storyStructure]);

  // Get current section index (chapter level only)
  const getCurrentSectionIndex = () => {
    return currentChapter;
  };

  // Navigate to specific chapter with smooth transitions
  const navigateToChapter = (chapterIndex) => {
    if (chapterIndex < 0 || chapterIndex >= storyStructure.length || isChapterTransitioning) return;
    
    const chapter = storyStructure[chapterIndex];
    console.log('🎯 Navigating to chapter:', chapter);
    
    // Start transitions
    setIsChapterTransitioning(true);
    setIsMapTransitioning(true);
    
    // Wait for fade-out, then change content
    setTimeout(() => {
      setCurrentChapter(chapterIndex);
      
      // Check if chapter has subsections
      if (chapter.sections && chapter.sections.length > 0) {
        setIsInSubsectionMode(true);
        setCurrentSubsection(0);
      } else {
        setIsInSubsectionMode(false);
        setCurrentSubsection(0);
      }
      
      // Wait a bit, then fade in
      setTimeout(() => {
        setIsChapterTransitioning(false);
        setIsMapTransitioning(false);
      }, 100);
    }, 400);
  };

  // Navigation functions
  const goToPreviousSection = () => {
    if (isChapterTransitioning) return;
    
    if (isInSubsectionMode) {
      // Navigate within subsections
      if (currentSubsection > 0) {
        setCurrentSubsection(prev => prev - 1);
      } else {
        // Go to previous chapter
        if (currentChapter > 0) {
          navigateToChapter(currentChapter - 1);
        }
      }
    } else {
      // Navigate between chapters
      if (currentChapter > 0) {
        navigateToChapter(currentChapter - 1);
      }
    }
  };

  const goToNextSection = () => {
    if (isChapterTransitioning) return;
    
    if (isInSubsectionMode) {
      // Navigate within subsections
      const currentChapterData = storyStructure[currentChapter];
      const maxSubsections = currentChapterData?.sections?.length || 0;
      
      if (currentSubsection < maxSubsections - 1) {
        setCurrentSubsection(prev => prev + 1);
      } else {
        // Go to next chapter
        if (currentChapter < storyStructure.length - 1) {
          navigateToChapter(currentChapter + 1);
        }
      }
    } else {
      // Navigate between chapters
      if (currentChapter < storyStructure.length - 1) {
        navigateToChapter(currentChapter + 1);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          goToPreviousSection();
        break;
        case 'ArrowDown':
          e.preventDefault();
          goToNextSection();
        break;
      default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapter, currentSubsection, isInSubsectionMode, isChapterTransitioning]);

  // Initialize first section
  useEffect(() => {
    if (sectionMap.current.length > 0 && !isInitialized) {
      navigateToChapter(0);
      setIsInitialized(true);
      console.log('📍 App initialized with first chapter');
    }
  }, [sectionMap.current.length, isInitialized]);

  // Get current map configuration
  const getCurrentMapConfig = () => {
    // Default fallback configuration
    const defaultConfig = {
      metric: 'Total_Students',
      colorScheme: 'interpolateViridis',
      title: 'Ukrainian Regional Data'
    };

    // Check if we have valid storyStructure and currentChapter
    if (!storyStructure || storyStructure.length === 0) {
      console.warn('⚠️ No story structure available, using default config');
      return defaultConfig;
    }

    if (currentChapter < 0 || currentChapter >= storyStructure.length) {
      console.warn('⚠️ Invalid chapter index:', currentChapter, 'using default config');
      return defaultConfig;
    }

    const chapter = storyStructure[currentChapter];
    if (!chapter) {
      console.warn('⚠️ Chapter not found:', currentChapter, 'using default config');
      return defaultConfig;
    }
    
    // Handle subsection mode
    if (isInSubsectionMode && chapter.sections && chapter.sections.length > 0) {
      if (currentSubsection >= 0 && currentSubsection < chapter.sections.length) {
        const subsection = chapter.sections[currentSubsection];
        if (subsection && subsection.mapConfig) {
          return { ...defaultConfig, ...subsection.mapConfig };
        }
      }
    }
    
    // Return chapter config or default
    if (chapter.mapConfig) {
      return { ...defaultConfig, ...chapter.mapConfig };
    }
    
    console.warn('⚠️ No mapConfig found for chapter:', chapter.title, 'using default');
    return defaultConfig;
  };

  // Get current color scale
  const getCurrentColorScale = () => {
    const config = getCurrentMapConfig();
    
    // Validate config and colorScheme
    if (!config || !config.colorScheme) {
      console.warn('⚠️ No valid color scheme found, using default');
      return d3.scaleSequential(d3.interpolateViridis);
    }
    
    // Validate that the colorScheme exists in d3
    const interpolator = d3[config.colorScheme];
    if (!interpolator || typeof interpolator !== 'function') {
      console.warn('⚠️ Invalid color scheme:', config.colorScheme, 'using default');
      return d3.scaleSequential(d3.interpolateViridis);
    }
    
    try {
      return d3.scaleSequential(interpolator);
    } catch (error) {
      console.error('❌ Error creating color scale:', error);
      return d3.scaleSequential(d3.interpolateViridis);
    }
  };

  // Get Ukrainian metric name for gradient scale
  const getUkrainianMetricName = (metricKey) => {
    const config = getCurrentMapConfig();
    // If we have a title in the config, use it (it's already in Ukrainian)
    if (config.title) {
      return config.title.replace(' по регіонах', '').replace('Кількість ', '').replace('Відсоток ', '');
    }
    
    // Fallback translations for metric keys
    const translations = {
      'Total_Students': 'Кількість студентів',
      'Average_Score': 'Середній бал',
      'Under_18_Count': 'Студентів до 18 років',
      'Under_18_Percentage': 'Відсоток до 18 років',
      'Over_30_Count': 'Студентів понад 30 років',
      'Over_30_Percentage': 'Відсоток понад 30 років',
      'Near_Perfect_Count': 'Високобальників',
      'Median_Age': 'Медіанний вік',
      'Std_Deviation': 'Різноманітність балів',
      'Female_Percentage': 'Відсоток жінок',
      'Male_Percentage': 'Відсоток чоловіків',
      'Gender_Balance_Score': 'Гендерний баланс',
      'Gender_Score_Gap': 'Гендерний розрив у балах'
    };
    
    return translations[metricKey] || metricKey;
  };

  // Prepare map data using actual CSV columns
  const prepareMapData = () => {
    if (!data || data.length === 0) return { mapData: {}, originalData: {} };

    const mapData = {};
    const originalData = {};
    const config = getCurrentMapConfig();
    
    // Mapping between English TopoJSON names and Ukrainian CSV names
    const regionNameMapping = {
      'Луганська обл.': 'Luhans\'k',
      'Полтавська обл.': 'Poltava', 
      'м. Київ': 'Kiev City',
      'Рівненська обл.': 'Rivne',
      'Львівська обл.': 'L\'viv',
      'Донецька обл.': 'Donets\'k',
      'Вінницька обл.': 'Vinnytsya',
      'Одеська обл.': 'Odessa',
      'Сумська обл.': 'Sumy',
      'Харківська обл.': 'Kharkiv',
      'Дніпропетровська обл.': 'Dnipropetrovs\'k',
      'Волинська обл.': 'Volyn',
      'Херсонська обл.': 'Kherson',
      'Кіровоградська обл.': 'Kirovohrad',
      'Миколаївська обл.': 'Mykolayiv',
      'Чернівецька обл.': 'Chernivtsi',
      'Запорізька обл.': 'Zaporizhzhya',
      'Черкаська обл.': 'Cherkasy',
      'Закарпатська обл.': 'Transcarpathia',
      'Тернопільська обл.': 'Ternopil\'',
      'Житомирська обл.': 'Zhytomyr',
      'Хмельницька обл.': 'Khmel\'nyts\'kyy',
      'Чернігівська обл.': 'Chernihiv',
      'Івано-Франківська обл.': 'Ivano-Frankivs\'k',
      'Київська обл.': 'Kiev'
    };
    
    // Create a mapping function based on current metric
    data.forEach(row => {
      const ukrainianName = row.Region;
      const englishName = regionNameMapping[ukrainianName];
      
      if (englishName) {
      let value = 0;
      
        // Map config metric to actual CSV column
        switch (config.metric) {
          case 'Total_Students':
            value = parseInt(row.Total_Students) || 0;
            break;
          case 'Average_Score':
          value = parseFloat(row.Average_Score) || 0;
          break;
          case 'Near_Perfect_Percentage':
            value = parseFloat(row.Near_Perfect_Percentage) || 0;
            break;
          case 'Std_Deviation':
            value = parseFloat(row.Std_Deviation) || 0;
            break;
          case 'Nomination_Count':
          value = parseInt(row.Nomination_Count) || 0;
          break;
          case 'Min_Score':
            value = parseFloat(row.Min_Score) || 0;
            break;
          case 'Median_Age':
          value = parseFloat(row.Median_Age) || 0;
          break;
          case 'Min_Age':
            value = parseFloat(row.Min_Age) || 0;
            break;
          case 'Under_18_Percentage':
            value = parseFloat(row.Under_18_Percentage) || 0;
            break;
          case 'Under_18_Count':
            value = parseInt(row.Under_18_Count) || 0;
            break;
          case 'Over_30_Percentage':
            value = parseFloat(row.Over_30_Percentage) || 0;
            break;
          case 'Over_30_Count':
            value = parseInt(row.Over_30_Count) || 0;
            break;
          case 'Gender_Balance_Score':
            value = parseFloat(row.Gender_Balance_Score) || 0;
            break;
          case 'Female_Percentage':
          value = parseFloat(row.Female_Percentage) || 0;
          break;
          case 'Male_Percentage':
            // If Male_Percentage exists, use it; otherwise calculate as 100 - Female_Percentage
            if (row.Male_Percentage && row.Male_Percentage !== '') {
              value = parseFloat(row.Male_Percentage) || 0;
            } else if (row.Female_Percentage && row.Female_Percentage !== '') {
              value = 100 - (parseFloat(row.Female_Percentage) || 0);
            } else {
              value = 0;
            }
            break;
          case 'Gender_Score_Gap':
            value = parseFloat(row.Gender_Score_Gap) || 0;
            break;
          case 'Female_High_Perf_Percentage':
            value = parseFloat(row.Female_High_Perf_Percentage) || 0;
          break;
          case 'Male_High_Perf_Percentage':
            value = parseFloat(row.Male_High_Perf_Percentage) || 0;
            break;
          case 'Near_Perfect_Count':
            value = parseInt(row.Near_Perfect_Count) || 0;
            break;
          case 'Female_High_Perf_Count':
            value = parseInt(row.Female_High_Perf_Count) || 0;
            break;
          case 'Male_High_Perf_Count':
            value = parseInt(row.Male_High_Perf_Count) || 0;
          break;
        default:
            // Fallback to total students
          value = parseInt(row.Total_Students) || 0;
      }
      
        // Store original value for tooltips
        originalData[englishName] = value;
        
        // Apply logarithmic transformation for specific metrics to better show variation
        if ((currentChapter === 0 && config.metric === 'Total_Students' && value > 0) ||
            (config.metric === 'Under_18_Count' && value > 0)) {
          // Use log10 transformation, adding 1 to avoid log(0)
          mapData[englishName] = Math.log10(value + 1);
          console.log(`📊 Log transform for ${englishName}: ${value} → ${mapData[englishName].toFixed(2)}`);
        } else {
        mapData[englishName] = value;
        }
      }
    });

    console.log('🗺️ Map data prepared:', {
      metric: config.metric,
      dataCount: Object.keys(mapData).length,
      sampleData: Object.fromEntries(Object.entries(mapData).slice(0, 3)),
      sampleOriginal: Object.fromEntries(Object.entries(originalData).slice(0, 3)),
      isLogarithmic: (currentChapter === 0 && config.metric === 'Total_Students') || config.metric === 'Under_18_Count'
    });

    return { mapData, originalData };
  };

  // Navigation sidebar component
  const NavigationSidebar = () => {
    const currentIndex = getCurrentSectionIndex();
    const canGoUp = currentIndex > 0;
    const canGoDown = currentIndex < totalSections.current - 1;

    return (
      <div className="navigation-sidebar">
        {/* Up Arrow */}
        <button 
          className={`nav-arrow nav-arrow-up ${!canGoUp ? 'disabled' : ''}`}
          onClick={goToPreviousSection}
          disabled={!canGoUp}
          title="Previous Section (↑)"
        >
          ▲
        </button>

        {/* Section Dots */}
        <div className="nav-dots">
          {sectionMap.current.map((section, index) => (
            <div
              key={section.id}
              className={`nav-dot ${index === currentIndex ? 'active' : ''} ${section.type} ${section.hasSubsections ? 'has-subsections' : ''}`}
              onClick={() => navigateToChapter(index)}
              title={`${section.chapterTitle}${section.hasSubsections ? ' (has subsections)' : ''}`}
            >
              <span className="nav-dot-number">{index + 1}</span>

            </div>
          ))}
        </div>

        {/* Down Arrow */}
        <button 
          className={`nav-arrow nav-arrow-down ${!canGoDown ? 'disabled' : ''}`}
          onClick={goToNextSection}
          disabled={!canGoDown}
          title="Next Section (↓)"
        >
          ▼
        </button>

        {/* Keyboard hint */}
        <div className="keyboard-hint">
          Use ↑↓ arrow keys
        </div>
      </div>
    );
  };

  // Subsection menu component
  const SubsectionMenu = () => {
    const currentChapterData = storyStructure[currentChapter];
    
    if (!isInSubsectionMode || !currentChapterData?.sections?.length) {
      return null;
    }

    const handleSubsectionClick = (index) => {
      if (index !== currentSubsection) {
        setCurrentSubsection(index);
        console.log('📍 Manual subsection change:', index);
      }
    };

    return (
      <div className="subsection-menu">
        <div className="subsection-indicators">
          {currentChapterData.sections.map((section, index) => (
            <div 
              key={section.id}
              className={`subsection-indicator ${index === currentSubsection ? 'active' : ''}`}
              onClick={() => handleSubsectionClick(index)}
            >
              <span className="subsection-number">{index + 1}</span>
              <span className="subsection-title">{section.title}</span>
            </div>
          ))}
        </div>
        
        {/* Current subsection content */}
        <div className="subsection-content">
          {currentChapterData.sections[currentSubsection] && (
            <ReactMarkdown>{currentChapterData.sections[currentSubsection].content}</ReactMarkdown>
          )}
        </div>
      </div>
    );
  };

  // Toggle between original scrollytelling and choropleth demo
  if (showChoroplethDemo) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Ukrainian Regional Data Visualization</h1>
          <p>Interactive choropleth maps for any Ukrainian regional data</p>
          <button 
            onClick={() => setShowChoroplethDemo(false)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            ← Back to Original Scrollytelling
          </button>
        </header>

        <main>
          <section>
            <UkraineMapExample />
          </section>
          <section>
            <RegionNameDebugger />
          </section>
        </main>
      </div>
    );
  }

  // Don't render until initialized
  if (!isInitialized || sectionMap.current.length === 0) {
    return (
      <div className="app loading">
        <div className="loading-message">
          <h2>Loading Ukrainian Educational Data...</h2>
          <p>Initializing navigation and story structure</p>
          </div>
      </div>
    );
  }

  // Main scrollytelling layout
  return (
    <div className="app">
      {/* Navigation Sidebar */}
      <NavigationSidebar />

      {/* Left Panel - Story Content */}
      <div className={`story-panel ${isInSubsectionMode ? 'subsection-mode' : ''}`}>
        <div className="story-content">
          {storyStructure.map((chapter, index) => (
            <div 
              key={chapter.id}
              className={`chapter-step ${
                index === currentChapter ? 'active' : ''
              } ${isChapterTransitioning ? 'transitioning' : ''}`}
              style={{
                display: index === currentChapter ? 'flex' : 'none',
                position: index === currentChapter ? 'relative' : 'absolute',
                top: index === currentChapter ? '0' : '-100vh'
              }}
            >
              <h1>{chapter.title}</h1>
              <ReactMarkdown>{chapter.content}</ReactMarkdown>
              
              {/* Subsection Menu */}
              <SubsectionMenu />
              
              {/* Stats Panel - Only show for first section */}
              {index === 0 && (
                <div className="chapter-stats">
                  <StatsPanel 
                    data={data} 
                    currentNomination={getCurrentMapConfig().metric}
                    currentStory={index}
                    currentSubsection={isInSubsectionMode && storyStructure[currentChapter]?.sections?.[currentSubsection] ? storyStructure[currentChapter].sections[currentSubsection].id : null}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="viz-panel">
        <div className="viz-container">
          {/* Map Title */}
          <div className="map-title-section">
            <h2 className="map-main-title">
              {getCurrentMapConfig().title}
            </h2>
            
            {/* Progress Indicator */}
            <div className="progress-indicator">
              <span>Chapter {currentChapter + 1} of {storyStructure.length}</span>
              {isInSubsectionMode && storyStructure[currentChapter]?.sections?.length > 0 && (
                <span> - Section {currentSubsection + 1} of {storyStructure[currentChapter].sections.length}</span>
              )}
            </div>
          </div>
          
          {/* Map Section */}
          <div className={`map-section-full ${isMapTransitioning ? 'transitioning' : ''}`}>
            {(() => {
              const { mapData, originalData } = prepareMapData();
              return (
            <UkraineMap 
              title=""
              showRegionNames={true}
                  regionData={mapData}
                  originalData={originalData}
              colorScale={getCurrentColorScale()}
                  metricName={getUkrainianMetricName(getCurrentMapConfig().metric)}
                  metricUnits=""
              width={850}
              height={520}
                />
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 