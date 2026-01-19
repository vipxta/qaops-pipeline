/**
 * Parallel Test Runner Configuration
 * Configuração para execução paralela de testes
 */

import { cpus } from 'os';

interface BrowserConfig {
  browserName: string;
  browserVersion?: string;
  platformName?: string;
  'selenoid:options'?: Record<string, any>;
}

interface ParallelConfig {
  maxWorkers: number;
  browsers: BrowserConfig[];
  gridUrl: string;
  retries: number;
  timeout: number;
  sharding: {
    enabled: boolean;
    totalShards: number;
    shardIndex: number;
  };
}

export const parallelConfig: ParallelConfig = {
  maxWorkers: Math.max(cpus().length - 1, 4),
  
  browsers: [
    {
      browserName: 'chrome',
      browserVersion: 'latest',
      platformName: 'linux',
      'selenoid:options': {
        enableVNC: true,
        enableVideo: true,
        videoName: 'test-${timestamp}.mp4',
        screenResolution: '1920x1080x24'
      }
    },
    {
      browserName: 'firefox',
      browserVersion: 'latest',
      platformName: 'linux',
      'selenoid:options': {
        enableVNC: true,
        enableVideo: true
      }
    },
    {
      browserName: 'MicrosoftEdge',
      browserVersion: 'latest',
      platformName: 'linux'
    }
  ],
  
  gridUrl: process.env.SELENIUM_GRID_URL || 'http://localhost:4444/wd/hub',
  retries: 2,
  timeout: 60000,
  
  sharding: {
    enabled: process.env.CI === 'true',
    totalShards: parseInt(process.env.TOTAL_SHARDS || '1'),
    shardIndex: parseInt(process.env.SHARD_INDEX || '0')
  }
};

export function getTestFiles(allFiles: string[]): string[] {
  if (!parallelConfig.sharding.enabled) {
    return allFiles;
  }
  
  const { totalShards, shardIndex } = parallelConfig.sharding;
  return allFiles.filter((_, index) => index % totalShards === shardIndex);
}

export function distributeTests(tests: string[], workers: number): string[][] {
  const distributed: string[][] = Array.from({ length: workers }, () => []);
  
  tests.forEach((test, index) => {
    distributed[index % workers].push(test);
  });
  
  return distributed;
}

export async function waitForGrid(url: string, timeout: number = 30000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`${url}/status`);
      const data = await response.json();
      
      if (data.value?.ready) {
        console.log('✅ Selenium Grid is ready');
        return true;
      }
    } catch (error) {
      // Grid not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error(`Selenium Grid not ready after ${timeout}ms`);
}
