import { Tenant } from '../types';

// Demo tenant configurations for frontend-only mode
export const DEMO_TENANTS: Record<string, Tenant> = {
    demo: {
        id: 'demo',
        name: 'Demo Factory',
        primaryColor: '#DC2626', // Red
        secondaryColor: '#1F2937',
        logo: undefined,
        features: {
            gamification: true,
            aiVision: true,
            lpa: true,
            ishikawa: true,
            factoryMap: true,
        },
        settings: {
            welcomeMessage: 'Welcome to the Demo Factory! 🏭',
            supportEmail: 'support@demo.leanrpg.app',
            xpMultiplier: 1.0,
        },
    },
    acme: {
        id: 'acme',
        name: 'ACME Industries',
        primaryColor: '#2563EB', // Blue
        secondaryColor: '#1E3A5F',
        logo: undefined,
        features: {
            gamification: true,
            aiVision: false,
            lpa: true,
            ishikawa: true,
            factoryMap: true,
        },
        settings: {
            welcomeMessage: 'Welcome to ACME Industries! 🔧',
            supportEmail: 'lean@acme.com',
            xpMultiplier: 1.5,
        },
    },
    magna: {
        id: 'magna',
        name: 'Magna Corp',
        primaryColor: '#059669', // Green
        secondaryColor: '#134E4A',
        logo: undefined,
        features: {
            gamification: true,
            aiVision: true,
            lpa: true,
            ishikawa: true,
            factoryMap: true,
        },
        settings: {
            welcomeMessage: 'Vítej v Magna Corp! 🌟',
            supportEmail: 'ci@magna.cz',
            xpMultiplier: 1.2,
        },
    },
};

export const getDefaultTenant = (tenantId: string): Tenant => {
    return DEMO_TENANTS[tenantId] || DEMO_TENANTS.demo;
};
