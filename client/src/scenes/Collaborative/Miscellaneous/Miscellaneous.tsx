import { Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import Header from '../../../components/Header';
import InstanceArtistsListened from '../../../components/ImplementedCards/InstanceArtistsListened';
import InstanceSongsListened from '../../../components/ImplementedCards/InstanceSongsListened';
import InstanceTimeListened from '../../../components/ImplementedCards/InstanceTimeListened';
import UserBestOfHour from '../../../components/ImplementedCharts/UserBestOfHour';
import UserTimeListenedPer from '../../../components/ImplementedCharts/UserTimeListenedPer';
import { selectUser } from '../../../services/redux/modules/user/selector';
import s from './index.module.css';

export default function AllStats() {
  const user = useSelector(selectUser);
  
  if (!user) {
    return null;
  }
  
  return (
    <div className={s.root}>
      <Header
        title="Miscellaneous"
        subtitle="Here are stats to compare the different users of this instance"
      />
      <div className={s.content}>
        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} md={6} lg={4}>
            <InstanceSongsListened />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InstanceTimeListened />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InstanceArtistsListened />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <UserTimeListenedPer className={s.chart} />
          </Grid>
          <Grid item xs={12} md={12} lg={6}>
            <UserBestOfHour className={s.chart} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
