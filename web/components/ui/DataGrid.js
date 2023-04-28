import Link from 'next/link';
import {Box, List, ListItem, Typography} from '@mui/material';

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
                            <Link key={index} component="button" key={item.meta.key} href={item.meta.linkHref}>
                                <a>
                                    <ListItemContent item={item} header={header} />
                                </a>
                            </Link>
                    ) || (
                        // list item is a clickable
                        item.meta.onClick &&
                            <Box key={index} onClick={item.meta.onClick}>
                                <ListItemContent item={item} header={header} />
                            </Box>
                    ) || (
                        <ListItemContent key={index} item={item} header={header} />
                    )

            ) : (
                <ListItemContent key={index} item={item} header={header} />
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
                <Column key="actions" width={header.actions.width} right>{item.meta.actions}</Column>
            }

        </Row>
    </ListItem>


export default Datagrid;
