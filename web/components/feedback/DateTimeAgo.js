import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import { Typography } from '@mui/material'

TimeAgo.addLocale(en)

const DateTimeAgo = ({ date }) => (
  <Typography variant={'caption'}>
    <ReactTimeAgo date={date} locale="en-US" timeStyle="round-minute" />
  </Typography>
)

export default DateTimeAgo
