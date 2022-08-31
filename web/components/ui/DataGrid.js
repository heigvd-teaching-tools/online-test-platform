import Link from 'next/link';
import { List, ListItem, Typography } from '@mui/material';

import Row from '../layout/Row';
import Column from '../layout/Column';

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
        { items && items.length > 0 && items.map((item) => (
            <Link key={item.meta.key} href={item.meta.linkHref}>
            <ListItem button divider>
                <Row>
                    { 
                    Object.keys(item).map((key, index) => {
                        if(index < header.columns.length && key !== 'meta') {
                            return (
                                <Column key={key} {...header.columns[index].column}>
                                    <Typography variant="body2">{item[key] || ""}</Typography>
                                </Column>
                            )
                        }
                    }
                    )}
                    {
                        item.meta.actions && header.actions &&
                        <Column key="actions" width={header.actions.width} right>{item.meta.actions}</Column>
                    }
                    
                </Row>
            </ListItem>
            </Link>
        ))}
      </List>
    )
}

export default Datagrid;