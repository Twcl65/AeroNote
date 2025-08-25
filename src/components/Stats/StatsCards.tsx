import React from 'react';
import {
    FileText,
    Pin,
    Lock,
    BarChart3,
    Share2,
    Activity
} from 'lucide-react';
import { Note } from '../../store/noteStore';
import { formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts';

interface StatsCardsProps {
    notes: Note[];
    onFilterChange?: (filter: string) => void;
    currentFilter?: string;
    onTagFilterChange?: (tag: string) => void;
    selectedTag?: string;
}

const StatsCards: React.FC<StatsCardsProps> = ({ notes, onFilterChange, currentFilter, onTagFilterChange, selectedTag }) => {
    const stats = {
        total: notes.length,
        pinned: notes.filter(note => note.isPinned).length,
        protected: notes.filter(note => note.isProtected).length,
        recent: notes.filter(note => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return new Date(note.updatedAt) > oneWeekAgo;
        }).length,
        totalTags: new Set(notes.flatMap(note => note.tags)).size,
        totalVersions: notes.reduce((sum, note) => sum + note.version, 0),
        averageLength: notes.length > 0
            ? Math.round(notes.reduce((sum, note) => sum + note.content.length, 0) / notes.length)
            : 0
    };

    const getMonthlyData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const monthlyCounts = new Array(12).fill(0);

        notes.forEach(note => {
            const noteDate = new Date(note.createdAt);
            if (noteDate.getFullYear() === currentYear) {
                monthlyCounts[noteDate.getMonth()]++;
            }
        });

        const fiveMonths = [];
        for (let i = 0; i < 5; i++) {
            const monthIndex = (currentMonth + i) % 12;
            fiveMonths.push({
                month: months[monthIndex],
                count: monthlyCounts[monthIndex]
            });
        }

        return fiveMonths;
    };

    const getChartSubtitle = () => {
        const data = getMonthlyData();
        if (data.length === 0) return 'No data available';

        const firstMonth = data[0].month;
        const lastMonth = data[data.length - 1].month;
        const currentYear = new Date().getFullYear();

        if (data.length === 1) {
            return `${firstMonth} ${currentYear}`;
        }

        return `${firstMonth} - ${lastMonth} ${currentYear}`;
    };

    const getRecentActivity = () => {
        const recentNotes = notes
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);

        return recentNotes.map(note => ({
            text: `${note.title} was updated`,
            time: formatDistanceToNow(note.updatedAt, { addSuffix: true }),
            color: note.isPinned ? 'bg-amber-500' : note.isProtected ? 'bg-purple-500' : 'bg-blue-500'
        }));
    };

    const statCards = [
        {
            title: 'Total Notes',
            value: stats.total,
            icon: FileText,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            darkBgColor: 'dark:bg-blue-900/20'
        },
        {
            title: 'Pinned Notes',
            value: stats.pinned,
            icon: Pin,
            color: 'bg-amber-500',
            textColor: 'text-amber-600',
            bgColor: 'bg-amber-50',
            darkBgColor: 'dark:bg-amber-900/20'
        },
        {
            title: 'Protected Notes',
            value: stats.protected,
            icon: Lock,
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            darkBgColor: 'dark:bg-purple-900/20'
        },
        {
            title: 'Recent (7 days)',
            value: stats.recent,
            icon: BarChart3,
            color: 'bg-green-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50',
            darkBgColor: 'dark:bg-green-900/20'
        },
        {
            title: 'Total Tags',
            value: stats.totalTags,
            icon: BarChart3,
            color: 'bg-indigo-500',
            textColor: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            darkBgColor: 'dark:bg-indigo-900/20'
        },
        {
            title: 'Avg Length',
            value: `${stats.averageLength} chars`,
            icon: BarChart3,
            color: 'bg-rose-500',
            textColor: 'text-rose-600',
            bgColor: 'bg-rose-50',
            darkBgColor: 'dark:bg-rose-900/20'
        }
    ];

    return (
        <div className="mb-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 sm:p-3 lg:p-4 shadow-xs"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className={`${stat.color} p-1.5 sm:p-2 rounded-lg`}>
                                <stat.icon size={14} className="text-white sm:w-4 sm:h-4" />
                            </div>
                            <span className={`${stat.textColor} text-xs font-medium`}>
                                {stat.value}
                            </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            {stat.title}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Charts Section - Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Monthly Notes Creation Chart */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 shadow-xs">
                    <div className="mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                                Total Notes
                            </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {getChartSubtitle()}
                        </p>
                    </div>
                    <div className="w-full h-32 sm:h-40 lg:h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={getMonthlyData()}
                                margin={{
                                    top: 20,
                                    left: 5,
                                    right: 5,
                                    bottom: 20,
                                }}
                            >
                                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={8}
                                    axisLine={false}
                                    stroke="#6b7280"
                                    fontSize={10}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#60a5fa"
                                    radius={[4, 4, 0, 0]}
                                    barSize={30}
                                >
                                    <LabelList
                                        dataKey="count"
                                        position="top"
                                        offset={10}
                                        fill="#374151"
                                        fontSize={10}
                                        fontWeight="500"
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Shared Notes Graph */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 shadow-xs">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Shared Notes
                        </h3>
                    </div>
                    <div className="flex items-center justify-center h-32 sm:h-40 lg:h-[200px]">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-gray-400 dark:text-gray-500 mb-2">
                                Coming Soon
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                Sharing functionality will be available soon
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 shadow-xs">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Recent Activity
                        </h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        {getRecentActivity().slice(0, 5).map((activity, index) => (
                            <div key={index} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${activity.color}`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-900 dark:text-gray-100 truncate">
                                        {activity.text}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="py-4 sm:py-6 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-2 sm:mb-3">
                    {/* Brand Section - Left Side */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-sm sm:text-lg font-bold text-blue-600">AeroNote</h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                                A clean and organized notepad application built for productivity and note-taking.
                            </p>
                        </div>
                    </div>

                    {/* Social Links - Right Side */}
                    <div className="text-right">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                            Connect with Us
                        </h4>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Built By - Centered Below */}
                <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Built by Twcl65
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StatsCards;
