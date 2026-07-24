import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { Header } from '../../components/Header/Header';
import { Card } from '../../components/Card/Card';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Briefcase, TrendingUp, Target, Globe, 
  ArrowUpRight, Building2, Star, BarChart3,
  AlertCircle, Loader2
} from 'lucide-react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import './Analytics.css';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

interface Opportunity {
  id: string;
  external_id: string;
  source: string;
  company: string;
  title: string;
  description: string;
  contract_type: string;
  modality: string;
  level: string;
  service_type: string;
  location: string;
  salary_range: string;
  application_url: string;
  posted_at: string;
  is_active: boolean;
  created_at: string;
}

interface Stats {
  total: number;
  plan_type: string;
  daily_limit: number;
  by_source: Record<string, number>;
  by_contract: Record<string, number>;
  by_modality: Record<string, number>;
  by_level: Record<string, number>;
  recent_count: number;
}

interface CountryData {
  name: string;
  opportunities: number;
  percentage: number;
  locations: string[];
}

const CHART_COLORS = ['#ec4899', '#f472b6', '#db2777', '#be185d', '#9d174d', '#6b21a5', '#1d4ed8', '#059669', '#d97706', '#ea580c'];

const countryMapping: Record<string, string> = {
  'Brazil': 'Brazil',
  'United States': 'USA',
  'United States of America': 'USA',
  'USA': 'USA',
  'Canada': 'Canada',
  'United Kingdom': 'United Kingdom',
  'Germany': 'Germany',
  'France': 'France',
  'Italy': 'Italy',
  'Spain': 'Spain',
  'Portugal': 'Portugal',
  'Netherlands': 'Netherlands',
  'Switzerland': 'Switzerland',
  'Australia': 'Australia',
  'New Zealand': 'New Zealand',
  'Japan': 'Japan',
  'China': 'China',
  'India': 'India',
  'Singapore': 'Singapore',
  'Mexico': 'Mexico',
  'Argentina': 'Argentina',
  'Chile': 'Chile',
  'Colombia': 'Colombia',
  'Peru': 'Peru',
  'South Africa': 'South Africa',
  'Egypt': 'Egypt',
  'Nigeria': 'Nigeria',
  'Kenya': 'Kenya',
  'Israel': 'Israel',
  'Turkey': 'Turkey',
  'Poland': 'Poland',
  'Sweden': 'Sweden',
  'Norway': 'Norway',
  'Denmark': 'Denmark',
  'Finland': 'Finland',
  'Ireland': 'Ireland',
  'Belgium': 'Belgium',
  'Austria': 'Austria',
  'Greece': 'Greece',
  'Russia': 'Russia',
  'Ukraine': 'Ukraine',
  'Romania': 'Romania',
  'Hungary': 'Hungary',
  'Czech Republic': 'Czech Republic',
  'Slovakia': 'Slovakia',
  'Bulgaria': 'Bulgaria',
  'Serbia': 'Serbia',
  'Croatia': 'Croatia',
  'Slovenia': 'Slovenia',
  'Estonia': 'Estonia',
  'Latvia': 'Latvia',
  'Lithuania': 'Lithuania',
  'Iceland': 'Iceland',
  'Luxembourg': 'Luxembourg',
  'Monaco': 'Monaco',
  'Andorra': 'Andorra',
  'Liechtenstein': 'Liechtenstein',
  'San Marino': 'San Marino',
  'Vatican City': 'Vatican City',
  'Malta': 'Malta',
  'Cyprus': 'Cyprus'
};

const normalizeLocation = (location: string): string => {
  if (!location) return 'Not specified';
  const locationLower = location.toLowerCase();
  if (locationLower.includes('brasil') || locationLower.includes('brazil')) return 'Brazil';
  if (locationLower.includes('eua') || locationLower.includes('usa') || locationLower.includes('united states')) return 'United States';
  if (locationLower.includes('canad') || locationLower.includes('canada')) return 'Canada';
  if (locationLower.includes('uk') || locationLower.includes('united kingdom') || locationLower.includes('england')) return 'United Kingdom';
  if (locationLower.includes('alem') || locationLower.includes('germany') || locationLower.includes('deutsch')) return 'Germany';
  if (locationLower.includes('fran') || locationLower.includes('france')) return 'France';
  if (locationLower.includes('ital') || locationLower.includes('italy')) return 'Italy';
  if (locationLower.includes('span') || locationLower.includes('spain') || locationLower.includes('espan')) return 'Spain';
  if (locationLower.includes('portug') || locationLower.includes('portugal')) return 'Portugal';
  if (locationLower.includes('holand') || locationLower.includes('netherlands')) return 'Netherlands';
  if (locationLower.includes('suic') || locationLower.includes('switzerland')) return 'Switzerland';
  if (locationLower.includes('austr') || locationLower.includes('australia')) return 'Australia';
  if (locationLower.includes('nova zeland') || locationLower.includes('new zealand')) return 'New Zealand';
  if (locationLower.includes('jap') || locationLower.includes('japan')) return 'Japan';
  if (locationLower.includes('china') || locationLower.includes('chin')) return 'China';
  if (locationLower.includes('india') || locationLower.includes('ind')) return 'India';
  if (locationLower.includes('singap') || locationLower.includes('singapore')) return 'Singapore';
  if (locationLower.includes('mex') || locationLower.includes('mexico')) return 'Mexico';
  if (locationLower.includes('argent') || locationLower.includes('argentina')) return 'Argentina';
  if (locationLower.includes('chile')) return 'Chile';
  if (locationLower.includes('colomb') || locationLower.includes('colombia')) return 'Colombia';
  if (locationLower.includes('peru')) return 'Peru';
  if (locationLower.includes('africa') || locationLower.includes('south africa')) return 'South Africa';
  return 'Others';
};

export function Analytics() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1.2 });
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [countryData, setCountryData] = useState<Map<string, CountryData>>(new Map());
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchOpportunities(), fetchStats()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const response = await api.get<{ data: Opportunity[] }>('/opportunities');
      if (response.data && response.data.data) {
        setOpportunities(response.data.data);
        processCountryData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get<Stats>('/opportunities/stats');
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const processCountryData = (opps: Opportunity[]) => {
    const countryMap = new Map<string, CountryData>();
    const total = opps.length;

    opps.forEach(opp => {
      const location = opp.location || 'Not specified';
      const normalizedCountry = normalizeLocation(location);
      const countryName = countryMapping[normalizedCountry] || normalizedCountry;

      if (!countryMap.has(countryName)) {
        countryMap.set(countryName, {
          name: countryName,
          opportunities: 0,
          percentage: 0,
          locations: []
        });
      }

      const data = countryMap.get(countryName)!;
      data.opportunities += 1;
      if (!data.locations.includes(location)) {
        data.locations.push(location);
      }
    });

    countryMap.forEach((data) => {
      data.percentage = total > 0 ? Math.round((data.opportunities / total) * 100) : 0;
    });

    setCountryData(countryMap);
  };

  const getUniqueCompanies = () => {
    const companies = new Set(opportunities.map(opp => opp.company));
    return Array.from(companies).length;
  };

  const getUniqueLocations = () => {
    const locations = new Set(opportunities.map(opp => opp.location || 'Remote'));
    return Array.from(locations).length;
  };

  const getServiceTypeData = () => {
    const serviceMap = new Map<string, number>();
    opportunities.forEach(opp => {
      const service = opp.service_type || 'Not defined';
      serviceMap.set(service, (serviceMap.get(service) || 0) + 1);
    });
    const total = opportunities.length;
    return Array.from(serviceMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getCompanyOpportunities = () => {
    const companyMap = new Map<string, number>();
    opportunities.forEach(opp => {
      companyMap.set(opp.company, (companyMap.get(opp.company) || 0) + 1);
    });
    const total = opportunities.length;
    return Array.from(companyMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const statsCards = [
    { 
      icon: Briefcase, 
      value: opportunities.length.toString(), 
      label: 'Active positions', 
      change: stats ? `${stats.recent_count || 0} new` : 'Loading...',
      color: '#3b82f6'
    },
    { 
      icon: Target, 
      value: opportunities.length > 0 ? `${Math.min(100, Math.round((opportunities.length / 10) * 100))}%` : '0%', 
      label: 'Average match', 
      change: `${opportunities.length} jobs found`,
      color: '#22c55e'
    },
    { 
      icon: Building2, 
      value: getUniqueCompanies().toString(), 
      label: 'Active companies', 
      change: 'Total companies',
      color: '#a855f7'
    },
    { 
      icon: Globe, 
      value: getUniqueLocations().toString(), 
      label: 'Locations reached', 
      change: 'Cities/Countries',
      color: '#f59e0b'
    },
  ];

  const serviceTypeData = getServiceTypeData();
  const companyData = getCompanyOpportunities();
  const hasData = opportunities.length > 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="analytics-chart-tooltip">
          <p className="analytics-chart-tooltip-label">{label}</p>
          <p className="analytics-chart-tooltip-value">
            {payload[0].value} jobs
            <span className="analytics-chart-tooltip-percent">
              ({payload[0].payload.percentage}%)
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const getCountryColor = (countryName: string): string => {
    const data = countryData.get(countryName);
    if (!data) return '#e8b4c8';
    const maxOpportunities = Math.max(...Array.from(countryData.values()).map(d => d.opportunities));
    if (maxOpportunities === 0) return '#e8b4c8';
    const ratio = data.opportunities / maxOpportunities;
    if (ratio > 0.7) return '#4a0d26';
    if (ratio > 0.4) return '#8c1a4a';
    if (ratio > 0.1) return '#ce266e';
    return '#e8b4c8';
  };

  const renderLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y - 6} 
        fill="#64748b" 
        fontSize={11} 
        textAnchor="middle"
        dominantBaseline="auto"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="dashboard-page">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Header onMenuClick={toggleSidebar} />
        <div className="dashboard-content analytics-content">
          <div className="analytics-header">
            <div>
              <h1 className="analytics-title">Analytics</h1>
              <span className="feedback-title-accent" />
              <p className="analytics-subtitle">Overview of the design market and opportunities.</p>
            </div>
            <div className="analytics-header-actions">
              <span className="analytics-badge">
                {opportunities.length} opportunities
              </span>
            </div>
          </div>

          <div className="analytics-stats-grid">
            {statsCards.map((stat, index) => (
              <Card key={index} className="analytics-stat-card">
                <div className="analytics-stat-top">
                  <div className="analytics-stat-icon" style={{ color: stat.color }}>
                    <stat.icon size={18} />
                  </div>
                  <span className="analytics-stat-change">{stat.change}</span>
                </div>
                <div className="analytics-stat-value">{stat.value}</div>
                <div className="analytics-stat-label">{stat.label}</div>
              </Card>
            ))}
          </div>

          <div className="analytics-grid">
            <Card className="analytics-map-card">
              <div className="analytics-card-header">
                <div className="analytics-card-title">
                  <Globe size={16} />
                  Global distribution
                </div>
                <div className="analytics-card-actions">
                  {hoveredCountry && (
                    <span className="analytics-tag">
                      {hoveredCountry}
                    </span>
                  )}
                  {selectedCountry && (
                    <span className="analytics-tag">
                      Selected country
                    </span>
                  )}
                </div>
              </div>
              <div className="analytics-map-container">
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 110 }}
                >
                  <ZoomableGroup
                    center={position.coordinates as [number, number]}
                    zoom={position.zoom}
                    onMoveEnd={(pos: any) => setPosition(pos)}
                  >
                    <Geographies geography={geoUrl}>
                      {({ geographies }: any) =>
                        geographies.map((geo: any) => {
                          const geoName = geo.properties.name || geo.properties.name_ar || '';
                          const countryName = countryMapping[geoName] || geoName;
                          const data = countryData.get(countryName);
                          const fillColor = getCountryColor(countryName);

                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={fillColor}
                              stroke="#0a0a0a"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: 'none' },
                                hover: { 
                                  fill: data && data.opportunities > 0 ? '#ce266e' : '#ce266e', 
                                  outline: 'none', 
                                  cursor: data && data.opportunities > 0 ? 'pointer' : 'default',
                                  stroke: '#ec4899',
                                  strokeWidth: 1.5
                                },
                                pressed: { outline: 'none' },
                              }}
                              onMouseEnter={() => {
                                if (data && data.opportunities > 0) {
                                  setHoveredCountry(
                                    `${countryName} (${data.opportunities} jobs - ${data.percentage}%)`
                                  );
                                }
                              }}
                              onMouseLeave={() => setHoveredCountry(null)}
                              onClick={() => {
                                if (data && data.opportunities > 0) {
                                  const code = geo.properties.iso_a3 || geo.properties.iso_a2;
                                  setSelectedCountry(code || null);
                                }
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>
              </div>
              <div className="analytics-map-footer">
                <span className="analytics-map-note">
                  {selectedCountry && hoveredCountry ? hoveredCountry : 'Hover over a country to see details'}
                </span>
                <div className="analytics-legend">
                  <div className="analytics-legend-item"><span style={{ background: '#4a0d26' }} />High</div>
                  <div className="analytics-legend-item"><span style={{ background: '#8c1a4a' }} />Medium</div>
                  <div className="analytics-legend-item"><span style={{ background: '#ce266e' }} />Low</div>
                  <div className="analytics-legend-item"><span style={{ background: '#e8b4c8' }} />No data</div>
                </div>
              </div>
            </Card>

            <Card className="analytics-chart-card">
              <div className="analytics-card-header">
                <div className="analytics-card-title">
                  <BarChart3 size={16} />
                  Jobs by area
                </div>
                <span className="analytics-card-count">
                  {serviceTypeData.length} areas
                </span>
              </div>
              <div className="analytics-chart-container">
                {loading ? (
                  <div className="analytics-chart-loading">
                    <Loader2 size={32} className="spinning" />
                    <p>Loading data...</p>
                  </div>
                ) : !hasData ? (
                  <div className="analytics-chart-empty">
                    <AlertCircle size={32} />
                    <p>No opportunities found</p>
                    <p className="analytics-chart-empty-sub">Scrape jobs on Dashboard to get started</p>
                  </div>
                ) : serviceTypeData.length === 0 ? (
                  <div className="analytics-chart-empty">
                    <AlertCircle size={32} />
                    <p>Area data not available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceTypeData} margin={{ top: 30, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]} 
                        barSize={36}
                        label={renderLabel}
                      >
                        {serviceTypeData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          <Card className="analytics-table-card">
            <div className="analytics-card-header">
              <div className="analytics-card-title">
                <Star size={16} />
                Companies with most opportunities
              </div>
              <span className="analytics-card-count">
                {companyData.length} companies
              </span>
            </div>
            <div className="analytics-table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Company</th>
                    <th>Jobs</th>
                    <th>% of total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Loader2 size={24} className="spinning" />
                      </td>
                    </tr>
                  ) : companyData.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                        No companies found
                      </td>
                    </tr>
                  ) : (
                    companyData.map((company, index) => (
                      <tr key={index}>
                        <td>
                          <span className="analytics-rank">{index + 1}</span>
                        </td>
                        <td className="analytics-table-company">{company.name}</td>
                        <td>{company.count}</td>
                        <td>
                          <div className="analytics-table-progress">
                            <span>{company.percentage}%</span>
                            <div className="analytics-table-progress-bar">
                              <div 
                                className="analytics-table-progress-fill" 
                                style={{ 
                                  width: `${company.percentage}%`,
                                  background: CHART_COLORS[index % CHART_COLORS.length]
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="analytics-table-status active">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
