export interface DataSourceExample {
  source: string;
  example: string;
  pcafOption: '1a' | '1b' | '2a' | '2b' | '3a' | '3b';
  defensePoints: string[];
}

export const dataSourceExamples: DataSourceExample[] = [
  {
    source: 'Fuel card API',
    example: 'Monthly liters by vehicle ID from provider API',
    pcafOption: '1a',
    defensePoints: [
      'Primary, measured fuel consumption',
      'Provider logs + invoice receipts retained',
    ],
  },
  {
    source: 'Telematics (OBD/GPS)',
    example: 'Actual trip distance and odometer snapshots',
    pcafOption: '1b',
    defensePoints: [
      'Device-sourced distance with tamper checks',
      'Vehicle efficiency from make/model/VIN',
    ],
  },
  {
    source: 'Odometer photos',
    example: 'Quarterly images with EXIF timestamps',
    pcafOption: '1b',
    defensePoints: [
      'Borrower attestation + image EXIF',
      'Reasonableness checks & outlier flags',
    ],
  },
  {
    source: 'VIN decode + local stats',
    example: 'OEM efficiency + municipal mileage surveys',
    pcafOption: '2a',
    defensePoints: [
      'Specific efficiency with local distance statistics',
      'Cited sources and periodic refresh cadence',
    ],
  },
  {
    source: 'VIN decode + regional stats',
    example: 'OEM efficiency + national averages',
    pcafOption: '2b',
    defensePoints: [
      'Specific efficiency with regional distances',
      'Documented fallback with improvement plan',
    ],
  },
  {
    source: 'CSV upload (type only)',
    example: 'Vehicle type/category without make/model',
    pcafOption: '3a',
    defensePoints: [
      'Type averages for efficiency and distance',
      'Cited datasets; pathway to collect make/model',
    ],
  },
  {
    source: 'Minimal fields',
    example: 'No type or distance fields available',
    pcafOption: '3b',
    defensePoints: [
      'Average assumptions with conservative defaults',
      'Explicit limitations and improvement roadmap',
    ],
  },
];
