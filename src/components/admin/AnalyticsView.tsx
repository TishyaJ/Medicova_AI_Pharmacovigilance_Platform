import { useState } from 'react';
import RegionalIntelligence from './analytics/RegionalIntelligence';
import MedicineRiskAnalysis from './analytics/MedicineRiskAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AnalyticsView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Deep Dive Analytics</h2>
        <p className="text-muted-foreground">Comprehensive data analysis and insights</p>
      </div>

      <Tabs defaultValue="regional" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="regional">Regional Intelligence</TabsTrigger>
          <TabsTrigger value="medicine">Medicine Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="regional">
          <RegionalIntelligence />
        </TabsContent>

        <TabsContent value="medicine">
          <MedicineRiskAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsView;
