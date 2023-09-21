import { useRouter } from 'next/router'
import { Tabs, Tab } from '@mui/material'
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
      {items.map(({ id, isFilled }, index) => (
        <Tab
          key={id}
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
      ))}
    </Tabs>
  )
}

export default Paging
