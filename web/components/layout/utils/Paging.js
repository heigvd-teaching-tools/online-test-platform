import { useRouter } from 'next/router'
import { Tabs, Tab, Tooltip } from '@mui/material'
import FilledBullet from '../../feedback/FilledBullet'
const Paging = ({ items, active, link }) => {
  const router = useRouter()

  return (
    <Tabs
      value={items.map(({ id }) => id).indexOf(active?.id || 0)}
      variant="scrollable"
      scrollButtons="auto"
      onChange={(e, index) => router.push(link(items[index].id, index))}
    >
      {items.map(({ id, tooltip, isFilled }, index) => (
        <Tooltip key={id} title={tooltip} placement="bottom">
        <Tab
          label={`Q${index + 1}`}
          iconPosition="start"
          sx={{ minHeight: '50px', minWidth: 0, mb: 1, mt: 1 }}
          value={index}
          icon={
            <FilledBullet
              index={index}
              isFilled={isFilled}
            />
          }
        />
        </Tooltip>
      ))}
    </Tabs>
  )
}

export default Paging
