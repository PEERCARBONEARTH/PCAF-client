import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingDown, Car, Zap, Leaf, Calculator } from 'lucide-react';
import { db } from '@/lib/db';

interface FleetComposition {
  total_vehicles: number;
  current_emissions_tco2_year: number;
  average_annual_km: number;
}

interface EmissionFactor {
  vehicle_category?: string;
  fuel_type?: string;
  emission_factor_kg_co2_km?: number;
}

interface TransitionScenario {
  ev_percentage: number;
  total_emissions_reduction_tco2: number;
  reduction_percentage: number;
  annual_savings_tco2: number;
  cumulative_savings_5_years: number;
}

export default function EVFleetTransitionSimulator() {
  const [fleetData, setFleetData] = useState<FleetComposition>({
    total_vehicles: 1000,
    current_emissions_tco2_year: 450,
    average_annual_km: 15000
  });
  
  const [evPercentage, setEvPercentage] = useState([25]);
  const [timeframe, setTimeframe] = useState('5');
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmissionFactors();
  }, []);

  const loadEmissionFactors = async () => {
    try {
      const factors = await db.emission_factors
        .where('vehicle_category')
        .equals('passenger_car')
        .toArray();
      setEmissionFactors(factors);
    } catch (error) {
      console.error('Error loading emission factors:', error);
    } finally {
      setLoading(false);
    }
  };

  const transitionScenario = useMemo((): TransitionScenario => {
    const evFactor = emissionFactors.find(f => f.fuel_type === 'electric');
    const gasolineFactor = emissionFactors.find(f => f.fuel_type === 'gasoline');
    
    if (!evFactor || !gasolineFactor) {
      return {
        ev_percentage: evPercentage[0],
        total_emissions_reduction_tco2: 0,
        reduction_percentage: 0,
        annual_savings_tco2: 0,
        cumulative_savings_5_years: 0
      };
    }

    const evVehicles = (fleetData.total_vehicles * evPercentage[0]) / 100;
    const remainingGasolineVehicles = fleetData.total_vehicles - evVehicles;
    
    // Calculate emissions for mixed fleet
    const evEmissions = (evVehicles * fleetData.average_annual_km * evFactor.emission_factor_kg_co2_km) / 1000;
    const gasolineEmissions = (remainingGasolineVehicles * fleetData.average_annual_km * gasolineFactor.emission_factor_kg_co2_km) / 1000;
    const newTotalEmissions = evEmissions + gasolineEmissions;
    
    const annual_savings_tco2 = fleetData.current_emissions_tco2_year - newTotalEmissions;
    const reduction_percentage = (annual_savings_tco2 / fleetData.current_emissions_tco2_year) * 100;
    const cumulative_savings = annual_savings_tco2 * parseInt(timeframe);

    return {
      ev_percentage: evPercentage[0],
      total_emissions_reduction_tco2: annual_savings_tco2,
      reduction_percentage,
      annual_savings_tco2,
      cumulative_savings_5_years: cumulative_savings
    };
  }, [evPercentage, fleetData, emissionFactors, timeframe]);

  const chartData = useMemo(() => {
    const years = Array.from({ length: parseInt(timeframe) }, (_, i) => i + 1);
    return years.map(year => ({
      year: `Year ${year}`,
      baseline: fleetData.current_emissions_tco2_year,
      withEVs: fleetData.current_emissions_tco2_year - transitionScenario.annual_savings_tco2,
      cumulative_savings: transitionScenario.annual_savings_tco2 * year
    }));
  }, [fleetData, transitionScenario, timeframe]);

  const comparisonData = [
    {
      scenario: 'Current Fleet',
      emissions: fleetData.current_emissions_tco2_year,
      cost_estimate: fleetData.current_emissions_tco2_year * 50 // Assume $50/tCO2
    },
    {
      scenario: `${evPercentage[0]}% EV Fleet`,
      emissions: fleetData.current_emissions_tco2_year - transitionScenario.annual_savings_tco2,
      cost_estimate: (fleetData.current_emissions_tco2_year - transitionScenario.annual_savings_tco2) * 50
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-muted-foreground">Loading emission factors...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            EV Fleet Transition Simulator
          </CardTitle>
          <CardDescription>
            Model the emission reduction impact of transitioning your vehicle fleet to electric vehicles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fleet Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Fleet Size</label>
              <input
                type="number"
                value={fleetData.total_vehicles}
                onChange={(e) => setFleetData(prev => ({ ...prev, total_vehicles: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Annual Emissions (tCO₂)</label>
              <input
                type="number"
                value={fleetData.current_emissions_tco2_year}
                onChange={(e) => setFleetData(prev => ({ ...prev, current_emissions_tco2_year: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Avg. Annual KM per Vehicle</label>
              <input
                type="number"
                value={fleetData.average_annual_km}
                onChange={(e) => setFleetData(prev => ({ ...prev, average_annual_km: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <Separator />

          {/* EV Transition Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">EV Fleet Percentage</label>
              <Badge variant="secondary" className="px-3">
                {evPercentage[0]}% EVs
              </Badge>
            </div>
            <Slider
              value={evPercentage}
              onValueChange={setEvPercentage}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                {Math.round(fleetData.total_vehicles * (100 - evPercentage[0]) / 100)} ICE vehicles
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {Math.round(fleetData.total_vehicles * evPercentage[0] / 100)} EV vehicles
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeframe Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Timeframe</label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Years</SelectItem>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="7">7 Years</SelectItem>
                <SelectItem value="10">10 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Annual Reduction</p>
                <p className="text-2xl font-bold text-green-600">
                  {transitionScenario.annual_savings_tco2.toFixed(1)} tCO₂
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Reduction %</p>
              <p className="text-2xl font-bold">
                {transitionScenario.reduction_percentage.toFixed(1)}%
              </p>
              <Progress value={transitionScenario.reduction_percentage} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{timeframe}-Year Savings</p>
              <p className="text-2xl font-bold text-blue-600">
                {transitionScenario.cumulative_savings_5_years.toFixed(0)} tCO₂
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Est. Carbon Cost Savings</p>
              <p className="text-2xl font-bold text-green-600">
                ${(transitionScenario.annual_savings_tco2 * 50).toFixed(0)}/year
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emission Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  `${value} tCO₂`, 
                  name === 'baseline' ? 'Current Fleet' : 'With EVs'
                ]} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Current Fleet"
                />
                <Line 
                  type="monotone" 
                  dataKey="withEVs" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="With EVs"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fleet Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="emissions" fill="#3b82f6" name="Annual Emissions (tCO₂)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Ready to model this transition?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Generate detailed reports and implementation roadmaps for your EV fleet transition
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Calculator className="mr-2 h-4 w-4" />
                Export Analysis
              </Button>
              <Button>
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}