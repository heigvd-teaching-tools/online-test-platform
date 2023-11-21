import useSWR from 'swr'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import LayoutMain from '../../layout/LayoutMain'
import LayoutSplitScreen from '../../layout/LayoutSplitScreen'
import { Role } from '@prisma/client'
import Authorisation from '../../security/Authorisation'
import QuestionFilter from '../../question/QuestionFilter'
import MainMenu from '../../layout/MainMenu'
import { Box, Button, ButtonGroup, Chip, FormControl, IconButton, InputLabel, MenuItem, Stack, Toolbar, Tooltip, Typography } from '@mui/material'
import { useSnackbar } from '../../../context/SnackbarContext'
import { useRouter } from 'next/router'
import AddQuestionDialog from '../list/AddQuestionDialog'
import QuestionListItem from '../list/QuestionListItem'
import AlertFeedback from '../../feedback/AlertFeedback'
import Loading from '../../feedback/Loading'
import { fetcher } from '../../../code/utils'
import ScrollContainer from '../../layout/ScrollContainer'
import QuestionUpdate from '../../question/QuestionUpdate'
import ResizableDrawer from '../../layout/utils/ResizableDrawer'
import Image from 'next/image'
import Datagrid from '@/components/ui/DataGrid'
import QuestionTypeIcon from '@/components/question/QuestionTypeIcon'
import QuestionTagsViewer from '@/components/question/tags/QuestionTagsViewer'
import DateTimeAgo from '@/components/feedback/DateTimeAgo'
import DropdownSelector from '@/components/input/DropdownSelector'

const PageList = () => {
  const router = useRouter()

  const { groupScope } = router.query

  const { show: showSnackbar } = useSnackbar()

  const [queryString, setQueryString] = useState(undefined)

  const {
    data: questions,
    error,
    mutate,
  } = useSWR(
    `/api/${groupScope}/questions${
      queryString ? `?${new URLSearchParams(queryString).toString()}` : ''
    }`,
      groupScope ? fetcher : null
  )

  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const [ selected, setSelected ] = useState(undefined)

  const createQuestion = useCallback(
    async (type, language) => {
      // language only used for code questions
      await fetch(`/api/${groupScope}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          type,
          language,
        }),
      })
        .then((res) => res.json())
        .then(async (createdQuestion) => {
          showSnackbar('Question created', 'success')
          await mutate([...questions, createdQuestion])
          await router.push(`/${groupScope}/questions/${createdQuestion.id}`)
        })
        .catch(() => {
          showSnackbar('Error creating questions', 'error')
        })
    },
    [groupScope, router, showSnackbar, questions, mutate]
  )

  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <Loading loading={!questions} errors={[error]}>
        <LayoutMain header={<MainMenu />}>
          <LayoutSplitScreen
            leftPanel={<QuestionFilter onApplyFilter={setQueryString} />}
            rightWidth={80}
            rightPanel={
              questions && (
                <Stack spacing={2} padding={2} height={'100%'}>
                  <ScrollContainer spacing={4} padding={1}>
                    <GridGrouping
                        label="Questions"
                        actions={
                          <Button onClick={() => setAddDialogOpen(true)}>
                            Create a new question
                          </Button>
                        }
                        header={{
                          actions: {
                            label: 'Actions',
                            width: '80px',
                          },
                          columns: [
                            {
                              label: 'Type',
                              column: { width: '140px' },
                              renderCell: (row) => <QuestionTypeIcon type={row.type} size={24} withLabel />,
                            },
                            {
                              label: 'Title',
                              column: { flexGrow: 1 },
                              renderCell: (row) => <Typography variant={"body2"}>{row.title}</Typography>
                            },
                            {
                              label: 'Tags',
                              column: { width: '200px' },
                              renderCell: (row) => <QuestionTagsViewer size={'small'} tags={row.questionToTag} collapseAfter={2} />
                            },
                            {
                              label: 'Updated',
                              column: { width: '80px' },
                              renderCell: (row) => <DateTimeAgo date={new Date(row.updatedAt)} />
                            },
                          ],
                        }}

                        items={questions.map((question) => ({
                          ...question,
                          meta:{
                            key: question.id,
                            actions: [
                              <React.Fragment key="actions">
                                <Tooltip title="Update in new page">
                                  <IconButton
                                    onClick={async () => {
                                      await router.push(`/${groupScope}/questions/${question.id}`);
                                    }}
                                  >
                                    <Image src={'/svg/icons/update.svg'} width={16} height={16} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Update in overlay">
                                  <IconButton
                                    onClick={() => setSelected(question)}
                                  >
                                    <Image src={'/svg/icons/aside.svg'} width={16} height={16} />
                                  </IconButton>
                                </Tooltip>
                              </React.Fragment>
                          ]
                          }
                        }))}
                        groupings={[
                          {
                            groupBy: 'updatedAt',
                            option: 'Last Update',
                            type: 'date',
                            renderLabel: (row) => {              
                              return <Typography variant={'h4'}>{weeksAgo(row.label)}</Typography>;
                            },
                          },
                          {
                            groupBy: 'questionToTag',
                            option: 'Tags',
                            type: 'array',
                            property: 'label',
                            renderLabel: (row) => {
                              return (
                                <Typography variant={'h3'}>
                                  {row.label}
                                </Typography>
                              )
                            }
                          },
                          {
                            groupBy: 'type',
                            option: 'Question Type',
                            type: 'element',
                            renderLabel: (row) => {
                              return <Typography variant={'h3'}>{questionTypeToLabel(row.label)}</Typography>;
                            },
                          },
                          {
                            groupBy: 'createdAt',
                            option: 'Created At',
                            type: 'date',
                            renderLabel: (row) => {              
                              return <Typography variant={'h3'}>{weeksAgo(row.label)}</Typography>;
                            },
                          }
                        ]}
                      />

                      <ResizableDrawer
                        open={selected !== undefined}
                        onClose={() => setSelected(undefined)}
                      >
                        <Box pt={2} width={"100%"} height={"100%"}>
                          { selected && (
                              <QuestionUpdate
                                groupScope={router.query.groupScope}
                                questionId={selected.id}
                                onUpdate={async (question) => {
                                  await mutate()
                                  setSelected(question)
                                }}
                                onDelete={async () => {
                                  await mutate()
                                  setSelected(undefined)
                                }}
                              />
                            )
                          }
                        </Box>
                      </ResizableDrawer>

                  </ScrollContainer>
                  {questions && questions.length === 0 && (
                    <AlertFeedback severity="info">
                      <Typography variant="body1">
                        No questions found in this group. Try changing your
                        search criteria
                      </Typography>
                    </AlertFeedback>
                  )}
                </Stack>
              )
            }
          />
          <AddQuestionDialog
            open={addDialogOpen}
            onClose={() => setAddDialogOpen(false)}
            handleAddQuestion={async (type, language) => {
              await createQuestion(type, language)
              setAddDialogOpen(false)
            }}
          />
        </LayoutMain>
      </Loading>
    </Authorisation>
  )
}


const GridGrouping = ({ label, header, items, groupings, actions }) => {

    const [selectedGrouping, setSelectedGrouping] = useState(groupings[0]); // Default to first grouping

    const elementGroupBy = (items, grouping) => {
        return items.reduce((acc, item) => {
            const key = `key_${item[grouping.groupBy]}`;
            if (!acc[key]) {
                acc[key] = { 
                  label: key.replace('key_', ''),
                  items: [],
                };
            }
            acc[key].items.push(item);
            return acc;
        }, {});
    };

    const arrayGroupBy = (items, grouping) => {
      return items.reduce((acc, item) => {
          item[grouping.groupBy].forEach(arrayItem => {
              const key = `key_${arrayItem[grouping.property]}`
              if (!acc[key]) {
                  acc[key] = { 
                    label: key.replace('key_', ''),
                    items: [],
                  };
              }
              acc[key].items.push(item);
          });
          return acc;
      }, {});
    };

    const getWeekNumber = (date) => {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };
    
    // Date Grouping Function
    const dateGroupBy = (items, grouping) => {
      return items.reduce((acc, item) => {
        const date = new Date(item[grouping.groupBy]);
        const year = date.getFullYear();
        const weekNumber = getWeekNumber(date);
        const key = `year_${year}_week_${weekNumber}`;
    
        if (!acc[key]) {
          acc[key] = { 
            label: key, 
            items: [] 
          };
        }
    
        acc[key].items.push(item);
        return acc;
      }, {});
    };
    


    const groupByType = (items, grouping) => {
      switch (grouping.type) {
        case 'element':
          return elementGroupBy(items, grouping);
        case 'array':
          return arrayGroupBy(items, grouping);
        case 'date':
          return dateGroupBy(items, grouping);
        default:
          return items;
      }
    };

    const handleGroupingChange = (option) => {
      const grouping = groupings.find((g) => g.option === option);
      setSelectedGrouping(grouping);
    };


    const groups = groupByType(items, selectedGrouping);

    return (
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <DropdownSelector
            label={`${items.length} ${label} grouped by`}
            color="info"
            value={selectedGrouping.option}
            options={groupings.map((g) => ({ label: g.option, value: g.option }))}
            onSelect={(value) => handleGroupingChange(value)}
          />
          {actions}
        </Stack>

        {Object.keys(groups).map((groupKey) => (
          <>
            {selectedGrouping.renderLabel && selectedGrouping.renderLabel(groups[groupKey])}
            <Datagrid 
              items={groups[groupKey].items} 
              header={header} 
            />
          </>
        ))}
      </Stack>
    );
}


const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};


const weeksAgo = (label) => {
  const parts = label.split('_');
  const year = parseInt(parts[1], 10);
  const weekNumber = parseInt(parts[3], 10);
  const currentYear = new Date().getFullYear();
  const currentWeekNumber = getWeekNumber(new Date());

  // Calculate the difference in weeks considering the year
  const weeksAgo = (currentYear - year) * 52 + (currentWeekNumber - weekNumber);

  switch (weeksAgo) {
    case 0:
      return 'This week';
    case 1:
      return 'Last week';
    default:
      return `${weeksAgo} weeks ago`;
  }
};

const questionTypeToLabel = (type) => {
  switch (type) {
    case 'code':
      return 'Code';
    case 'multipleChoice':
      return 'Multiple Choice';
    case 'essay':
      return 'Essay';
    case 'trueFalse':
      return 'True/False';
    case 'web':
      return 'Web';
    case 'database':
      return 'Database';
    default:
      return type;
  }
};


export default PageList
