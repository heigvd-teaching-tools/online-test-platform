import {useState} from "react";
import Link from 'next/link';
import {Box, IconButton, List, ListItem, Menu, Stack, Typography} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import Row from '../layout/utils/Row';
import Column from '../layout/utils/Column';

const Datagrid = ({ header, items }) => {
    return (
        <List>
        <ListItem divider>
            <Row>
            {header.columns.map(({label, column}) => (
                <Column key={label} {...column}>
                    <Typography variant="button">{label}</Typography>
                </Column>
            ))}

            {header.actions &&
                <Column key="actions" width={header.actions.width} right>
                    <Typography variant="button">{header.actions.label}</Typography>
                </Column>
            }

            </Row>
        </ListItem>
        { items && items.length > 0 && items.map((item, index) => (
            item.meta ? (
                    (
                        // list item is a link
                        item.meta.linkHref &&
                            <Link component="button" key={item.meta.key} href={item.meta.linkHref}>
                                <a>
                                    <ListItemContent item={item} header={header} />
                                </a>
                            </Link>
                    ) || (
                        // list item is a clickable
                        item.meta.onClick &&
                            <Box key={item.meta.key} onClick={item.meta.onClick}>
                                <ListItemContent item={item} header={header} />
                            </Box>
                    ) || (
                        <ListItemContent key={item.meta.key} item={item} header={header} />
                    )

            ) : (
                <ListItemContent key={item.meta.key} item={item} header={header} />
            )
        ))}
      </List>
    )
}

const ListItemContent = ({ item, header }) =>
    <ListItem divider>
        <Row>
            {
            Object.keys(item).map((key, index) => {
                if(index < header.columns.length && key !== 'meta') {
                    return (
                        <Column key={key} {...header.columns[index].column}>
                            {item[key] || ""}
                        </Column>
                    )
                }
            }
            )}
            {
                item.meta && item.meta.actions && header.actions &&
                <Column key="actions" width={header.actions.width} right>
                    <ActionsColumn meta={item.meta} actions={item.meta.actions} />
                </Column>
            }
        </Row>
    </ListItem>


const ActionsColumn = ({ meta, actions }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    if(actions?.length === 0){
        return null;
    }
    return(
        <>
            {
                (
                    meta.collapsedActions && actions.length > 0 &&
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <IconButton size="small" onClick={(ev) => {
                                ev.preventDefault();
                                ev.stopPropagation();
                                setAnchorEl(ev.currentTarget);
                            }}>
                                <MoreVertIcon />
                            </IconButton>
                            <ActionsContextMenu
                                actions={actions}
                                anchorEl={anchorEl}
                                handleCloseContextMenu={
                                    (ev) => {
                                        ev.preventDefault();
                                        ev.stopPropagation();
                                        setAnchorEl(null);
                                    }
                                }
                            />
                        </Box>
                ) || (
                    actions.length > 0 && actions
                )
            }
        </>
    )
}
/*
* ActionsContextMenu
* When the grid item is collapsed, the actions are displayed in a context menu accessed by clicking the
* MoreVertIcon (triple point) in the ActionsColumn component
* @param {Array} actions - array of actions to display in the context menu
* @param {Element} anchorEl - element to anchor the context menu to
*
* */
const ActionsContextMenu = ({  actions, anchorEl, handleCloseContextMenu }) => {
    return(
        <Menu
            sx={{ mt: '40px' }}
            id="grid-context-menu"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right', }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right', }}
            open={Boolean(anchorEl)}
            onClose={handleCloseContextMenu}
        >
            <Stack padding={2} spacing={2} alignItems={"flex-start"}>
                {actions}
            </Stack>
        </Menu>
    )
}


export default Datagrid;
