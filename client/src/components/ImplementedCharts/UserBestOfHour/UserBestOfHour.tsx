import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Payload } from 'recharts/types/component/DefaultTooltipContent';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import { UnboxPromise } from '../../../services/types';
import ChartCard from '../../ChartCard';
import StackedBar from '../../charts/StackedBar';
import { StackedBarProps } from '../../charts/StackedBar/StackedBar';
import LoadingImplementedChart from '../LoadingImplementedChart';
import { ImplementedChartProps } from '../types';

interface UserBestOfHourProps extends ImplementedChartProps {}

function getElementName(
  result: UnboxPromise<ReturnType<typeof api.getBestUsersOfHour>>['data'][number],
  id: string,
) {
  return result.users.find((t) => t.user.id === id)?.user.username;
}

function getElementData(
  result: UnboxPromise<ReturnType<typeof api.getBestUsersOfHour>>['data'],
  index: number,
) {
  const foundIndex = result.findIndex((r) => r._id === index);
  if (foundIndex === -1) {
    return { x: index };
  }
  const found = result[foundIndex];
  const { total } = found;

  if ('users' in found) {
    return found.users.reduce<StackedBarProps['data'][number]>(
      (acc, curr) => {
        acc[curr.user.id] = Math.floor((curr.count / total) * 1000) / 10;
        return acc;
      },
      { x: index },
    );
  }
  return { x: index };
}

function formatX(value: any) {
  return `${value}:00`;
}

function itemSorter(item: Payload<number, string>) {
  return -(item.value ?? 0);
}

export default function UserBestOfHour({ className }: UserBestOfHourProps) {
  const { interval } = useSelector(selectRawIntervalDetail);
  const result = useAPI(api.getBestUsersOfHour, interval.start, interval.end);

  const data = useMemo(() => {
    if (!result) {
      return [];
    }
    return Array.from(Array(24).keys()).map((index) => getElementData(result, index));
  }, [result]);

  const labelFormatter = useCallback(
    (label: string) => {
      return `20 most listened users at ${label}:00`;
    },
    ["users"],
  );

  const valueFormatter = useCallback(
    (value: number, elementId: string, { payload }: any) => {
      const foundIndex = result?.findIndex((r) => r._id === payload.x);
      if (result && foundIndex !== undefined && foundIndex !== -1) {
        const found = result[foundIndex];
        return [`${value}% of ${getElementName(found, elementId)}`];
      }
      return [];
    },
    [result],
  );

  if (!result) {
    return (
      <LoadingImplementedChart title={`Best users for hour of day`} className={className} />
    );
  }

  return (
    <ChartCard
      title={`Best users for hour of day`}
      className={className}>
      <StackedBar
        data={data}
        xFormat={formatX}
        tooltipLabelFormatter={labelFormatter}
        tooltipValueFormatter={valueFormatter}
        tooltipItemSorter={itemSorter as any}
      />
    </ChartCard>
  );
}
