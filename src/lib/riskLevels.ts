// Risk level configuration for the Medicova platform
// Severity scores range from 0 to 1, mapped to risk levels 1-5

export interface RiskLevelConfig {
    critical: {
        text: string;
        bg: string;
        border: string;
    };
    severe: {
        text: string;
        bg: string;
        border: string;
    };
    moderate: {
        text: string;
        bg: string;
        border: string;
    };
    low: {
        text: string;
        bg: string;
        border: string;
    };
    thresholds: {
        critical: number;  // >= 0.8 (Level 5)
        severe: number;    // >= 0.6 (Level 4)
        moderate: number;  // >= 0.4 (Level 3)
        low: number;       // >= 0.2 (Level 2)
        // < 0.2 is Level 1 (minimal)
    };
    colors: {
        level5: string;
        level4: string;
        level3: string;
        level2: string;
        level1: string;
    };
}

export const riskLevelConfig: RiskLevelConfig = {
    critical: {
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
    },
    severe: {
        text: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200'
    },
    moderate: {
        text: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
    },
    low: {
        text: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200'
    },
    thresholds: {
        critical: 0.8,
        severe: 0.6,
        moderate: 0.4,
        low: 0.2
    },
    colors: {
        level5: 'text-red-600 bg-red-50 border-red-200',
        level4: 'text-orange-600 bg-orange-50 border-orange-200',
        level3: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        level2: 'text-blue-600 bg-blue-50 border-blue-200',
        level1: 'text-green-600 bg-green-50 border-green-200'
    }
};

/**
 * Convert severity score (0-1) to risk level (1-5)
 */
export const getRiskLevel = (severityScore: number): 1 | 2 | 3 | 4 | 5 => {
    return Math.ceil(severityScore * 5) as 1 | 2 | 3 | 4 | 5;
};

/**
 * Get color classes for a given severity score
 */
export const getRiskLevelColor = (severityScore: number): string => {
    const level = getRiskLevel(severityScore);
    return riskLevelConfig.colors[`level${level}` as keyof typeof riskLevelConfig.colors];
};

/**
 * Get risk level label
 */
export const getRiskLevelLabel = (severityScore: number): string => {
    const level = getRiskLevel(severityScore);
    switch (level) {
        case 5: return 'Critical';
        case 4: return 'Severe';
        case 3: return 'Moderate';
        case 2: return 'Low';
        case 1: return 'Minimal';
        default: return 'Unknown';
    }
};
