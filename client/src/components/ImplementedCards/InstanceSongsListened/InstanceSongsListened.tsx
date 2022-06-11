import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { Skeleton } from '@mui/material';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import { Timesplit } from '../../../services/types';
import TitleCard from '../../TitleCard';
import { ImplementedCardProps } from '../types';
import s from '../index.module.css';
import { getLastPeriod, getPercentMore } from '../../../services/stats';
import { selectRawIntervalDetail } from '../../../services/redux/modules/user/selector';
import Text from '../../Text';

interface InstanceSongsListenedProps extends ImplementedCardProps {}

export default function SongsListened({ className }: InstanceSongsListenedProps) {
  const { interval, unit } = useSelector(selectRawIntervalDetail);
  const result = useAPI(api.instanceSongsPer, interval.start, interval.end, Timesplit.all);
  const lastPeriod = useMemo(() => getLastPeriod(interval.start, interval.end), [interval]);
  const resultOld = useAPI(api.instanceSongsPer, lastPeriod.start, lastPeriod.end, Timesplit.all);

  if (!result || !resultOld) {
    return (
      <TitleCard title="Instance songs listened" className={className} fade>
        <div className={s.root}>
          <Text className={s.number}>
            <Skeleton width={50} />
          </Text>
          <Text>
            <Skeleton width={200} />
          </Text>
        </div>
      </TitleCard>
    );
  }

  const count = result[0]?.count ?? 0;
  const oldCount = resultOld[0]?.count ?? 0;

  const different = result[0]?.differents ?? 0;

  const percentMore = getPercentMore(oldCount, count);

  return (
    <TitleCard title="Instance songs listened" className={className} fade>
      <div className={s.root}>
        <div className={s.twonumbers}>
          <Text className={s.number}>{count}</Text>
          <Text className={s.number}>{different} diff.</Text>
        </div>
        <Text>
          <Text
            element="strong"
            className={clsx({
              [s.more]: percentMore >= 0,
              [s.less]: percentMore < 0,
            })}>
            {Math.abs(percentMore)}%
          </Text>
          <Text element="span">
            &nbsp;{percentMore < 0 ? 'less' : 'more'} than last {unit}
          </Text>
        </Text>
      </div>
    </TitleCard>
  );
}
