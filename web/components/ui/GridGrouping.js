/**
 * Copyright 2022-2024 HEIG-VD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import DropdownSelector from '../input/DropdownSelector'
import Datagrid from './DataGrid'
import { useTheme } from '@emotion/react'
import ScrollContainer from '../layout/ScrollContainer'

const elementGroupBy = (items, grouping) => {
  return items.reduce((acc, item) => {
    const key = `key_${item[grouping.groupBy]}`
    if (!acc[key]) {
      acc[key] = {
        label: key.replace('key_', ''),
        items: [],
      }
    }
    acc[key].items.push(item)
    return acc
  }, {})
}

const arrayGroupBy = (items, grouping) => {
  return items.reduce((acc, item) => {
    item[grouping.groupBy].forEach((arrayItem) => {
      const key = `key_${arrayItem[grouping.property]}`
      if (!acc[key]) {
        acc[key] = {
          label: key.replace('key_', ''),
          items: [],
        }
      }
      acc[key].items.push(item)
    })
    return acc
  }, {})
}

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

// Date Grouping Function
const dateGroupBy = (items, grouping) => {
  return items.reduce((acc, item) => {
    const date = new Date(item[grouping.groupBy])
    const year = date.getFullYear()
    const weekNumber = getWeekNumber(date)
    const key = `year_${year}_week_${weekNumber}`

    if (!acc[key]) {
      acc[key] = {
        label: key,
        items: [],
      }
    }

    acc[key].items.push(item)
    return acc
  }, {})
}

const groupByType = (items, grouping) => {
  switch (grouping.type) {
    case 'element':
      return elementGroupBy(items, grouping)
    case 'array':
      return arrayGroupBy(items, grouping)
    case 'date':
      return dateGroupBy(items, grouping)
    default:
      return items
  }
}

const GridGrouping = ({ label, header, items, groupings, actions }) => {
  const theme = useTheme()

  const [navigation, setNavigation] = useState('all')
  const [selectedGrouping, setSelectedGrouping] = useState(groupings[0]) // Default to first grouping

  const [groups, setGroups] = useState(groupByType(items, groupings[0]))

  useEffect(() => {
    setGroups(groupByType(items, selectedGrouping))
  }, [items])

  const handleGroupingChange = (option) => {
    const grouping = groupings.find((g) => g.option === option)
    setSelectedGrouping(grouping)
    setGroups(groupByType(items, grouping))
    setNavigation('all')
  }

  const handleNavigationChange = (value) => {
    setNavigation(value)
  }

  const navigationOptions = [
    { label: '/', value: 'all' },
    ...Object.keys(groups).map((key) => ({
      label: selectedGrouping.renderLabel(groups[key]),
      value: key,
    })),
  ]

  return (
    <Stack spacing={2} height={'100%'} position="relative">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        zIndex={2}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <DropdownSelector
            label={(option) =>
              `${items.length} ${label} grouped by ${option.label}`
            }
            optionInLabel
            color="info"
            value={selectedGrouping.option}
            options={groupings.map((g) => ({
              label: g.option,
              value: g.option,
            }))}
            onSelect={(value) => handleGroupingChange(value)}
          />

          <DropdownSelector
            color="info"
            label={(option) => option.label}
            value={navigation}
            options={navigationOptions || []}
            onSelect={handleNavigationChange}
          />
        </Stack>

        {actions}
      </Stack>
      <Stack flex={1}>
        <ScrollContainer spacing={2}>
          {Object.keys(groups).map((groupKey) =>
            navigation === 'all' || navigation === groupKey ? (
              <Stack key={groupKey}>
                <Stack
                  bgcolor={theme.palette.background.default}
                  p={1}
                  position={'sticky'}
                  top={0}
                  zIndex={1}
                >
                  {selectedGrouping.renderLabel &&
                    selectedGrouping.renderLabel(groups[groupKey])}
                </Stack>

                <Datagrid items={groups[groupKey].items} header={header} />
              </Stack>
            ) : null
          )}
        </ScrollContainer>
      </Stack>
    </Stack>
  )
}

export default GridGrouping
