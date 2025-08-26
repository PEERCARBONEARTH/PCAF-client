
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertCircle } from "lucide-react";
import { masterSchoolProjects } from '@/lib/masterData';

interface MapProps {
  mapboxToken?: string;
  onTokenSubmit?: (token: string) => void;
}

const Map: React.FC<MapProps> = ({ mapboxToken, onTokenSubmit }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [tempToken, setTempToken] = useState('');
  const [tokenError, setTokenError] = useState(false);

  const handleTokenSubmit = () => {
    if (tempToken.trim()) {
      setTokenError(false);
      onTokenSubmit?.(tempToken.trim());
    } else {
      setTokenError(true);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      // Initialize map
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [35, -1], // Center on East Africa
        zoom: 5,
        pitch: 45,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add markers for each project from master data
      map.current.on('load', () => {
        masterSchoolProjects.forEach((project) => {
          // Create custom marker element
          const markerElement = document.createElement('div');
          markerElement.className = 'custom-marker';
          markerElement.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
            background-color: ${
              project.status === 'completed' ? '#22c55e' : 
              project.status === 'active' ? '#3b82f6' : 
              project.status === 'pending' ? '#f59e0b' : '#ef4444'
            };
          `;

          // Create popup content with real data
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeOnClick: true
          }).setHTML(`
            <div class="p-2 min-w-[200px]">
              <h3 class="font-semibold text-sm mb-2">${project.schoolName}</h3>
              <div class="space-y-1 text-xs text-gray-600">
                <div class="flex justify-between">
                  <span>Investment:</span>
                  <span class="font-medium">$${project.financials.totalInvestment.toLocaleString()}</span>
                </div>
                <div class="flex justify-between">
                  <span>Progress:</span>
                  <span class="font-medium">${project.progress}%</span>
                </div>
                <div class="flex justify-between">
                  <span>Students:</span>
                  <span class="font-medium">${project.studentsCount}</span>
                </div>
                <div class="flex justify-between">
                  <span>Status:</span>
                  <span class="font-medium capitalize">${project.status.replace('_', ' ')}</span>
                </div>
                <div class="flex justify-between">
                  <span>CO₂ Credits:</span>
                  <span class="font-medium">${project.mrvData.carbonCreditsPerMonth.toFixed(1)}/mo</span>
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${project.progress}%"></div>
              </div>
            </div>
          `);

          // Add marker to map
          new mapboxgl.Marker(markerElement)
            .setLngLat(project.coordinates)
            .setPopup(popup)
            .addTo(map.current!);
        });

        // Fit map to show all markers
        const bounds = new mapboxgl.LngLatBounds();
        masterSchoolProjects.forEach(project => bounds.extend(project.coordinates));
        map.current?.fitBounds(bounds, { padding: 50 });
      });

      // Cleanup
      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenError(true);
    }
  }, [mapboxToken]);

  if (!mapboxToken) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapbox Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Enter your Mapbox public token to view project locations on the map.
              </p>
              <p className="text-xs text-muted-foreground">
                Get your token at{' '}
                <a 
                  href="https://mapbox.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJ..."
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTokenSubmit()}
                className={tokenError ? 'border-red-500' : ''}
              />
              {tokenError && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Please enter a valid Mapbox token
                </div>
              )}
              <Button onClick={handleTokenSubmit} className="w-full">
                Load Map
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-sm shadow-lg" />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-sm p-3 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Project Status</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Completed ({masterSchoolProjects.filter(p => p.status === 'completed').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Active ({masterSchoolProjects.filter(p => p.status === 'active').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Pending ({masterSchoolProjects.filter(p => p.status === 'pending').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>On Hold ({masterSchoolProjects.filter(p => p.status === 'on_hold').length})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
