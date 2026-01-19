/**
 * Feature Flags Testing Suite
 * Testes para validar comportamento de feature toggles
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock do cliente de feature flags
interface FlagConfig {
  enabled: boolean;
  variants?: Record<string, any>;
  targeting?: {
    rules: Array<{
      attribute: string;
      operator: string;
      value: any;
      variation: string;
    }>;
  };
  rolloutPercentage?: number;
}

class MockFeatureFlagClient {
  private flags: Map<string, FlagConfig> = new Map();

  setFlag(key: string, config: FlagConfig): void {
    this.flags.set(key, config);
  }

  isEnabled(key: string, context?: Record<string, any>): boolean {
    const flag = this.flags.get(key);
    if (!flag) return false;

    // Check targeting rules
    if (flag.targeting && context) {
      for (const rule of flag.targeting.rules) {
        const attributeValue = context[rule.attribute];
        if (this.evaluateRule(attributeValue, rule.operator, rule.value)) {
          return rule.variation === 'on';
        }
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && context?.userId) {
      const hash = this.hashString(context.userId + key);
      return hash < flag.rolloutPercentage;
    }

    return flag.enabled;
  }

  getVariant(key: string, context?: Record<string, any>): string | null {
    const flag = this.flags.get(key);
    if (!flag || !flag.variants) return null;

    if (flag.targeting && context) {
      for (const rule of flag.targeting.rules) {
        const attributeValue = context[rule.attribute];
        if (this.evaluateRule(attributeValue, rule.operator, rule.value)) {
          return rule.variation;
        }
      }
    }

    return flag.enabled ? 'control' : null;
  }

  private evaluateRule(value: any, operator: string, target: any): boolean {
    switch (operator) {
      case 'equals': return value === target;
      case 'contains': return String(value).includes(target);
      case 'greaterThan': return value > target;
      case 'in': return Array.isArray(target) && target.includes(value);
      default: return false;
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 100);
  }

  reset(): void {
    this.flags.clear();
  }
}

describe('🚩 Feature Flags Testing Suite', () => {
  let flagClient: MockFeatureFlagClient;

  beforeEach(() => {
    flagClient = new MockFeatureFlagClient();
  });

  afterEach(() => {
    flagClient.reset();
  });

  describe('Basic Flag Operations', () => {
    it('should return false for non-existent flag', () => {
      expect(flagClient.isEnabled('non-existent-flag')).toBe(false);
    });

    it('should return true for enabled flag', () => {
      flagClient.setFlag('new-feature', { enabled: true });
      expect(flagClient.isEnabled('new-feature')).toBe(true);
    });

    it('should return false for disabled flag', () => {
      flagClient.setFlag('disabled-feature', { enabled: false });
      expect(flagClient.isEnabled('disabled-feature')).toBe(false);
    });
  });

  describe('User Targeting', () => {
    beforeEach(() => {
      flagClient.setFlag('beta-feature', {
        enabled: false,
        targeting: {
          rules: [
            { attribute: 'email', operator: 'contains', value: '@beta.com', variation: 'on' },
            { attribute: 'plan', operator: 'equals', value: 'premium', variation: 'on' },
            { attribute: 'userId', operator: 'in', value: ['user-1', 'user-2'], variation: 'on' }
          ]
        }
      });
    });

    it('should enable flag for beta users by email', () => {
      expect(flagClient.isEnabled('beta-feature', { email: 'test@beta.com' })).toBe(true);
      expect(flagClient.isEnabled('beta-feature', { email: 'test@normal.com' })).toBe(false);
    });

    it('should enable flag for premium users', () => {
      expect(flagClient.isEnabled('beta-feature', { plan: 'premium' })).toBe(true);
      expect(flagClient.isEnabled('beta-feature', { plan: 'free' })).toBe(false);
    });

    it('should enable flag for specific user IDs', () => {
      expect(flagClient.isEnabled('beta-feature', { userId: 'user-1' })).toBe(true);
      expect(flagClient.isEnabled('beta-feature', { userId: 'user-99' })).toBe(false);
    });
  });

  describe('Percentage Rollout', () => {
    it('should respect rollout percentage', () => {
      flagClient.setFlag('gradual-rollout', {
        enabled: true,
        rolloutPercentage: 50
      });

      const results: boolean[] = [];
      for (let i = 0; i < 100; i++) {
        results.push(flagClient.isEnabled('gradual-rollout', { userId: `user-${i}` }));
      }

      const enabledCount = results.filter(r => r).length;
      // Should be roughly 50% (allow some variance)
      expect(enabledCount).toBeGreaterThan(30);
      expect(enabledCount).toBeLessThan(70);
    });

    it('should be deterministic for same user', () => {
      flagClient.setFlag('deterministic-rollout', {
        enabled: true,
        rolloutPercentage: 50
      });

      const context = { userId: 'consistent-user' };
      const result1 = flagClient.isEnabled('deterministic-rollout', context);
      const result2 = flagClient.isEnabled('deterministic-rollout', context);
      const result3 = flagClient.isEnabled('deterministic-rollout', context);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('A/B Test Variants', () => {
    beforeEach(() => {
      flagClient.setFlag('checkout-experiment', {
        enabled: true,
        variants: {
          control: { buttonColor: 'blue' },
          treatment: { buttonColor: 'green' }
        },
        targeting: {
          rules: [
            { attribute: 'group', operator: 'equals', value: 'A', variation: 'control' },
            { attribute: 'group', operator: 'equals', value: 'B', variation: 'treatment' }
          ]
        }
      });
    });

    it('should return correct variant for group A', () => {
      expect(flagClient.getVariant('checkout-experiment', { group: 'A' })).toBe('control');
    });

    it('should return correct variant for group B', () => {
      expect(flagClient.getVariant('checkout-experiment', { group: 'B' })).toBe('treatment');
    });
  });

  describe('Kill Switch', () => {
    it('should immediately disable feature when kill switch is off', () => {
      flagClient.setFlag('critical-feature', { enabled: true });
      expect(flagClient.isEnabled('critical-feature')).toBe(true);

      // Simulate kill switch activation
      flagClient.setFlag('critical-feature', { enabled: false });
      expect(flagClient.isEnabled('critical-feature')).toBe(false);
    });
  });
});
