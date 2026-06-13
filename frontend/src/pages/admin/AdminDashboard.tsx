import * as React from 'react';
import { Card } from '../../components/ui/card';
import { motion } from 'framer-motion';
import { Shield, Users, BookOpen, CreditCard, Sparkles } from 'lucide-react';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  AreaSeries,
  Category,
  Inject,
  Tooltip,
  Legend,
} from '@syncfusion/ej2-react-charts';

const AdminDashboard = () => {
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

  const platformData = [
    { month: 'Jan', users: 120, courses: 8 },
    { month: 'Feb', users: 185, courses: 12 },
    { month: 'Mar', users: 240, courses: 15 },
    { month: 'Apr', users: 310, courses: 18 },
    { month: 'May', users: 380, courses: 22 },
    { month: 'Jun', users: 450, courses: 26 },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="glass-card p-7 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-ios-purple/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-10 w-48 h-48 bg-ios-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-[28px] font-semibold text-ios-text tracking-tight flex items-center gap-2">
            Admin Control Center <Shield className="text-ios-purple" size={22} />
          </h1>
          <p className="text-ios-text-secondary mt-1.5 text-[15px]">System overview and management.</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-ios-accent/15 flex items-center justify-center text-ios-accent"><Users size={20} /></div>
          <div>
            <p className="text-[10px] text-ios-text-secondary font-medium uppercase tracking-wide">Total Users</p>
            <p className="text-2xl font-semibold text-ios-text">--</p>
            <p className="text-[10px] text-ios-text-secondary/70">API pending</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-ios-purple/15 flex items-center justify-center text-ios-purple"><BookOpen size={20} /></div>
          <div>
            <p className="text-[10px] text-ios-text-secondary font-medium uppercase tracking-wide">Total Courses</p>
            <p className="text-2xl font-semibold text-ios-text">--</p>
            <p className="text-[10px] text-ios-text-secondary/70">API pending</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-ios-green/15 flex items-center justify-center text-ios-green"><Sparkles size={20} /></div>
          <div>
            <p className="text-[10px] text-ios-text-secondary font-medium uppercase tracking-wide">Enrollments</p>
            <p className="text-2xl font-semibold text-ios-text">--</p>
            <p className="text-[10px] text-ios-text-secondary/70">API pending</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-ios-orange/15 flex items-center justify-center text-ios-orange"><CreditCard size={20} /></div>
          <div>
            <p className="text-[10px] text-ios-text-secondary font-medium uppercase tracking-wide">Revenue</p>
            <p className="text-2xl font-semibold text-ios-text">--</p>
            <p className="text-[10px] text-ios-text-secondary/70">API pending</p>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-ios-text mb-4">Platform Growth</h3>
          <ChartComponent
            primaryXAxis={{ valueType: 'Category', labelStyle: { color: 'rgba(255,255,255,0.5)', size: '11px' }, majorGridLines: { width: 0 } }}
            primaryYAxis={{ labelStyle: { color: 'rgba(255,255,255,0.5)', size: '11px' }, majorGridLines: { color: 'rgba(255,255,255,0.06)' } }}
            height="260px"
            background="transparent"
            tooltip={{ enable: true }}
            legendSettings={{ visible: true, textStyle: { color: 'rgba(255,255,255,0.6)' } }}
          >
            <Inject services={[AreaSeries, Category, Tooltip, Legend]} />
            <SeriesCollectionDirective>
              <SeriesDirective
                dataSource={platformData}
                xName="month"
                yName="users"
                name="Users"
                type="Area"
                fill="rgba(107, 159, 212, 0.2)"
                border={{ color: '#6b9fd4', width: 1.5 }}
                opacity={0.8}
              />
              <SeriesDirective
                dataSource={platformData}
                xName="month"
                yName="courses"
                name="Courses"
                type="Area"
                fill="rgba(155, 142, 196, 0.15)"
                border={{ color: '#9b8ec4', width: 1.5 }}
                opacity={0.8}
              />
            </SeriesCollectionDirective>
          </ChartComponent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="p-10 text-center">
          <Shield size={40} className="text-ios-purple/40 mx-auto mb-3" />
          <h3 className="text-[17px] font-semibold text-ios-text mb-2">Platform Management</h3>
          <p className="text-ios-text-secondary max-w-md mx-auto text-[14px]">
            Advanced management features will appear here. Currently verified for Phase 1 stability.
          </p>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
