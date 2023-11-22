import { useRouter } from 'next/router'
import { Tabs, Tab, Tooltip, Typography } from '@mui/material'
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
      {items.map((item, index) => (
        <Tooltip key={item.id} title={item.tooltip && 
          <Typography variant="caption">
            {item.tooltip}
          </Typography>
        } placement="bottom">
        <Tab
          label={item.label}
          iconPosition="start"
          sx={{ minHeight: '50px', minWidth: 0, mb: 1, mt: 1 }}
          value={index}
          icon={
            ( 
              item.icon && item.icon 
            ) || (
              item.fillable &&
              <FilledBullet
                index={index}
                isFilled={item.isFilled}
              />
            )            
          }
        />
        </Tooltip>
      ))}
    </Tabs>
  )
}

export default Paging
