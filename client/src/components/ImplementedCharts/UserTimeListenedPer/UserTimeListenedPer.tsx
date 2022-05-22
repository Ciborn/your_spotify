import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import {
  buildXYDataObjSpread,
  formatXAxisDateTooltip,
  useFormatXAxis,
} from '../../../services/stats';
import { DateId } from '../../../services/types';
import ChartCard from '../../ChartCard';
import LoadingImplementedChart from '../LoadingImplementedChart';
import { ImplementedChartProps } from '../types';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import { useRawTooltipLabelFormatter } from '../../../services/chart';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getColor } from '../../../services/colors';
import { User } from '../../../services/redux/modules/user/types';

interface UserTimeListenedPerProps extends ImplementedChartProps {}

const formatYAxis = (value: any) => {
  return `${Math.floor(value * 100)}%`;
};

export default function UserTimeListenedPer({ className }: UserTimeListenedPerProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const results = useAPI(api.userTimePer, interval.start, interval.end, interval.timesplit);

  const resultsWithCount = useMemo(
    () =>
      results?.map((res) => ({
        _id: res._id,
        users: res.users.reduce<Record<string, number>>((acc, curr, idx) => {
          acc[curr.id] = res.counts[idx];
          return acc;
        }, {}),
      })),
    [results],
  );

  const allUsers = useMemo(() => {
    const all: Record<string, User> = {};
    results?.forEach((res) => {
      res.users.forEach((user) => {
        if (!(user._id in all)) {
          all[user.id] = user;
        }
      });
    });
    return all;
  }, [results]);

  const data = useMemo(() => {
    if (!resultsWithCount) {
      return [];
    }
    const d = resultsWithCount.map((curr, idx) => {
      const obj: { x: number; _id: DateId } & any = {
        x: idx,
        _id: curr._id as DateId,
      };
      const total = Object.values(curr.users).reduce((acc, count) => acc + count, 0);
      Object.values(allUsers).forEach((user) => {
        obj[user.id] = (curr.users[user.id] ?? 0) / total;
      });
      return obj;
    }, []);
    return buildXYDataObjSpread(d, Object.keys(allUsers), interval.start, interval.end, false);
  }, [allUsers, interval, resultsWithCount]);

  const tooltipLabelFormatter = useRawTooltipLabelFormatter(formatXAxisDateTooltip, false);

  const tooltipValueFormatter = useCallback(
    (value: number, label: string) => {
      if (value === 0) {
        return [<span />];
      }
      return [`${allUsers[label].username}: ${Math.floor(value * 1000) / 10}%`];
    },
    [allUsers],
  );

  const tooltipSorter = useCallback((a: any) => {
    return -a.payload[a.dataKey];
  }, []);

  const formatX = useFormatXAxis(data);

  if (!results) {
    return <LoadingImplementedChart title="User listening distribution" className={className} />;
  }

  return (
    <ChartCard title="User listening distribution" className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="x" tickFormatter={formatX} style={{ fontWeight: 'bold' }} />
          <YAxis domain={[0, 1]} tickFormatter={formatYAxis} />
          <Tooltip
            formatter={tooltipValueFormatter}
            labelFormatter={tooltipLabelFormatter}
            wrapperStyle={{ zIndex: 1000 }}
            contentStyle={{ background: 'var(--background)' }}
            itemSorter={tooltipSorter}
          />
          {Object.values(allUsers).map((user, idx) => (
            <Area
              type="monotone"
              dataKey={user.id}
              key={user.id}
              stackId={-1}
              stroke={getColor(idx)}
              fill={getColor(idx)}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
