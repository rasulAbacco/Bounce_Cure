// src/components/DealCharts.jsx
import { Pie, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export function PipelineChart({ deals }) {
    const stages = ["Negotiation", "Proposal Sent", "Closed Won", "Closed Lost"];
    const stageCounts = stages.map(stage =>
        deals.filter(deal => deal.stage === stage).length
    );

    const data = {
        labels: stages,
        datasets: [
            {
                label: "Deals",
                data: stageCounts,
                backgroundColor: [
                    "rgba(139, 69, 255, 0.9)",   // Purple - Negotiation
                    "rgba(59, 130, 246, 0.9)",   // Blue - Proposal Sent
                    "rgba(34, 197, 94, 0.9)",    // Green - Closed Won
                    "rgba(248, 113, 113, 0.9)",  // Red - Closed Lost
                ],
                borderColor: [
                    "rgba(139, 69, 255, 1)",
                    "rgba(59, 130, 246, 1)",
                    "rgba(34, 197, 94, 1)",
                    "rgba(248, 113, 113, 1)",
                ],
                borderWidth: 3,
                hoverBackgroundColor: [
                    "rgba(139, 69, 255, 1)",
                    "rgba(59, 130, 246, 1)",
                    "rgba(34, 197, 94, 1)",
                    "rgba(248, 113, 113, 1)",
                ],
                hoverBorderColor: "rgba(255, 255, 255, 1)",
                hoverBorderWidth: 4,
                offset: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#e4e4e7',
                    font: {
                        family: 'Inter, system-ui, sans-serif',
                        size: 13,
                        weight: '500',
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(24, 24, 27, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#e4e4e7',
                borderColor: 'rgba(63, 63, 70, 0.8)',
                borderWidth: 1,
                cornerRadius: 12,
                displayColors: true,
                padding: 16,
                titleFont: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 14,
                    weight: '600',
                },
                bodyFont: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 13,
                    weight: '400',
                },
                callbacks: {
                    label: function (context) {
                        const percentage = ((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} deals (${percentage}%)`;
                    }
                }
            },
        },
        elements: {
            arc: {
                borderRadius: 6,
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1200,
            easing: 'easeOutQuart',
        },
    };

    return (
        <div className="relative">
            <div className="h-80">
                <Pie data={data} options={options} />
            </div>
        </div>
    );
}

export function ConversionChart({ deals }) {
    const won = deals.filter(d => d.status === "Won").length;
    const total = deals.length;
    const conversion = ((won / total) * 100).toFixed(1);

    const data = {
        labels: ["Won", "Others"],
        datasets: [
            {
                data: [won, total - won],
                backgroundColor: [
                    "rgba(16, 185, 129, 0.9)",   // Emerald - Won
                    "rgba(156, 163, 175, 0.6)",  // Gray - Others
                ],
                borderColor: [
                    "rgba(16, 185, 129, 1)",
                    "rgba(156, 163, 175, 0.8)",
                ],
                borderWidth: 3,
                hoverBackgroundColor: [
                    "rgba(16, 185, 129, 1)",
                    "rgba(156, 163, 175, 0.8)",
                ],
                hoverBorderColor: "rgba(255, 255, 255, 1)",
                hoverBorderWidth: 4,
                cutout: '70%',
                offset: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#e4e4e7',
                    font: {
                        family: 'Inter, system-ui, sans-serif',
                        size: 13,
                        weight: '500',
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(24, 24, 27, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#e4e4e7',
                borderColor: 'rgba(63, 63, 70, 0.8)',
                borderWidth: 1,
                cornerRadius: 12,
                displayColors: true,
                padding: 16,
                titleFont: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 14,
                    weight: '600',
                },
                bodyFont: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 13,
                    weight: '400',
                },
                callbacks: {
                    label: function (context) {
                        const percentage = ((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} deals (${percentage}%)`;
                    }
                }
            },
        },
        elements: {
            arc: {
                borderRadius: 8,
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1200,
            easing: 'easeOutQuart',
        },
    };

    return (
        <div className="relative w-full">
            <div className="h-80">
                <Doughnut data={data} options={options} />
            </div>
            {/* Center text overlay for doughnut chart */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center flex flex-col items-center justify-center mb-auto mt-[15%]">
                    <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                        {conversion}%
                    </div>
                    <div className="text-sm text-zinc-400 font-medium mt-1">
                        Conversion Rate
                    </div>
                </div>
            </div>
            {/* Bottom stats */}
            <div className="mt-6 flex justify-center space-x-8 text-sm">
                <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{won}</div>
                    <div className="text-zinc-400 font-medium">Won Deals</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-zinc-300">{total}</div>
                    <div className="text-zinc-400 font-medium">Total Deals</div>
                </div>
            </div>
        </div>
    );
}