import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format, eachDayOfInterval, subDays, isEqual } from 'date-fns';

interface ActivityDay {
  date: Date;
  count: number;
}

interface ActivityHeatmapProps {
  activities: {
    completedAt: string;
  }[];
  days?: number;
}

export function ActivityHeatmap({ activities = [], days = 365 }: ActivityHeatmapProps) {
  const getActivityCount = (date: Date): number => {
    if (!Array.isArray(activities)) return 0;
    return activities.filter(activity => 
      activity?.completedAt && isEqual(new Date(activity.completedAt).setHours(0, 0, 0, 0), date.setHours(0, 0, 0, 0))
    ).length;
  };
  const getDayIntensity = (count: number): string => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900/60';
    if (count === 2) return 'bg-emerald-300 dark:bg-emerald-700';
    if (count === 3) return 'bg-emerald-400 dark:bg-emerald-600';
    return 'bg-emerald-500 dark:bg-emerald-500';
  };

  const today = new Date();
  const dateRange = eachDayOfInterval({
    start: subDays(today, days),
    end: today
  });

  const activityData: ActivityDay[] = dateRange.map(date => ({
    date,
    count: getActivityCount(date)
  }));

  // Group by weeks for the grid
  const weeks: ActivityDay[][] = [];
  let week: ActivityDay[] = [];

  activityData.forEach((day, index) => {
    week.push(day);
    if ((index + 1) % 7 === 0 || index === activityData.length - 1) {
      weeks.push(week);
      week = [];
    }
  });
  return (    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pb-2 bg-transparent">
        <CardTitle className="text-base font-medium text-muted-foreground">
          {activityData.reduce((sum, day) => sum + day.count, 0)} activities in the last year
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-2">            {/* Month labels */}
            <div className="flex h-8 ml-8">
              {Array.from({ length: 12 }, (_, i) => {
                const date = subDays(today, (12 - i - 1) * 30);
                return (
                  <div key={i} className="flex-1 text-xs font-medium">
                    {format(date, 'MMM')}
                  </div>
                );
              })}
            </div>

            {/* Day labels and grid */}
            <div className="flex">
              {/* Day of week labels */}
              <div className="flex flex-col justify-between mr-2 text-xs text-gray-400 pt-2">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* Activity grid */}              <div className="grid grid-flow-col gap-[3px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                    {week.map((day, dayIndex) => (
                      <Tooltip key={dayIndex} delayDuration={50}>
                        <TooltipTrigger asChild>
                          <div 
                            className={`w-[10px] h-[10px] rounded-sm ${getDayIntensity(day.count)} transition-colors`}
                            aria-label={`${day.count} activities on ${format(day.date, 'PP')}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p className="font-medium">{day.count} activities</p>
                          <p className="text-muted-foreground">{format(day.date, 'MMMM d, yyyy')}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>            {/* Legend */}
            <div className="flex items-center gap-2 mt-6 text-xs">
              <span className="text-muted-foreground font-medium">Activity:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Less</span>
                <div className="flex gap-[3px]">
                  {[
                    'bg-gray-100 dark:bg-gray-800',
                    'bg-emerald-200 dark:bg-emerald-900/60',
                    'bg-emerald-300 dark:bg-emerald-700',
                    'bg-emerald-400 dark:bg-emerald-600',
                    'bg-emerald-500 dark:bg-emerald-500'
                  ].map((color, i) => (
                    <div key={i} className={`w-[10px] h-[10px] rounded-sm ${color}`} />
                  ))}
                </div>
                <span className="text-muted-foreground">More</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
