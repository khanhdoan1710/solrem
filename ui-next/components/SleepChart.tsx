import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SleepData } from '../types';

interface SleepChartProps {
  data: SleepData[];
}

const SleepChart: React.FC<SleepChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#CCFF00" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorRem" x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
               <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#52525B" 
            fontSize={11} 
            fontFamily="JetBrains Mono"
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#52525B" 
            fontSize={11} 
            fontFamily="JetBrains Mono"
            tickLine={false}
            axisLine={false}
            domain={[40, 100]}
          />
          <Tooltip 
            cursor={{ stroke: '#52525B', strokeWidth: 1, strokeDasharray: '4 4' }}
            contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: '0px', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
            itemStyle={{ fontSize: '12px', fontFamily: 'JetBrains Mono', padding: 0 }}
            labelStyle={{ color: '#A1A1AA', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#CCFF00" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorScore)" 
            animationDuration={1000}
            activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
          />
           <Area 
            type="monotone" 
            dataKey="remScore" 
            stroke="#22D3EE" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRem)" 
            strokeDasharray="4 4"
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SleepChart;