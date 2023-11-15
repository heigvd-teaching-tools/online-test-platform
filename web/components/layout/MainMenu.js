import Link from 'next/link'
import { useRouter } from 'next/router'
import { Tabs, Tab, Box, Stack } from '@mui/material'
import GroupSelector from './GroupSelector'
const MainMenu = () => {
    const { query, asPath } = useRouter()
    const { groupScope } = query

    return (
        <Stack direction={'row'} spacing={1} alignItems={'center'}>
          <Box>
            <GroupSelector />
          </Box>
          <Tabs
            variant="scrollable"
            value={asPath.split('/')[2] || 'questions'}
            aria-label="main-menu"
            textColor="inherit"
            indicatorColor="secondary"
          >
            {mainPaths.map((path) => (
              <Link
                key={path.path}
                value={path.path}
                href={`/${groupScope}/${path.path}`}
                passHref
              >
                <Tab
                  value={path.path}
                  label={path.label}
                  sx={{ opacity: 1, m: 1 }}
                />
              </Link>
            ))}
          </Tabs>
        </Stack>
    )
}

const mainPaths = [
  {
    path: 'questions',
    label: 'Questions',
  },
  {
    path: 'collections',
    label: 'Collections',
  },
  {
    path: 'evaluation',
    label: 'evaluation',
  },
]

export default MainMenu
